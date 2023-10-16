---------------------------------------------
Install Redis
---------------------------------------------

>> sudo apt install redis-server


>> sudo vim /etc/redis/redis.conf
~ change: 'supervised systemd' to 'supervised systemd'
 
> sudo systemctl restart redis.service
> sudo systemctl status redis