
mysql> CREATE USER 'mobiad'@'localhost' IDENTIFIED BY 'mossy@45veckro'; 
mysql> CREATE USER 'mobiad'@'%' IDENTIFIED BY 'mossy@45veckro';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'mobiad'@'%'; 
mysql> GRANT ALL PRIVILEGES ON *.* TO 'mobiad'@'localhost'; 

>> mysql -u mobiad -p

 

