// app.js
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


import $$ from 'dom7';
import Template7 from 'template7';
import Framework7 from 'framework7/framework7.esm.bundle.js';
import 'framework7/css/framework7.bundle.css';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Base64 as base64 } from 'js-base64';

/**
 *
 */
import '../css/icons.css';
import '../css/app.less';


/**
 *
 */
import routes  from './routes.js';
import './helpers.js';
import ace from 'ace-builds'
import 'ace-builds/webpack-resolver';

window.ace = ace
window.base64 = base64

var host = location.host;

Template7.global = {
    locale: 'ua',
    i18n: {
        'ua': {
            'Action': 'Дія',

            'Username': 'І\'мя користувача',
            'Password': 'Пароль',
            'version': 'версія',
            'Login': 'Авторизуватися',

            'GPIO devices': 'GPIO пристрої',
            'Programming': 'Програмування',
            'File System': 'Файлова система',
            'Logout': 'Вихід',

            'List GPIO Devices': 'Список GPIO пристроїв',
            'Name': 'Назва',
            'Device': 'Пристрій',
            'Activity': 'Активність',

            'Date': 'Дата',

            'Add': 'Добавити',
            'Cancel': 'Скасувати',
            'Close': 'Закрити',
            'Save': 'Зберегти',
            'Title': 'Назва',
            'Description': 'Опис',
            'Back': 'Назад',


            'No algorithms yet': 'Немає алгоритмів ще',
            'List of algorithms': 'Список алгоритмів',
            'New Algorithm': 'Новий алгоритм',
            'Edit Algorithm': 'Редагування алгоритму',
        },
        'ru': {
            'Cancel': 'Скасувати'
        }
    },
    gpio: {
        readall:[]
    },
};

var appPanel = Template7.compile($$('.template-app-pannel').html()),
    appLoginScreen = Template7.compile($$('.template-app-login-screen').html());

$$('#app').append(appPanel());
$$('#app').append(appLoginScreen({ className: 'login-screen' }));


/**
 *
 */
var app = new Framework7({
    root: '#app', // App root element
    animate: false,

    name: 'Orange Maker', // App name
    theme: 'aurora', // Automatic theme detection
    // App root data
    data: function () {
        return {
            url: 'http://100.168.210.102', //'//' + host,
            device: {},
            programming: {
                algorithms: []
            },
            gpio: {
                devices: [],
                readall: [],
            },
            w1: {
                devices: [],
            },
            mobile: {
                devices: [],
            }
        };
    },

    methods: {
        programming: {
            algorithms: function(callback) {
                app.request.json(app.data.url + '/algorithms', { }, function(algorithms, status, xhr) {
                    app.data.programming.algorithms = algorithms;
                    if (callback !== undefined)
                        callback(algorithms);
                }, function(xhr, status) {
                    if (callback !== undefined)
                        callback(undefined);
                });
            },
        },

        gpio: {
            devices: function(callback) {
                app.request.json(app.data.url + '/gpio/devices', { }, function(res, status, xhr) {
                    app.data.gpio.devices = res.data;
                    if (callback !== undefined)
                        callback(res.data);
                }, function(xhr, status) {
                    if (callback !== undefined)
                        callback(undefined);
                });
            },
            readall: function(callback) {
                app.request.json(app.data.url + '/gpio', { }, function(res, status, xhr) {
                    app.data.gpio.readall = res.data;
                    Template7.global.gpio.readall = res.data;
                    if (callback !== undefined)
                        callback(res.data);
                }, function(xhr, status) {
                    if (callback !== undefined)
                        callback(undefined);
                });
            }
        },

        w1: {
            devices: function(callback) {
                app.request.json(app.data.url + '/w1/devices', { }, function(devices, status, xhr) {
                    app.data.w1.devices = devices;
                    if (callback !== undefined)
                        callback(data.data);
                }, function(xhr, status) {
                    if (callback !== undefined)
                        callback(undefined);
                });
            }
        },

        device: function(callback) {
            app.request.json(app.data.url + '/device', { }, function(device, status, xhr) {
                app.data.device = device;
                if (callback !== undefined)
                    callback(device);
            }, function(xhr, status) {
                if (callback !== undefined)
                    callback(undefined);
            });
        },

        signin: function(data, callback) {
            app.request.postJSON(app.data.url + '/signin', data, function(res, status, xhr) {
                if (res.success) {
                    app.request.setup({
                        headers: {
                            'Backend-Authorization': res.data
                        }
                    });

                    localStorage['Backend-Authorization'] = res.data;

                    app.loginScreen.close('.login-screen');

                    if (callback !== undefined)
                        callback(res.data);

                    // app.methods.gpio.devices();
                    // app.methods.gpio.readall();
                    // app.methods.w1.devices();
                    app.methods.programming.algorithms();

                    // rws_start();
                } else {
                    if (data === undefined)
                        app.loginScreen.open('.login-screen');
                    else
                        app.dialog.alert(res.msg, 'Error', function() { });

                    if (callback !== undefined)
                        callback(res.data);

                    // rws_stop();
                }
            },function(xhr, status) {
                if (callback !== undefined)
                    callback(undefined);
            });
        },

        signout: function() {
            app.request.postJSON(app.data.url + '/signout', {}, function(data, status, xhr) {
                if (data.success) {
                    app.request.setup({
                        headers: { }
                    });

                    localStorage.removeItem('Backend-Authorization');

                    app.loginScreen.open('.login-screen');

                    rws_stop();
                } else {
                    app.dialog.alert(data.msg, 'Error', function() { });
                }
            },function(xhr, status) {

            });
        }
    },

    routes: routes,
});


/**
 *
 */
$$(document).on('page:init', function(e) {
    $$('[data-' + app.data.lang + ']').each(function(i, e) {
        e.innerHTML = e.getAttribute('data-' + app.data.lang);
    });
})


/**
 *
 */
$$(document).on('click', '.login-screen .button', function() {
    var data = app.form.convertToData('.login-screen form');

    app.methods.signin(data);
});


/**
 *
 */
$$(document).on('click', '.signout', function() {
    app.methods.signout();
});


/**
 *
 */
if (localStorage['Backend-Authorization'] !== undefined) {
    app.request.setup({
        headers: {
            'Backend-Authorization': localStorage['Backend-Authorization']
        }
    });
}


/**
 *
 */
app.methods.signin();


function rws_stop() {
    try {
        window.rws.close();
    } catch(e) {

    }
}


function rws_start() {
    app.dialog.preloader('Connecting ...')
    window.rws = new ReconnectingWebSocket('ws://' + host);

    window.rws.addEventListener('open', function(e) {
        console.log('open');
        app.dialog.close();
    });

    window.rws.addEventListener('error', function(e) {
        console.log('error');
        app.dialog.preloader('Connecting ...')
    });

    // window.rws.addEventListener('close', function(e) {
    //     console.log('close');
    //     app.dialog.preloader('Connecting ...')
    // });

    window.rws.addEventListener('message', function(msg) {
        try { msg = JSON.parse(msg.data); } catch(e) { msg = {}; }


        if (msg.action === undefined)
            return;


        if (msg.action === 'changes') {
            var device_activity = $$('.device-' + msg.id);

            if (msg.device === 'ds18b20') {
                if (parseFloat(msg.pins.out.value) > 0)
                    device_activity.html(msg.pins.out.value + '℃');
                else
                    device_activity.html('-');
            }

            if (msg.device === 'hc-sr501') {
                if (device_activity.length) {
                    if (parseInt(msg.pins.out.value) === 1)
                        device_activity.addClass('text-color-red');
                    else
                        device_activity.removeClass('text-color-red');
                }
            }
        }


        if (msg.action === 'status') {
            $$('.cpu-usage').addClass('hidden');
            for (var cpu in msg.data.cpu.usage) {
                var color = 'green';

                if (msg.data.cpu.usage[cpu].percentage > 40)
                    color = '#ff9500';

                if (msg.data.cpu.usage[cpu].percentage > 80)
                    color = 'red';

                if ($$('.cpu-usage-' + cpu).length) {
                    $$('.cpu-usage-' + cpu).parent().removeClass('hidden');
                    app.gauge.get('.cpu-usage-' + cpu).update({
                        value: msg.data.cpu.usage[cpu].percentage / 100,
                        valueText: msg.data.cpu.usage[cpu].percentage + '%',
                        valueTextColor: color,
                        borderColor: color,
                    });
                }

                console.log();
            }

            app.progressbar.set('.cpu-temperature', msg.data.cpu.temperature);
            app.progressbar.set('.disk-usage', Math.round(100 - ((msg.data.disk.free / msg.data.disk.total) * 100)));
            app.progressbar.set('.ram-usage', Math.round(100 - ((msg.data.memory.free / msg.data.memory.total) * 100)));
        }


        if (msg.action === 'console') {
            $$('.console').append(msg.data + '<br>');
        }
    });
}

