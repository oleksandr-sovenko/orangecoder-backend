class BMP280Data {
private:
  double pressure; // hPa
  double temperature; // m
  double altitude; // °C
public:

  BMP280Data() {
    pressure = 0;
    temperature = 0;
    altitude = 0;
  }

  BMP280Data(double pressure, double temperature, double altitude) {
    this->pressure = pressure;
    this->temperature = temperature;
    this->altitude = altitude;
  }

  virtual ~BMP280Data() {
  }

  void setAltitude(double altitude) {
    this->altitude = altitude;
  }

  void setPressure(double pressure) {
    this->pressure = pressure;
  }

  void setTemperature(double temperature) {
    this->temperature = temperature;
  }

  double getAltitude() {
    return altitude;
  }

  double getPressure() {
    return pressure;
  }

  double getTemperature() {
    return temperature;
  }
};