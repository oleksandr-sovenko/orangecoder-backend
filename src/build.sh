# build.sh
# Copyright (C) 2020 Oleksandr Sovenko (info@oleksandrsovenko.com)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


CWD=$(pwd)

npm i -g pkg

# modules
cd ${CWD}/backend-modules/core/
npm i
npm i node-addon-api
node-gyp configure
node-gyp rebuild
cp ${CWD}/backend-modules/core/build/Release/core.node \
   ${CWD}/../modules/core.node


# build (frontend)
#rm -rf ${CWD}/../public/*
#cp -vR ${CWD}/frontend/www/* ${CWD}/../public


# build (backend)
cd ${CWD}/backend/
npm i
pkg -t node12.2.0-linux-armv7 -o ${CWD}/../bin/orangecoder-node12.2.0-linux-armv7-1.0 app.js
cd ${CWD}/../bin
ln -svf orangecoder-node12.2.0-linux-armv7-1.0 orangecoder


# pack
cd ${CWD}/../
tar Jcfv orangecoder-latest.upd bin/ modules/ public/

