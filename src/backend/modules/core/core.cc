// core.cc
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


#include <napi.h>
#include <stdio.h>
#include <iostream>
#include <stdexcept>
#include <cstdio>
#include <csignal>
#include <wiringPi.h>
#include "bmp280/bmp280.h"


BMP280 *bmp280  = NULL;
int    HC_SC04_Devices[64];


void signalHandler(int signum) {
	if (bmp280)
		delete bmp280;

	exit(signum);  
}


// GPIO {
	Napi::Value GPIO_IsLow(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		int pin = info.This().As<Napi::Object>().Get("_pin").As<Napi::Number>();

		return Napi::Boolean::New(env, digitalRead(pin) ? false : true);
	}

	Napi::Value GPIO_IsHigh(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		int pin = info.This().As<Napi::Object>().Get("_pin").As<Napi::Number>();

		return Napi::Boolean::New(env, digitalRead(pin) ? true : false);
	}

	Napi::Value GPIO_Low(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		int pin = info.This().As<Napi::Object>().Get("_pin").As<Napi::Number>();

		digitalWrite(pin, LOW);

		return env.Null();
	}

	Napi::Value GPIO_High(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		int pin = info.This().As<Napi::Object>().Get("_pin").As<Napi::Number>();

		digitalWrite(pin, HIGH);

		return env.Null();
	}

	Napi::Value GPIO_Input(const Napi::CallbackInfo& info) {
		Napi::Env    env    = info.Env();
		Napi::Object object = Napi::Object::New(env);

		if (!info[0].IsNumber()) {
			Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
			return env.Null();
		}

  		int pin = info[0].As<Napi::Number>();

  		pinMode(pin, INPUT);

		object.Set(Napi::String::New(env, "_pin"),
			Napi::Number::New(env, pin));
		object.Set(Napi::String::New(env, "isLow"),
			Napi::Function::New(env, GPIO_IsLow));
		object.Set(Napi::String::New(env, "isHigh"),
			Napi::Function::New(env, GPIO_IsHigh));
		object.Set(Napi::String::New(env, "low"),
			Napi::Function::New(env, GPIO_Low));
		object.Set(Napi::String::New(env, "high"),
			Napi::Function::New(env, GPIO_High));

		return object;
	}

	Napi::Value GPIO_Output(const Napi::CallbackInfo& info) {
		Napi::Env    env    = info.Env();
		Napi::Object object = Napi::Object::New(env);

		if (!info[0].IsNumber()) {
			Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
			return env.Null();
		}

  		int pin = info[0].As<Napi::Number>();

  		pinMode(pin, OUTPUT);

		object.Set(Napi::String::New(env, "_pin"),
			Napi::Number::New(env, pin));
		object.Set(Napi::String::New(env, "isLow"),
			Napi::Function::New(env, GPIO_IsLow));
		object.Set(Napi::String::New(env, "isHigh"),
			Napi::Function::New(env, GPIO_IsHigh));
		object.Set(Napi::String::New(env, "low"),
			Napi::Function::New(env, GPIO_Low));
		object.Set(Napi::String::New(env, "high"),
			Napi::Function::New(env, GPIO_High));

		return object;
	}
// }


// BMP280 {
	Napi::Value BMP280_Data(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();
		Napi::Object object = Napi::Object::New(env);
	
		if (bmp280) {
			BMP280Data *bmp280Data = bmp280->getBMP280Data();
	
			object.Set("pressure", bmp280Data->getPressure());
			object.Set("temperature", bmp280Data->getTemperature());
			object.Set("altitude", bmp280Data->getAltitude());
		}
		
		return object;
	}

	Napi::Value BMP280_Init(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();
	
		if (bmp280)
			return Napi::Boolean::New(env, true);
	
	    bmp280 = new BMP280((char *) "/dev/i2c-0", BMP280_I2C_ADDRESS1);
	    int fd = bmp280->init();
	    bmp280->reset();
	
	    if (fd < 0) {
	    	delete bmp280;
	
	        return Napi::Boolean::New(env, false);
	    }
	
	    bmp280->reset();
	    bmp280->setPowerMode(BMP280_NORMAL_MODE);
	    bmp280->setTemperatureOversampling(BMP280_ULTRAHIGHRESOLUTION_OVERSAMP_TEMPERATURE);
	    bmp280->setPressureOversampling(BMP280_ULTRAHIGHRESOLUTION_OVERSAMP_PRESSURE);
	    bmp280->setIrrFilter(BMP280_FILTER_COEFF_16);
	    bmp280->setStandbyTime(BMP280_STANDBY_TIME_250_MS);
	
		return Napi::Boolean::New(env, true);
	}
// }


// DS18B20 {
	Napi::Value DS18B20_Init(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();
		Napi::Object object = Napi::Object::New(env);

		return object;
	}

	Napi::Value DS18B20_Data(const Napi::CallbackInfo& info) {
		// FILE  *file;
		// char  buffer[1024];
		// char  *addr    = NULL;
		// char  *id      = argv[2];
		// float old_temp = 0;
		// float new_temp = 0;

		// if (strstr(argv[3], "addr:") != NULL)
		// 	addr = argv[3] + 5;

		// if (addr == NULL) {
		// 	return EXIT_FAILURE;
		// }

		// for (;;) {
		// 	strcpy(buffer, "/sys/bus/w1/devices/");
		// 	strcat(buffer, addr);
		// 	strcat(buffer, "/w1_slave");

		// 	if (file = fopen(buffer, "r")) {
		// 		fread(&buffer, sizeof(buffer), 1, file);
		// 		fclose(file);

		// 		char *t = strstr(buffer, "t=");
		// 		new_temp = (float) atoi(t + 2) / 1000;
		// 	} else {
		// 		new_temp = 0;
		// 		delay(500);
		// 	}
		// }

		Napi::Env env = info.Env();
		Napi::Object object = Napi::Object::New(env);

		return object;
	}
// }


// HC_SC04 {
	Napi::Value HC_SC04_Data(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		int trig = info.This().As<Napi::Object>().Get("_trig").As<Napi::Number>();
		int echo = info.This().As<Napi::Object>().Get("_echo").As<Napi::Number>();

		digitalWrite(trig, HIGH);
		delayMicroseconds(20);
		digitalWrite(trig, LOW);

		// Wait for echo start
		while(digitalRead(echo) == LOW);

		// Wait for echo end
		long startTime = micros();
		while(digitalRead(echo) == HIGH);
		long travelTime = micros() - startTime;

		// Get distance in cm
		int distance = travelTime / 58;

		return Napi::Number::New(env, distance);
	}

	Napi::Value HC_SC04_Init(const Napi::CallbackInfo& info) {
		Napi::Env    env    = info.Env();
		Napi::Object object = Napi::Object::New(env);

		if (!info[0].IsNumber() || !info[1].IsNumber()) {
			Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
			return env.Null();
		}

  		int trig = info[0].As<Napi::Number>();
  		int echo = info[1].As<Napi::Number>();

		pinMode(trig, OUTPUT);
		pinMode(echo, INPUT);

		// TRIG pin must start LOW
		digitalWrite(trig, LOW);
		delay(30);

		object.Set(Napi::String::New(env, "_trig"),
			Napi::Number::New(env, trig));
		object.Set(Napi::String::New(env, "_echo"),
			Napi::Number::New(env, echo));
		object.Set(Napi::String::New(env, "data"),
			Napi::Function::New(env, HC_SC04_Data));

		return object;
	}
// }


Napi::Object Module(Napi::Env env, Napi::Object exports) {
	Napi::Object GPIO    = Napi::Object::New(env);
	Napi::Object BMP280  = Napi::Object::New(env);
	Napi::Object DS18B20 = Napi::Object::New(env);

	GPIO.Set(Napi::String::New(env, "input"),
		Napi::Function::New(env, GPIO_Input));
	GPIO.Set(Napi::String::New(env, "output"),
		Napi::Function::New(env, GPIO_Output));
	exports.Set(Napi::String::New(env, "GPIO"), GPIO);

	BMP280.Set(Napi::String::New(env, "init"),
		Napi::Function::New(env, BMP280_Init));
	BMP280.Set(Napi::String::New(env, "data"),
		Napi::Function::New(env, BMP280_Data));
	exports.Set(Napi::String::New(env, "BMP280"), BMP280);

	DS18B20.Set(Napi::String::New(env, "init"),
		Napi::Function::New(env, DS18B20_Init));
	DS18B20.Set(Napi::String::New(env, "data"),
		Napi::Function::New(env, DS18B20_Data));
	exports.Set(Napi::String::New(env, "DS18B20"), DS18B20);

	exports.Set(Napi::String::New(env, "HC_SC04"),
		Napi::Function::New(env, HC_SC04_Init));

	wiringPiSetup();
	
	signal(SIGABRT, signalHandler); 
	signal(SIGFPE , signalHandler);
	signal(SIGILL , signalHandler);
	signal(SIGINT , signalHandler);
	signal(SIGSEGV, signalHandler);
	signal(SIGTERM, signalHandler);

	return exports;
}


NODE_API_MODULE(Module , Module)

