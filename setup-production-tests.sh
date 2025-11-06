#!/bin/bash

# Production Test Setup Script for AushadiExpress
# This script helps you configure and run tests against your Railway production server

echo "🧪 AushadiExpress Production Testing Setup"
echo "=========================================="
echo ""

# Check if .env.test.production exists
if [ ! -f .env.test.production ]; then
    echo "❌ .env.test.production not found!"
    echo "Please create it first by copying the template:"
    echo "  cp .env.test.production.example .env.test.production"
    exit 1
fi

# Prompt for Railway URL if not set
if ! grep -q "^PRODUCTION_URL=https://" .env.test.production; then
    echo "📝 Please enter your Railway production URL:"
    read -p "URL (e.g., https://your-app.railway.app): " RAILWAY_URL

    # Update .env.test.production
    sed -i.bak "s|PRODUCTION_URL=.*|PRODUCTION_URL=$RAILWAY_URL|" .env.test.production
    echo "✅ Production URL configured: $RAILWAY_URL"
    echo ""
fi

# Load environment variables
export $(cat .env.test.production | grep -v '^#' | xargs)

echo "📋 Current Configuration:"
echo "  Production URL: $PRODUCTION_URL"
echo "  Retailer User:  $TEST_RETAILER_USERNAME"
echo "  Customer User:  $TEST_CUSTOMER_USERNAME"
echo ""

# Check if test users need to be created
echo "⚠️  IMPORTANT: Make sure test users exist on production!"
echo ""
echo "Test users required:"
echo "  1. Retailer: $TEST_RETAILER_USERNAME (password: $TEST_RETAILER_PASSWORD)"
echo "  2. Customer: $TEST_CUSTOMER_USERNAME (password: $TEST_CUSTOMER_PASSWORD)"
echo ""
read -p "Have you created these test users on production? (y/n): " USERS_CREATED

if [ "$USERS_CREATED" != "y" ]; then
    echo ""
    echo "📝 Please create test users first:"
    echo "  1. Go to: $PRODUCTION_URL"
    echo "  2. Register a retailer account with username: $TEST_RETAILER_USERNAME"
    echo "  3. Register a customer account with username: $TEST_CUSTOMER_USERNAME"
    echo ""
    echo "Then run this script again!"
    exit 1
fi

echo ""
echo "🎯 What would you like to do?"
echo ""
echo "1) Run smoke tests (quick validation)"
echo "2) Run smoke tests with visible browser"
echo "3) Run smoke tests in UI mode (interactive)"
echo "4) Run ALL tests on production (creates test data!)"
echo "5) View previous test report"
echo "6) Exit"
echo ""

read -p "Choose an option (1-6): " OPTION

case $OPTION in
    1)
        echo ""
        echo "🚀 Running production smoke tests..."
        npm run test:prod
        ;;
    2)
        echo ""
        echo "🚀 Running production smoke tests (headed mode)..."
        npm run test:prod:headed
        ;;
    3)
        echo ""
        echo "🚀 Opening Playwright UI..."
        npm run test:prod:ui
        ;;
    4)
        echo ""
        echo "⚠️  WARNING: This will run ALL tests and create test data!"
        read -p "Are you sure? (y/n): " CONFIRM
        if [ "$CONFIRM" = "y" ]; then
            echo "🚀 Running full test suite on production..."
            npm run test:prod:all
        else
            echo "❌ Cancelled"
        fi
        ;;
    5)
        echo ""
        echo "📊 Opening test report..."
        npm run test:prod:report
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
echo ""
echo "📊 To view the test report, run: npm run test:prod:report"
echo "📖 For more options, see: PRODUCTION_TESTING.md"
