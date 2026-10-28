#!/usr/bin/env bash
# =============================================================================
# Privitty Web — AWS Resource Teardown
# =============================================================================
# Deletes all AWS resources created by aws-deploy-setup.sh:
#   • Amplify app (all branches + build history)
#   • S3 bucket (all objects + bucket)
#   • IAM user (all keys + policies + user)
#
# Usage:
#   chmod +x scripts/aws-teardown.sh
#   ./scripts/aws-teardown.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}ℹ ${RESET}$*"; }
success() { echo -e "${GREEN}✔ ${RESET}$*"; }
warn()    { echo -e "${YELLOW}⚠ ${RESET}$*"; }
error()   { echo -e "${RED}✖ ${RESET}$*" >&2; exit 1; }
header()  { echo -e "\n${BOLD}${CYAN}══ $* ══${RESET}"; }

DEPLOY_RECORD=".amplify-deploy-info.json"

# Try to load values from saved deploy record
if [[ -f "$DEPLOY_RECORD" ]]; then
  info "Loading deployment info from $DEPLOY_RECORD"
  AMPLIFY_APP_ID=$(jq -r '.amplify_app_id'   "$DEPLOY_RECORD")
  S3_BUCKET_NAME=$(jq -r '.s3_bucket'        "$DEPLOY_RECORD")
  AWS_REGION=$(jq -r     '.aws_region'       "$DEPLOY_RECORD")
  IAM_USER_NAME=$(jq -r  '.iam_user'         "$DEPLOY_RECORD")
else
  warn "No $DEPLOY_RECORD found — enter values manually."
  read -r -p "  Amplify App ID : " AMPLIFY_APP_ID
  read -r -p "  S3 Bucket name : " S3_BUCKET_NAME
  read -r -p "  AWS region     : " AWS_REGION
  IAM_USER_NAME="privitty-s3-deployer"
fi

echo ""
echo -e "${RED}${BOLD}⚠ WARNING: This will permanently delete:${RESET}"
echo "  • Amplify app  : $AMPLIFY_APP_ID (region: $AWS_REGION)"
echo "  • S3 bucket    : $S3_BUCKET_NAME (ALL OBJECTS)"
echo "  • IAM user     : $IAM_USER_NAME"
echo ""
read -r -p "Type 'yes' to confirm deletion: " confirm
[[ "$confirm" == "yes" ]] || { info "Aborted."; exit 0; }

# ── Amplify ────────────────────────────────────────────────────────────────────
header "Deleting Amplify app"
if aws amplify get-app --app-id "$AMPLIFY_APP_ID" --region "$AWS_REGION" &>/dev/null; then
  aws amplify delete-app --app-id "$AMPLIFY_APP_ID" --region "$AWS_REGION" --output text > /dev/null
  success "Amplify app deleted"
else
  warn "Amplify app not found — skipping"
fi

# ── S3 ─────────────────────────────────────────────────────────────────────────
header "Deleting S3 bucket: $S3_BUCKET_NAME"
if aws s3api head-bucket --bucket "$S3_BUCKET_NAME" 2>/dev/null; then
  info "Removing all versioned objects..."
  # Delete all versions and delete markers (required before bucket delete)
  aws s3api list-object-versions --bucket "$S3_BUCKET_NAME" --output json \
    | jq -r '(.Versions // []) + (.DeleteMarkers // []) | .[] | "\(.Key) \(.VersionId)"' \
    | while read -r key vid; do
        aws s3api delete-object --bucket "$S3_BUCKET_NAME" --key "$key" --version-id "$vid" \
          --output text > /dev/null
      done
  aws s3api delete-bucket --bucket "$S3_BUCKET_NAME" --region "$AWS_REGION"
  success "S3 bucket deleted"
else
  warn "S3 bucket not found — skipping"
fi

# ── IAM ────────────────────────────────────────────────────────────────────────
header "Deleting IAM user: $IAM_USER_NAME"
if aws iam get-user --user-name "$IAM_USER_NAME" &>/dev/null; then
  # Delete all access keys
  aws iam list-access-keys --user-name "$IAM_USER_NAME" --output json \
    | jq -r '.AccessKeyMetadata[].AccessKeyId' \
    | while read -r key_id; do
        aws iam delete-access-key --user-name "$IAM_USER_NAME" --access-key-id "$key_id"
        info "Deleted access key: $key_id"
      done
  # Delete inline policies
  aws iam list-user-policies --user-name "$IAM_USER_NAME" --output json \
    | jq -r '.PolicyNames[]' \
    | while read -r pname; do
        aws iam delete-user-policy --user-name "$IAM_USER_NAME" --policy-name "$pname"
        info "Deleted policy: $pname"
      done
  aws iam delete-user --user-name "$IAM_USER_NAME"
  success "IAM user deleted"
else
  warn "IAM user not found — skipping"
fi

# Clean up local deploy record
[[ -f "$DEPLOY_RECORD" ]] && rm "$DEPLOY_RECORD" && info "Removed $DEPLOY_RECORD"

echo ""
success "All AWS resources removed."
echo -e "  ${YELLOW}Note: your PostgreSQL database was NOT deleted — remove it from your DB provider manually.${RESET}"
