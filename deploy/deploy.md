
>> sudo ln -s /etc/nginx/sites-available/mobiad.co.tz /etc/nginx/sites-enabled/ ::80
>> sudo ln -s /etc/nginx/sites-available/admin.panel /etc/nginx/sites-enabled/  ::8080
>> sudo ln -s /etc/nginx/sites-available/agents.vodacom /etc/nginx/sites-enabled/ ::6969
>> sudo ln -s /etc/nginx/sites-available/phpmyadmin /etc/nginx/sites-enabled/ ::9972



[Extensions]
>> sudo apt-get update
>> sudo apt install php-zip
>> sudo apt install -y php7.4 php7.4-cli php7.4-common php7.4-fpm
>> sudo apt install -y php7.4-mysql php7.4-dom php7.4-simplexml php7.4-ssh2 php7.4-xml php7.4-xmlreader php7.4-curl  php7.4-exif  php7.4-ftp php7.4-gd  php7.4-iconv php7.4-imagick php7.4-json  php7.4-mbstring php7.4-posix php7.4-sockets php7.4-tokenizer

[env-key]
>> composer install --no-dev
>> cp .env.example .env
>> php artisan key:generate //remove if key exists in .env
>> php artisan storage:link

[PermissionsOnLinux]
>> sudo chown -R $USER:www-data storage
>> sudo chown -R $USER:www-data bootstrap/cache
>> sudo chmod -R 775 storage
>> sudo chmod -R 775 bootstrap/cache


[migration]
>> php artisan migrate
>> php artisan passport:install


[Seeding]
#>> php artisan permission:cache-reset
php artisan db:seed --class=AdminSeeder 
php artisan db:seed --class=PermissionsSeeder
php artisan db:seed --class=NotificationTemplateSeeder
php artisan db:seed --class=SmsGatewaySeeder
php artisan db:seed --class=TunePackageSeeder
php artisan db:seed --class=MobileNetworksSeeder
 

#files
php artisan storage:link

#resetting permissions-cache
php artisan permission:cache-reset



cp .env /var/www/mobiad/vodacom-caller-tunes/.env
