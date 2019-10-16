const util = require('util');
const exec = util.promisify(require('child_process').exec);

let pin9 = -1;

setInterval(async function() {
    const { stdout, stderr } = await exec('gpio read 9');
    pin9 = parseInt(stdout);
}, 50);

async function routes (fastify, options) {
    fastify.get('/ws/rule1', { websocket: true }, function(connection, req) {
        connection.socket.on('message', function(message) {
            // message === 'hi from client'
            connection.socket.send('hi from server')
        });
    });

    fastify.get('/rule1', async function(request, reply) {
        return { pin9: pin9 }
    })
}

module.exports = routes