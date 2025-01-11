#!/bin/sh
set -e 

cat << EOF > /app/.env
API_KEY=$(cat /run/secrets/API_KEY)
ADMIN_PASSWORD=$(cat /run/secrets/ADMIN_PASSWORD)
ADMIN_USERNAME=$(cat /run/secrets/ADMIN_USERNAME)
ADMIN_EMAIL=$(cat /run/secrets/ADMIN_EMAIL)
API_HOST=$(cat /run/secrets/API_HOST)
SESSION_SECRET=$(cat /run/secrets/SESSION_SECRET)
REFRESH_JWT_SECRET=$(cat /run/secrets/REFRESH_JWT_SECRET)
ACCESS_JWT_SECRET=$(cat /run/secrets/ACCESS_JWT_SECRET)
GOOGLE_CLIENT_ID=$(cat /run/secrets/GOOGLE_CLIENT_ID)
GOOGLE_CLIENT_SECRET=$(cat /run/secrets/GOOGLE_CLIENT_SECRET)
TEST_USER_EMAIL=$(cat /run/secrets/TEST_USER_EMAIL)
TEST_USER_PASSWORD=$(cat /run/secrets/TEST_USER_PASSWORD)
EOF

# Clean up any temporary files
rm -f /tmp/*

echo "Configuration file created successfully"