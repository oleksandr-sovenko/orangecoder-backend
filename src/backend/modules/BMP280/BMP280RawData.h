#include <stdint.h>

class BMP280RawData {
private:
  uint8_t pmsb;
  uint8_t plsb;
  uint8_t pxsb;

  uint8_t tmsb;
  uint8_t tlsb;
  uint8_t txsb;

  uint32_t temperature;
  uint32_t pressure;
public:

  BMP280RawData(
    uint8_t pmsb, uint8_t plsb, uint8_t pxsb,
    uint8_t tmsb, uint8_t tlsb, uint8_t txsb,
    uint32_t temperature, uint32_t pressure) {
    this->pmsb = pmsb;
    this->plsb = plsb;
    this->pxsb = pxsb;
    this->tmsb = tmsb;
    this->tlsb = tlsb;
    this->txsb = txsb;
    this->temperature = temperature;
    this->pressure = pressure;
  }

  BMP280RawData() {
    this->pmsb = 0;
    this->plsb = 0;
    this->pxsb = 0;
    this->tmsb = 0;
    this->tlsb = 0;
    this->txsb = 0;
    this->temperature = 0;
    this->pressure = 0;
  }

  virtual ~BMP280RawData() {
  }

  void setPlsb(uint8_t plsb) {
    this->plsb = plsb;
  }

  void setPmsb(uint8_t pmsb) {
    this->pmsb = pmsb;
  }

  void setPressure(uint32_t pressure) {
    this->pressure = pressure;
  }

  void setPxsb(uint8_t pxsb) {
    this->pxsb = pxsb;
  }

  void setTemperature(uint32_t temperature) {
    this->temperature = temperature;
  }

  void setTlsb(uint8_t tlsb) {
    this->tlsb = tlsb;
  }

  void setTmsb(uint8_t tmsb) {
    this->tmsb = tmsb;
  }

  void setTxsb(uint8_t txsb) {
    this->txsb = txsb;
  }

  uint8_t getPlsb() {
    return plsb;
  }

  uint8_t getPmsb() {
    return pmsb;
  }

  uint32_t getPressure() {
    return pressure;
  }

  uint8_t getPxsb() {
    return pxsb;
  }

  uint32_t getTemperature() {
    return temperature;
  }

  uint8_t getTlsb() {
    return tlsb;
  }

  uint8_t getTmsb() {
    return tmsb;
  }

  uint8_t getTxsb() {
    return txsb;
  }
};