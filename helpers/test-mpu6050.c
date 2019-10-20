// http://www.siloged.fr/docs/raspberry/index.html?ProgrammedegestionducapteurMPU60.html

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdint.h>
#include <string.h>
#include <math.h>

#include <wiringPi.h>
#include <wiringPiI2C.h>

// #include "I2Cdev.h"
#include "MPU6050_6Axis_MotionApps20.h"


//#include "mpu6050/MPU6050.h"
//#include "mpu6050/helper_3dmath.h"

int      adresse = 0x68;
long int timePrev, temps, timeStep;
double   arx, ary, arz, gsx, gsy, gsz, gry, grz, grx, rx, ry, rz;
int      fd;
int      i = 1;

static const double gyroScale = 131; // 131 LSB/deg/s
static const double Rad2Degr  = 57.295779506; // PI = 180°

int   angleX, angleY, angleZ;
float angleX0, angleY0, angleZ0;

int conversionSigne(double valeur) {
	if (valeur >= 0x8000)
		return -((65535 - valeur) + 1);
	else
		return valeur;
}

double getAccX() {
	double temp;

	temp = wiringPiI2CReadReg8(fd, 0x3B) << 8 | wiringPiI2CReadReg8(fd, 0x3C);

	return conversionSigne(temp);
}

double getAccY() {
	double temp;

	temp = wiringPiI2CReadReg8(fd, 0x3D) << 8 | wiringPiI2CReadReg8(fd, 0x3E);

	return conversionSigne(temp);
}

double getAccZ() {
	double temp;

	temp = wiringPiI2CReadReg8(fd, 0x3F) << 8 | wiringPiI2CReadReg8(fd, 0x40);

	return conversionSigne(temp);
}

double getGyroX() {
	return wiringPiI2CReadReg8(fd, 0x43) << 8 | wiringPiI2CReadReg8(fd, 0x44);
}

double getGyroY() {
	return wiringPiI2CReadReg8(fd, 0x45) << 8 | wiringPiI2CReadReg8(fd, 0x46);
}

double getGyroZ() {
	return wiringPiI2CReadReg8(fd, 0x47) << 8 | wiringPiI2CReadReg8(fd, 0x48);
}

// void lireTous() {
// 	short int temp;

// 	for (int i = 0x0D; i < 0x76; i++) {
// 		temp = wiringPiI2CReadReg8(fd, i);
// 		// qDebug()<<temp<<endl;
// 	}
// }

float getAngleX() {
	double temp;
	double aX, aY, aZ;

	aX = getAccX() / 16384;//16.384 LSB pour 1g d'après la doc
	aY = getAccY() / 16384;
	aZ = getAccZ() / 16384;
	temp = sqrt(pow(aY, 2) + pow(aZ, 2));

	return Rad2Degr * atan(aX / temp);
}

float getAngleY() {
	double temp;
	double aX, aY, aZ;
	aX = getAccX() / 16384;
	aY = getAccY() / 16384;
	aZ = getAccZ() / 16384;
	temp = sqrt(pow(aX, 2) + pow(aZ, 2));

	return Rad2Degr * atan(aY / temp);
}

float getAngleZ() {
	double temp;
	double aX, aY, aZ;

	aX = getAccX() / 16384; //16.384 LSB pour 1g d'après la doc
	aY = getAccY() / 16384;
	aZ = getAccZ() / 16384;
	temp = sqrt(pow(aX, 2) + pow(aY, 2));

	return Rad2Degr*  atan(temp / aZ);
}

void getAngles() {
	timePrev = temps;
	temps = millis();
	timeStep = (temps - timePrev) / 1000;

	arx = getAngleX();
	ary = getAngleY();
	arz = getAngleZ();
	gsx = getGyroX() / gyroScale;
	gsy = getGyroY() / gyroScale;
	gsz = getGyroZ() / gyroScale;

	if (i == 1) {
		grx = arx;
		gry = ary;
		grz = arz;
	} else {
		grx = grx + (timeStep*gsx);
		gry = gry + (timeStep*gsy);
		grz = grz + (timeStep*gsz);
	}

	delay(50);
	angleX = (0.04 * arx) + (0.96 * grx);
	angleY = (0.04 * ary) + (0.96 * gry);
	angleZ = (0.04 * arz) + (0.96 * grz);
}

void initAngles() {
	double tx = 0;
	double ty = 0;
	double tz = 0;

	for (int i = 0; i < 100; i++) {
		getAngles();
		tx += angleX;
		ty += angleY;
		tz += angleZ;
		printf("%i\n", i);
	}

	angleX0 = tx / 100;
	angleY0 = ty / 100;
	angleZ0 = tz / 100;
}


// MPU control/status vars
bool dmpReady = false;  // set true if DMP init was successful
uint8_t mpuIntStatus;   // holds actual interrupt status byte from MPU
uint8_t devStatus;      // return status after each device operation (0 = success, !0 = error)
uint16_t packetSize;    // expected DMP packet size (default is 42 bytes)
uint16_t fifoCount;     // count of all bytes currently in FIFO
uint8_t fifoBuffer[64]; // FIFO storage buffer

// orientation/motion vars
Quaternion q;           // [w, x, y, z]         quaternion container
VectorInt16 aa;         // [x, y, z]            accel sensor measurements
VectorInt16 aaReal;     // [x, y, z]            gravity-free accel sensor measurements
VectorInt16 aaWorld;    // [x, y, z]            world-frame accel sensor measurements
VectorFloat gravity;    // [x, y, z]            gravity vector
float euler[3];         // [psi, theta, phi]    Euler angle container
float ypr[3];           // [yaw, pitch, roll]   yaw/pitch/roll container and gravity vector

// packet structure for InvenSense teapot demo
uint8_t teapotPacket[14] = { '$', 0x02, 0,0, 0,0, 0,0, 0,0, 0x00, 0x00, '\r', '\n' };

int main() {
	// temps = millis();
	// i = 1;

	// wiringPiSetup();
	// fd = wiringPiI2CSetup(adresse);
	// if (fd == -1) {
	// 	printf("Le port I2C n'est pas joignable. Vérifiez les pramètres et connexions.\n");
	// 	return -1;
	// } else {
	// 	wiringPiI2CWriteReg8(fd, 0x6B, 0x00);
	// 	// lireTous();
	// 	initAngles();
	// 	while(1) {
	// 		getAngles();
	// 		printf("AngleX = %.2f, AngleY = %.2f, AngleZ = %.2f\n", angleX - angleX0, angleY - angleY0, angleZ - angleZ0);
	// 		delay(500);
	// 	}
	// }

	MPU6050 mpu;

	printf("Initializing I2C devices...\n");
    mpu.initialize();

    // verify connection
    printf("Testing device connections...\n");
    printf(mpu.testConnection() ? "MPU6050 connection successful\n" : "MPU6050 connection failed\n");

    // load and configure the DMP
    printf("Initializing DMP...\n");
    devStatus = mpu.dmpInitialize();
    
    // make sure it worked (returns 0 if so)
    if (devStatus == 0) {
        // turn on the DMP, now that it's ready
        printf("Enabling DMP...\n");
        mpu.setDMPEnabled(true);

        // enable Arduino interrupt detection
        //Serial.println(F("Enabling interrupt detection (Arduino external interrupt 0)..."));
        //attachInterrupt(0, dmpDataReady, RISING);
        mpuIntStatus = mpu.getIntStatus();

        // set our DMP Ready flag so the main loop() function knows it's okay to use it
        printf("DMP ready!\n");
        dmpReady = true;

        // get expected DMP packet size for later comparison
        packetSize = mpu.dmpGetFIFOPacketSize();
    } else {
        // ERROR!
        // 1 = initial memory load failed
        // 2 = DMP configuration updates failed
        // (if it's going to break, usually the code will be 1)
        printf("DMP Initialization failed (code %d)\n", devStatus);
    }


    while(1) {
		// if programming failed, don't try to do anything
		if (!dmpReady) continue;
		// get current FIFO count
		fifoCount = mpu.getFIFOCount();

		if (fifoCount == 1024) {
		    // reset so we can continue cleanly
		    mpu.resetFIFO();
		    printf("FIFO overflow!\n");

		// otherwise, check for DMP data ready interrupt (this should happen frequently)
		} else if (fifoCount >= 42) {
		    // read a packet from FIFO
		    mpu.getFIFOBytes(fifoBuffer, packetSize);

    		mpu.dmpGetQuaternion(&q, fifoBuffer);
    		mpu.dmpGetEuler(euler, &q);
    		printf("euler %7.2f %7.2f %7.2f    ", euler[0] * 180/M_PI, euler[1] * 180/M_PI, euler[2] * 180/M_PI);
            printf("\n");
    	}
    }

	return 0;
}
