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

int main(int argc, char *argv[]) {
	if (argc < 4)
		return EXIT_FAILURE;

	char *mode    = argv[1];
	int  pin      = atoi(argv[2]);
	int  interval = atoi(argv[3]);

	wiringPiSetup();

	if (!strcmp(mode, "output"))
		pinMode(pin, OUTPUT);

	if (!strcmp(mode, "input"))
		pinMode(pin, INPUT);

	int old_status = digitalRead(pin);
  
	for (;;) {
		int new_status = digitalRead(pin);

		if (new_status != old_status) {
			fprintf(stderr, "{\"event\":\"change\",\"pin\":\"%i\",\"value\":\"%i\"}\n", pin, new_status);
			old_status = new_status;
		}

		delay(interval);
	}

	return EXIT_SUCCESS;
}
