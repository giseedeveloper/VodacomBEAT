
> sudo apt install cron

> sudo systemctl enable cron

//Add crons
> crontab -l  //view
> crontab -e  //edit
* * * * * cd /var/www/mobiad/mobiad-subscriptions && php artisan schedule:run >> /dev/null 2>&1

> php artisan schedule:list
