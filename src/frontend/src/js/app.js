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


import 'framework7/css/framework7.bundle.css';


import $$                    from 'dom7';
import Template7             from 'template7';
import Framework7            from 'framework7/framework7.esm.bundle.js';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Base64 as base64 }  from 'js-base64';

/**
 *
 */
import '../css/icons.css';
import '../css/app.less';


/**
 *
 */
import              './helpers.js';
import moment  from 'moment-timezone';
import routes  from './routes.js';
import ace     from 'ace-builds'
import              'ace-builds/webpack-resolver';


window.ace    = ace
window.base64 = base64


var host = location.host == 'localhost:8080' ? '172.1.1.30' : location.host;


if (localStorage['timezone'] === undefined)
    localStorage['timezone'] = 'UTC';
if (localStorage['language'] === undefined)
    localStorage['language'] = 'en';


moment.locale(localStorage['language'].replace('ua', 'uk'));


Template7.global = {
    locale: localStorage['language'],
    i18n: {
        'ua': {
            'Error': 'Помилка',

            'Dashboard': 'Панель приладів',
            'Navigation': 'Навігація',
            'Action': 'Дія',
            'Uptime': 'Час роботи',
            'Board': 'Плата',
            'Temperature': 'Температура',
            'Usage': 'Використання',
            'Disk': 'Диск',
            'Network Interfaces': 'Мережеві інтерфейси',
            'Interface': 'Інтерфейс',
            'Address': 'Адреса',
            'Netmask': 'Маска мережі',
            'CIDR': 'CIDR',
            'Mac Address': 'Mac адреса',

            'Username': "І'мя користувача",
            'Your Username': "Ваше і'мя користувача",
            'Password': 'Пароль',
            'Your Password': "Ваш пароль",
            'version': 'версія',
            'Sign In': 'Авторизуватися',

            'Programming': 'Програмування',
            'Storage': 'Cховище',
            'Logout': 'Вихід',
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
            'Arbitrary name': 'Довільна назва',
            'Short description': 'Короткий опис',

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
            'Rebooting': 'Перезавантаження',
            'Are you sure you want to reload the system?': 'Ви впевнені, що хочете перезавантажити систему?',
        },
        'ru': {
            'Error': 'Ошибка',

            'Dashboard': 'Панель приборов',
            'Navigation': 'Навигация',
            'Action': 'Действие',
            'Uptime': 'Время работы',
            'Board': 'Плата',
            'Temperature': 'Температура',
            'Usage': 'Использование',
            'Disk': 'Диск',
            'Network Interfaces': 'Сетевые интерфейсы',
            'Interface': 'Интерфейс',
            'Address': 'Адрес',
            'Netmask': 'Маска сети',
            'CIDR': 'CIDR',
            'Mac Address': 'Mac адресс',

            'Username': 'Имя пользователя',
            'Your Username': 'Ваше имя пользователя',
            'Password': 'Пароль',
            'Your Password': "Ваш пароль",
            'version': 'версия',
            'Sign In': 'Авторизироваться',

            'Programming': 'Программирование',
            'Storage': 'Хранилище',
            'Logout': 'Выход',
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
            'Arbitrary name': 'Произвольное имя',
            'Short description': 'Краткое описание',

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
            'Rebooting': 'Перезагрузка',
            'Are you sure you want to reload the system?': 'Вы уверены, что хотите перезагрузить систему?',
        },
    },
    gpio: {
        readall:[]
    },
};


var leftPanel   = Template7.compile($$('script#leftPanel').html()),
    loginScreen = Template7.compile($$('script#loginScreen').html());


$$('#app').append(loginScreen({ className: 'login-screen' })).append(leftPanel());


/**
 *
 */
var app = new Framework7({
    root   : '#app',
    name   : 'OrangeCoder',
    version: '1.0.0 (20200909.1)',
    theme  : 'aurora',

    checkLogin: false,
    rebooting: false,

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
        i18n: function(v) {
            var t7 = Template7.global,
                result = '';

            try {
                result = t7.i18n[t7.locale][v];
            } catch(e) {
                result = v;
            }

            return result !== undefined ? result : v;
        },

        ajax(method, path, data, success, error, complete) {
            app.request({
                url: app.data.url + path,
                method: method,
                dataType: 'json',
                data: data,
                success: function(result, status, xhr) {
                    if (typeof success === 'function')
                        success(result);
                },
                error: function(xhr, status) {
                    if (typeof error === 'function')
                        error();
                },
                complete: function(xhr, status) {
                    if (typeof error === 'complete')
                        complete();
                }
            });
        },

        // Settings

        reboot: function(success, error, complete) {
            app.methods.ajax('POST', '/management/reboot', { }, success, error, complete);
        },

        setTimezone: function(data, success, error, complete) {
            app.methods.ajax('POST', '/settings/timezone', data, success, error, complete);
        },

        changePassword: function(data, success, error, complete) {
            app.methods.ajax('POST', '/settings/password', data, success, error, complete);
        },

        // Algorithms

        getAlgorithms: function(success, error, complete) {
            app.methods.ajax('GET', '/algorithms', { }, success, error, complete);
        },

        addAlgorithm: function(data, success, error, complete) {
            app.methods.ajax('PUT', '/algorithm', data, success, error, complete);
        },

        updateAlgorithm: function(data, success, error, complete) {
            app.methods.ajax('POST', '/algorithm/' + data.id, data, success, error, complete);
        },

        deleteAlgorithm: function(id, success, error, complete) {
            app.methods.ajax('DELETE', '/algorithm/' + id, { }, success, error, complete);
        },

        runAlgorithm: function(id, success, error, complete) {
            app.methods.ajax('POST', '/algorithm/run/' + id, { }, success, error, complete);
        },

        stopAlgorithm: function(id, success, error, complete) {
            app.methods.ajax('POST', '/algorithm/stop/' + id, { }, success, error, complete);
        },

        runCode: function(data, success, error, complete) {
            app.methods.ajax('POST', '/algorithm/runcode', data, success, error, complete);
        },

        stopCode: function(data, success, error, complete) {
            app.methods.ajax('POST', '/algorithm/stopcode/' + data.id, { }, success, error, complete);
        },

        // Files

        getFiles: function(path, success, error, complete) {
            app.methods.ajax('GET', '/storage/list' + path, { }, success, error, complete);
        },

        addFile: function(data, success, error, complete) {
            app.methods.ajax('PUT', '/algorithm', data, success, error, complete);
        },

        deleteFile: function(success, error, complete) {

        },

        getDevice: function(callback) {
            app.methods.ajax('GET', '/device', { }, function(response, status, xhr) {
                app.data.device = response;

                if (typeof callback === 'function')
                    callback(response);
            }, function(xhr, status) {
                if (typeof callback === 'function')
                    callback(undefined);
            });
        },

        signIn: function(data, callback) {
            app.methods.ajax('POST', '/signin', data, function(response, status, xhr) {
                rws_stop();

                if (response.success) {
                    app.request.setup({
                        headers: {
                            'Backend-Authorization': response.data
                        }
                    });

                    if (app.panel.get('.panel-left') === undefined)
                        app.panel.create({ el: '.panel-left', visibleBreakpoint: 960 });

                    app.views.main.router.navigate('/dashboard', { animate: false });

                    localStorage['Backend-Authorization'] = response.data;
                    app.loginScreen.close('.login-screen');

                    rws_start();
                } else {
                    if (data === undefined)
                        app.loginScreen.open('.login-screen');
                    else
                        app.dialog.alert(response.msg, app.methods.i18n('Error'));
                }
            }, function(status, xhr) {
                app.dialog.alert(app.methods.i18n('Something went wrong'));
            });
        },

        signOut: function() {
            app.methods.ajax('POST', '/signout', {}, function(response, status, xhr) {
                if (response.success) {
                    app.request.setup({
                        headers: { }
                    });

                    localStorage.removeItem('Backend-Authorization');
                    app.loginScreen.open('.login-screen');
                } else {
                    app.dialog.alert(response.msg, app.methods.i18n('Error'));
                }
            }, function(xhr, status) {

            }, function(xhr, status) {
                rws_stop();
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
$$(document).on('click', '.login-screen .button', function() {
    app.methods.signIn(
        app.form.convertToData('.login-screen form')
    );
});


/**
 *
 */
$$(document).on('click', '.signout', function() {
    app.methods.signOut();
});


/**
 *
 */
if (localStorage['Backend-Authorization'] !== undefined) {
    app.request.setup({
        headers: {
            'Backend-Authorization': localStorage['Backend-Authorization'],
            'Locale': localStorage['language']
        }
    });
}


/**
 *
 */
app.methods.signIn();


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
        app.params.rebooting = false;

        app.dialog.close();

        if (app.params.checkLogin) {
            app.params.checkLogin = false;
            app.methods.signIn();
        }
    });

    window.rws.addEventListener('error', function(e) {
        app.params.checkLogin = true;

        if (!$$('.dialog.dialog-preloader.modal-in').length)
            if (app.params.rebooting)
                app.dialog.preloader(app.methods.i18n('Rebooting') + ' ...');
            else
                app.dialog.preloader(app.methods.i18n('Connecting') + ' ...');
    });

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

            var html_network = `
                <div class="row">
                   <div class="col"><strong>${app.methods.i18n('Interface')}</strong></div>
                   <div class="col"><strong>${app.methods.i18n('Address')}</strong></div>
                   <div class="col"><strong>${app.methods.i18n('Netmask')}</strong></div>
                   <div class="col"><strong>${app.methods.i18n('CIDR')}</strong></div>
                   <div class="col"><strong>${app.methods.i18n('Mac Address')}</strong></div>
                </div>
            `;

            for (var intr in msg.data.network) {
                for (var i in msg.data.network[intr]) {
                    var item = msg.data.network[intr][i];

                    html_network += `
                        <div class="row">
                           <div class="col">${item.family} ${intr}</div>
                           <div class="col">${item.address}</div>
                           <div class="col">${item.netmask}</div>
                           <div class="col">${item.cidr}</div>
                           <div class="col">${item.mac}</div>
                        </div>
                    `;
                }
            }

            $$('.info-network').html(html_network);
            if (parseInt(msg.data.uptime) > 86400)
                $$('.info-uptime').html(`${moment.utc(msg.data.uptime * 1000).add(-1, 'days')
                    .format('D')} day(s) ${moment.utc(msg.data.uptime * 1000).format('HH:mm:ss')}`);
            else
                $$('.info-uptime').html(`${moment.utc(msg.data.uptime * 1000)
                    .format('HH:mm:ss')}`);
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
