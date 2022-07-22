#!/bin/bash
ACCEPT_EULA=y
DEBIAN_FRONTEND=noninteractive
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/msprod.list
sudo apt-get update 
sudo ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev
sudo echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> /root/.bash_profile