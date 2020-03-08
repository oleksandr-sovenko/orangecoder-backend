#all:
#	npm i
#	npm i pkg
#	if [ ! -d "$(shell pwd)/bin" ]; then mkdir "$(shell pwd)/bin"; fi
#	pkg -t node12.2.0-linux-armv7 -o "$(shell pwd)/bin/orangecoder-1.0-node12.2.0-linux-armv7" app.js

#modules:
#	cd backend-modules/core
#	npm i
#	node-gyp configure
#	node-gyp rebuild

CWD=$(pwd)

# modules

cd ${CWD}/backend-modules/core
npm i
npm i node-addon-api
node-gyp configure
node-gyp rebuild
cp ${CWD}/backend-modules/core/build/Release/core.node \
	${CWD}/../modules/core.node

# build

cd ${CWD}/backend
pkg -t node12.2.0-linux-armv7 -o ${CWD}/../bin/orangecoder-node12.2.0-linux-armv7-1.0 app.js
ln -svf ${CWD}/../bin/orangecoder-node12.2.0-linux-armv7-1.0 \
	${CWD}/../bin/orangecoder


# pack

tar Jcf ../orangecoder-backend-latest.tar.xz bin/ modules/
tar Jcf ../orangecoder-frontend-latest.tar.xz public
