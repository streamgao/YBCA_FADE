// mouseover serial

 // Demonstrates how to send data to the Arduino I/O board, in order to
 // turn ON a light if the mouse is over a square and turn it off
 // if the mouse is not.

 // created 2003-4
 // based on examples by Casey Reas and Hernando Barragan
 // modified 30 Aug 2011
 // by Tom Igoe
 // This example code is in the public domain.



 import processing.serial.*;

 float boxX;
 float boxY;
 int boxSize = 20;
 boolean mouseOverBox = false;

 Serial port;

 void setup() {
 size(200, 200);
 boxX = width/2.0;
 boxY = height/2.0;
 rectMode(RADIUS); 
 
 int p0= 3; //6 works too
 
 // List all the available serial ports in the output pane. 
 // You will need to choose the port that the Arduino board is 
 // connected to from this list. The first port in the list is 
 // port #0 and the third port in the list is port #2. 
 // if using Processing 2.1 or later, use Serial.printArray()
 println(Serial.list()); 
 println(Serial.list()[p0]); 

 // Open the port that the Arduino board is connected to (in this case #0) 
 // Make sure to open the port at the same speed Arduino is using (9600bps) 
// port = new Serial(this, Serial.list()[p0], 115200); 
 port = new Serial(this, Serial.list()[p0], 921600); 
// port = new Serial(this, Serial.list()[p0], 1843200); // not working
 
 }

void tick(char id)
{
  port.write(id);
  port.write('H');
  delay(300);
  port.write(id);
  port.write('L');
//  delay(100);
}

 void draw()
 {
  tick('0');
//  tick('1');
//  tick('2');
//  tick('3');
   background(0);
  
   // Test if the cursor is over the box
   if (mouseX > boxX-boxSize && mouseX < boxX+boxSize &&
     mouseY > boxY-boxSize && mouseY < boxY+boxSize) {
     mouseOverBox = true;
     // draw a line around the box and change its color:
     stroke(255);
     fill(153);
     // send an 'H' to indicate mouse is over square:
     port.write('H');
   }
   else {
     // return the box to it's inactive state:
     stroke(153);
     fill(153);
     // send an 'L' to turn the LED off:
     port.write('L');
     mouseOverBox = false;
   }
  
   // Draw the box
   rect(boxX, boxY, boxSize, boxSize);

 }
