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
	Napi::Value GPIO_Read(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		if (!info[0].IsNumber()) {
			Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
			return env.Null();
		}

  		int pin = info[0].As<Napi::Number>();

		return Napi::Number::New(env, digitalRead(pin));
	}

	Napi::Value GPIO_Write(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		if (!info[0].IsNumber() || !info[1].IsNumber()) {
			Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
			return env.Null();
		}

  		int pin = info[0].As<Napi::Number>();
  		int val = info[1].As<Napi::Number>();

		digitalWrite(pin, val);

		return env.Null();
	}

	Napi::Value GPIO_Mode(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		if (!info[0].IsNumber() || !info[1].IsNumber()) {
			Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
			return env.Null();
		}

  		int pin  = info[0].As<Napi::Number>();
  		int mode = info[1].As<Napi::Number>();

  		pinMode(pin, mode);

		return env.Null();
	}
// }


// BMP280 {
	Napi::Value BMP280_Data(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		if (bmp280) {
			BMP280Data *bmp280Data = bmp280->getBMP280Data();

			Napi::Object object = Napi::Object::New(env);
			object.Set("pressure", bmp280Data->getPressure());
			object.Set("temperature", bmp280Data->getTemperature());
			object.Set("altitude", bmp280Data->getAltitude());

			return object;
		}

		return env.Null();
	}

	Napi::Value BMP280_Init(const Napi::CallbackInfo& info) {
		Napi::Env env = info.Env();

		if (!bmp280) {
		    bmp280 = new BMP280((char *) "/dev/i2c-0", BMP280_I2C_ADDRESS1);
		    int fd = bmp280->init();
	    	bmp280->reset();

	    	if (fd < 0) {
	    		delete bmp280;

	        	return env.Null();
	    	}

	    	bmp280->reset();
	    	bmp280->setPowerMode(BMP280_NORMAL_MODE);
	    	bmp280->setTemperatureOversampling(BMP280_ULTRAHIGHRESOLUTION_OVERSAMP_TEMPERATURE);
	    	bmp280->setPressureOversampling(BMP280_ULTRAHIGHRESOLUTION_OVERSAMP_PRESSURE);
	    	bmp280->setIrrFilter(BMP280_FILTER_COEFF_16);
	    	bmp280->setStandbyTime(BMP280_STANDBY_TIME_250_MS);
	    }

		Napi::Object object = Napi::Object::New(env);
		object.Set(Napi::String::New(env, "getData"),
			Napi::Function::New(env, BMP280_Data));

		return object;
	}
// }


// HC_SC04 {
	Napi::Value HC_SC04_Distance_CM(const Napi::CallbackInfo& info) {
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
		Napi::Env env = info.Env();

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

		Napi::Object object = Napi::Object::New(env);
		object.Set(Napi::String::New(env, "_trig"),
			Napi::Number::New(env, trig));
		object.Set(Napi::String::New(env, "_echo"),
			Napi::Number::New(env, echo));
		object.Set(Napi::String::New(env, "getDistanceCM"),
			Napi::Function::New(env, HC_SC04_Distance_CM));

		return object;
	}
// }


Napi::Object Module(Napi::Env env, Napi::Object exports) {
	Napi::Object GPIO    = Napi::Object::New(env);

	GPIO.Set(Napi::String::New(env, "mode"),
		Napi::Function::New(env, GPIO_Mode));
	GPIO.Set(Napi::String::New(env, "write"),
		Napi::Function::New(env, GPIO_Write));
	GPIO.Set(Napi::String::New(env, "read"),
		Napi::Function::New(env, GPIO_Read));
	GPIO.Set(Napi::String::New(env, "OUTPUT"),
		Napi::Number::New(env, OUTPUT));
	GPIO.Set(Napi::String::New(env, "INPUT"),
		Napi::Number::New(env, INPUT));
	GPIO.Set(Napi::String::New(env, "LOW"),
		Napi::Number::New(env, LOW));
	GPIO.Set(Napi::String::New(env, "HIGH"),
		Napi::Number::New(env, HIGH));
	exports.Set(Napi::String::New(env, "GPIO"), GPIO);

	exports.Set(Napi::String::New(env, "BMP280"),
		Napi::Function::New(env, BMP280_Init));

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

