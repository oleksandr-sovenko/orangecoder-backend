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
import moment from 'moment-timezone';


window.ace = ace
window.base64 = base64

var host = location.host;


if (localStorage['timezone'] === undefined)
    localStorage['timezone'] = 'UTC';
if (localStorage['language'] === undefined)
    localStorage['language'] = 'en';


Template7.global = {
    locale: localStorage['language'],
    i18n: {
        'ua': {
            'Dashboard': 'Панель приладів',
            'Navigation': 'Навігація',
            'Action': 'Дія',
            'Uptime': 'Час роботи',
            'Temperature': 'Температура',

            'Username': 'І\'мя користувача',
            'Password': 'Пароль',
            'version': 'версія',
            'Login': 'Авторизуватися',

            'GPIO devices': 'GPIO пристрої',
            'Programming': 'Програмування',
            'Storage': 'Cховище',
            'Logout': 'Вихід',

            'List GPIO Devices': 'Список GPIO пристроїв',
            'Name': 'Назва',
            'Device': 'Пристрій',
            'Activity': 'Активність',

            'Date': 'Дата',

            'Editor': 'Редактор',
            'Console': 'Консоль',

            'Add': 'Добавити',
            'Run': 'Запустити',
            'Stop': 'Зупинити',
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

            // Storage

            'List of files and directories': 'Список файлів і каталогів',
            'Folder': 'Каталог',
            'File': 'Файл',
            'Refresh': 'Оновити',

            // Settings

            'Settings': 'Налаштування',
            'General': 'Загальні',
            'Language': 'Мова',
            'Timezone': 'Часовий пояс',
            'Your current time zone': 'Ваш поточний часовий пояс',

			'Change password': 'Змінити пароль',
			'Old password': 'Старий пароль',
			'Current your password': 'Поточний пароль',
			'New password': 'Новий пароль',
			'Your new password': 'Ваш новий пароль',
			'Confirm password': 'Підтвердьте пароль',
			'Enter your new password again': 'Введіть свій новий пароль ще раз',
			'Change': 'Змінити',

            'Management': 'Управління',

            'Firmware Upgrade': 'Оновлення прошивки',
            'Upgrade the board\'s firmware to obtain new functionalities. And some bugs and malfunctions may be fixed in new firmware. Please refer to the release notes for details. It will take minutes to upload and upgrade the firmware, please be patient.': 'Оновіть програмне забезпечення плати для отримання нових функціональних можливостей. І деякі помилки та несправності можуть бути виправлені в новій прошивці. Для детальної інформації зверніться до приміток до випуску. Щоб завантажити та оновити прошивку, пройдуть кілька хвилин. Будьте терплячі.',
            'Upgrade': 'Оновити',

            'System Reboot': 'Перезавантаження системи',
            'You can reboot the system if the board are working abnormally.': 'Ви можете перезавантажити систему, якщо плата працює ненормально.',
            'Reboot': 'Перезавантажити',
        },
        'ru': {
            'Dashboard': 'Панель приборов',
            'Navigation': 'Навигация',
            'Action': 'Действие',
            'Uptime': 'Время работы',
            'Temperature': 'Температура',

            'Username': 'Имя пользователя',
            'Password': 'Пароль',
            'version': 'версия',
            'Login': 'Авторизироваться',

            'GPIO devices': 'GPIO устройства',
            'Programming': 'Программирование',
            'Storage': 'Хранилище',
            'Logout': 'Выход',

            'List GPIO Devices': 'Список GPIO устройств',
            'Name': 'Название',
            'Device': 'Устройство',
            'Activity': 'Активность',

            'Date': 'Дата',

            'Editor': 'Редактор',
            'Console': 'Консоль',

            'Add': 'Добавить',
            'Run': 'Запустить',
            'Stop': 'Остановить',
            'Cancel': 'Отмена',
            'Close': 'Закрыть',
            'Save': 'Зберегти',
            'Title': 'Название',
            'Description': 'Описание',
            'Back': 'Назад',


            'No algorithms yet': 'Еще нет алгоритмов',
            'List of algorithms': 'Список алгоритмов',
            'New Algorithm': 'Новый алгоритм',
            'Edit Algorithm': 'Редактирование алгоритма',

            // Storage

            'List of files and directories': 'Список файлов и каталогов',
            'Folder': 'Каталог',
            'File': 'Файл',
            'Refresh': 'Обновить',

            // Settings

            'Settings': 'Настройки',
            'General': 'Общее',
            'Language': 'Язык',
            'Timezone': 'Часовой пояс',
            'Your current time zone': 'Ваш текущий часовой пояс',

            'Change password': 'Изменить пароль',
            'Old password': 'Старый пароль',
            'Current your password': 'Текущий пароль',
            'New password': 'Новый пароль',
            'Your new password': 'Ваш новый пароль',
            'Confirm password': 'Подтвердите пароль',
            'Enter your new password again': 'Введите пароль еще раз',
            'Change': 'Изменить',

            'Management': 'Управление',

            'Firmware Upgrade': 'Обновление прошивки',
            'Upgrade the board\'s firmware to obtain new functionalities. And some bugs and malfunctions may be fixed in new firmware. Please refer to the release notes for details. It will take minutes to upload and upgrade the firmware, please be patient.': 'Обновите программное обеспечение платы для получения новых функциональных возможностей. И некоторые ошибки и неисправности могут быть исправлены в новой прошивке. Для детальной информации обратитесь к примечаниям к выпуску. Чтобы загрузить и обновить прошивку, пройдут несколько минут. Будьте терпеливы.',
            'Upgrade': 'Обновить',

            'System Reboot': 'Перезагрузка системы',
            'You can reboot the system if the board are working abnormally.': 'Вы можете перезагрузить систему, если плата работает ненормально.',
            'Reboot': 'Перезагрузить',
        },
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
    root: '#app',
    animate: false,
    name: 'OrangeCoder',
    version: '1.0.0',
    theme: 'aurora',

    data: function () {
        return {
            url: '//' + host,
            device: {},
            storage: {
                files: []
            },
            programming: {
                algorithms: []
            },
        };
    },

    methods: {
        storage: {
            files: function(path, callback) {
                app.request.json(app.data.url + '/storage/list/' + path, { }, function(files, status, xhr) {
                    app.data.storage.files = files;
                    if (callback !== undefined)
                        callback(files);
                }, function(xhr, status) {
                    if (callback !== undefined)
                        callback(undefined);
                });
            },
        },

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

                    // app.methods.device();
                    app.methods.programming.algorithms();
                    app.methods.storage.files('');

                    rws_start();
                } else {
                    if (data === undefined)
                        app.loginScreen.open('.login-screen');
                    else
                        app.dialog.alert(res.msg, 'Error', function() { });

                    if (callback !== undefined)
                        callback(res.data);

                    rws_stop();
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


$$('title').text(app.name);
$$('.version').text(app.version);


/**
 *
 */
// $$(document).on('page:init', function(e) {
//     $$('[data-' + app.data.lang + ']').each(function(i, e) {
//         e.innerHTML = e.getAttribute('data-' + app.data.lang);
//     });
// })


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


/**
 *
 */
window.addEventListener('resize', function() {
    $$('.popup.modal-in .editor').css({ height: ($$(window).height() - 250) + 'px' });
    $$('.popup.modal-in .console').css({ height: ($$(window).height() - 270) + 'px' });
}, false);


/**
 *
 */
function rws_stop() {
    try {
        window.rws.close();
    } catch(e) {

    }
}


/**
 *
 */
function rws_start() {
    app.dialog.preloader('Connecting ...')
    window.rws = new ReconnectingWebSocket('ws://' + host + '/'+ localStorage['Backend-Authorization']);

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

        if (msg.action === 'status') {
            localStorage['timezone'] = msg.data.timezone;

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
            }

            app.progressbar.set('.cpu-temperature', msg.data.cpu.temperature);
            app.progressbar.set('.disk-usage', Math.round(100 - ((msg.data.disk.free / msg.data.disk.total) * 100)));
            app.progressbar.set('.ram-usage', Math.round(100 - ((msg.data.memory.free / msg.data.memory.total) * 100)));

            var html_network =
                '<div class="row">' +
                '   <div class="col"><strong>Interface</strong></div>' +
                '   <div class="col"><strong>Address</strong></div>' +
                '   <div class="col"><strong>Netmask</strong></div>' +
                '   <div class="col"><strong>CIDR</strong></div>' +
                '   <div class="col"><strong>Mac Address</strong></div>' +
                '</div>';

            for (var intr in msg.data.network) {
                for (var i in msg.data.network[intr]) {
                    var item = msg.data.network[intr][i];

                    html_network += '<div class="row">';
                    html_network += '   <div class="col">' + item.family + ' ' + intr + '</div>';
                    html_network += '   <div class="col">' + item.address + '</div>';
                    html_network += '   <div class="col">' + item.netmask + '</div>';
                    html_network += '   <div class="col">' + item.cidr + '</div>';
                    html_network += '   <div class="col">' + item.mac + '</div>';
                    html_network += '</div>';
                }
            }

            $$('.info-network').html(html_network);
            $$('.info-uptime').html(moment.utc(msg.data.uptime * 1000).format('HH:mm:ss'));
        }


        if (msg.type === 'console') {
            if ($$('.popup.modal-in .console[data-algorithm-id="' + msg.process.id + '"]').length)
                $$('.popup.modal-in .console').append('<p class="text-color-gray">PROC' + msg.process.pid + ', ' + msg.message + '</p>').scrollTop(999999);
            else {
                if ($$('.popup.modal-in .console').length)
                    $$('.popup.modal-in .console').append('<p class="text-color-gray">PROC' + msg.process.pid + ', ' + msg.message + '</p>').scrollTop(999999);
            }
        }

        if (msg.type === 'error') {
            if ($$('.popup.modal-in .console[data-algorithm-id="' + msg.process.id + '"]').length)
                $$('.popup.modal-in .console').append('<p class="text-color-red">' + msg.message + '</p>').scrollTop(999999);
            else {
                if ($$('.popup.modal-in .console').length)
                    $$('.popup.modal-in .console').append('<p class="text-color-red">' + msg.message + '</p>').scrollTop(999999);
            }
        }
    });
}

