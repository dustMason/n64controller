#include <Arduino.h>
#include <DistanceGP2Y0A21YK.h>
#include <RunningMedian.h>
void setup();
void loop();
boolean machineIsOn();
void setFaderLedLevel(int cm);
#line 1 "src/sketch.ino"
//#include <DistanceGP2Y0A21YK.h>
//#include <RunningMedian.h>

RunningMedian samples = RunningMedian(30);
DistanceGP2Y0A21YK Dist;

const int sensorPin = A5;
const int buttonPin = 3;
const int ledPin =  11;
const int faderLedPin = 10;

long count = 0;
long time = 0;         // the last time the output pin was toggled
int state = LOW;
int previous = HIGH;   // the previous reading from the input pin
int debounce = 200;    // the debounce time, increase if the output flickers
int maxDistance = 50;  // in CM

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);      
  Dist.begin(sensorPin);
  Serial.begin(9600);
}

void loop() {
  if (machineIsOn()) {
    digitalWrite(ledPin, HIGH);
    samples.add(Dist.getDistanceCentimeter());
    count++;
    if (count % 10 == 0) { 
      setFaderLedLevel(samples.getMedian());
    }
    // delay(10);
  } else {
    digitalWrite(ledPin, LOW);
    digitalWrite(faderLedPin, LOW);
  }
}

boolean machineIsOn() {
  int reading = digitalRead(buttonPin);
  if (reading == LOW && previous == HIGH && millis() - time > debounce) {
    if (state == LOW) {
      Serial.println("-- ON --");
      state = HIGH;
    } else {
      Serial.println("-- OFF --");
      state = LOW;
    }
    time = millis();    
  }
  previous = reading;
  return state;
}

void setFaderLedLevel(int cm) {
  /* Serial.println(cm); */
  float percent = (1.0 - ((float)cm / (float)maxDistance));
  if (percent < 0.10) { percent = 0; }
  int intensity = 255.0 * percent;
  analogWrite(faderLedPin, intensity);
  /* Serial.println(intensity); */
  Serial.println(percent);
}
