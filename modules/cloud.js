// cloud.js
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


global.cloud = {};


/** cloudLoadUser
 *
 */
global.cloudLoadUser = async function() {
	var result = {};

	if (fs.existsSync('./data/cloud.json')) {
		try {
    		result = JSON.parse(fs.readFileSync('./data/cloud.json', 'utf8'));
    	} catch(e) {
    		result = {};
    	}
	}

	return result;
}


/** cloudSaveUser
 *
 */
global.cloudSaveUser = function(user) {
	fs.writeFileSync('./data/cloud.json', JSON.stringify(user));
}


/** cloudCheckSession
 *
 */
global.cloudIsSessionActive = async function(user) {
    if (cloud.user === undefined)
        return false;

    var result = await request({
        headers: { 'Authorization': cloud.user.session.id },
        method: 'GET',
        url:'http://orangecoder.org:3000/account',
        json: { }
    });

    if (result.success)
        return true;
    else
        return false;
}


/**
 *
 */
async function routes(fastify, options) {
    /**
     *
     */
    fastify.post('/cloud/signin', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (req.body === null ||
            req.body.email === undefined ||
            req.body.password === undefined
        )
            return { success: false, msg: 'Require email, password' };

        var result = await request({
            method: 'POST',
            url:'http://orangecoder.org:3000/signin',
            json: { email: req.body.email, password: req.body.password }
        });

        if (result.success)
        	cloudSaveUser(result.user);

        return result;
    });


    /**
     *
     */
    fastify.post('/cloud/signout', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (cloud_user.session !== undefined && cloud_user.session.id !== undefined) {
        	var result = await request({
				headers: { 'Authorization': cloud_user.session.id },
            	method: 'POST',
            	url:'http://orangecoder.org:3000/signout'
        	});
        }

		return { success: true, msg: '' };
    })


    /**
     *
     */
    fastify.post('/cloud/notifications/send', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        // req.body.device_id === undefined ||
        // req.body.title     === undefined ||
        // req.body.body

        // if (cloud_user.session !== undefined && cloud_user.session.id !== undefined) {
        //     var result = await request({
        //         headers: { 'Authorization': cloud_user.session.id },
        //         method: 'POST',
        //         url:'http://orangecoder.org:3000/signout'
        //     });
        // }

        return { success: true, msg: '' };
    })


    /**
     *  Initialization
     */
    cloud.user   = await cloudLoadUser();
    cloud.active = await cloudIsSessionActive();
}


module.exports = routes
