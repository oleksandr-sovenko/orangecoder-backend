#!/bin/bash

cd /opt/root/orangemaker-repeater-backend

cd helpers
make clean
make
cd ..

if [ ! -d node_modules ]; then
	npm i
fi

nodejs app.js