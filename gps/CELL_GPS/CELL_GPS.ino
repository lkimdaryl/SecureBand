/**************************************************************
 *
 * For this example, you need to install PubSubClient library:
 *   https://github.com/knolleary/pubsubclient
 *   or from http://librarymanager/all#PubSubClient
 *
 * TinyGSM Getting Started guide:
 *   https://tiny.cc/tinygsm-readme
 *
 * For more MQTT examples, see PubSubClient library
 *
 **************************************************************
 * This example connects to HiveMQ's showcase broker.
 *
 * You can quickly test sending and receiving messages from the HiveMQ webclient
 * available at http://www.hivemq.com/demos/websocket-client/.
 *
 * Subscribe to the topic GsmClientTest/ledStatus
 * Publish "toggle" to the topic GsmClientTest/led and the LED on your board
 * should toggle and you should see a new message published to
 * GsmClientTest/ledStatus with the newest LED status.
 *
 **************************************************************/

#define TINY_GSM_MODEM_SIM7000

// Set serial for debug console (to the Serial Monitor, default speed 115200)
#define SerialMon Serial

// Set serial for AT commands (to the module)
// Use Hardware Serial on Mega, Leonardo, Micro
#define SerialAT Serial1

// See all AT commands, if wanted
//#define DUMP_AT_COMMANDS

// Define the serial console for debug prints, if needed
#define TINY_GSM_DEBUG SerialMon

// Add a reception delay, if needed.
// This may be needed for a fast processor at a slow baud rate.
// #define TINY_GSM_YIELD() { delay(2); }

// Define how you're planning to connect to the internet
// These defines are only for this example; they are not needed in other code.
#define TINY_GSM_USE_GPRS true
#define TINY_GSM_USE_WIFI false


// set GSM PIN, if any
#define GSM_PIN ""

// Your GPRS credentials, if any
const char apn[]      = "m2m.com.attz";
const char gprsUser[] = "";
const char gprsPass[] = "";

// Your WiFi connection credentials, if applicable
const char wifiSSID[] = "YourSSID";
const char wifiPass[] = "YourWiFiPass";

// MQTT details
//const char *broker = "rc2f8c80.ala.us-east-1.emqxsl.com";
const char *broker = "broker.hivemq.com";
const int broker_port = 1883;

const char *mqtt_username = "SecureBand";
const char *mqtt_password = "GPSTEST123";

const char *gps_topic = "SecureBand/GPS";
const char *alive_topic = "SecureBand/Alive";
const char *rescue_topic = "SecureBand/Rescue";

#include <TinyGsmClient.h>
#include <PubSubClient.h>
#include <Ticker.h>
#include <SPI.h>
#include <SD.h>

// Just in case someone defined the wrong thing..
#if TINY_GSM_USE_GPRS && not defined TINY_GSM_MODEM_HAS_GPRS
#undef TINY_GSM_USE_GPRS
#undef TINY_GSM_USE_WIFI
#define TINY_GSM_USE_GPRS false
#define TINY_GSM_USE_WIFI true
#endif
#if TINY_GSM_USE_WIFI && not defined TINY_GSM_MODEM_HAS_WIFI
#undef TINY_GSM_USE_GPRS
#undef TINY_GSM_USE_WIFI
#define TINY_GSM_USE_GPRS true
#define TINY_GSM_USE_WIFI false
#endif

#ifdef DUMP_AT_COMMANDS
#include <StreamDebugger.h>
StreamDebugger debugger(SerialAT, SerialMon);
TinyGsm        modem(debugger);
#else
TinyGsm        modem(SerialAT);
#endif
TinyGsmClient client(modem);
PubSubClient  mqtt(client);



Ticker tick;



#define uS_TO_S_FACTOR 1000000ULL  // Conversion factor for micro seconds to seconds
#define TIME_TO_SLEEP  60          // Time ESP32 will go to sleep (in seconds)

#define UART_BAUD   115200
#define PIN_DTR     25
#define PIN_TX      27
#define PIN_RX      26
#define PWR_PIN     4

#define SD_MISO     2
#define SD_MOSI     15
#define SD_SCLK     14
#define SD_CS       13
#define LED_PIN     12

int ledStatus = LOW;

uint32_t lastReconnectAttempt = 0;


unsigned long last_gps = 0;

bool gps_on = true;

unsigned long gps_interval = 60 * 1000;


void mqttCallback(char *topic, byte *payload, unsigned int length) {
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
      gps_interval = 10 * 1000;
      gps_on = true;
   }
}

boolean mqttConnect()
{
    SerialMon.print("Connecting to ");
    SerialMon.print(broker);

    // Connect to MQTT Broker
    //boolean status = mqtt.connect("SecureBand");

    // Or, if you want to authenticate MQTT:
    boolean status = mqtt.connect(mqtt_username, mqtt_username, mqtt_password);

    if (status == false) {
        SerialMon.println(" fail");
        return false;
    }
//    SerialMon.println(" success");
//    mqtt.publish(topicInit, "GsmClientTest started");
//    mqtt.subscribe(topicLed);
    mqtt.subscribe(rescue_topic);
    return mqtt.connected();
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
    Serial.begin(115200);
    delay(10);

    // Set LED OFF
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, HIGH);

    pinMode(PWR_PIN, OUTPUT);
    digitalWrite(PWR_PIN, HIGH);
    delay(300);
    digitalWrite(PWR_PIN, LOW);

    delay(1000);

    SerialAT.begin(UART_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);

    // Restart takes quite some time
    // To skip it, call init() instead of restart()
    Serial.println("Initializing modem...");
    if (!modem.restart()) {
        Serial.println("Failed to restart modem, attempting to continue without restarting");
    }



//    String name = modem.getModemName();
//    DBG("Modem Name:", name);
//
//    String modemInfo = modem.getModemInfo();
//    DBG("Modem Info:", modemInfo);

//#if TINY_GSM_USE_GPRS
//    // Unlock your SIM card with a PIN if needed
//    if (GSM_PIN && modem.getSimStatus() != 3) {
//        modem.simUnlock(GSM_PIN);
//    }
//#endif

#if TINY_GSM_USE_WIFI
    // Wifi connection parameters must be set before waiting for the network
    SerialMon.print(F("Setting SSID/password..."));
    if (!modem.networkConnect(wifiSSID, wifiPass)) {
        SerialMon.println(" fail");
        delay(10000);
        return;
    }
    SerialMon.println(" success");
#endif

    SerialMon.print("Waiting for network...");
    while(!modem.isNetworkConnected()){
      Serial.print(".");
      delay(10000);
    }
//    if (!modem.waitForNetwork()) {
//        SerialMon.println(" fail");
//        delay(10000);
//        return;
//    }
    SerialMon.println(" success");

    if (modem.isNetworkConnected()) {
        SerialMon.println("Network connected");
    }

#if TINY_GSM_USE_GPRS
    // GPRS connection parameters are usually set after network registration
    SerialMon.print(F("Connecting to "));
    SerialMon.print(apn);
    if (!modem.gprsConnect(apn, gprsUser, gprsPass)) {
        SerialMon.println(" fail");
        delay(10000);
        return;
    }
    SerialMon.println(" success");

    if (modem.isGprsConnected()) {
        SerialMon.println("GPRS connected");
    }
#endif

    // MQTT Broker setup
    mqtt.setServer(broker, broker_port);
    mqtt.setCallback(mqttCallback);

}

void loop()
{


    // Make sure we're still registered on the network
    if (!modem.isNetworkConnected()) {
        SerialMon.println("Network disconnected");
        if (!modem.waitForNetwork(180000L, true)) {
            SerialMon.println(" fail");
            delay(10000);
            return;
        }
        if (modem.isNetworkConnected()) {
            SerialMon.println("Network re-connected");
        }

#if TINY_GSM_USE_GPRS
        // and make sure GPRS/EPS is still connected
        if (!modem.isGprsConnected()) {
            SerialMon.println("GPRS disconnected!");
            SerialMon.print(F("Connecting to "));
            SerialMon.print(apn);
            if (!modem.gprsConnect(apn, gprsUser, gprsPass)) {
                SerialMon.println(" fail");
                delay(10000);
                return;
            }
            if (modem.isGprsConnected()) {
                SerialMon.println("GPRS reconnected");
            }
        }
#endif
    }

    if (!mqtt.connected()) {
        SerialMon.println("=== MQTT NOT CONNECTED ===");
        // Reconnect every 10 seconds
        uint32_t t = millis();
        if (t - lastReconnectAttempt > 10000L) {
            lastReconnectAttempt = t;
            if (mqttConnect()) {
                lastReconnectAttempt = 0;
            }
        }
        delay(100);
        return;
    }


    unsigned long curr_time = millis();

    if(gps_on && (curr_time - last_gps > gps_interval)){
      last_gps = curr_time;

      
  
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

              Serial.print("Latitude: ");
              Serial.println(latitude);
              
              char * longitude = strsep(&gps_raw, ",");

              Serial.print("Longitude: ");
              Serial.println(longitude);


              

              int message_size = strlen(latitude) + strlen(longitude) + 2;

              Serial.print("String Lengths: ");
              Serial.println(message_size);
              char formatted_gps[message_size];
              
              strcpy(formatted_gps, latitude);
              strcat(formatted_gps, ",");
              strcat(formatted_gps, longitude);

//              sprintf(formatted_gps, "%s,%s", latitude, longitude);

              Serial.print("Formatted GPS: ");
              Serial.println(formatted_gps);
              
              
              
      
              mqtt.publish(gps_topic, formatted_gps);


//              free(formatted_gps);
              break;
          }
          digitalWrite(LED_PIN, !digitalRead(LED_PIN));
          delay(2000);
      }
    }
    mqtt.loop();

}
