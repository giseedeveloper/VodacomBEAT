
# Build React
>> yarn build
>> Commit prod build

# Log Onto the server
>> ssh eyasi@164.90.179.176



# First Time Deployment
-----------------------------
>> sudo apt-get install nginx  | DigitalOceanJar@330Wd

# clone repo
>> cd /var/www/eyasi
>> git clone git@github.com:Eyasi-Technologies/eyasi_sales.git

## Update files path
>> sudo vim /etc/nginx/sites-available/default
// set root to: >>  root /var/www/eyasi/eyasi_sales/ui/build;

>> cd /var/www/eyasi/eyasi_sales
>> sudo chown -R $USER:www-data /var/www/eyasi/eyasi_sales/ui/build
>> sudo chmod -R 775 /var/www/eyasi/eyasi_sales/ui/build
>> sudo vim /etc/nginx/sites-available/default

## checking logs
>> sudo vim /var/log/nginx/error.log | DigitalOceanJar@330Wd
>> sudo  truncate -s 0 /var/log/nginx/error.log | DigitalOceanJar@330Wd


-------------------
# Re-Deployment
--------------------
>> ssh eyasi@164.90.179.176

## Pull changes
>> cd /var/www/eyasi/eyasi_sales
>> git pull  | DigitalOceanJar@330Wd

## Update permission
>> cd /var/www/eyasi/eyasi_sales
>> sudo chown -R $USER:www-data /var/www/eyasi/eyasi_sales/ui/build
>> sudo chmod -R 775 /var/www/eyasi/eyasi_sales/ui/build


git config --global user.email "rjkilonzo@gmail.com"
git config --global user.name "charden"
