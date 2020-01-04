all:
	if [ ! -d "$(shell pwd)/bin" ]; then mkdir "$(shell pwd)/bin"; fi
	pkg -t node12.2.0-linux-armv7 -o "$(shell pwd)/bin/orangecoder-1.0-node12.2.0-linux-armv7" app.js

