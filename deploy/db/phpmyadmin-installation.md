
roman$rev56proto

# Create DB Directory
>> cd /var/www
>> sudo mkdir phpmyadmin
>> sudo chown -R $USER:www-data phpmyadmin
>> sudo chmod -R 775 phpmyadmin

# Download php my-admin
>> cd /var/www/db
>> wget https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip
>> unzip phpMyAdmin-5.2.1-all-languages.zip
>> mv phpMyAdmin-5.2.1-all-languages phpmyadmin
>> rm phpMyAdmin-5.2.1-all-languages.zip

# Update application files permissions
>> sudo chown -R $USER:www-data /var/www/phpmyadmin
>> sudo chmod -R 775 /var/www/db/phpmyadmin

# Copy php-my-admin-nginx block
> exist ssh
> scp docs/nginx-blocks/phpmyadmin.conf alaf@64.226.89.122:~
> ssh alaf@64.226.89.122 
> sudo mv ~/phpmyadmin.conf /etc/nginx/sites-available 

>> sudo ln -s /etc/nginx/sites-available/phpmyadmin /etc/nginx/sites-enabled/
>> sudo nginx -t 
>> sudo systemctl restart nginx | hardware@home


# edit nginx block
> sudo vim /etc/nginx/sites-available/phpmyadmin.conf



Firewall
sudo ufw enable
sudo ufw status

sudo ufw allow 9972
sudo ufw allow 9972/tcp
sudo service ufw restart

[DB]
64.226.116.125:9972
 
