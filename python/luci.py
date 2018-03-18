#!/usr/bin/python
# luci.py
#
# Gestione luci primo piano Acme Systems srl
# 2018 (c) Sergio Tanzilli - sergio@tanzilli.com - www.tanzolab.it

import paho.mqtt.client as mqtt
import json
import time
import sys
import os
from datetime import datetime
import StringIO
import select

serial_enabled=True

if serial_enabled:
	import RPi.GPIO as GPIO
	import serial

stato_luci=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

broker="localhost"
port=1883
topic="toa"

if serial_enabled:
	ser = serial.Serial(
		port='/dev/ttyUSB2',
		baudrate=9600,
		timeout=1,
		parity=serial.PARITY_NONE,
		stopbits=serial.STOPBITS_ONE,
		bytesize=serial.EIGHTBITS
	)
	ser.flushOutput()
	ser.flushInput()

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
	global topic
	print("Connected with result code "+str(rc))
	client.subscribe(topic + "/light/+/setval")
	client.subscribe(topic + "/light/+/getval")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
	global stato_luci,topic
		
	print msg.topic , msg.payload
	
	a=msg.topic.split("/")
	i=int(a[2])
	if (a[3]=="setval"):
		stato_luci[i]=int(msg.payload)
		
		rele=i+1
		if stato_luci[i]==0:
			stato=0
		else:	
			stato=1

		print "rele=%d stato=%d" % (rele,stato)
		sample = "%c%c%c\r" % (0xFF,i+1,stato)

		if serial_enabled:
			ser.write(sample)
		
	client.publish(topic + "/light/%d/currentval" % i,"%d" % stato_luci[i])

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(broker, port, 60)

client.loop_start()
#client.loop_forever()

#Invio lo stato corrente delle luci
for i in range(len(stato_luci)):
	client.publish(topic + "/light/%d/currentval" % i,"%d" % stato_luci[i])

while True:
	time.sleep(10)

