//var mqtt_broker="www.tanzolab.it";
//var mqtt_port=1884;

var mqtt_broker="cm3home.local";
var mqtt_port=9001;
var mqtt_mainpage_client;
var message_line;


// Estrae parametri dalla url che ha chiamato la pagina
// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
// Uso $.QueryString["param"]
(function($) {
    $.QueryString = (function(paramsArray) {
        let params = {};

        for (let i = 0; i < paramsArray.length; ++i)
        {
            let param = paramsArray[i]
                .split('=', 2);

            if (param.length !== 2)
                continue;

            params[param[0]] = decodeURIComponent(param[1].replace(/\+/g, " "));
        }

        return params;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

function loadVideo(videofile) {
	$("#videoclip").get(0).pause();
    $("#mp4video").attr('src', 'video/' + videofile);
    $("#videoclip").get(0).load();
    $("#videoclip").get(0).play();	
}

// Genera una stringa random di caratteri
// Viane usata per le funzioni MQTT
var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function onConnect() {
	mqtt_mainpage_client.subscribe("toa/cm3panel");
}	

function onMessageArrived(message) {
	console.log(message.destinationName + " " + message.payloadString);

	json_data = JSON.parse(message.payloadString);

	// Refresh della pagina
	if (json_data.cmd=="loadpage") {
		document.location.href = "/www/panel/" + json_data.value + ".html";
	}	

	// Message
	if (json_data.cmd=="message") {
		message_line.message(json_data.value);
	}	

	// Cambio video in background
	if (json_data.cmd=="loadvideo") {
		loadVideo(json_data.value);
	}    

	// Gestione orologio
	if (json_data.cmd=="clock_off") {
		$("#clockdatewidget").animate({opacity: 0.0,top: '480px'}, "slow");
	}    
	
	if (json_data.cmd=="clock_on") {
		$("#clockdatewidget").animate({opacity: 1.0,top: '65px'}, "slow");
	}
}	

$(document).ready(function() {
	//*****************************************************************************
	// Interpretazione messaggi MQTT in arrivo
	//*****************************************************************************
	
	mqtt_mainpage_client = new Paho.MQTT.Client(mqtt_broker, Number(mqtt_port), "/ws",randomString(20));
	mqtt_mainpage_client.onMessageArrived=onMessageArrived;
	mqtt_mainpage_client.connect({
		onSuccess:onConnect
	});

	//*****************************************************************************
	// Carica il video di background se specificato sulla url
	// video=videofile
	//*****************************************************************************
	
	if ($.QueryString["video"]!==undefined) {
		loadVideo($.QueryString["video"]);
	}
	
});
