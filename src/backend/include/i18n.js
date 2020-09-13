// i18n.js
// Copyright (C) 2020 Oleksandr Sovenko (info@oleksandrsovenko.com)
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


/**
 *
 *
 */
const I18N = {
	data: {
		ua: {
			// src/backend/include/auth.js
			'Authorization required': 'Потрібна авторизація',
			'Required fields are not filled': "Обов'язкові поля не заповнені",
			'Successfully': 'Успішно',
			'Wrong current password': 'Неправильний поточний пароль',
			"New password can't be empty": 'Новий пароль не може бути порожнім',
			'Passwords do not match': 'Паролі не збігаються',
			'Something went wrong': 'Щось пішло не так',
			'Wrong username or password' : "Неправильне ім'я користувача або пароль",

			"Title can't be empty": 'Назва не може бути порожньою'
		},
		ru: {
			// src/backend/include/auth.js
			'Authorization required': 'Требуется авторизация',
			'Required fields are not filled': "Обязательные поля заполнены",
			'Successfully': 'успешно',
			'Wrong current password': 'Неправильный текущий пароль',
			"New password can't be empty": 'Новый пароль не может быть пустым',
			'Passwords do not match': 'Пароли не совпадают',
			'Something went wrong': 'Что-то пошло не так',
			'Wrong username or password' : "Неправильное имя пользователя или пароль",

			"Title can't be empty": 'Название не может быть пустым'
		}
	},
    translate: function(locale, message) {
    	try {
    		return this.data[locale][message];
    	} catch(e) {
    		return message;
    	}
    }
}


module.exports = I18N;