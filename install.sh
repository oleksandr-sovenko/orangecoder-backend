#!/bin/bash

cp ./orangemaker-repeater-backend.service /etc/systemd/system/orangemaker-repeater-backend.service
systemctl enable orangemaker-repeater-backend
