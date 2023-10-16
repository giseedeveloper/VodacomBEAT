

[ Server-1 ]
> ssh mobiadi@159.89.8.177   //IP-No.1
> ssh mobiadi@138.68.113.110 //IP-No.3
> pwd: roman$rev56proto
> pwd: roman$rev56proto

[ Server-2 - backup ]
> ssh mobiad@64.226.110.69
> ssh mobiad@64.226.110.69
> pwd: roman$rev56proto
> pwd: roman$rev56proto

# Files
cd /var/www/mobiad/mobiad-subscriptions
cd /var/www/mobiad/mobiad-subscriptions/storage/logs
>> mv *.* bkp/


# Nginx
cd /etc/nginx/sites-available
cd /var/log/nginx

# UI
cd /var/www/mobiad/mobiad-subscriptions

# copying configs
scp admin.panel mobiad@64.226.110.69:~/tmp/  | roman$rev56proto
scp admin.panel mobiad@64.226.110.69:/etc/nginx/sites-available


# php-my-admin
cd /var/www/mobiad/phpmyadmin
enlightened

http://admin.mobiadafrica

> sudo adduser mobiadi | roman$rev56proto
> sudo  usermod -aG sudo mobiadi

=========================
Database
=========================
phpMyAdmin: http://159.89.8.177:9972
user: mobiad
pwd: mossy@45veckro
Database: nbc

http://admin.mobiadafrica.com
superuser@system.com
zxcvbnm
