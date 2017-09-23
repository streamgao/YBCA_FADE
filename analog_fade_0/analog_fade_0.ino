/*
this file led effect:
fade r
fade g
fade b 
*/


#define D0 16
#define D1 5 // I2C Bus SCL (clock)
#define D2 4 // I2C Bus SDA (data)
#define D3 0
#define D4 2 // Same as "LED_BUILTIN", but inverted logic
#define D5 14 // SPI Bus SCK (clock)
#define D6 12 // SPI Bus MISO 
#define D7 13 // SPI Bus MOSI
#define D8 15 // SPI Bus SS (CS)
#define D9 3 // RX0 (Serial console)
#define D10 1 // TX0 (Serial console)


const int PINs[3] = {D4, D2, D3};
int brightness[3] = {0, 0, 0};

int fadeAmount = 5;
int currentLED = 0;
bool indicator = false;

void setup() {
  // Serial.begin(9600);
  pinMode(PINs[0], OUTPUT);
  pinMode(PINs[1], OUTPUT);
  pinMode(PINs[2], OUTPUT);
  indicator = false;
}

void loop() {
  for (int i = 0; i < 3; i++) {
    if (i != currentLED) {
      brightness[i] = 0;
    } else {
      brightness[i] = brightness[i] + fadeAmount;
    }
    analogWrite(PINs[i], brightness[i]);
  }

  if (brightness[currentLED] == 0 && indicator) {
      fadeAmount = -fadeAmount;
      currentLED = currentLED + 1;
      if (currentLED == 3) {
        currentLED = 0;
      }
  }
  if (brightness[currentLED] == 255) {
      fadeAmount = -fadeAmount;
      indicator = true;
  }
  // wait for 30 milliseconds to see the dimming effect
  delay(30);
}



