
>> sudo ln -s /etc/nginx/sites-available/mobiad.co.tz /etc/nginx/sites-enabled/ ::80
>> sudo ln -s /etc/nginx/sites-available/admin.panel /etc/nginx/sites-enabled/  ::8080
>> sudo ln -s /etc/nginx/sites-available/agents.vodacom /etc/nginx/sites-enabled/ ::6969
>> sudo ln -s /etc/nginx/sites-available/phpmyadmin /etc/nginx/sites-enabled/ ::9972

[Extensions]
>> sudo apt install lsb-release ca-certificates apt-transport-https software-properties-common -y
>> sudo add-apt-repository ppa:ondrej/php
>> sudo apt-get update 
// 8.1
>> sudo apt install -y php-mysql php8.1-dom php8.1-fpm php8.1-cli php8.1-simplexml php8.1-ssh2 php8.1-xml php8.1-xmlreader php8.1-curl  php8.1-exif  php8.1-ftp php8.1-gd  php8.1-iconv php8.1-imagick   php8.1-mbstring php8.1-posix php8.1-sockets php8.1-tokenizer
>> sudo apt install -y php8.1-mysqli php8.1-pdo  php8.1-ctype php8.1-fileinfo php8.1-zip php8.1-exif php8.1-intl

// 8.2
>> sudo apt install -y php-mysql php8.2-dom php8.2-fpm php8.2-cli php8.2-simplexml php8.2-ssh2 php8.2-xml php8.2-xmlreader php8.2-curl  php8.2-exif  php8.2-ftp php8.2-gd  php8.2-iconv php8.2-imagick   php8.2-mbstring php8.2-posix php8.2-sockets php8.2-tokenizer
>> sudo apt install -y php8.2-mysqli php8.2-pdo  php8.2-ctype php8.2-fileinfo php8.2-zip php8.2-exif php8.2-intl

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
