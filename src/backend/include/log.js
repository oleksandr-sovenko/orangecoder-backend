// log.js
// Copyright (C) 2019 Oleksandr Sovenko (info@oleksandrsovenko.com)
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


const   CONFIG = require('../config'),
        moment = require('moment'),
        fs     = require('fs');


/**
 *
 *
 */
const LOG = {
    append: function(message) {
    	console.log('{ LOG.append } =>', message);

        fs.appendFileSync(CONFIG.dir.log + '/' + moment().format('YYYY-MM-DD') + '.log', moment().format('hh:mm:ss') + ' ' + message + '\n\n');
    }
}


module.exports = LOG;