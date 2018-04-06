# Progetto luci primo piano

<abstract>
Appunti relativi al progetto Luci per il primo piano Acme Systems
</abstract>

## CM3-Home

Installazione librerie mqtt per Python (Paho)

	sudo apt-get update
	sudo install python-serial
	sudo apt-get install python-pip
	sudo pip install paho-mqtt
	sudo apt-get install python-setuptools
	sudo easy_install PyCRC

GitHub repository

* <https://github.com/tanzilli/toa>

File __/lib/systemd/system/luci.service__

	[Unit]
	Description=Luci
	After=systemd-user-sessions.service
	
	[Service]
	ExecStart=/usr/bin/python /home/pi/luci.py
	Restart=on-abort
	User=pi
	WorkingDirectory=/home/pi
	
	[Install]
	WantedBy=multi-user.target

## Camera streaming

* [Video Streaming with Flask](https://blog.miguelgrinberg.com/post/video-streaming-with-flask)
* [Flask Video Streaming Revisited](https://blog.miguelgrinberg.com/post/flask-video-streaming-revisited)

	sudo apt-get update
	apt-get install python-flask
	sudo apt-get install python-picamera
	sudo apt-get install git
	git clone https://github.com/miguelgrinberg/flask-video-streaming.git
	cd flask-video-streaming
	python app.py
	CAMERA=pi python app.py
	
### streaming.py

	#!/usr/bin/env python
	from flask import Flask, render_template, Response
	from camera import Camera
	
	app = Flask(__name__)
	
	@app.route('/')
	def index():
	    return render_template('index.html')
	
	def gen(camera):
	    while True:
	        frame = camera.get_frame()
	        yield (b'--frame\r\n'
	               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
	
	@app.route('/video_feed')
	def video_feed():
	    return Response(gen(Camera()),
	                    mimetype='multipart/x-mixed-replace; boundary=frame')
	
	if __name__ == '__main__':
	    app.run(host='0.0.0.0', debug=True)
    
### index.html

	<html>
	  <head>
	    <title>Video Streaming Demonstration</title>
	  </head>
	  <body>
	    <h1>Video Streaming Demonstration</h1>
	    <img src="{{ url_for('video_feed') }}">
	  </body>
	</html>

## Previsioni del tempo

* <https://darksky.net/dev/docs>
* <https://api.darksky.net/forecast/a9f28d03f944f9aa0d5099e1f3f898f9/41.965287,12.078242?unit=auto&lang=it>


## Installazione senza controllo dell'autenticazione 

	sudo apt-get --allow-unauthenticated update
	
## Links

* (https://www.alt-codes.net/smiley_alt_codes.php)[https://www.alt-codes.net/smiley_alt_codes.php]

@include='bio_sergio_tanzilli'
	