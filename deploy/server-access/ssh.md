

# Add non-root user
> ssh root@64.226.89.122 | hardware@home
> ssh alaf@64.226.89.122 | hardware@home
> adduser alaf
> usermod -aG sudo alaf

# Update password
> passwd alaf

# copy-ssh key
ssh-copy-id alaf@64.226.89.122 | hardware@home


# disable root login
> sudo vim  /etc/ssh/sshd_config
> sudo vim  ~/.ssh/id_rsa.pub
> systemctl reload ssh


