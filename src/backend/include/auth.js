// auth.js
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


const fs      = require('fs'),
      CONFIG  = require('../config'),
      SESSION = require('./session'),
      { DATETIME, HASH } = require('./namespace')


/**
 *
 */
async function routes(fastify, options) {
    var credentials_json = CONFIG.dir.conf + '/credentials.json';


    /**
     *
     */
    fastify.post('/change-password', async function(req, rep) {
        var credentials = JSON.parse(fs.readFileSync(credentials_json, 'utf8'));

         if (!SESSION.get(req.headers['backend-authorization']))
             return { success: false, msg: 'Authorization required' }

        if (req.body === null ||
            req.body.password_current === undefined ||
            req.body.password_new === undefined ||
            req.body.password_confirm === undefined
        )
            return { success: false, msg: 'Required password_current, password_new, password_confirm.' };

        if (credentials.password !== HASH.md5(req.body.password_current))
            return { success: false, msg: 'Wrong current password' };

        if (req.body.password_new === '')
            return { success: false, msg: "New password can't be empty" };

        if (req.body.password_new !== req.body.password_confirm)
            return { success: false, msg: 'Passwords do not match' };

        fs.writeFileSync(credentials_json, JSON.stringify({ "username": "admin", "password": HASH.md5(req.body.password_new) }));
        credentials = JSON.parse(fs.readFileSync(credentials_json, 'utf8'))

        if (credentials.password === HASH.md5(req.body.password_new))
            return { success: true, msg: 'Password changed' };
        else
            return { success: false, msg: 'Something went wrong' };
    })


    /**
     *
     */
    fastify.post('/signin', async function(req, rep) {
        const credentials = JSON.parse(fs.readFileSync(credentials_json, 'utf8'));

        if (req.headers['backend-authorization'] !== undefined)
            session_id = req.headers['backend-authorization'];
        else
            session_id  = HASH.md5(Math.random());

        if (SESSION.get(session_id))
            return { success: true, msg: 'Already authorized', data: session_id };

        if (req.body === null || req.body.username === undefined || req.body.password === undefined)
            return { success: false, msg: 'Required username and password' };

        if (credentials.username !== req.body.username || credentials.password !== HASH.md5(req.body.password))
            return { success: false, msg: 'Wrong username or password' };

        SESSION.set(session_id, {});

        return { success: true, msg: 'Authorized successfully', data: session_id };
    })


    /**
     *
     */
    fastify.post('/signout', async function(req, rep) {
        var session_id = req.headers['backend-authorization'];

        if (!SESSION.get(session_id)) {

        } else {
            SESSION.unset(session_id);
        }

        return { success: true, msg: 'Successfully' }
    })
}


module.exports = routes
