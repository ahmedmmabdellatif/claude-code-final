#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "  🏋️  AI FITNESS COACH - DATABASE SETUP"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=" .env; then
    print_success "Database URL found in .env"
else
    print_error "DATABASE_URL not found in .env"
    exit 1
fi

echo ""
echo "────────────────────────────────────────────────────────────"
echo "  Step 1/3: Generating Prisma Client"
echo "────────────────────────────────────────────────────────────"
echo ""

bunx prisma generate

if [ $? -eq 0 ]; then
    print_success "Prisma client generated successfully"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

echo ""
echo "────────────────────────────────────────────────────────────"
echo "  Step 2/3: Syncing Schema to Database"
echo "────────────────────────────────────────────────────────────"
echo ""

bunx prisma db push

if [ $? -eq 0 ]; then
    print_success "Schema synced to database"
else
    print_error "Failed to sync schema"
    exit 1
fi

echo ""
echo "────────────────────────────────────────────────────────────"
echo "  Step 3/3: Seeding Database with Initial Data"
echo "────────────────────────────────────────────────────────────"
echo ""

bun run prisma/seed.ts

if [ $? -eq 0 ]; then
    print_success "Database seeded successfully"
else
    print_error "Failed to seed database"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  🎉 SETUP COMPLETE!"
echo "════════════════════════════════════════════════════════════"
echo ""
print_info "Test Accounts Created:"
echo ""
echo "  👨‍🏫 Coach Account"
echo "     Email: coach@example.com"
echo "     Password: password123"
echo ""
echo "  🏃 Client Account"
echo "     Email: client@example.com"
echo "     Password: password123"
echo ""
echo "────────────────────────────────────────────────────────────"
print_info "Database Contents:"
echo ""
echo "  • 2 Users (1 coach, 1 client)"
echo "  • 15 Exercises (bench press, squats, deadlifts, etc.)"
echo "  • 12 Foods (chicken, rice, eggs, etc.)"
echo "  • 3 Program Offers (Basic, Plus, Premium)"
echo "  • Sample goals and measurements"
echo ""
echo "────────────────────────────────────────────────────────────"
print_info "Next Steps:"
echo ""
echo "  1. Start your app with your normal start command"
echo "  2. Login with coach@example.com or client@example.com"
echo "  3. Test the full workflow (registration → plan → tracking)"
echo ""
print_info "Optional Commands:"
echo ""
echo "  📊 View database: bunx prisma studio"
echo "  ✅ Verify setup: bun run verify-setup.ts"
echo ""
echo "════════════════════════════════════════════════════════════"
