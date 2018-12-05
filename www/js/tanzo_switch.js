// Gestione degli switch
class tanzoSwitch {
	constructor(caption,address,domElementId) {
		this.domElementId = domElementId;
		this.address = address;
		this.state = 0;

		$("#" + this.domElementId).click(this.click_handler.bind(this));
		
		$("#" + this.domElementId).html(`
			<div style="
				border: 2px solid black; 
				background-color: grey; 
				background-color:rgba(0, 0, 0, 0.5); 
				border-color: light-grey; 
				width: 240px; 
				padding-top: 2px;
				padding-bottom: 0px;
				margin-bottom: 20px;
				font-family: arial;
			">
				<table>
					<tr>
						<td style="padding-left: 5px;">
							<img width="60px" src="images/off.png" id=` + address + `>
						</td>
						<td style="font-size: 26px; color: white; padding-left: 10px;">
					    	` + caption + `
					    </td>
				    </tr>
			    </table>
			</div>
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

	onConnect() {
		this.mqtt_client.subscribe("toa/lights/"+ this.address + "/current_value");
		//var message;
		//message = new Paho.MQTT.Message("x");
		//message.destinationName = "toa/light/"+ this.address + "/getval";
		//this.mqtt_client.send(message);
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
		$("#" +  this.address).attr("src","images/off.png");
		this.state=0;
	}

	state_on() {
		$("#" +  this.address).attr("src","images/on.png");
		this.state=1;
	}
}

// Note: Uso della funzione bind() 
// https://stackoverflow.com/questions/42233090/access-class-properties-outside-of-mqtt-callback-scope