// info.js
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


const fs = require('fs'),
      os = require('os'),
      { execSync } = require('child_process'),
      CONFIG  = require('../config');


/**
 *  get_device_info
 *
 *  @param callback
 */
function get_device_info() {
    var board   = '',
        model   = 'Unknown',
        serial  = 'Unknown',
        version = '',
        scheme  = '';

    if (fs.existsSync('/etc/armbian-release')) {
        var content = fs.readFileSync('/etc/armbian-release').toString();

        board = content
                .replace(/.*BOARD=/s, '')
                .replace(/\n.*/s, '').trim();

        model = content
                .replace(/.*BOARD_NAME="/s, '')
                .replace(/".*/s, '').trim();

        version = content
                  .replace(/.*VERSION=/s, '')
                  .replace(/\n.*/s, '').trim();
    }

    if (fs.existsSync('/proc/cpuinfo'))
        serial = fs.readFileSync('/proc/cpuinfo')
                .toString()
                .replace(/.*Serial\t\t: /s, '').trim();

    var result = execSync('gpio readall').toString(),
        temp   = result.split('\n'),
        gpio   = [],
        fields = [];

    for (var i in temp) {
        var items = temp[i].split('|');

        if (items.length > 1 && !/Physical/.test(temp[i])) {
            gpio.push({
                left: {
                    'H2+': items[1].trim(),
                    'wPi': items[2].trim(),
                    'Name': items[3].trim(),
                    'Mode': items[4].trim(),
                    'V': items[5].trim(),
                    'Physical': items[6].trim()
                },
                right: {
                    'Physical': items[8].trim(),
                    'V': items[9].trim(),
                    'Mode': items[10].trim(),
                    'Name': items[11].trim(),
                    'wPi': items[12].trim(),
                    'H2+': items[13].trim(),
                }
            });
        }
    }

    if (fs.existsSync(CONFIG.dir.public + '/static/imgs/' + board + '.svg'))
        scheme = fs.readFileSync(CONFIG.dir.public + '/static/imgs/' + board + '.svg').toString();

    return {
        platform: 'Linux',
        version: os.release() + (version !== '' ? ', Armbian ' + version : ''),
        model: model,
        manufacturer: 'Xunlong',
        serial: serial,
        scheme: scheme,
        gpio: gpio
    }
}


/**
 *  get_cpu_usage
 *
 *  @param callback
 */
function get_cpu_usage(callback) {
	var result = [];

    var stats = get_cpu_info();
    var startIdle = stats.idle;
    var startTotal = stats.total;

    setTimeout(function() {
        var stats = get_cpu_info();
        var endIdle = stats.idle;
        var endTotal = stats.total;

		var cpus = os.cpus();
 		for (var cpu in cpus) {
        	if (!cpus.hasOwnProperty(cpu)) continue;

        	var idle  = endIdle[cpu]  - startIdle[cpu];
        	var total = endTotal[cpu] - startTotal[cpu];

			result.push({
				percentage: Math.round(100 - ((idle / total) * 100))
			});

        }

		callback(result);
    }, 1000);
}


/**
 *  get_cpu_info
 *
 *  @param callback
 */
function get_cpu_info(callback) {
    var cpus = os.cpus();

    var user  = {};
    var nice  = {};
    var sys   = {};
    var idle  = {};
    var irq   = {};
    var total = {};

    for(var cpu in cpus){
        if (!cpus.hasOwnProperty(cpu)) continue;

        if (user[cpu] === undefined) user[cpu] = 0;
        if (nice[cpu] === undefined) nice[cpu] = 0;
        if (sys[cpu]  === undefined) sys[cpu]  = 0;
        if (irq[cpu]  === undefined) irq[cpu]  = 0;
        if (idle[cpu] === undefined) idle[cpu] = 0;

        user[cpu] += cpus[cpu].times.user;
        nice[cpu] += cpus[cpu].times.nice;
        sys[cpu]  += cpus[cpu].times.sys;
        irq[cpu]  += cpus[cpu].times.irq;
        idle[cpu] += cpus[cpu].times.idle;
    	total[cpu] = user[cpu] + nice[cpu] + sys[cpu] + idle[cpu] + irq[cpu];
    }

    return {
        'idle': idle,
        'total': total
    };
}


module.exports = { get_device_info, get_cpu_usage };
