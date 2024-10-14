
ssh eyasi@194.163.147.240
> cd ~/.ssh
> ssh-keygen

# hesabu_rsa
# --------------------------------
vim ~/.ssh/config
# --------------------------------
    Host github-hesabu-app
    HostName github.com
    User git
    IdentityFile ~/.ssh/hesabu_rsa
    IdentitiesOnly yes
# ---------------------------------
git clone git@github-hesabu-app:Rixar-Technologies-LTD/app.hesabu.co.git
# ---------------------------------


# market_rsa
> ssh eyasi@194.163.147.240
> cd ~/.ssh
> ssh-keygen
> name/location --> market_rsa
> vim ~/.ssh/market_rsa.pub
# --------------------------------
> vim ~/.ssh/config
# --------------------------------
    Host github-market
    HostName github.com
    User git
    IdentityFile ~/.ssh/market_rsa
    IdentitiesOnly yes
# ---------------------------------
git clone git@github.com:Rixar-Technologies-LTD/dar.co.tz.git
# ---------------------------------
