cmd_Release/obj.target/core/bmp280/bmp280.o := g++ -o Release/obj.target/core/bmp280/bmp280.o ../bmp280/bmp280.cpp '-DNODE_GYP_MODULE_NAME=core' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-DV8_DEPRECATION_WARNINGS' '-DV8_IMMINENT_DEPRECATION_WARNINGS' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' '-D__STDC_FORMAT_MACROS' '-DOPENSSL_NO_PINSHARED' '-DOPENSSL_THREADS' '-DNAPI_DISABLE_CPP_EXCEPTIONS' '-DBUILDING_NODE_EXTENSION' -I/root/.cache/node-gyp/12.18.3/include/node -I/root/.cache/node-gyp/12.18.3/src -I/root/.cache/node-gyp/12.18.3/deps/openssl/config -I/root/.cache/node-gyp/12.18.3/deps/openssl/openssl/include -I/root/.cache/node-gyp/12.18.3/deps/uv/include -I/root/.cache/node-gyp/12.18.3/deps/zlib -I/root/.cache/node-gyp/12.18.3/deps/v8/include -I/opt/orangecoder-dev/src/backend-modules/core/node_modules/node-addon-api  -fPIC -pthread -Wall -Wextra -Wno-unused-parameter -O3 -fno-omit-frame-pointer -fno-rtti -std=gnu++1y -MMD -MF ./Release/.deps/Release/obj.target/core/bmp280/bmp280.o.d.raw   -c
Release/obj.target/core/bmp280/bmp280.o: ../bmp280/bmp280.cpp \
 ../bmp280/bmp280.h ../bmp280/BMP280CalibrationData.h \
 ../bmp280/BMP280RawData.h ../bmp280/BMP280Data.h
../bmp280/bmp280.cpp:
../bmp280/bmp280.h:
../bmp280/BMP280CalibrationData.h:
../bmp280/BMP280RawData.h:
../bmp280/BMP280Data.h:
