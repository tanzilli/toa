// *********************
// tanzoGauge
// http://justgage.com
// *********************

class tanzoGauge {
	constructor(domElementId,caption) {
			this.domElementId=domElementId;
			
			var g = new JustGage({
				id: domElementId,
				//value: getRandomInt(-30,+30),
				value: 0,
				decimals: 2,
				min: 0,
				max: 30,
				title: caption,
				counter: true,
				pointer: true,
				width: 200,
				showInnerShadow: true,
		        shadowOpacity: 1,
        		shadowSize: 5,
        		shadowVerticalOffset: 10,
        		gaugeWidthScale: 1,
        		gaugeColor: "grey",
				levelColors: [
						  "#FF0000",
						  "#00FF00"
						],
				valueFontColor: "#FFFFFF",			  
			});
			
			this.g=g;
	}
	
	setValue(value) {
		this.g.refresh(value);
	}
	
	on() {
		$("#" + this.domElementId).animate({opacity: 1.0,top: '50px'}, "slow");
	}

	off() {
		$("#" + this.domElementId).animate({opacity: 0.0,top: '480px'}, "slow");
	}
}	

// **************
// tanzoSwitch
// **************

class tanzoSwitch {
	constructor(caption,address,domElementId) {
		this.domElementId = domElementId;
		this.address = address;
		this.state = 0;

		$("#" + this.domElementId).click(this.click_handler.bind(this));
		
		$("#" + this.domElementId).html(`
			<div id=` + address + ` style="
				border: 2px solid black; 
				background-color:rgba(10, 10, 100, 0.5); 
				//border-color: red; 
				box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
				width: 260px; 
				height: 55px;
				line-height: 55px;
				padding-top: 4px;
				padding-bottom: 4px;
				margin-bottom: 5px;
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
		$("#" +  this.address).css("background-color","rgba(80,80,80, 0.5)");
		$("#" +  this.address).css("color","white");
		$("#" +  this.address).css("border-color","darkgrey");
		this.state=0;
	}

	state_on() {
		$("#" +  this.address).css("background-color","rgba(255, 255, 0, 0.7)");
		$("#" +  this.address).css("color","black");
		$("#" +  this.address).css("border-color","red");
		this.state=1;
	}
}

// **************
//  tanzoClock
// **************

var days = ["Domenica","Lunedi","Martedi","Mercoledi","Giovedi","Venerdi","Sabato"];
var months = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

class tanzoClock {
	constructor(domElementId,topline,bottomline) {
		this.domElementId=domElementId;
		
		$('#' + domElementId).html("<div id='tclock'></div><div id='tdate' style='text-align: center; color: white; padding: 20px; font-family: arial; font-size: 20px;'></div>");
	
		$('#tclock').thooClock({
				size: 300,
				showNumerals:true,
				brandText: topline,
				brandText2: bottomline
		});

		this.updateDate();
		setInterval(this.updateDate,1000);
	}

	updateDate() {
		var d = new Date();
		$("#tdate").html(days[d.getDay()] + " " +  d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear())
		//$("#tdate").html(d.getSeconds());
	}
	
	on() {
		$("#" + this.domElementId).animate({opacity: 1.0,top: '65px'}, "slow");
	}

	off() {
		$("#" + this.domElementId).animate({opacity: 0.0,top: '480px'}, "slow");
	}

}

// **************
//  tanzoMessage
// **************

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

// thooClock, a jQuery Clock with alarm function
// by Thomas Haaf aka thooyork, http://www.smart-sign.com
// Twitter: @thooyork
// Version 0.9.20
// Copyright (c) 2013 thooyork

// MIT License, http://opensource.org/licenses/MIT


(function( $ ) {

    $.fn.thooClock = function(options) {
        
        this.each(function() {

        var cnv,
                ctx,
                el,
                defaults,
                settings,
                radius,
                dialColor,
                dialBackgroundColor,
                secondHandColor,
                minuteHandColor,
                hourHandColor,
                alarmHandColor,
                alarmHandTipColor,
                hourCorrection,
                x,
                y;

       defaults = {
                size:250,
                dialColor:'white',
                dialBackgroundColor:'transparent',
                secondHandColor:'#F3A829',
                minuteHandColor:'yellow',
                hourHandColor:'yellow',
                alarmHandColor:'#FFFFFF',
                alarmHandTipColor:'#026729',
                hourCorrection:'+0',
                alarmCount:1,
                showNumerals:true
            };

            settings = $.extend({}, defaults, options);

            el = this;

            el.size = settings.size;
            el.dialColor = settings.dialColor;
            el.dialBackgroundColor = settings.dialBackgroundColor;
            el.secondHandColor = settings.secondHandColor;
            el.minuteHandColor = settings.minuteHandColor;
            el.hourHandColor = settings.hourHandColor;
            el.alarmHandColor = settings.alarmHandColor;
            el.alarmHandTipColor = settings.alarmHandTipColor;
            el.hourCorrection = settings.hourCorrection;
            el.showNumerals = settings.showNumerals;

            el.brandText = settings.brandText;
            el.brandText2 = settings.brandText2;
            
            el.alarmCount = settings.alarmCount;
            el.alarmTime = settings.alarmTime;
            el.onAlarm = settings.onAlarm;
            el.offAlarm = settings.offAlarm;

            el.onEverySecond = settings.onEverySecond;

            x=0; //loopCounter for Alarm
            
            cnv = document.createElement('canvas');
            ctx = cnv.getContext('2d');

            cnv.width = this.size;
            cnv.height = this.size;
            //append canvas to element
            $(cnv).appendTo(el);

            radius = parseInt(el.size/2, 10);
            //translate 0,0 to center of circle:
            ctx.translate(radius, radius); 

            //set alarmtime from outside:
            
            $.fn.thooClock.setAlarm = function(newtime){
                    var thedate;
                    if(newtime instanceof Date){
                    	//keep date object
                    	thedate=newtime;
                    }
                    else{
						//convert from string formatted like hh[:mm[:ss]]]
						var arr = newtime.split(':');
						thedate=new Date();
						for(var i= 0; i <3 ; i++){
							//force to int
							arr[i]=Math.floor(arr[i]);
							//check if NaN or invalid min/sec
							if( arr[i] !==arr[i] || arr[i] > 59) arr[i]=0 ;
							//no more than 24h
							if( i==0 && arr[i] > 23) arr[i]=0 ;
						}
						thedate.setHours(arr[0],arr[1],arr[2]);
                    }
                    //alert(el.id);
                    el.alarmTime = thedate;   
            };

            $.fn.thooClock.clearAlarm = function(){
                    el.alarmTime = undefined;
                    startClock(0,0);
                    $(el).trigger('offAlarm');
            };
        

            function toRadians(deg){
                return ( Math.PI / 180 ) * deg;
            }     

            function drawDial(color, bgcolor){
                var dialRadius,
                    dialBackRadius,
                    i,
                    ang,
                    sang,
                    cang,
                    sx,
                    sy,
                    ex,
                    ey,
                    nx,
                    ny,
                    text,
                    textSize,
                    textWidth,
                    brandtextWidth,
                    brandtextWidth2;

                dialRadius = parseInt(radius-(el.size/50), 10);
                dialBackRadius = radius-(el.size/400);

                ctx.beginPath();
                ctx.arc(0,0,dialBackRadius,0,360,false);
                ctx.fillStyle = bgcolor;
                ctx.fill();

                 
                for (i=1; i<=60; i+=1) {
                    ang=Math.PI/30*i;
                    sang=Math.sin(ang);
                    cang=Math.cos(ang);
                    //hour marker/numeral
                    if (i % 5 === 0) {
                        ctx.lineWidth = parseInt(el.size/50,10);
                        sx = sang * (dialRadius - dialRadius/9);
                        sy = cang * -(dialRadius - dialRadius/9);
                        ex = sang * dialRadius;
                        ey = cang * - dialRadius;
                        nx = sang * (dialRadius - dialRadius/4.2);
                        ny = cang * -(dialRadius - dialRadius/4.2);
                        text = i/5;
                        ctx.textBaseline = 'middle';
                        textSize = parseInt(el.size/13,10);
                        ctx.font = '100 ' + textSize + 'px helvetica';
                        textWidth = ctx.measureText (text).width;
                        ctx.beginPath();
                        ctx.fillStyle = color;

                        if(el.showNumerals){
                            ctx.fillText(text,nx-(textWidth/2),ny);
                        }
                    //minute marker
                    } else {
                       ctx.lineWidth = parseInt(el.size/100,10);
                        sx = sang * (dialRadius - dialRadius/20);
                        sy = cang * -(dialRadius - dialRadius/20);
                        ex = sang * dialRadius;
                        ey = cang * - dialRadius;
                    }

                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.lineCap = "round";
                    ctx.moveTo(sx,sy);
                    ctx.lineTo(ex,ey);
                    ctx.stroke();
                } 

                if(el.brandText !== undefined){
                    ctx.font = '100 ' + parseInt(el.size/28,10) + 'px helvetica';
                    brandtextWidth = ctx.measureText (el.brandText).width;
                    ctx.fillText(el.brandText,-(brandtextWidth/2),(el.size/6)); 
                }

                if(el.brandText2 !== undefined){
                    ctx.textBaseline = 'middle';
                    ctx.font = '100 ' + parseInt(el.size/44,10) + 'px helvetica';
                    brandtextWidth2 = ctx.measureText (el.brandText2).width;
                    ctx.fillText(el.brandText2,-(brandtextWidth2/2),(el.size/5)); 
                }

            }


            function twelvebased(hour){
                if(hour >= 12){
                    hour = hour - 12;
                }
                return hour;
            }



            function drawHand(length){
               ctx.beginPath();
               ctx.moveTo(0,0);
               ctx.lineTo(0, length * -1);
               ctx.stroke();
            }
            

            function drawSecondHand(seconds, color){
                var shlength = (radius)-(el.size/40);
                
                ctx.save();
                ctx.lineWidth = parseInt(el.size/150,10);
                ctx.lineCap = "round";
                ctx.strokeStyle = color;
                ctx.rotate( toRadians(seconds * 6));

                ctx.shadowColor = 'rgba(0,0,0,.5)';
                ctx.shadowBlur = parseInt(el.size/80,10);
                ctx.shadowOffsetX = parseInt(el.size/200,10);
                ctx.shadowOffsetY = parseInt(el.size/200,10);

                drawHand(shlength);

                //tail of secondhand
                ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.lineTo(0, shlength/15);
                ctx.lineWidth = parseInt(el.size/30,10);
                ctx.stroke();

                //round center
                ctx.beginPath();
                ctx.arc(0, 0, parseInt(el.size/30,10), 0, 360, false);
                ctx.fillStyle = color;

                ctx.fill();
                ctx.restore();
            }

            function drawMinuteHand(minutes, color){
                var mhlength = el.size/2.2;
                ctx.save();
                ctx.lineWidth = parseInt(el.size/50,10);
                ctx.lineCap = "round";
                ctx.strokeStyle = color;
                ctx.rotate( toRadians(minutes * 6));

                ctx.shadowColor = 'rgba(0,0,0,.5)';
                ctx.shadowBlur = parseInt(el.size/50,10);
                ctx.shadowOffsetX = parseInt(el.size/250,10);
                ctx.shadowOffsetY = parseInt(el.size/250,10);

                drawHand(mhlength);
                ctx.restore();
            }

            function drawHourHand(hours, color){
                var hhlength = el.size/3;
                ctx.save();
                ctx.lineWidth = parseInt(el.size/25, 10);
                ctx.lineCap = "round";
                ctx.strokeStyle = color;
                ctx.rotate( toRadians(hours * 30));

                ctx.shadowColor = 'rgba(0,0,0,.5)';
                ctx.shadowBlur = parseInt(el.size/50, 10);
                ctx.shadowOffsetX = parseInt(el.size/300, 10);
                ctx.shadowOffsetY = parseInt(el.size/300, 10);

                drawHand(hhlength);
                ctx.restore();
            }

            function timeToDecimal(time){
                var h,
                    m;
                if(time !== undefined){
                    h = twelvebased(time.getHours());
                    m = time.getMinutes();
                }
                return parseInt(h,10) + (m/60);
            }

            function drawAlarmHand(alarm, color, tipcolor){

                var ahlength = el.size/2.4;
                
                ctx.save();
                ctx.lineWidth = parseInt(el.size/30, 10);
                ctx.lineCap = "butt";
                ctx.strokeStyle = color;

                //decimal equivalent to hh:mm
                alarm = timeToDecimal(alarm);
                ctx.rotate( toRadians(alarm * 30));

                ctx.shadowColor = 'rgba(0,0,0,.5)';
                ctx.shadowBlur = parseInt(el.size/55, 10);
                ctx.shadowOffsetX = parseInt(el.size/300, 10);
                ctx.shadowOffsetY = parseInt(el.size/300, 10);

                //drawHand(ahlength);

                ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.lineTo(0, (ahlength-(el.size/10)) * -1);
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = tipcolor;
                ctx.moveTo(0, (ahlength-(el.size/10)) * -1);
                ctx.lineTo(0, (ahlength) * -1);
                ctx.stroke();

                //round center
                ctx.beginPath();
                ctx.arc(0, 0, parseInt(el.size/24, 10), 0, 360, false);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.restore();
            }

            function numberCorrection(num){
                if(num !== '+0' && num !== ''){
                    if(num.charAt(0) === '+'){
                        //addNum
                        return + num.charAt(1);
                    }
                    else{
                        //subNum
                        return - num.charAt(1);
                    }
                }
                else{
                    return 0;
                }
            }

            //listener
            if(el.onAlarm !== undefined){
            	$(el).on('onAlarm', function(e){
                	el.onAlarm();
                	e.preventDefault();
                	e.stopPropagation();
            	});
            }

            if(el.onEverySecond !== undefined){
                $(el).on('onEverySecond', function(e){
                    el.onEverySecond();
                    e.preventDefault();
                });
            }

            if(el.offAlarm !== undefined){
	            $(el).on('offAlarm', function(e){
    	            el.offAlarm();
        	        e.stopPropagation();
            	    e.preventDefault();
           		});
			}

            y=0;

            function startClock(x,y){
                var theDate,
                    s,
                    m,
                    hours,
                    mins,
                    h,
                    exth,
                    extm,
                    allExtM,
                    allAlarmM,
                    atime;

                theDate = new Date();
                s = theDate.getSeconds();
                mins = theDate.getMinutes();
                m = mins + (s/60);
                hours = theDate.getHours();
                h = twelvebased(hours + numberCorrection(el.hourCorrection)) + (m/60);

                ctx.clearRect(-radius,-radius,el.size,el.size);

                drawDial(el.dialColor, el.dialBackgroundColor);

                if(el.alarmTime !== undefined){
                    drawAlarmHand(el.alarmTime, el.alarmHandColor, el.alarmHandTipColor);
                }
                drawHourHand(h, el.hourHandColor);
                drawMinuteHand(m, el.minuteHandColor);
                drawSecondHand(s, el.secondHandColor);

                //trigger every second custom event
                y+=1;
                if(y===1){
                    $(el).trigger('onEverySecond');
                    y=0;
                }
               
                if(el.alarmTime !== undefined){
                    allExtM = (el.alarmTime.getHours()*60*60) + (el.alarmTime.getMinutes() *60) + el.alarmTime.getSeconds();
                }

                allAlarmM = (hours*60*60) + (mins*60) + s;

                //set alarm loop counter
                //if(h >= timeToDecimal(twelvebased(el.alarmTime)){

                //alarmMinutes greater than passed Minutes;
                if(allAlarmM >= allExtM){
                    x+=1; 
                }
                //trigger alarm for as many times as i < alarmCount
                if(x <= el.alarmCount && x !== 0){
                   $(el).trigger('onAlarm');
                }
                var synced_delay= 1000 - ((new Date().getTime()) % 1000);
                setTimeout(function(){startClock(x,y);},synced_delay);
            }

            startClock(x,y);

   });//return each this;
  };     

}(jQuery));

