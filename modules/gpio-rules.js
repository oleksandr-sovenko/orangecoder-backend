async function routes(fastify, options) {

    /* =====================================
        /gpio-rules
    ===================================== */

    fastify.get('/gpio-rules', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }

        return { rules: ['rule-1', 'rule-2', 'rule-3'] }
    })

    /* =====================================
        /gpio-rules/add
    ===================================== */

    fastify.get('/gpio-rules/add', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }

        return { hello: 'asdasd' }
    })

    /* =====================================
        /gpio-rules/update
    ===================================== */

    fastify.get('/gpio-rules/update', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }

        return { hello: 'asdasd' }
    })

    /* =====================================
        /gpio-rules/get
    ===================================== */

    fastify.get('/gpio-rules/get', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }

        return { hello: 'asdasd' }
    })

    /* =====================================
        /gpio-rules/remove
    ===================================== */

    fastify.get('/gpio-rules/remove', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }
        
        return { hello: 'asdasd' }
    })

}

module.exports = routes