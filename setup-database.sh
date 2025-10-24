#!/bin/bash

echo "🚀 Setting up database..."
echo ""

echo "Step 1: Generating Prisma Client..."
bunx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo ""
echo "Step 2: Pushing schema to database..."
bunx prisma db push
if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema to database"
    exit 1
fi

echo ""
echo "Step 3: Seeding database with initial data..."
bun run prisma/seed.ts
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📊 To view your database, run: bunx prisma studio"
