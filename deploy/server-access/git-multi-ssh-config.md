
ssh eyasi@194.163.147.240
> cd ~/.ssh
> ssh-keygen

# vodacom-tune
> ssh mobiad@38.242.229.179
> cd ~/.ssh
> ssh-keygen -t rsa
> name/location --> biztune
> vim ~/.ssh/biztune.pub
# --------------------------------
> vim ~/.ssh/config
# --------------------------------
Host biztune
HostName github.com
User git
IdentityFile ~/.ssh/biztune
IdentitiesOnly yes
# ---------------------------------
git clone git@biztune:Mobiad-Africa/vodacom-caller-tunes.git
git pull git@biztune:Mobiad-Africa/vodacom-caller-tunes.git
# ---------------------------------
https://github.com/
