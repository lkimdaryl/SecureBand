# imports
import time
import paho.mqtt.client as paho
from paho import mqtt
import asyncio 


# defined
topic_subscribe = "SecureBand/#"
topic_rescue = "SecureBand/Rescue"
username = 'Admin'
password = 'SecureBandece140b'
broker_address = "05dd93c59d194b748d1862b8002f5c1d.s1.eu.hivemq.cloud"
port = 8883

latest_coordinates = {"latitude": 0.0, "longitude": 0.0}  # Global dictionary to store the latest coordinates

# hivemq.webclient.1685163054772
# a%G:>f@72zDHgMX1K9bs

# callback function for connection acknowledgement
def on_connect(client, userdata, flags, rc, properties=None):
    # check connection
    print("CONNACK received with code %s." % rc)


# callback function for publishing acknowledgement
def on_publish(client, userdata, mid, properties=None):
    print("mid: " + str(mid))


# callback function for subscription acknowledgement
def on_subscribe(client, userdata, mid, granted_qos, properties=None):
    print("subscribed: " + str(mid) + " " + str(granted_qos))


# callback function for message reception
def on_message(client, userdata, msg):
    # extracting the coordinates payload
    coordinates = msg.payload.decode("utf-8")
    
    # splitting the coordinates 
    split_coordinates = coordinates.split(',')

    # upon startup, coordinates are 0
    if len(coordinates) == 1: 
        latitude = 0.0
        longitude = 0.0
    # extract latitude and longitude 
    else: 
        latitude = float(split_coordinates[0].strip())
        longitude = float(split_coordinates[1].strip())

    # Update the latest coordinates
    latest_coordinates["latitude"] = latitude
    latest_coordinates["longitude"] = longitude

    print("latitude", latitude)
    print("longitude", longitude)
    # print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))


# define rescue
rescue = 1

def rescue_mode(mode): 
    global rescue
    rescue = mode
    print("rescue mode:", rescue)

def public_rescue(client): 
    print("rescue variable:", rescue)

    if rescue == 1: 
        # publish to SecureBand/Rescue
        client.publish(topic_rescue, payload="1", qos=1)

    elif rescue == 2:
        # publish to SecureBand/Rescue
        client.publish(topic_rescue, payload="2", qos=1)

    else:
        # publish to SecureBand/Rescue
        client.publish(topic_rescue, payload="0", qos=1)

        # unsubscribe from SecureBand/GPS and SecureBand/Rescue
        client.unsubscribe(topic_subscribe)


async def start_connection():
    global rescue

    # creating MQTT client
    client = paho.Client(client_id="", userdata=None, protocol=paho.MQTTv5)
    client.on_connect = on_connect

    # enable TLS for secure connection
    client.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)

    # setting username and password
    client.username_pw_set(username,password)

    # connecting to HiveMQ Cloud
    client.connect(host=broker_address,port=port,keepalive=300)

    # callback functions
    client.on_subscribe = on_subscribe
    client.on_message = on_message
    client.on_publish = on_publish

    # checking rescue variable --> # 0 off 1 on 2 fast

    client.loop_start()

    # subscribe to SecureBand/GPS and SecureBand/Rescue
    client.subscribe(topic_subscribe, qos=1)  

    public_rescue(client)

    await asyncio.sleep(0.1)

    return client
