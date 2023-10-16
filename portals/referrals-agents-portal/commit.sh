 
git add -f build/
git commit -m "Deploy react"
git push

ssh eyasi@164.90.179.176

cd /home/eyasi/repository/eyasi_sales
git pull

sudo rm -rf /var/www/html/
sudo cp -r /home/eyasi/repository/eyasi_sales/ui/build/ /var/www/html/
cd /var/www/html
ls -alsh

# DigitalOceanJar@330Wd