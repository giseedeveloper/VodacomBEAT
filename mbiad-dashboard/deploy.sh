#!/bin/bash

# -- Produce js artifacts
# npm run build

# -- Commit produced artifacts
cd build
git add . -f
git commit -m "Deployment"
git push

# -- Pull changes on the server
ssh eyasi@164.90.179.176 << EOF

echo "Navigating to deployment folder..."
cd /var/www/eyasi/eyasi_sales || exit

echo "Pulling changes..."
git stash
git pull

echo " "
echo " "
echo "UI deployment complete..."

EOF
