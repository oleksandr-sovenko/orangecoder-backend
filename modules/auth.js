const   md5 = require('md5'),
        fs = require('fs');
 
async function routes(fastify, options) {

    /* =====================================
        /signin
    ===================================== */

    fastify.post('/signin', async function(request, reply) {
        const credentials = JSON.parse(fs.readFileSync('./data/credentials.json', 'utf8')),
              session_id = md5(Math.random()),
              timestamp = global.get_unix_timestamp(),
              is_authorized = global.is_authorized(request);

        if (is_authorized)
            return { success: true, msg: 'Already authorized', data: request.headers.authorization };

        if (request.body.username === undefined || request.body.password === undefined)
            return { success: false, msg: 'Require username and password' };

        if (credentials.username !== request.body.username || credentials.password !== md5(request.body.password))
            return { success: false, msg: 'Wrong username or password' };

        global.sessions[session_id] = { expire: timestamp + 3600 };

        return { success: true, msg: 'Authorized successfully', data: session_id };
    })

    /* =====================================
        /signout
    ===================================== */

    fastify.post('/signout', async function(request, reply) {
        if (request.headers.authorization !== undefined && global.sessions[request.headers.authorization] !== undefined) {
            
        } else {
            delete global.sessions[request.headers.authorization];
        }

        return { success: true, msg: 'Successfully' }
    })

}

module.exports = routes
