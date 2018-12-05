var client;

var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function onConnect() {
	$("#debug_line").val("Connected to MQTT broker ");	
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
	$("#debug_line").val("Connessione con MQTT persa : " + responseObject.errorMessage);	
  }
}

function onMessageDelivered() {
	$("#debug_line").val("Message delivered");	
}

function onMessageArrived(message) {
	console.log(message);
	$("#subscriber_destinationName").val(message.destinationName);
	$("#subscriber_payloadString").val(message.payloadString);
}

function sendMessage(topic,message_text) {
	var message = new Paho.MQTT.Message(message_text);
	message.destinationName = topic;
	client.send(message);
}		


$(document).ready(function() {
	//client = new Paho.MQTT.Client("iot.eclipse.org", Number(443), "/ws",randomString(20));
	//client = new Paho.MQTT.Client("www.tanzolab.it", Number(1884), "/ws",randomString(20));
	client = new Paho.MQTT.Client("toa.local", Number(9001), "/ws",randomString(20));
	topic="toa/"
	
	client.onConnectionLost = onConnectionLost;
	client.onMessageDelivered = onMessageDelivered;
	client.connect({onSuccess:onConnect});
	client.onMessageArrived = onMessageArrived;

	$("#publisher_send").click(function() {
		sendMessage($("#publisher_topic").val(),$("#publisher_message").val());
	});

	$("#all_on").click(function() {
		$("#publisher_topic").val(topic+"light")
		for (i=0;i<16;i++) {
			sendMessage($("#publisher_topic").val() + "/" + i + "/setval","255");
		}
	});

	$("#all_off").click(function() {
		$("#publisher_topic").val(topic+"light")
		for (i=0;i<16;i++) {
			sendMessage($("#publisher_topic").val() + "/" + i + "/setval","0");
		}
	});

	$("#clock_on").click(function() {
		$("#publisher_topic").val(topic+"cm3panel")
		sendMessage($("#publisher_topic").val(),'{"cmd":"clock_on"}');
	});

	$("#clock_off").click(function() {
		$("#publisher_topic").val(topic+"cm3panel")
		sendMessage($("#publisher_topic").val(),'{"cmd":"clock_off"}');
	});

	// Cambio pagina html
	$(".htmlpanel").click(function() {
		newpage=$(this).text();
		$("#publisher_topic").val(topic+"cm3panel")
		sendMessage($("#publisher_topic").val(),'{"cmd":"loadpage","value":"' + newpage + '"}');
	});

	$("#video_apple").click(function() {
		$("#publisher_topic").val(topic+"cm3panel")
		sendMessage($("#publisher_topic").val(),'{"cmd":"loadvideo","value":"apple"}');
	});

	$("#video_starman").click(function() {
		$("#publisher_topic").val(topic+"cm3panel")
		sendMessage($("#publisher_topic").val(),'{"cmd":"loadvideo","value":"starman"}');
	});

	$("#video_newyork").click(function() {
		$("#publisher_topic").val(topic+"cm3panel")
		sendMessage($("#publisher_topic").val(),'{"cmd":"loadvideo","value":"newyork"}');
	});

	$("#subscriber_subscribe").click(function() {
		client.subscribe($("#subscriber_topic").val());
	});

});
