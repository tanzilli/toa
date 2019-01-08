// Gestione degli switch
class tanzoSwitch {
	constructor(caption,address,domElementId) {
		this.domElementId = domElementId;
		this.address = address;
		this.state = 0;

		$("#" + this.domElementId).click(this.click_handler.bind(this));
		
		$("#" + this.domElementId).html(`
			<div id=` + address + ` style="
				border: 2px solid black; 
				background-color: grey; 
				background-color:rgba(10, 10, 100, 0.5); 
				border-color: light-grey; 
				width: 260px; 
				height: 60px;
				line-height: 60px;
				padding-top: 4px;
				padding-bottom: 4px;
				margin-bottom: 20px;
				font-family: arial;
				font-size: 28px; 
				color: white; 
				padding-left: 20px;
			">
		    	` + caption + `
			</div>
		`);
		
		this.mqtt_client = new Paho.MQTT.Client(mqtt_broker, Number(mqtt_port), "/ws",randomString(20));
		this.mqtt_client.onMessageArrived = this.onMessageArrived.bind(this);

		this.mqtt_client.connect({
			onSuccess:this.onConnect.bind(this),reconnect:true,keepAliveInterval: 3, timeout:3
		});
	}


	onConnect() {
		this.mqtt_client.subscribe("toa/lights/"+ this.address + "/current_value");
		console.log("Connect");
	}	

	onMessageArrived(mqtt_message) {
		if (mqtt_message.payloadString=="0") {
			this.state_off();
		} else {
			this.state_on();
		}
	}
	
	click_handler() {
		var message;
		
		if (this.state===0) {
			message = new Paho.MQTT.Message("255");
		} else {
			message = new Paho.MQTT.Message("0");
		}	
		message.destinationName = "toa/lights/"+ this.address + "/set_value";
		this.mqtt_client.send(message);
	}

	state_off() {
		$("#" +  this.address).css("background-color","#808080");
		$("#" +  this.address).css("color","white");
		this.state=0;
	}

	state_on() {
		$("#" +  this.address).css("background-color","rgba(255, 255, 0, 1)");
		$("#" +  this.address).css("color","black");
		this.state=1;
	}
}

// Note: Uso della funzione bind() 
// https://stackoverflow.com/questions/42233090/access-class-properties-outside-of-mqtt-callback-scope