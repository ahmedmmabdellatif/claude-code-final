#!/bin/bash

echo "🔧 Setting up Prisma..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
bunx prisma generate

# Push schema to database
echo "🗃️ Pushing schema to database..."
bunx prisma db push --accept-data-loss

# Seed the database
echo "🌱 Seeding database..."
bunx prisma db seed

echo "✅ Prisma setup complete!"
