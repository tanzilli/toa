// Note: Uso della funzione bind() 
// https://stackoverflow.com/questions/42233090/access-class-properties-outside-of-mqtt-callback-scope

class tanzoMessage {
	constructor(target) {
		this.target = target;
		
		$("#" + this.target).attr("style",`
		    position: fixed;
		    color: white;
		    width: 100%;
		    height: 24px;
		    padding: 5px;
		    padding-left: 10px;
		    padding-right: 10px;
		    left: 0px;
		    bottom: 0px;
		    background-color: rgba(0, 127, 127, 0.5);
		    font-family: arial;
		    font-size: 20px;
		`);
		
		$("#" + this.target).html(`
			<span id="` + this.target + "_span" + `" style="position: relative;"></span>
		`);

		//*****************************************************************************
		// Connessione al broker MQTT
		// https://www.eclipse.org/paho/clients/js/
		//*****************************************************************************
	
		this.mqtt_client = new Paho.MQTT.Client(mqtt_broker, Number(mqtt_port), "/ws",randomString(20));
		this.mqtt_client.onMessageArrived = this.onMessageArrived.bind(this);
		this.mqtt_client.connect({
			onSuccess:this.onConnect.bind(this)
		});
	}
	
	message(text) {
		this.text=text;
		$("#" + this.target + "_span").animate({opacity: 0.0,bottom: '+=10px'}, "fast");
		setTimeout(this.tickerIn, 500,this.target,this.text)
		
		//$("#" + this.target + "_span").html(text);
	}

	tickerIn(target,text) {
		$("#" + target + "_span").html(text);
		$("#" + target + "_span").animate({opacity: 1.0, bottom: '-=10px'}, "slow");
	}

	onConnect() {
		this.mqtt_client.subscribe(mqtt_topic);
	}	

	onMessageArrived(mqtt_message) {
		this.message(mqtt_message.destinationName + " " + mqtt_message.payloadString);	
	}
}	

