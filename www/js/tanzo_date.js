// tanzoDate

var days = ["Domenica","Lunedi","Martedi","Mercoledi","Giovedi","Venerdi","Sabato"];
var months = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

class tanzoDate {
	constructor(domElementId) {
		this.updateDate(domElementId);
		setInterval(this.updateDate,1000,domElementId);
	}

	updateDate(domElementId) {
		var d = new Date();
		$("#" + domElementId).html(days[d.getDay()] + " " +  d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear())
		//$("#" + domElementId).html(d.getSeconds());
	}
}	