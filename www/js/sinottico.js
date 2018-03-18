
var broker="www.tanzolab.it";
var base_topic = "primopiano";
var port=1884;
var client;
var debug;
var scene;

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

// called when the client connects
function onConnect() {
	client.subscribe(base_topic + "/" + "#");
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
  }
}

// Interpretazione messaggi MQTT in arrivo
function onMessageArrived(message) {
	debug.message(message.destinationName + " " + message.payloadString);	
	
	if (message.destinationName.search("cmd")>-1) {
		json_cmd = JSON.parse(message.payloadString);

		if (json_cmd.cmd=="led_state") {
			if (json_cmd.state=="on") {
				$('input[name="LED'  + json_cmd.id + '"]').bootstrapSwitch('state', true, true);
			} else {
				$('input[name="LED'  + json_cmd.id + '"]').bootstrapSwitch('state', false, false);
			}
		}	

		// Refresh della pagina
		if (json_cmd.cmd=="reload") {
			location.reload(true);
		}	
		
	}
}	

$(document).ready(function() {

	//*****************************************************************************
	// WebGL
	//*****************************************************************************
	
	var container;
	var camera, scene, renderer;
	var mouseX = 0, mouseY = 0;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
	init();
	animate();
	function init() {
		// Posiziona la telecamera
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.z = 100;

		// Crea la scena
		scene = new THREE.Scene();
		
		// Crea le luci
		var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
		scene.add( ambientLight );
		var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
		camera.add( pointLight );
		scene.add( camera );

		// Crea le texture
		//var textureLoader = new THREE.TextureLoader( );
		//var texture = textureLoader.load( 'textures/UV_Grid_Sm.jpg' );
		
		var loader = new THREE.OBJLoader();
		loader.load( 'models/tanzolab.obj', function (object) {
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					//child.material.map = texture;
					var  geometry = child.geometry;
					material = child.material;
					mesh = new THREE.Mesh(geometry, material);
					scene.add(mesh);
			
					var useWireFrame = true;
					if (useWireFrame) {
						mesh.traverse(function (child) {
							if (child instanceof THREE.Mesh) {
								child.material.wireframe = true;
								child.material.color = new THREE.Color(0xFFFFFF);
							}
						});
					}	
				}
			});	
			object.position.y = - 0;
			scene.add( object );
		});
		
		renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );

		$("#3d").append(renderer.domElement);
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		window.addEventListener( 'resize', onWindowResize, false );
	}
	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	function onDocumentMouseMove( event ) {
		mouseX = ( event.clientX - windowHalfX ) / 2;
		mouseY = ( event.clientY - windowHalfY ) / 2;
	}
	//
	function animate() {
		requestAnimationFrame( animate );
		render();
	}
	function render() {
		camera.position.x += ( mouseX - camera.position.x ) * .05;
		camera.position.y += ( - mouseY - camera.position.y ) * .05;
		camera.lookAt( scene.position );
		renderer.render( scene, camera );
	}

	//*****************************************************************************
	// Connessione al broker MQTT
	// https://www.eclipse.org/paho/clients/js/
	//*****************************************************************************

	client = new Paho.MQTT.Client(broker, Number(port), "/ws",randomString(20));
	
	client.onConnectionLost = onConnectionLost;
	client.onMessageArrived = onMessageArrived;
	client.connect({onSuccess:onConnect});
	client.onMessageArrived = onMessageArrived;

	//*****************************************************************************
	// Creazione linea di debug su CM3-Panel
	//*****************************************************************************

	debug = new TanzoTicker("debug_line");
	debug.message("First Floor Electric Project &copy; 2018 Acme Systems srl - ver. 0.01");

	//*****************************************************************************
	// Creazione orologio su CM3-Panel
	//*****************************************************************************

	$('#clock').thooClock({
			size: 300,
			showNumerals:true,
			brandText:'ACME SYSTEMS',
			brandText2:'Italy',
			onEverySecond:function(){
			//callback that should be fired every second
		}
	});

});