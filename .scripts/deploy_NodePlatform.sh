#!/usr/bin/env sh

######################################################################
# @author      : DevEkla (ekla@visio.devekla.com)
# @file        : deploy_NodePlatform
# @created     : Saturday May 25, 2024 08:31:02 UTC
#
# @description : 
######################################################################

cd /home/ekla/NodeReactPlatform/
git pull origin main
pm2 restart all



