---------------------------------------------
Install PHP 8.2
---------------------------------------------

>> sudo apt install lsb-release ca-certificates apt-transport-https software-properties-common -y

>> sudo add-apt-repository ppa:ondrej/php


1. If you are using apache2, you are advised to  also add ppa:ondrej/apache2
2. If you are using nginx, you are advised to  also add ppa:ondrej/nginx-mainline or ppa:ondrej/nginx

>> sudo apt install php8.2
  
# DEPENDENCIES
>> sudo apt install -y php-mysql php8.2-dom php8.2-fpm php8.2-cli php8.2-simplexml php8.2-ssh2 php8.2-xml php8.2-xmlreader php8.2-curl  php8.2-exif  php8.2-ftp php8.2-gd  php8.2-iconv php8.2-imagick   php8.2-mbstring php8.2-posix php8.2-sockets php8.2-tokenizer
 >> sudo apt install -y php8.2-mysqli php8.2-pdo  php8.2-ctype php8.2-fileinfo php8.2-zip php8.2-exif

# For apache2
 >>sudo a2enmod php8.2
 >>systemctl restart apache2
