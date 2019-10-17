const util = require('util'),
      exec = util.promisify(require('child_process').exec);

async function routes(fastify, options) {

    /* =====================================
        /gpio-readall
    ===================================== */

    fastify.get('/gpio-readall', async function(request, reply) {
        const { stdout, stderr } = await exec('gpio readall');

        var temp = stdout.split('\n'),
            data = [],
            fields = [];

        for (var i in temp) {
            var items = temp[i].split('|');

            if (items.length > 1 && !/Physical/.test(temp[i])) {
                data.push({
                    'H2+': items[1].trim(),
                    'wPi': items[2].trim(),
                    'Name': items[3].trim(),
                    'Mode': items[4].trim(),
                    'V': items[5].trim(),
                    'Physical': items[6].trim()
                });

                data.push({
                    'H2+': items[13].trim(),
                    'wPi': items[12].trim(),
                    'Name': items[11].trim(),
                    'Mode': items[10].trim(),
                    'V': items[9].trim(),
                    'Physical': items[8].trim()
                });
            }
        }

        return { success: true, msg:'', data: data }
    })

}

module.exports = routes