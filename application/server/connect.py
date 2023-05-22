# # imports 
# import time 
# import paho.mqtt.client as paho
# from paho import mqtt

# # defined
# topic_gps = "SecureBand/GPS"
# topic_rescue = "SecureBand/Rescue"
# username = 'Monitor'
# password = '1234'
# broker_address = "broker.hivemq.com"
# port = 1883

# # callback function for connection acknowledgement 
# def on_connect(client, userdata, flags, rc, properties=None):
#     # check connection
#     print("CONNACK received with code %s." % rc)
#     # if rc == 0: 
#     #     print('CONNACK received with code %d.' % (rc))
#     #     # subscribe to topics
#     #     client.subscribe(topic_gps)
#     #     client.subscribe(topic_rescue)
#     # else: 
#     #     print(f"Connection failed, error code {rc}")

# # callback function for publishing acknowledgement
# def on_publish(client, userdata, mid, properties=None):
#     print("mid: " + str(mid))


# # callback function for subscription acknowledgement
# def on_subscribe(client, userdata, mid, granted_qos):
#     print("subscribed: " + str(mid) + " " + str(granted_qos))

# # callback function for message reception
# def on_message(client, userdata, msg):
#     print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))
#     # topic = msg.topic
#     # payload = msg.payload.decode('utf-8')

#     # # subscribing to a topic
#     # if topic == topic_gps:
#     #     print(1)
#     # elif topic ==  topic_rescue: 
#     #     if payload == "1":
#     #         print(2)

# def start_connection(): 
#     # creating MQTT client
#     client = paho.Client(client_id="", userdata=None, protocol=paho.MQTTv5)
#     client.on_connect = on_connect

#     # enable TLS for secure connection
#     client.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)

#     # setting username and password 
#     client.username_pw_set(username,password)

#     # connecting to HiveMQ Cloud 
#     client.connect(broker_address,port)

#     # callback functions
#     client.on_subscribe = on_subscribe
#     client.on_message = on_message
#     client.on_publish = on_publish

#     # subscribe to SecureBand gps topic
#     client.subscribe(topic_gps, qos=1)




# # Mqtt Host: deployment-rc2f8c80
# # Websocket Port: 8084

# # User: Monitor
# # Pass: 1234

# # Topics:
# # SecureBand/GPS  --- For GPS Data
# # SecureBand/Rescue  --- To Change to rescue mode send '1'. To switch back, send any other message 


# # client.on_connect = on_connect
# # client.connect('broker.mqttdashboard.com', 1883)

