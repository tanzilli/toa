var counter=0;
var rss_title=[];

// Uscita testo notizia
function tickerOut() {
	$("#ticker_text").animate({opacity: 0.0,left: '+=200px'}, "slow");
	setTimeout(tickerUpdate, 1000)
}

// Aggiurnamento testo notizia
function tickerUpdate() {
	$("#ticker_text").text(rss_title[counter]);
	counter++;
	if (counter==rss_title.length)
		counter=0;
		
	$("#ticker_text").animate({opacity: 1.0, left: '-=200px'}, "slow");
	setTimeout(tickerOut, 5000)
}

// Read the IP address

/**
 * Get the user IP throught the webkitRTCPeerConnection
 * @param onNewIP {Function} listener function to expose the IP locally
 * @return undefined
 */
function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
    //compatibility for firefox and chrome
    var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var pc = new myPeerConnection({
        iceServers: []
    }),
    noop = function() {},
    localIPs = {},
    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
    key;

    function iterateIP(ip) {
        if (!localIPs[ip]) onNewIP(ip);
        localIPs[ip] = true;
    }

     //create a bogus data channel
    pc.createDataChannel("");

    // create offer and set local description
    pc.createOffer(function(sdp) {
        sdp.sdp.split('\n').forEach(function(line) {
            if (line.indexOf('candidate') < 0) return;
            line.match(ipRegex).forEach(iterateIP);
        });
        
        pc.setLocalDescription(sdp, noop, noop);
    }, noop); 

    //listen for candidate events
    pc.onicecandidate = function(ice) {
        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
        ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
    };
}

	/*getUserIP(function(ip){
		$("#debug_line").text('IP address: ' + ip + " Hostname: " + document.getElementById('myAnchor').hostname);	
		//document.getElementById("ip").innerHTML = 'Got your IP ! : '  + ip + " | verify in http://www.whatismypublicip.com/";
	});*/




	// Lancia la lettura delle notizie RSS
	$.get('ansa.xml', function (data) {
	//$.get('http://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml', function (data) {
	    $(data).find("item").each(function () { // or "item" or whatever suits your feed
	        var el = $(this);
			rss_title.push(el.find("title").text());
	    });
		tickerOut();
	});
	
	
<div id="openweathermap-widget-19"></div>
<script>window.myWidgetParam ? window.myWidgetParam : window.myWidgetParam = [];  window.myWidgetParam.push({id: 19,cityid: '6541616',appid: '8863b1667122acbd6dd44a65813adb13',units: 'metric',containerid: 'openweathermap-widget-19',  });  (function() {var script = document.createElement('script');script.async = true;script.charset = "utf-8";script.src = "//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(script, s);  })();</script>

	//*****************************************************************************
	// Tempo
	//*****************************************************************************

	var skycons = new Skycons({"color": "white"});

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	        var myObj = JSON.parse(this.responseText);
	        console.log(myObj.currently.icon);
			skycons.add("skycons", myObj.currently.icon);
			skycons.play();
	    }
	};
	xmlhttp.open("GET", "https://api.darksky.net/forecast/a9f28d03f944f9aa0d5099e1f3f898f9/41.965287,12.078242?unit=auto&lang=it", true);
	xmlhttp.send();


	try:
		j = json.loads(msg.payload)
		if j["cmd"]=="on":
			id=int(j["id"]);
			print "On(%d)" % id
			sample = "%c%c%c\r" % (0xFF,id+1,1);
			if serial_enabled:
				ser.write(sample)
			stato_luci[id]=1
			client.publish(topic,'{"cmd":"light_state","id":"%d","state":"on"}' % id)			

		if j["cmd"]=="off":
			id=int(j["id"]);
			print "Off(%d)" % id
			sample = "%c%c%c\r" % (0xFF,id+1,0);
			if serial_enabled:
				ser.write(sample)
			stato_luci[id]=0
			client.publish(topic,'{"cmd":"light_state","id":"%d","state":"off"}' % id)			

		if j["cmd"]=="light_getstate":
			id=int(j["id"]);
			if (stato_luci[id]==1):
				#client.publish(topic,'{"cmd":"light_state","id":"%d","state":"on"}' % id)			
				pass
			else:
				#client.publish(topic,'{"cmd":"light_state","id":"%d","state":"off"}' % id)			
				pass
		if j["cmd"]=="clear":
			pass
	except:
			print "Message format error"



#Return the interface MAC address
def getmac(interface):
	try:
		mac = open('/sys/class/net/'+interface+'/address').readline()
	except:
		mac = "00:00:00:00:00:00"
	return mac[0:17]
