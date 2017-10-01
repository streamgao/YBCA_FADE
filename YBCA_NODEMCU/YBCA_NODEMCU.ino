/*
   31 mar 2015
   http://www.esp8266.com/viewtopic.php?f=29&t=2222
   This sketch display UDP packets coming from an UDP client.
   On a Mac the NC command can be used to send UDP. (nc -u 192.168.1.101 12345).

   Configuration : Enter the ssid and password of your Wifi AP. Enter the port number your server is listening on.

*/
#include <ESP8266WiFi.h>
#include <WiFiUDP.h>

extern "C" {  //required for read Vdd Voltage
#include "user_interface.h"
#include "SimpleTimer.h"
  // uint16 readvdd33(void);
}

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

int ID = 02;   //change this for each device

int PIN_RELAY = D1; //5
int PIN_B = D2; //4
int PIN_G = D3; //0
int PIN_R = D4; //2

const int BLINK_DURATION = 100;
const int MODE_BLINK = 1;
const int MODE_FADE = 2;
int MODE = MODE_BLINK;
int brightness = 0;
int fadeAmount = 5;

int status = WL_IDLE_STATUS;
const char* ssid = "kineviz_test";  //  your network SSID (name)
const char* pass = "12345678";       // your network password
// const char* serverIP = "192.168.0.101"; //server to send my info  192.168.0.94
const char* serverIP = "192.168.0.94";
unsigned int serverPort = 12346;
unsigned int localPort = 12345;      // local port to listen for UDP packets
SimpleTimer timer;
byte packetBuffer[512]; //buffer to hold incoming and outgoing packets

// A UDP instance to let us send and receive packets over UDP
WiFiUDP Udp;

void setup() {
  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_R, OUTPUT);
  pinMode(PIN_G, OUTPUT);
  pinMode(PIN_B, OUTPUT);
  // Open serial communications and wait for port to open:
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }

  // setting up Station AP
  WiFi.begin(ssid, pass);

  // Wait for connect to AP
  Serial.print("[Connecting]");
  Serial.print(ssid);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    tries++;
    if (tries > 30) {
      break;
    }
  }
  Serial.println();
  printWifiStatus();

  Serial.println("Connected to wifi");
  Serial.print("Udp server started at port ");
  Serial.println(localPort);
  Udp.begin(localPort);

  blink(255, 0, 0, 0, 250);
  delay(250);
  blink(0, 255, 0, 1, 250);
  delay(250);
  blink(0, 0, 255, 0, 250);
  delay(500);
  blink(255, 255, 255, 1, 250);

  timer.setInterval(3000, heartBeat);

  // default mode
  MODE = MODE_BLINK;
  brightness = 0;
}

void blink(int r, int g, int b, int relay, int duration) {
  Serial.print(r + ',' + g + ',' + b + '. relay: ');
  Serial.print(relay);
  Serial.println();

  if (relay > 0) digitalWrite(PIN_RELAY, HIGH);
  analogWrite(PIN_R, r);
  analogWrite(PIN_G, g);
  analogWrite(PIN_B, b);
  //    if(r>0) digitalWrite(PIN_R, HIGH);
  delay(duration);
  digitalWrite(PIN_RELAY, LOW);
  analogWrite(PIN_R, 0);
  analogWrite(PIN_G, 0);
  analogWrite(PIN_B, 0);
  //    digitalWrite(PIN_R, LOW);
}

void loop() {
  timer.run();
  int noBytes = Udp.parsePacket();
  String cmd = "";

  if ( noBytes ) {
    Serial.print(millis() / 1000);
    Serial.print(":Packet of ");
    Serial.print(noBytes);
    Serial.print(" received from ");
    Serial.print(Udp.remoteIP());
    Serial.print(":");
    Serial.println(Udp.remotePort());
    // We've received a packet, read the data from it
    Udp.read(packetBuffer, noBytes); // read the packet into the buffer

    // display the packet contents in HEX
    for (int i = 1; i <= noBytes; i++) {
      Serial.print(packetBuffer[i - 1], HEX);
      cmd = cmd + char(packetBuffer[i - 1]);
      if (i % 32 == 0) {
        Serial.println();
      }
      else Serial.print(' ');
    } // end for
    Serial.println('\n'+ cmd + '\n');

    // blick options
    int commaIndex = cmd.indexOf(',');
    int secondCommaIndex = cmd.indexOf(',', commaIndex + 1);
    int thirdCommaIndex = cmd.indexOf(',', secondCommaIndex + 1);
    int forthCommaIndex = cmd.indexOf(',', thirdCommaIndex + 1);
    String strR = cmd.substring(0, commaIndex);
    String strG = cmd.substring(commaIndex + 1, secondCommaIndex);
    String strB = cmd.substring(secondCommaIndex + 1, thirdCommaIndex);
    String strRelay = cmd.substring(thirdCommaIndex + 1);
    int curMode = cmd.substring(forthCommaIndex + 1).toInt();

    if ( curMode == MODE_BLINK ) {
        MODE = curMode;
        blink(strR.toInt(), strG.toInt(), strB.toInt(), strRelay.toInt(), BLINK_DURATION);
    } else { // fade
        MODE = curMode;
    }
  } // end if

  if (MODE == MODE_FADE) {
      // fade
      brightness += fadeAmount;
      analogWrite(PIN_R, brightness);
      analogWrite(PIN_G, brightness);
      analogWrite(PIN_B, brightness);
      if (brightness == 0 || brightness == 250) {
          fadeAmount = -fadeAmount;
      }
      // wait for 20 milliseconds to see the dimming effect
      // whole loop is 1.00 second .  -- i just want a round number
      delay(20);
  } else {
      // reset
      brightness = 0;
      fadeAmount = 5;
  }
}


void heartMonitor() {
  int sensorValue = analogRead(A0);
  Udp.beginPacket(serverIP, serverPort);
  Udp.write("ecg ");
  Udp.println(sensorValue);
  Udp.endPacket();
}

void heartBeat() {
  Udp.beginPacket(serverIP, serverPort);
  Udp.write("Heartbeat from ESP8266 ID:");
  Udp.print(ID);
  Udp.write(" #IP:");
  Udp.print(WiFi.localIP());
  Udp.println();
  Udp.endPacket();

  Serial.println("Heatbeat sent to server");
  Serial.println();
}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}
