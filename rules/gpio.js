const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function routes(fastify, options) {

    /* =====================================
        gpio-readall
    ===================================== */
    fastify.get('/gpio-readall', async function(request, reply) {
        const { stdout, stderr } = await exec('gpio readall');

        let result = [];

        let arr = stdout.split('\n');

        for (let i in arr) {
            let items = arr[i].split('|');

            if (items.length > 1) {
                for (let j in items)
                    items[j] = items[j].trim()

                if (!/Physical/.test(arr[i])) {
                    result.push({
                        'H2+'     : items[1],
                        'wPi'     : items[2],
                        'Name'    : items[3],
                        'Mode'    : items[4],
                        'V'       : items[5],
                        'Physical': items[6],
                    })

                    result.push({
                        'H2+'     : items[13],
                        'wPi'     : items[12],
                        'Name'    : items[11],
                        'Mode'    : items[10],
                        'V'       : items[9],
                        'Physical': items[8],
                    })
                }
            }
        }

        return result
    })

}

module.exports = routes
