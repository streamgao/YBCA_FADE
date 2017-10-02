/*
this file led effect:
fade white
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


const int PINs[3] = {D2, D3, D4};
int brightness = 0;
int fadeAmount = 5;

void setup() {
  // Serial.begin(9600);
  pinMode(PINs[0], OUTPUT);
  pinMode(PINs[1], OUTPUT);
  pinMode(PINs[2], OUTPUT);
}

void loop() {
  for (int i = 0; i < 3; i++) {
      brightness = brightness + fadeAmount;
      analogWrite(PINs[i], brightness);
  }

  if (brightness == 0 || brightness == 250) {
      fadeAmount = -fadeAmount;
  }
  // wait for 20 milliseconds to see the dimming effect
  // whole loop is 1.00 second .  -- i just want a round number
  delay(20);
}


