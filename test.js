// test.js
// Copyright (C) 2020 Oleksandr Sovenko (info@oleksandrsovenko.com)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

GPIO.mode(30, 'out');

// FILE.write('/test.txt', 'hello world!');

setInterval(function() {

	CONSOLE.log(
		DATETIME.format('YYYY-MM-DD hh:mm:ss') + ', ' +
		DATETIME.timestamp()   + ', ' +
		HASH.md5('0xc0der?')   + ', ' +
		FILE.read('/test.txt') + ', ' +
		''
	);

	if (GPIO.read(30) == 1)
		GPIO.write(30, 0);
	else
		GPIO.write(30, 1);

	// var filename = '/file-' + DATETIME.timestamp() + '.txt',
	// 	data     = DATETIME.format('YYYY-MM-DD hh:mm:ss');

	// FILE.write(filename, data);

}, 3000);
