
ssh eyasi@194.163.147.240
> cd ~/.ssh
> ssh-keygen

 

# vodacom-tune
> ssh mobiad@38.242.229.179
> cd ~/.ssh
> ssh-keygen
> name/location --> vodacom_tune
> vim ~/.ssh/vodacom_tune.pub
# --------------------------------
> vim ~/.ssh/config
# --------------------------------
Host vodacom-tune
HostName github.com
User git
IdentityFile ~/.ssh/vodacom_tune
IdentitiesOnly yes
# ---------------------------------
git clone git@vodacom-tune:Mobiad-Africa/vodacom-caller-tunes.git
git pull git@vodacom-tune:Mobiad-Africa/vodacom-caller-tunes.git
# ---------------------------------
https://github.com/
