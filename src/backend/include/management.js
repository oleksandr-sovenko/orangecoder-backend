// management.js
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


const   { execSync }   = require('child_process'),
        fs             = require('fs'),
        CONFIG         = require('../config'),
        I18N           = require('./i18n'),
        { FILE, HASH } = require('./namespace');


async function routes(fastify, options) {
    /**
     *
     */
    fastify.post('/management/reboot', async function(req, rep) {
        execSync('reboot');

        return { success: true, msg: I18N.translate(locale, 'Successfully') };
    })


    /**
     *
     */
    fastify.post('/management/upgrade', async function(req, rep) {
        const files = req.raw.files

        fs.writeFileSync('/tmp/upgrade', files['firmware'].data, 'binary');
        execSync('cd ' + CONFIG.dir.root + ' && tar xf /tmp/upgrade && reboot');

        return { success: true, msg: I18N.translate(locale, 'Successfully') };
    })
}


module.exports = routes
