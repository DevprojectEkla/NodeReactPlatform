#!/usr/bin/env sh

######################################################################
# @author      : DevEkla (ekla@ArchLinuxEkla)
# @file        : build
# @created     : mercredi févr. 14, 2024 09:51:55 CET
#
# @description : 
######################################################################


cd client/
npm run build
cd ..
rm -r ./server/build/
cp -R ./client/build/ ./server/build/
notify-send "React build completed"
