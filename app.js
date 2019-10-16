global.sessions = [];

const fastify = require('fastify')({ logger: false })

fastify.register(require('fastify-cors'))

fastify.register(require('./modules/auth'))
fastify.register(require('./modules/gpio-rules'))

fastify.listen(3000, '0.0.0.0', function(err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
})

/* =====================================
	get_unix_timestamp()
===================================== */

global.get_unix_timestamp = function() {
	return Math.round(new Date().getTime() / 1000);
}

/* =====================================
	is_authorized(request)
===================================== */

global.is_authorized = function(request) {
	const timestamp = global.get_unix_timestamp();

	if (request.headers.authorization !== undefined &&
	    global.sessions[request.headers.authorization] !== undefined &&
	    global.sessions[request.headers.authorization].expire > timestamp) {
		return true;
	} else {
	    return false;
	}
}


