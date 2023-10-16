https://www.digitalocean.com/community/tutorials/how-to-set-up-replication-in-mysql#step-2-configuring-the-source-database

Source IP: 159.89.8.177
Replica IP: 64.226.110.69
roman$rev56proto

refer to backup file: deploy/db/backups/mysqld.cnf

# Step 1 allow replicas to access to source/master
> sudo ufw allow from 64.226.110.69 to any port 3306
> telnet 159.89.8.177 3306 [test]

 
# Step 2 — Configuring the Source Database
> sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf

 server-id             = 1                [Ucommented]
 bind-address          = 159.89.8.177     [Set to server IP]
 log_bin               = /var/log/mysql/mysql-bin.log [Uncommented]
 binlog_do_db          = mobiad  [Uncommented & changed db name]

# Step 3: Restart server
> sudo systemctl stop mysql
> sudo systemctl start mysql

# Step 4: create user who will perform replications 
> sudo mysql

> CREATE USER 'chronos'@'64.226.110.69' IDENTIFIED WITH mysql_native_password BY 'pantheon45#20BC';
> GRANT REPLICATION SLAVE ON *.* TO 'chronos'@'64.226.110.69';
> FLUSH PRIVILEGES;



# Step 5: Retrieving Binary Log Coordinates from the Source
> sudo mysql

> FLUSH TABLES WITH READ LOCK;
> SHOW MASTER STATUS;

+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000002 |      8681 | mobiad       |                  |                   |
+------------------+----------+--------------+------------------+-------------------+


## Configuring replicas

# Step 1: Configuring replicas
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf

> Change params
server-id       = 2
log_bin         = /var/log/mysql/mysql-bin.log

> Add line
relay-log               = /var/log/mysql/mysql-relay-bin.log

> sudo systemctl restart mysql
> sudo systemctl stop mysql
> sudo systemctl start mysql
> sudo systemctl status mysql

# Step 2: set replication params

> sudo mysql

> CHANGE REPLICATION SOURCE TO
> SOURCE_HOST='159.89.8.177',
> SOURCE_USER='chronos',
> SOURCE_PASSWORD='pantheon45#20BC',
> SOURCE_LOG_FILE='mysql-bin.000002',
> SOURCE_LOG_POS=8681;


# Step 3: set replication params
> sudo mysql

> START REPLICA;
> SHOW REPLICA STATUS\G;

> STOP REPLICA;
> RESET MASTER;
> START REPLICA;

# Fix: 
> sudo systemctl stop mysql
> sudo rm /var/lib/mysql/auto.cnf
> sudo systemctl start mysql


# Help Queries
> SELECT @@server_uuid; 
> SELECT @@server_id;   [show server-id]
> SELECT @@datadir;     [show data directory]
