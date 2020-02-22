#include <stdint.h>

class BMP280CalibrationData {
private:
  uint16_t T1;
  int16_t T2;
  int16_t T3;

  uint16_t P1;
  int16_t P2;
  int16_t P3;
  int16_t P4;
  int16_t P5;
  int16_t P6;
  int16_t P7;
  int16_t P8;
  int16_t P9;

public:

  BMP280CalibrationData() {
    T1 = 0;
    T2 = 0;
    T3 = 0;
    P1 = 0;
    P2 = 0;
    P3 = 0;
    P4 = 0;
    P5 = 0;
    P6 = 0;
    P7 = 0;
    P8 = 0;
    P9 = 0;
  }

  BMP280CalibrationData(
    uint16_t T1, int16_t T2, int16_t T3,
    uint16_t P1, int16_t P2, int16_t P3,
    int16_t P4, int16_t P5, int16_t P6,
    int16_t P7, int16_t P8, int16_t P9) {
    this->P1 = P1;
    this->P2 = P2;
    this->P3 = P3;
    this->P4 = P4;
    this->P5 = P5;
    this->P6 = P6;
    this->P7 = P7;
    this->P8 = P8;
    this->P9 = P9;
    this->T1 = T1;
    this->T2 = T2;
    this->T3 = T3;
  }

  virtual ~BMP280CalibrationData() {
  }

  void setP1(uint16_t P1) {
    this->P1 = P1;
  }

  void setP2(int16_t P2) {
    this->P2 = P2;
  }

  void setP3(int16_t P3) {
    this->P3 = P3;
  }

  void setP4(int16_t P4) {
    this->P4 = P4;
  }

  void setP5(int16_t P5) {
    this->P5 = P5;
  }

  void setP6(int16_t P6) {
    this->P6 = P6;
  }

  void setP7(int16_t P7) {
    this->P7 = P7;
  }

  void setP8(int16_t P8) {
    this->P8 = P8;
  }

  void setP9(int16_t P9) {
    this->P9 = P9;
  }

  void setT1(uint16_t T1) {
    this->T1 = T1;
  }

  void setT2(int16_t T2) {
    this->T2 = T2;
  }

  void setT3(int16_t T3) {
    this->T3 = T3;
  }

  uint16_t getP1() {
    return P1;
  }

  int16_t getP2() {
    return P2;
  }

  int16_t getP3() {
    return P3;
  }

  int16_t getP4() {
    return P4;
  }

  int16_t getP5() {
    return P5;
  }

  int16_t getP6() {
    return P6;
  }

  int16_t getP7() {
    return P7;
  }

  int16_t getP8() {
    return P8;
  }

  int16_t getP9() {
    return P9;
  }

  uint16_t getT1() {
    return T1;
  }

  int16_t getT2() {
    return T2;
  }

  int16_t getT3() {
    return T3;
  }
};