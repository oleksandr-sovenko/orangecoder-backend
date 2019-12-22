#!/bin/bash

cd /opt/orangecoder

cd helpers
make clean
make
cd ..

if [ ! -d node_modules ]; then
	npm i
fi

nodejs app.js
