#!/usr/bin/env bash
# =============================================================================
# Privitty Web — AWS Amplify One-Shot Deployment Setup
# =============================================================================
# What this script does:
#   1. Validates prerequisites (aws-cli, git, node, npm, jq)
#   2. Creates an S3 bucket (private) with CORS for presigned URLs
#   3. Creates a scoped IAM user + access keys for S3 operations
#   4. Creates an Amplify Hosting app connected to your GitHub repo
#   5. Sets all required environment variables in the Amplify Console
#   6. Runs Prisma DB migrations + seeding against the provided DATABASE_URL
#   7. Triggers the first Amplify build → deploy
#
# Prerequisites:
#   • AWS CLI v2 installed and configured  (aws configure)
#   • git, node ≥ 18, npm installed
#   • jq installed  (brew install jq)
#   • A PostgreSQL database URL ready
#     (Neon ▸ https://neon.tech  or  Supabase ▸ https://supabase.com — free tier)
#   • A GitHub Personal Access Token (PAT) with  repo  scope
#     (Settings → Developer settings → Personal access tokens → Classic → New token)
#
# Usage:
#   chmod +x scripts/aws-deploy-setup.sh
#   ./scripts/aws-deploy-setup.sh
#
# You can also pre-populate variables to skip prompts:
#   export DATABASE_URL="postgresql://..."
#   export GITHUB_TOKEN="ghp_..."
#   ./scripts/aws-deploy-setup.sh
# =============================================================================

set -euo pipefail

# ─── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}ℹ ${RESET}$*"; }
success() { echo -e "${GREEN}✔ ${RESET}$*"; }
warn()    { echo -e "${YELLOW}⚠ ${RESET}$*"; }
error()   { echo -e "${RED}✖ ${RESET}$*" >&2; exit 1; }
header()  { echo -e "\n${BOLD}${CYAN}══ $* ══${RESET}"; }

# ─── Helpers ──────────────────────────────────────────────────────────────────
prompt() {
  # prompt <var_name> <display_text> [default]
  local var="$1" text="$2" default="${3:-}"
  if [[ -n "${!var:-}" ]]; then
    info "$text already set → ${!var:0:6}..."
    return
  fi
  if [[ -n "$default" ]]; then
    read -r -p "  $text [$default]: " input
    eval "$var=\"${input:-$default}\""
  else
    read -r -p "  $text: " input
    eval "$var=\"$input\""
  fi
}

prompt_secret() {
  local var="$1" text="$2"
  if [[ -n "${!var:-}" ]]; then
    info "$text already set."
    return
  fi
  read -r -s -p "  $text (hidden): " input
  echo
  eval "$var=\"$input\""
}

require_cmd() {
  command -v "$1" &>/dev/null || error "'$1' is not installed. $2"
}

# ─── 0. Prerequisites ─────────────────────────────────────────────────────────
header "Checking prerequisites"

require_cmd aws  "Install from https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
require_cmd git  "Install Xcode Command Line Tools: xcode-select --install"
require_cmd node "Install Node.js 20 LTS from https://nodejs.org"
require_cmd npm  "Comes with Node.js"
require_cmd jq   "Install with: brew install jq"

AWS_CLI_VERSION=$(aws --version 2>&1 | awk '{print $1}')
NODE_VERSION=$(node --version)
info "aws-cli: $AWS_CLI_VERSION | node: $NODE_VERSION"

# Verify AWS credentials are configured
aws sts get-caller-identity --output text --query 'Account' &>/dev/null \
  || error "AWS credentials not configured. Run: aws configure"

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
success "AWS account: $AWS_ACCOUNT_ID"

# ─── 1. Gather inputs ─────────────────────────────────────────────────────────
header "Configuration"

echo -e "\n${BOLD}GitHub${RESET}"
prompt GITHUB_REPO   "GitHub repo URL (e.g. https://github.com/Privitty/privitty-web)" "https://github.com/Privitty/privitty-web"
prompt GITHUB_BRANCH "GitHub branch to deploy"                                          "main"
prompt_secret GITHUB_TOKEN "GitHub Personal Access Token (needs 'repo' scope)"

echo -e "\n${BOLD}Database${RESET}"
prompt_secret DATABASE_URL "PostgreSQL connection URL (postgresql://user:pass@host:5432/db)"

echo -e "\n${BOLD}AWS${RESET}"
prompt AWS_REGION      "AWS region"                    "us-east-1"
prompt S3_BUCKET_NAME  "S3 bucket name (must be globally unique)" "privitty-media-$(echo $RANDOM | md5sum | head -c 6)"
prompt AMPLIFY_APP_NAME "Amplify app name"             "privitty-web"

echo -e "\n${BOLD}Admin seed credentials${RESET}"
prompt       ADMIN_EMAIL    "Admin email"  "admin@privitty.com"
prompt_secret ADMIN_PASSWORD "Admin password (min 12 chars)"
prompt       ADMIN_NAME     "Admin display name" "Privitty Admin"

# Derive public vars from server vars (same bucket/region)
NEXT_PUBLIC_AWS_S3_BUCKET="$S3_BUCKET_NAME"
NEXT_PUBLIC_AWS_REGION="$AWS_REGION"
IAM_USER_NAME="privitty-s3-deployer"

echo ""
info "Summary:"
echo "  GitHub repo   : $GITHUB_REPO ($GITHUB_BRANCH)"
echo "  AWS region    : $AWS_REGION"
echo "  S3 bucket     : $S3_BUCKET_NAME"
echo "  Amplify app   : $AMPLIFY_APP_NAME"
echo "  Admin email   : $ADMIN_EMAIL"
echo ""
read -r -p "Proceed? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { info "Aborted."; exit 0; }

# ─── 2. Create S3 Bucket ──────────────────────────────────────────────────────
header "Creating S3 bucket: $S3_BUCKET_NAME"

# us-east-1 requires no LocationConstraint; all other regions do
if [[ "$AWS_REGION" == "us-east-1" ]]; then
  aws s3api create-bucket \
    --bucket "$S3_BUCKET_NAME" \
    --region "$AWS_REGION" \
    --output text > /dev/null
else
  aws s3api create-bucket \
    --bucket "$S3_BUCKET_NAME" \
    --region "$AWS_REGION" \
    --create-bucket-configuration LocationConstraint="$AWS_REGION" \
    --output text > /dev/null
fi
success "Bucket created: s3://$S3_BUCKET_NAME"

# Block all public access (files served via presigned URLs only)
aws s3api put-public-access-block \
  --bucket "$S3_BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
success "Public access blocked (presigned-URL only access)"

# Set CORS so browsers can PUT files directly via presigned upload URLs
# and GET files served from Amplify domain
AMPLIFY_DOMAIN_PATTERN="https://*.amplifyapp.com"
aws s3api put-bucket-cors \
  --bucket "$S3_BUCKET_NAME" \
  --cors-configuration "{
    \"CORSRules\": [
      {
        \"AllowedHeaders\": [\"*\"],
        \"AllowedMethods\": [\"GET\", \"PUT\", \"POST\", \"DELETE\", \"HEAD\"],
        \"AllowedOrigins\": [\"${AMPLIFY_DOMAIN_PATTERN}\", \"http://localhost:3000\"],
        \"ExposeHeaders\": [\"ETag\", \"Content-Length\"],
        \"MaxAgeSeconds\": 3000
      }
    ]
  }"
success "CORS configured on bucket"

# Enable versioning (optional but good for media safety)
aws s3api put-bucket-versioning \
  --bucket "$S3_BUCKET_NAME" \
  --versioning-configuration Status=Enabled
success "Bucket versioning enabled"

# ─── 3. Create IAM User + Scoped Policy ───────────────────────────────────────
header "Creating IAM user: $IAM_USER_NAME"

# Check if user already exists
if aws iam get-user --user-name "$IAM_USER_NAME" &>/dev/null; then
  warn "IAM user '$IAM_USER_NAME' already exists — skipping creation."
else
  aws iam create-user --user-name "$IAM_USER_NAME" --output text > /dev/null
  success "IAM user created"
fi

# Attach a scoped inline policy (only this bucket, specific actions)
POLICY_DOC=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PrivittyS3Operations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetObjectAcl",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::${S3_BUCKET_NAME}",
        "arn:aws:s3:::${S3_BUCKET_NAME}/*"
      ]
    }
  ]
}
EOF
)

aws iam put-user-policy \
  --user-name "$IAM_USER_NAME" \
  --policy-name "PrivittyS3BucketPolicy" \
  --policy-document "$POLICY_DOC"
success "Scoped IAM policy attached"

# Generate access keys
info "Generating IAM access keys..."
KEY_OUTPUT=$(aws iam create-access-key --user-name "$IAM_USER_NAME" --output json)
AWS_ACCESS_KEY_ID=$(echo "$KEY_OUTPUT"   | jq -r '.AccessKey.AccessKeyId')
AWS_SECRET_ACCESS_KEY=$(echo "$KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')
success "IAM access keys generated (stored only in Amplify env vars)"

# ─── 4. Create Amplify App ────────────────────────────────────────────────────
header "Creating Amplify Hosting app: $AMPLIFY_APP_NAME"

# Build the env vars payload for Amplify
ENV_VARS=$(jq -n \
  --arg DATABASE_URL                  "$DATABASE_URL" \
  --arg AWS_REGION                    "$AWS_REGION" \
  --arg AWS_S3_BUCKET                 "$S3_BUCKET_NAME" \
  --arg AWS_ACCESS_KEY_ID             "$AWS_ACCESS_KEY_ID" \
  --arg AWS_SECRET_ACCESS_KEY         "$AWS_SECRET_ACCESS_KEY" \
  --arg AWS_S3_CUSTOM_DOMAIN          "" \
  --arg NEXT_PUBLIC_AWS_S3_BUCKET     "$S3_BUCKET_NAME" \
  --arg NEXT_PUBLIC_AWS_REGION        "$AWS_REGION" \
  --arg NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN "" \
  --arg ENABLE_LOCAL_STORAGE_FALLBACK "false" \
  --arg ADMIN_INITIAL_EMAIL           "$ADMIN_EMAIL" \
  --arg ADMIN_INITIAL_PASSWORD        "$ADMIN_PASSWORD" \
  --arg ADMIN_INITIAL_NAME            "$ADMIN_NAME" \
  --arg NODE_ENV                      "production" \
  --arg NODE_OPTIONS                  "--max-old-space-size=4096" \
  '{
    DATABASE_URL:                    $DATABASE_URL,
    AWS_REGION:                      $AWS_REGION,
    AWS_S3_BUCKET:                   $AWS_S3_BUCKET,
    AWS_ACCESS_KEY_ID:               $AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY:           $AWS_SECRET_ACCESS_KEY,
    AWS_S3_CUSTOM_DOMAIN:            $AWS_S3_CUSTOM_DOMAIN,
    NEXT_PUBLIC_AWS_S3_BUCKET:       $NEXT_PUBLIC_AWS_S3_BUCKET,
    NEXT_PUBLIC_AWS_REGION:          $NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN: $NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN,
    ENABLE_LOCAL_STORAGE_FALLBACK:   $ENABLE_LOCAL_STORAGE_FALLBACK,
    ADMIN_INITIAL_EMAIL:             $ADMIN_INITIAL_EMAIL,
    ADMIN_INITIAL_PASSWORD:          $ADMIN_INITIAL_PASSWORD,
    ADMIN_INITIAL_NAME:              $ADMIN_INITIAL_NAME,
    NODE_ENV:                        $NODE_ENV,
    NODE_OPTIONS:                    $NODE_OPTIONS
  }')

APP_OUTPUT=$(aws amplify create-app \
  --name "$AMPLIFY_APP_NAME" \
  --repository "$GITHUB_REPO" \
  --platform "WEB_COMPUTE" \
  --access-token "$GITHUB_TOKEN" \
  --environment-variables "$ENV_VARS" \
  --build-spec "$(cat amplify.yml)" \
  --region "$AWS_REGION" \
  --output json)

AMPLIFY_APP_ID=$(echo "$APP_OUTPUT" | jq -r '.app.appId')
AMPLIFY_DEFAULT_DOMAIN=$(echo "$APP_OUTPUT" | jq -r '.app.defaultDomain')

success "Amplify app created: $AMPLIFY_APP_ID"
info "Default domain: https://${GITHUB_BRANCH}.${AMPLIFY_DEFAULT_DOMAIN}"

# ─── 5. Create & link the branch ──────────────────────────────────────────────
header "Configuring branch: $GITHUB_BRANCH"

aws amplify create-branch \
  --app-id "$AMPLIFY_APP_ID" \
  --branch-name "$GITHUB_BRANCH" \
  --stage "PRODUCTION" \
  --enable-auto-build \
  --region "$AWS_REGION" \
  --output text > /dev/null

success "Branch '$GITHUB_BRANCH' configured with auto-deploy on push"

# ─── 6. Run DB Migrations + Seed ──────────────────────────────────────────────
header "Running Prisma migrations and seed"

info "Installing dependencies locally (for prisma CLI)..."
npm ci --prefer-offline --silent

info "Deploying pending migrations to production DB..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
success "Migrations applied"

info "Seeding initial data (admin user, testimonials, team, partners)..."
DATABASE_URL="$DATABASE_URL" \
ADMIN_INITIAL_EMAIL="$ADMIN_EMAIL" \
ADMIN_INITIAL_PASSWORD="$ADMIN_PASSWORD" \
ADMIN_INITIAL_NAME="$ADMIN_NAME" \
npm run db:seed
success "Database seeded"

# ─── 7. Trigger First Build ───────────────────────────────────────────────────
header "Triggering first Amplify build"

JOB_OUTPUT=$(aws amplify start-job \
  --app-id "$AMPLIFY_APP_ID" \
  --branch-name "$GITHUB_BRANCH" \
  --job-type "RELEASE" \
  --region "$AWS_REGION" \
  --output json)

JOB_ID=$(echo "$JOB_OUTPUT" | jq -r '.jobSummary.jobId')
success "Build job started: $JOB_ID"

# ─── 8. Update S3 CORS with real Amplify domain ───────────────────────────────
header "Updating S3 CORS with production Amplify domain"

PROD_DOMAIN="https://${GITHUB_BRANCH}.${AMPLIFY_DEFAULT_DOMAIN}"
aws s3api put-bucket-cors \
  --bucket "$S3_BUCKET_NAME" \
  --cors-configuration "{
    \"CORSRules\": [
      {
        \"AllowedHeaders\": [\"*\"],
        \"AllowedMethods\": [\"GET\", \"PUT\", \"POST\", \"DELETE\", \"HEAD\"],
        \"AllowedOrigins\": [\"${PROD_DOMAIN}\", \"http://localhost:3000\"],
        \"ExposeHeaders\": [\"ETag\", \"Content-Length\"],
        \"MaxAgeSeconds\": 3000
      }
    ]
  }"
success "S3 CORS updated with: $PROD_DOMAIN"

# ─── 9. Save deployment record ────────────────────────────────────────────────
DEPLOY_RECORD=".amplify-deploy-info.json"
jq -n \
  --arg app_id      "$AMPLIFY_APP_ID" \
  --arg app_name    "$AMPLIFY_APP_NAME" \
  --arg region      "$AWS_REGION" \
  --arg branch      "$GITHUB_BRANCH" \
  --arg domain      "$PROD_DOMAIN" \
  --arg bucket      "$S3_BUCKET_NAME" \
  --arg iam_user    "$IAM_USER_NAME" \
  --arg deployed_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{
    amplify_app_id:   $app_id,
    amplify_app_name: $app_name,
    aws_region:       $region,
    github_branch:    $branch,
    live_url:         $domain,
    s3_bucket:        $bucket,
    iam_user:         $iam_user,
    deployed_at:      $deployed_at
  }' > "$DEPLOY_RECORD"

# Ensure this file is gitignored (it has no secrets but is machine-specific)
grep -qxF "$DEPLOY_RECORD" .gitignore 2>/dev/null || echo "$DEPLOY_RECORD" >> .gitignore

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}║          🚀  Deployment setup complete!              ║${RESET}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Live URL${RESET}        : ${CYAN}${PROD_DOMAIN}${RESET}"
echo -e "  ${BOLD}Amplify App ID${RESET}  : ${AMPLIFY_APP_ID}"
echo -e "  ${BOLD}S3 Bucket${RESET}       : ${S3_BUCKET_NAME}"
echo -e "  ${BOLD}Build Job${RESET}       : ${JOB_ID}"
echo ""
echo -e "  ${BOLD}Monitor build${RESET}:"
echo -e "  ${CYAN}https://${AWS_REGION}.console.aws.amazon.com/amplify/apps/${AMPLIFY_APP_ID}${RESET}"
echo ""
echo -e "  ${BOLD}Next steps${RESET}:"
echo -e "  • Wait ~3-5 min for the first build to finish"
echo -e "  • Admin panel: ${CYAN}${PROD_DOMAIN}/admin${RESET}"
echo -e "  • Login with: ${ADMIN_EMAIL}"
echo -e "  • Update S3 CORS with your custom domain once DNS is configured"
echo -e "  • Deploy record saved to: ${DEPLOY_RECORD}"
echo ""
