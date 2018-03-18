#!/usr/bin/python
# acmelamp.py
#
# Gestione luci primo piano Acme Systems srl
# 2018 (c) Sergio Tanzilli - tanzilli@acmesystems.it - www.acmesystems.it

# sudo apt-get install python-serial
# sudo apt-get install python-setuptools
# sudo easy_install PyCRC

# https://pycrc.readthedocs.io/en/latest/readme.html
# http://www.sunshine2k.de/coding/javascript/crc/crc_js.html

import serial
import time
import math
from PyCRC.CRC32 import CRC32
import paho.mqtt.client as mqtt
import time
import sys
import os
from datetime import datetime
import StringIO
import select
import RPi.GPIO as GPIO

broker="www.tanzolab.it"
port=1883
topic="primopiano"
stato_luci=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

#########################################
# Trasmissione pacchetto RS485 alla Yarm
#########################################

def sendPacket(ser,address,cmd,warm,cold,red,green,blue):
	valore=0
	counter=0
	packet = bytearray()

	#Start transmission
	packet.append(0x7E)  # STX

	#Payload
	packet.append(address)  # Address (no 0x00)
	packet.append(cmd)  	# Cmd 0x01 set valore globale
							#     0x02 set luminosita
	packet.append(warm)  	# Warm  brightness
	packet.append(cold)  	# Cold  brightness
	packet.append(red)  	# Red   brightness
	packet.append(green)	# Green brightness
	packet.append(blue)  	# Blue  brightness
	packet.append(0x00)  	# Reserved

	#CRC32
	payload=str(packet[1:9])	

	crc32=CRC32().calculate(payload)

	#print "Crc32: %08X" % crc32, 

	#Inserisce il CRC32 a fine pacchetto

	packet.append(crc32 & 0xFF)
	packet.append((crc32 >> 8) & 0xFF)
	packet.append((crc32 >> 16) & 0xFF)
	packet.append((crc32 >> 24) & 0xFF)

	#for i in range(9):
	#	print "--> %02X" % packet[i]
	#	ser.write(str(packet[i]))

	ser.write(packet)

	for i in range(len(packet)):
		print "%02X " % (packet[i]),
	print

#########################################
# Ricezione di un pacchetto da Yarm
#########################################

def waitPacket(ser):
	rxchar=ser.read(20)

	if rxchar:
		for i in range(len(rxchar)):
			print("%02X " % (ord(rxchar[i]))),
		print	
	else:
		print "Timeout"

#########################################
# MQTT Callback connessione avvenuta
#########################################

def on_connect(client, userdata, flags, rc):
	global topic
	print("Connected with result code "+str(rc))
	client.subscribe(topic + "/luci/+/setval")
	client.subscribe(topic + "/luci/+/getval")

#########################################
# MQTT Callback messaggi in arrivo
#########################################

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
			stato=255

		address=0x05
		cmd=0x5A
		
		if i==0:
			sendPacket(ser,address,cmd,stato,stato,stato,stato,stato)

	client.publish(topic + "/luci/%d/currentval" % i,"%d" % stato_luci[i])

#########################################
# Start
#########################################

ser = serial.Serial(
    port='/dev/ttyUSB0',
    baudrate=460800,
    timeout=1,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    bytesize=serial.EIGHTBITS
)

ser.flushOutput()
ser.flushInput()

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(broker, port, 60)

client.loop_start()
#client.loop_forever()

#Invio lo stato corrente delle luci
for i in range(len(stato_luci)):
	client.publish(topic + "/luci/%d/currentval" % i,"%d" % stato_luci[i])

while True:
	time.sleep(10)


