#include <string.h>
#include <stdint.h>
#include <stdexcept>
#include <iostream>
#include <stdio.h>
#include <math.h>
#include <wiringPiI2C.h>
#include <wiringPi.h>
#include "bmp280.h"

BMP280::BMP280(char * device, int devId) : fd(0), chipId(0), bmp280CalibrationData(0), bmp280RawData(0) {
    setDevice(device);
    this->devId = devId;
}

BMP280::BMP280(int devId) : device(0), fd(0), chipId(0), bmp280CalibrationData(0), bmp280RawData(0) {
    this->devId = devId;
}

BMP280::~BMP280() {
    delete bmp280CalibrationData;
    delete bmp280RawData;
    delete[] device;
}

int BMP280::init() {
    int fd = -1;
    if (device) {
        fd = wiringPiI2CSetupInterface(device, devId);
    } else {
        int rev = piBoardRev();

        if (rev == 1) {
            setDevice((char *) "/dev/i2c-0");
        } else if (rev == 2) {
            setDevice((char *) "/dev/i2c-1");
        } else if (rev == 3) {
            setDevice((char *) "/dev/i2c-2");
        } else {
            setDevice((char *) "/dev/i2c-3");
        }

        fd = wiringPiI2CSetupInterface(device, devId);
    }
    if (fd < 0) {
        char buffer[256];
        sprintf(buffer, "Device not found: I2C device: %s, device ID: %d", device, devId);
        throw std::logic_error(buffer);
    }
    this->fd = fd;

    uint8_t chipId = getChipId();
    switch (chipId) {
        case BMP280_CHIP_ID1:
        case BMP280_CHIP_ID2:
        case BMP280_CHIP_ID3:
            this->chipId = chipId;
            break;
        default:
        {
            char buffer[256];
            sprintf(buffer, "Device Chip ID error: chip ID = %d", chipId);
            throw std::logic_error(buffer);
        }
    }
    if (bmp280CalibrationData) {
        delete bmp280CalibrationData;
    }
    bmp280CalibrationData = getCalibrationData();
    return fd;
}

BMP280CalibrationData * BMP280::getCalibrationData() {
    uint16_t T1, P1;
    int16_t T2, T3, P2, P3, P4, P5, P6, P7, P8, P9;

    T1 = readU16(BMP280_REGISTER_DIG_T1);
    T2 = readS16(BMP280_REGISTER_DIG_T2);
    T3 = readS16(BMP280_REGISTER_DIG_T3);
    P1 = readU16(BMP280_REGISTER_DIG_P1);
    P2 = readS16(BMP280_REGISTER_DIG_P2);
    P3 = readS16(BMP280_REGISTER_DIG_P3);
    P4 = readS16(BMP280_REGISTER_DIG_P4);
    P5 = readS16(BMP280_REGISTER_DIG_P5);
    P6 = readS16(BMP280_REGISTER_DIG_P6);
    P7 = readS16(BMP280_REGISTER_DIG_P7);
    P8 = readS16(BMP280_REGISTER_DIG_P8);
    P9 = readS16(BMP280_REGISTER_DIG_P9);

    return new BMP280CalibrationData(T1, T2, T3, P1, P2, P3, P4, P5, P6, P7, P8, P9);
}

BMP280CalibrationData * BMP280::getBmp280CalibrationData() {
    return bmp280CalibrationData;
}

BMP280RawData * BMP280::getRawData() {
    uint8_t pmsb, plsb, pxsb;
    uint8_t tmsb, tlsb, txsb;
    uint32_t temperature, pressure;

    plsb = read8(BMP280_REGISTER_PRESSUREDATA_LSB);
    pmsb = read8(BMP280_REGISTER_PRESSUREDATA_MSB);
    pxsb = read8(BMP280_REGISTER_PRESSUREDATA_XLSB);

    tmsb = read8(BMP280_REGISTER_TEMPDATA_MSB);
    tlsb = read8(BMP280_REGISTER_TEMPDATA_LSB);
    txsb = read8(BMP280_REGISTER_TEMPDATA_XLSB);

    temperature = 0;
    temperature = (temperature | tmsb) << 8;
    temperature = (temperature | tlsb) << 8;
    temperature = (temperature | txsb) >> 4;

    pressure = 0;
    pressure = (pressure | pmsb) << 8;
    pressure = (pressure | plsb) << 8;
    pressure = (pressure | pxsb) >> 4;

    return new BMP280RawData(pmsb, plsb, pxsb, tmsb, tlsb, txsb, temperature, pressure);
}

void BMP280::reset() {
    setReset(BMP280_SOFT_RESET_CODE);
}

void BMP280::spi3wEnable() {
    uint8_t config = getConfig();
    setConfig(config | 0b00000001);
}

void BMP280::spi3wDisable() {
    uint8_t config = getConfig();
    setConfig(config & 0b11111110);
}

void BMP280::setPowerMode(uint8_t mode) {
    switch (mode) {
        case BMP280_FORCED_MODE:
        case BMP280_NORMAL_MODE:
        case BMP280_SLEEP_MODE:
        {
            uint8_t curentMode = getControl() & 0b11111100;
            setControl(curentMode | mode);
            break;
        }
        default:break;
    }
}

void BMP280::setTemperatureOversampling(uint8_t oversampling) {
    switch (oversampling) {
        case BMP280_OVERSAMP_SKIPPED:
        case BMP280_OVERSAMP_1X:
        case BMP280_OVERSAMP_2X:
        case BMP280_OVERSAMP_4X:
        case BMP280_OVERSAMP_8X:
        case BMP280_OVERSAMP_16X:
        {
            uint8_t curentOversampling = getControl() & 0b00011111;
            setControl(curentOversampling | (oversampling << 5));
            break;
        }
        default:break;
    }
}

void BMP280::setPressureOversampling(uint8_t oversampling) {
    switch (oversampling) {
        case BMP280_OVERSAMP_SKIPPED:
        case BMP280_OVERSAMP_1X:
        case BMP280_OVERSAMP_2X:
        case BMP280_OVERSAMP_4X:
        case BMP280_OVERSAMP_8X:
        case BMP280_OVERSAMP_16X:
        {
            uint8_t curentOversampling = getControl() & 0b11100011;
            setControl(curentOversampling | (oversampling << 2));
            break;
        }
        default:break;
    }
}

void BMP280::setStandbyTime(uint8_t tStandby) {
    switch (tStandby) {
        case BMP280_STANDBY_TIME_1_MS:
        case BMP280_STANDBY_TIME_63_MS:
        case BMP280_STANDBY_TIME_125_MS:
        case BMP280_STANDBY_TIME_250_MS:
        case BMP280_STANDBY_TIME_500_MS:
        case BMP280_STANDBY_TIME_1000_MS:
        case BMP280_STANDBY_TIME_2000_MS:
        case BMP280_STANDBY_TIME_4000_MS:
        {
            uint8_t config = getConfig() & 0b00011111;
            setConfig(config | (tStandby << 5));
            break;
        }
        default:break;
    }
}

void BMP280::setIrrFilter(uint8_t irrFilter) {
    switch (irrFilter) {
        case BMP280_FILTER_COEFF_OFF:
        case BMP280_FILTER_COEFF_2:
        case BMP280_FILTER_COEFF_4:
        case BMP280_FILTER_COEFF_8:
        case BMP280_FILTER_COEFF_16:
        {
            uint8_t config = getConfig() & 0b11100011;
            setConfig(config | (irrFilter << 2));
            break;
        }
        default:break;
    }
}

uint8_t BMP280::getPowerMode() {
    return getControl() & 0b00000011;
}

uint8_t BMP280::getPressureOversampling() {
    return (getControl() & 0b00011100) >> 2;
}

uint8_t BMP280::getTemperatureOversampling() {
    return (getControl() & 0b11100000) >> 5;
}

uint8_t BMP280::getIrrFilter() {
    return (getConfig() & 0b00011100) >> 2;
}

uint8_t BMP280::getStandbyTime() {
    return (getConfig() & 0b11100000) >> 5;
}

uint8_t BMP280::getSpi3w() {
    return (getConfig() & 0b00000001) >> 5;
}

uint8_t BMP280::getMeasuringStatus() {
    return (getStatus() >> 3) & 0b00000001;
}

uint8_t BMP280::getImUpdateStatus() {
    return getStatus() & 0b00000001;
}

uint8_t BMP280::getConfig() {
    return read8(BMP280_REGISTER_CONFIG);
}

uint8_t BMP280::getStatus() {
    return read8(BMP280_REGISTER_STATUS);
}

uint8_t BMP280::getControl() {
    return read8(BMP280_REGISTER_CONTROL);
}

uint8_t BMP280::getChipId() {
    return read8(BMP280_REGISTER_CHIPID);
}

uint8_t BMP280::getChipVersion() {
    return read8(BMP280_REGISTER_VERSION);
}

void BMP280::setReset(uint8_t value) {
    write8(BMP280_REGISTER_SOFTRESET, value);
}

void BMP280::setConfig(uint8_t value) {
    return write8(BMP280_REGISTER_CONFIG, value);
}

void BMP280::setStatus(uint8_t value) {
    return write8(BMP280_REGISTER_STATUS, value);
}

void BMP280::setControl(uint8_t value) {
    return write8(BMP280_REGISTER_CONTROL, value);
}

double BMP280::getAltitude(double pressure) {
    return 44330.0 * (1.0 - pow(pressure / MEAN_SEA_LEVEL_PRESSURE, 0.190294957));
}

int32_t BMP280::getTemperatureC(int32_t adc_T) {
    int32_t var1 = ((((adc_T >> 3) - ((int32_t) bmp280CalibrationData->getT1() << 1))) *
            ((int32_t) bmp280CalibrationData->getT2())) >> 11;

    int32_t var2 = (((((adc_T >> 4) - ((int32_t) bmp280CalibrationData->getT1())) *
            ((adc_T >> 4) - ((int32_t) bmp280CalibrationData->getT1()))) >> 12) *
            ((int32_t) bmp280CalibrationData->getT3())) >> 14;

    return var1 + var2;
}

double BMP280::compensateT(int32_t t_fine) {
    double T = (t_fine * 5 + 128) >> 8;
    return T / 100;
}

double BMP280::compensateP(int32_t adc_P, int32_t t_fine) {
    int64_t var1, var2, p;

    var1 = ((int64_t) t_fine) - 128000;
    var2 = var1 * var1 * (int64_t) bmp280CalibrationData->getP6();
    var2 = var2 + ((var1 * (int64_t) bmp280CalibrationData->getP5()) << 17);
    var2 = var2 + (((int64_t) bmp280CalibrationData->getP4()) << 35);
    var1 = ((var1 * var1 * (int64_t) bmp280CalibrationData->getP3()) >> 8) +
            ((var1 * (int64_t) bmp280CalibrationData->getP2()) << 12);
    var1 = (((((int64_t) 1) << 47) + var1))*((int64_t) bmp280CalibrationData->getP1()) >> 33;

    if (var1 == 0) {
        return 0; // avoid exception caused by division by zero
    }
    p = 1048576 - adc_P;
    p = (((p << 31) - var2)*3125) / var1;
    var1 = (((int64_t) bmp280CalibrationData->getP9()) * (p >> 13) * (p >> 13)) >> 25;
    var2 = (((int64_t) bmp280CalibrationData->getP8()) * p) >> 19;

    p = ((p + var1 + var2) >> 8) + (((int64_t) bmp280CalibrationData->getP7()) << 4);
    return (double) p / 256;
}

BMP280Data * BMP280::getBMP280Data() {
    int32_t t_fine;
    double t, p, a;
    while (getMeasuringStatus()) {
    }
    if (bmp280RawData) {
        delete bmp280RawData;
    }
    bmp280RawData = getRawData();
    t_fine = getTemperatureC(bmp280RawData->getTemperature());
    t = compensateT(t_fine); // C
    p = compensateP(bmp280RawData->getPressure(), t_fine) / 100; // hPa
    a = getAltitude(p); // meters

    return new BMP280Data(p, t, a);
}

void BMP280::setDevice(char *device) {
    if (device) {
        this->device = new char[strlen(device)];
        strcpy(this->device, device);
    }
}

void BMP280::write8(uint8_t reg, uint8_t value) {
    wiringPiI2CWriteReg8(fd, reg, value);
}

uint8_t BMP280::read8(uint8_t reg) {
    return wiringPiI2CReadReg8(fd, reg);
}

uint16_t BMP280::read16(uint8_t reg) {
    return wiringPiI2CReadReg16(fd, reg);
}

int16_t BMP280::readS16(uint8_t reg) {
    return (int16_t) read16(reg);
}

uint16_t BMP280::readU16(uint8_t reg) {
    return (uint16_t) read16(reg);
}
