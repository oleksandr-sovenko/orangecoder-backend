#!/bin/bash

cd /opt/orangemaker-repeater-backend

cd helpers
make clean
make
cd ..

if [ ! -d node_modules ]; then
	npm i
fi

nodejs app.js
