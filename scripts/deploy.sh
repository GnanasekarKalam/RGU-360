#!/bin/bash
# Deployment script for Vercel
# Usage: bash scripts/deploy.sh

set -e

echo "🚀 Department360 Academic Dashboard - Vercel Deployment"
echo "======================================================\n"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check environment variables
echo "📋 Checking environment variables..."
required_vars=("DATABASE_URL" "JWT_SECRET" "NEXTAUTH_SECRET" "NEXTAUTH_URL")

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}❌ Missing required environment variable: $var${NC}"
    exit 1
  fi
done

echo -e "${GREEN}✓ All required environment variables are set${NC}\n"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Build project
echo "🔨 Building project..."
npm run build

# Run migrations (if database is accessible)
if [ ! -z "$DATABASE_URL" ]; then
  echo "📚 Running database migrations..."
  npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Migrations skipped (database might not be ready)${NC}"
  
  echo "🌱 Seeding database..."
  npx prisma db seed || echo -e "${YELLOW}⚠️  Seeding skipped${NC}"
fi

echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo -e "\n🚀 Ready to deploy to Vercel"
echo "Next steps:"
echo "1. git push to main branch (for auto-deployment)"
echo "2. Or run: vercel --prod"
