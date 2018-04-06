# Tanzo Office Automation 


## Messaggi MQTT

	toa/light
		id/setval			Set the brightness value (0,255)
		id/getval			Get the brightness value
		id/currentval		Send the brightness current value
		
	toao/cm3panel
		{"cmd":pageload","value":"page.html"}	Change the CM3-panel web page
		{"cmd":videoload","value":"video.mp4"}	Load a background video
		{"cmd":clock_off"}						Hide clock
		{"cmd":clock_on"}						Show clock
		{"cmd":"message","value":"text"}		Send a message

## Software to install on the CM3-Panel

	sudo apt-get update
	sudo apt-get install chromium-browser
	sudo apt-get install xorg

Create the systemd file __/lib/systemd/system/startx.service__

	[Unit]
	Description=Launch xorg
	After=systemd-user-sessions.service
	
	[Service]
	ExecStart=/usr/bin/xinit -bg black -fg white -geometry 132x36 -e "runuser pi -c 'chromium-browser --incognito  -kiosk --window-position=0,0 --window-size=800,480 http://www.tanzolab.it/panel'"
	Restart=on-abort
	User=root
	WorkingDirectory=/home/pi
	
	[Install]
	WantedBy=multi-user.target
	

## Software to install on the CM3-Home

NodeJS

```
bash <(curl -sL https://raw.githubusercontent.com/node-red/raspbian-deb-package/master/resources/update-nodejs-and-nodered)
```