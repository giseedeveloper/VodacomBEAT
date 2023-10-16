

# delete  migrations
->transactions
->votes

# delete tables
->transactions
->votes

composer install
php artisan migrate

php artisan db:seed --class=VoteWeightsSeeder
php artisan db:seed --class=PermissionsSeeder

