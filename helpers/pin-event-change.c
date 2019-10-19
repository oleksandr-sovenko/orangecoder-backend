// pin-event-change
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

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <wiringPi.h>

/** device_hc_sr04
 * @param trig
 * @param echo
 */
void device_hc_sr04(int trig, int echo) {
	pinMode(trig, OUTPUT);
	pinMode(echo, INPUT);

	//TRIG pin must start LOW
	digitalWrite(trig, LOW);
	delay(30);
}

/** device_hc_sr04_getcm
 * @param trig
 * @param echo
 */
int device_hc_sr04_getcm(int trig, int echo) {
	digitalWrite(trig, HIGH);
	delayMicroseconds(20);
	digitalWrite(trig, LOW);

	//Wait for echo start
	while(digitalRead(echo) == LOW);

	//Wait for echo end
	long startTime = micros();
	while(digitalRead(echo) == HIGH);
	long travelTime = micros() - startTime;

	//Get distance in cm
	int distance = travelTime / 58;

	return distance;
}

/** main
 * @param argc
 * @param argv
 */
int main(int argc, char *argv[]) {
	if (argc < 2)
		return EXIT_FAILURE;

	char *device  = argv[1];

	wiringPiSetup();

	/** HC-SR501
 	 */
	if (!strcmp(device, "hc-sr501")) {

	}

 	/** MPU-6050
 	 */
	if (!strcmp(device, "mpu-6050")) {

	}

	/** HC-SR04
	 * $example: ./pin-event-change hc-sr04 9 8
 	 */
	if (!strcmp(device, "hc-sr04")) {
		if (argc < 4) {
			return EXIT_FAILURE;
		}

		int trig = atoi(argv[2]);
		int echo = atoi(argv[3]);

		device_hc_sr04(trig, echo);

		int old_distance = device_hc_sr04_getcm(trig, echo);

		for (;;) {
			int new_distance = device_hc_sr04_getcm(trig, echo);

			if (new_distance != old_distance) {
				fprintf(stderr, "{\"device\":\"hc-sr04\",\"pin\":{\"trig\":%d,\"echo\":%d},\"distance-cm\":%d}\n", trig, echo, new_distance);
				old_distance = new_distance;
			}

			delay(1000);
		}
	}

 	/** DS18B20
 	 */
	if (!strcmp(device, "ds18b20")) {

	}

	return EXIT_SUCCESS;
}
