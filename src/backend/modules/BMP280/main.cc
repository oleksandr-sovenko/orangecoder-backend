#include <napi.h>

#include <stdio.h>
#include <iostream>
#include <stdexcept>
#include <wiringPi.h>
#include "bmp280.h"

#include <cstdio>
#include <csignal>

BMP280 *bmp280 = NULL;

void signalHandler( int signum ) {
	if (bmp280)
		delete bmp280;

	exit(signum);  
}

Napi::Value bmp280_init(const Napi::CallbackInfo& info) {
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


Napi::Value bmp280_get_data(const Napi::CallbackInfo& info) {
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


Napi::Object Init(Napi::Env env, Napi::Object exports) {
	exports.Set(Napi::String::New(env, "init"),
		Napi::Function::New(env, bmp280_init));

	exports.Set(Napi::String::New(env, "data"),
		Napi::Function::New(env, bmp280_get_data));

	signal(SIGABRT, signalHandler); 
	signal(SIGFPE , signalHandler);
	signal(SIGILL , signalHandler);
	signal(SIGINT , signalHandler);
	signal(SIGSEGV, signalHandler);
	signal(SIGTERM, signalHandler);

	return exports;
}


NODE_API_MODULE(hello, Init)

