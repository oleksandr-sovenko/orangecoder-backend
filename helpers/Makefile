# Makefile
# Copyright (C) 2019 Oleksandr Sovenko (info@oleksandrsovenko.com)
# 
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

all: pin-event-change

clean:
	rm -f pin-event-change test-mpu6050

pin-event-change:
	gcc -Wall -o pin-event-change pin-event-change.c -lwiringPi -lpthread

test-mpu6050:
	g++ -DDMP_FIFO_RATE=9 -Wall -g -O2 test-mpu6050.c MPU6050.cpp I2Cdev.cpp -o test-mpu6050 -lwiringPi -lpthread -lm
