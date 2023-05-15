// Set serial for debug console (to the Serial Monitor, default speed 115200)
#define SerialMon Serial

// Set serial for AT commands (to the module)
// Use Hardware Serial on Mega, Leonardo, Micro
#define SerialAT Serial1

#define TINY_GSM_MODEM_SIM7000
#define TINY_GSM_RX_BUFFER 1024 // Set RX buffer to 1Kb
#define SerialAT Serial1

// See all AT commands, if wanted
// #define DUMP_AT_COMMANDS

// set GSM PIN, if any
#define GSM_PIN ""

// Your GPRS credentials, if any
const char apn[]  = "YOUR-APN";     //SET TO YOUR APN
const char gprsUser[] = "";
const char gprsPass[] = "";



#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// WiFi
const char *ssid = "SpectrumSetup-E0"; // Enter your WiFi name
const char *password = "smarttrain175";  // Enter WiFi password

const char *mqtt_broker = "rc2f8c80.ala.us-east-1.emqxsl.com";
const char *gps_topic = "SecureBand/GPS";
const char *alive_topic = "SecureBand/Alive";
const char *rescue_topic = "SecureBand/Rescue";
const char *mqtt_username = "SecureBand";
const char *mqtt_password = "GPSTEST123";
const int mqtt_port = 8883;

WiFiClientSecure espClient;
PubSubClient client(espClient);


#include <TinyGsmClient.h>
#include <SPI.h>
#include <SD.h>
#include <Ticker.h>

#ifdef DUMP_AT_COMMANDS
#include <StreamDebugger.h>
StreamDebugger debugger(SerialAT, SerialMon);
TinyGsm modem(debugger);
#else
TinyGsm modem(SerialAT);
#endif

#define uS_TO_S_FACTOR      1000000ULL  // Conversion factor for micro seconds to seconds
#define TIME_TO_SLEEP       60          // Time ESP32 will go to sleep (in seconds)

#define UART_BAUD           9600
#define PIN_DTR             25
#define PIN_TX              27
#define PIN_RX              26
#define PWR_PIN             4

#define SD_MISO             2
#define SD_MOSI             15
#define SD_SCLK             14
#define SD_CS               13
#define LED_PIN             12


unsigned long last_gps = 0;

bool gps_on = true;

unsigned long gps_interval = 60 * 1000;




void callback(char *topic, byte *payload, unsigned int length) {
 Serial.print("Message arrived in topic: ");
 Serial.println(topic);
 Serial.print("Message:");
 for (int i = 0; i < length; i++) {
     Serial.print((char) payload[i]);
 }
 Serial.println();
 Serial.println("-----------------------");

 if((char) payload[0] == '0'  ){
  Serial.println("GPS OFF");
  gps_on = false;
 }
 else if ((char) payload[0] == '1' ){
  Serial.println("Default GPS Mode");
  gps_interval = 60 * 1000;
  gps_on = true;
 }
 else if ((char) payload[0] == '2' ){
  Serial.println("Rescue GPS Mode");
  gps_interval = 1000;
  gps_on = true;
 }
}


void setupWifi()
{
   WiFi.begin(ssid, password);
   while (WiFi.status() != WL_CONNECTED) {
       delay(500);
       Serial.println("Connecting to WiFi..");
   }
   espClient.setInsecure();
   Serial.println("Connected to the WiFi network");
   client.setServer(mqtt_broker, mqtt_port);
   client.setCallback(callback);
   while (!client.connected()) {
       String client_id = "esp32-client-";
       client_id += String(WiFi.macAddress());
       Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
       if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
           Serial.println("Public emqx mqtt broker connected");
       } else {
           Serial.print("failed with state ");
           Serial.print(client.state());
           delay(2000);
       }
   }
   // publish and subscribe
   client.publish(alive_topic, "SecureBand is Alive");
   client.subscribe(rescue_topic);
}

void enableGPS(void)
{
    // Set SIM7000G GPIO4 LOW ,turn on GPS power
    // CMD:AT+SGPIO=0,4,1,1
    // Only in version 20200415 is there a function to control GPS power
    modem.sendAT("+SGPIO=0,4,1,1");
    if (modem.waitResponse(10000L) != 1) {
        DBG(" SGPIO=0,4,1,1 false ");
    }

    // SIM7070G use GPIO5
//    modem.sendAT("+SGPIO=0,5,1,1");
//    if (modem.waitResponse(10000L) != 1) {
//        DBG(" SGPIO=0,4,1,1 false ");
//    }

    modem.enableGPS();


}

void disableGPS(void)
{
    // Set SIM7000G GPIO4 LOW ,turn off GPS power
    // CMD:AT+SGPIO=0,4,1,0
    // Only in version 20200415 is there a function to control GPS power
    modem.sendAT("+SGPIO=0,4,1,0");
    if (modem.waitResponse(10000L) != 1) {
        DBG(" SGPIO=0,4,1,0 false ");
    }

//    // SIM7070G use GPIO5
//    modem.sendAT("+SGPIO=0,5,1,0");
//    if (modem.waitResponse(10000L) != 1) {
//        DBG(" SGPIO=0,4,1,0 false ");
//    }
    modem.disableGPS();
}

void modemPowerOn()
{
    pinMode(PWR_PIN, OUTPUT);
    digitalWrite(PWR_PIN, LOW);
    delay(1000);    //Datasheet Ton mintues = 1S
    digitalWrite(PWR_PIN, HIGH);
}

void modemPowerOff()
{
    pinMode(PWR_PIN, OUTPUT);
    digitalWrite(PWR_PIN, LOW);
    delay(1500);    //Datasheet Ton mintues = 1.2S
    digitalWrite(PWR_PIN, HIGH);
}


void modemRestart()
{
    modemPowerOff();
    delay(1000);
    modemPowerOn();
}

void setup()
{
    // Set console baud rate
    SerialMon.begin(115200);

    delay(10);

    setupWifi();

    // Set LED OFF
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, HIGH);

    modemPowerOn();

    SerialAT.begin(UART_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);

    Serial.println("/**********************************************************/");
    Serial.println("To initialize the network test, please make sure your GPS");
    Serial.println("antenna has been connected to the GPS port on the board.");
    Serial.println("/**********************************************************/\n\n");

    delay(10000);
}

void loop()
{
    unsigned long curr_time = millis();

    if(gps_on && (curr_time - last_gps > gps_interval)){
      last_gps = curr_time;

      
    
      if (!modem.testAT()) {
          Serial.println("Failed to restart modem, attempting to continue without restarting");
          modemRestart();
          return;
      }
  
      Serial.println("Start positioning . Make sure to locate outdoors.");
      Serial.println("The blue indicator light flashes to indicate positioning.");
  
      enableGPS();
  
      float lat,  lon;
      while (1) {
          if (modem.getGPS(&lat, &lon)) {
              Serial.println("The location has been locked, the latitude and longitude are:");
              Serial.print("latitude:"); Serial.println(lat);
              Serial.print("longitude:"); Serial.println(lon);
              
              char * gps_raw = (char*) modem.getGPSraw().c_str();
              Serial.println(gps_raw);  
  
              
              strsep(&gps_raw, ",");
              strsep(&gps_raw, ",");
              strsep(&gps_raw, ",");
  
              char * latitude = strsep(&gps_raw, ",");
              char * longitude = strsep(&gps_raw, ",");
  
              char * formatted_gps = (char *) malloc(strlen(latitude) + strlen(longitude) + 2);
              strcpy(formatted_gps, latitude);
              strcat(formatted_gps, ",");
              strcat(formatted_gps, longitude);
              
              
              
      
              client.publish(gps_topic, formatted_gps);
              free(formatted_gps);
              break;
          }
          digitalWrite(LED_PIN, !digitalRead(LED_PIN));
          delay(2000);
      }
  
      disableGPS();
    }

    client.loop();

}
