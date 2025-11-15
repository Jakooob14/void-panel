#!/bin/sh
set -e

echo "Waiting for Postgres..."
until nc -z postgres 5432; do
  sleep 1
done

echo "Postgres is up – running Prisma migrations..."
npx prisma migrate deploy

echo "Ensuring default admin user exists..."
node scripts/create-admin.js

echo "Starting Next.js..."
npm run start
