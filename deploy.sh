#!/bin/bash --login

source ~/.bashrc
time = $(date +%Y-%m-%d" "%H:%M:%S)


echo 'start...'
# check node verison
echo 'checking node verison...'
nvm use 19.9.0
echo 'complete check node verison'

sleep 2s

# fetch code
echo 'fetching code...'
git pull
echo 'complete fetch code'

# install deps
echo 'installing deps...'
yarn install
echo 'complete install deps'

# build
echo 'building...'
yarn build
echo 'complete build'

# restart
echo 'restarting...'
nginx -s reload
echo 'finshed'
echo 'deployed chart application at $time' >> 'deploy.log'




