#include <stdint.h>
#include "BMP280CalibrationData.h"
#include "BMP280RawData.h"
#include "BMP280Data.h"

#define MEAN_SEA_LEVEL_PRESSURE       1013

/**\name	CHIP ID DEFINITION       */
/***********************************************/
#define BMP280_CHIP_ID1  (0x56)
#define BMP280_CHIP_ID2  (0x57)
#define BMP280_CHIP_ID3  (0x58)
/************************************************/
/**\name	I2C ADDRESS DEFINITION       */
/***********************************************/
#define BMP280_I2C_ADDRESS1                  (0x76)
#define BMP280_I2C_ADDRESS2                  (0x77)
/************************************************/
/**\name	POWER MODE DEFINITION       */
/***********************************************/
/* Sensor Specific constants */
#define BMP280_SLEEP_MODE                    (0x00)
#define BMP280_FORCED_MODE                   (0x01)
#define BMP280_NORMAL_MODE                   (0x03)
#define BMP280_SOFT_RESET_CODE               (0xB6)
/************************************************/
/**\name	STANDBY TIME DEFINITION       */
/***********************************************/
#define BMP280_STANDBY_TIME_1_MS              (0x00)
#define BMP280_STANDBY_TIME_63_MS             (0x01)
#define BMP280_STANDBY_TIME_125_MS            (0x02)
#define BMP280_STANDBY_TIME_250_MS            (0x03)
#define BMP280_STANDBY_TIME_500_MS            (0x04)
#define BMP280_STANDBY_TIME_1000_MS           (0x05)
#define BMP280_STANDBY_TIME_2000_MS           (0x06)
#define BMP280_STANDBY_TIME_4000_MS           (0x07)
/************************************************/
/**\name	OVERSAMPLING DEFINITION       */
/***********************************************/
#define BMP280_OVERSAMP_SKIPPED          (0x00)
#define BMP280_OVERSAMP_1X               (0x01)
#define BMP280_OVERSAMP_2X               (0x02)
#define BMP280_OVERSAMP_4X               (0x03)
#define BMP280_OVERSAMP_8X               (0x04)
#define BMP280_OVERSAMP_16X              (0x05)
/************************************************/
/**\name	WORKING MODE DEFINITION       */
/***********************************************/
#define BMP280_ULTRA_LOW_POWER_MODE          (0x00)
#define BMP280_LOW_POWER_MODE                (0x01)
#define BMP280_STANDARD_RESOLUTION_MODE      (0x02)
#define BMP280_HIGH_RESOLUTION_MODE          (0x03)
#define BMP280_ULTRA_HIGH_RESOLUTION_MODE    (0x04)

#define BMP280_ULTRALOWPOWER_OVERSAMP_PRESSURE          BMP280_OVERSAMP_1X
#define BMP280_ULTRALOWPOWER_OVERSAMP_TEMPERATURE       BMP280_OVERSAMP_1X

#define BMP280_LOWPOWER_OVERSAMP_PRESSURE          BMP280_OVERSAMP_2X
#define BMP280_LOWPOWER_OVERSAMP_TEMPERATURE          BMP280_OVERSAMP_1X

#define BMP280_STANDARDRESOLUTION_OVERSAMP_PRESSURE     BMP280_OVERSAMP_4X
#define BMP280_STANDARDRESOLUTION_OVERSAMP_TEMPERATURE  BMP280_OVERSAMP_1X

#define BMP280_HIGHRESOLUTION_OVERSAMP_PRESSURE         BMP280_OVERSAMP_8X
#define BMP280_HIGHRESOLUTION_OVERSAMP_TEMPERATURE      BMP280_OVERSAMP_1X

#define BMP280_ULTRAHIGHRESOLUTION_OVERSAMP_PRESSURE       BMP280_OVERSAMP_16X
#define BMP280_ULTRAHIGHRESOLUTION_OVERSAMP_TEMPERATURE    BMP280_OVERSAMP_2X
/************************************************/
/**\name	FILTER DEFINITION       */
/***********************************************/
#define BMP280_FILTER_COEFF_OFF               (0x00)
#define BMP280_FILTER_COEFF_2                 (0x01)
#define BMP280_FILTER_COEFF_4                 (0x02)
#define BMP280_FILTER_COEFF_8                 (0x03)
#define BMP280_FILTER_COEFF_16                (0x04)
/************************************************/

/*
 * REGISTERS
 */
enum {
  BMP280_REGISTER_DIG_T1 = 0x88,
  BMP280_REGISTER_DIG_T2 = 0x8A,
  BMP280_REGISTER_DIG_T3 = 0x8C,

  BMP280_REGISTER_DIG_P1 = 0x8E,
  BMP280_REGISTER_DIG_P2 = 0x90,
  BMP280_REGISTER_DIG_P3 = 0x92,
  BMP280_REGISTER_DIG_P4 = 0x94,
  BMP280_REGISTER_DIG_P5 = 0x96,
  BMP280_REGISTER_DIG_P6 = 0x98,
  BMP280_REGISTER_DIG_P7 = 0x9A,
  BMP280_REGISTER_DIG_P8 = 0x9C,
  BMP280_REGISTER_DIG_P9 = 0x9E,

  BMP280_REGISTER_CHIPID = 0xD0,
  BMP280_REGISTER_VERSION = 0xD1,
  BMP280_REGISTER_SOFTRESET = 0xE0,

  BMP280_REGISTER_CAL26 = 0xE1, // R calibration stored in 0xE1-0xF0

  BMP280_REGISTER_STATUS = 0xF3,
  BMP280_REGISTER_CONTROL = 0xF4,
  BMP280_REGISTER_CONFIG = 0xF5,
  BMP280_REGISTER_PRESSUREDATA_MSB = 0xF7,
  BMP280_REGISTER_PRESSUREDATA_LSB = 0xF8,
  BMP280_REGISTER_PRESSUREDATA_XLSB = 0xF9,
  BMP280_REGISTER_TEMPDATA_MSB = 0xFA,
  BMP280_REGISTER_TEMPDATA_LSB = 0xFB,
  BMP280_REGISTER_TEMPDATA_XLSB = 0xFC
};

class BMP280 {
private:
  char * device;
  int devId;
  int fd;
  uint8_t chipId;
  BMP280CalibrationData * bmp280CalibrationData;
  BMP280RawData * bmp280RawData;

  void write8(uint8_t, uint8_t);
  uint8_t read8(uint8_t);
  uint16_t read16(uint8_t);
  int16_t readS16(uint8_t);
  uint16_t readU16(uint8_t);

  int32_t getTemperatureC(int32_t adc_T);
  double getAltitude(double pressure);
  double compensateT(int32_t t_fine);
  double compensateP(int32_t adc_P, int32_t t_fine);
  BMP280CalibrationData * getCalibrationData();
  BMP280RawData * getRawData();

public:
  BMP280(int);
  BMP280(char *, int);
  virtual ~BMP280();

  BMP280CalibrationData * getBmp280CalibrationData();
  BMP280Data * getBMP280Data();

  int init();
  void reset();
  void spi3wEnable();
  void spi3wDisable();
  void setPowerMode(uint8_t);
  void setTemperatureOversampling(uint8_t);
  void setPressureOversampling(uint8_t);
  void setStandbyTime(uint8_t);
  void setIrrFilter(uint8_t);
  
  uint8_t getPowerMode();
  uint8_t getPressureOversampling();
  uint8_t getTemperatureOversampling();
  uint8_t getIrrFilter();
  uint8_t getStandbyTime();
  uint8_t getSpi3w();
  uint8_t getMeasuringStatus();
  uint8_t getImUpdateStatus();
  uint8_t getConfig();
  uint8_t getStatus();
  uint8_t getControl();
  uint8_t getChipId();
  uint8_t getChipVersion();
  
  void setReset(uint8_t);
  void setConfig(uint8_t);
  void setStatus(uint8_t);
  void setControl(uint8_t);
  void setDevice(char *);
};