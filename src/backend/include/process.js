// process.js
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


const CONFIG = require('../config'),
      { spawn } = require('child_process');


/**
 *
 *
 */
const PROCESS = {
    list: function() {
        return global.backend.process;
    },

    get: function(id) {
        return global.backend.process[id];
    },

    run: function(id, session_id) {
        var script = spawn(process.argv[0], [process.argv[1], 'vm', CONFIG.dir.algoritms + '/' + id]);
        
        global.backend.process[id] = {
            session_id: session_id,
            script: script
        }
    },

    kill: function(id) {
        try {
            global.backend.process[id].script.kill();
            delete global.backend.process[id];
        } catch (e) {

        }
    },

    killall_by_session(session_id) {
        for (var id in global.backend.process) {
            if (global.backend.process[id].session_id == session_id)
                this.kill(id);
        }
    }
}


if (global.backend.process === undefined) {
    global.backend.process = [];
}


module.exports = PROCESS;