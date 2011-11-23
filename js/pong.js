var field = { width: 1280, height: 720};
var game = null;
var gamespeed = 10;
var cameraStyle = {
	persp: false,
	ortho: true
};
var onField = function(point){
	if(point.x > field.width || point.x < 0){
		return false;
	}
	if(point.y > field.height || point.y < 0){
		return false;
	}
	return true;
};

//jiglib stuff
var system;
var csystem;
var paddles = [];
var walls = [];
var jball = null;
var then = new Date().getTime();
var effect;

//wall depth
//var wallDepth = 100; // just for physics model

//audio

//buzz.defaults.formats = [ 'ogg', 'mp3' ];

var boing, yay, woohoo;
var winnerScore = 5;
var finished = false;

(function() {

	var drawingContext;

	$(document).ready(function() {

		var renderTarget = document.getElementById('gamefield');

		game = new Game(renderTarget);
		prepAudio();
		showGUI(game);
		renderGame();
	});

	function renderGame() {
		game.render(renderGame);
	}
	function prepAudio(){
		if ( !buzz.isSupported() ) {
			alert("HTML5 Audio is not supported");
		}else{
			//buzz.defaults.formats = [ 'mp3' ];
			boing = new buzz.sound('sounds/clack.mp3');
			boing.load();
			yay = new buzz.sound('http://www.pacdv.com/sounds/voices/yay.wav');
			yay.load();
			woohoo = new buzz.sound('http://www.pacdv.com/sounds/voices/woohoo.wav');
			woohoo.load();
		}
		//boing.autoload = true;
	}

	// control properties for dat.gui
	var controlProps = {
	    GameSpeed: 10,
	    GameMode: 3,
	    CameraMode: 1,
		cameraX: 0,
		cameraY: 0,
		cameraZ: 0
	};

	function showGUI(game) {
		var gui = new DAT.GUI();
		DAT.GUI.autoPlace = false;
		
		$gui	= $('#guidat');
		$gui.css({
			right: 'auto',
			left: '40%'
		});
		//$("#uiContainer").append(gui.domElement);

		gui.add(controlProps, 'GameSpeed').min(10).max(20).listen().onChange(function(newValue){
			game.updateGameSpeed(parseInt(newValue,0));
		});

		gui.add(controlProps, 'GameMode').options( {'Demo': 1, '1 Player': 2, '2 Player': 3} ).onChange(function(newValue){
			var val = parseInt(newValue,0);
			game.mode = {
				player1: val === 2,
				player2: val === 3,
				demo: val === 1
			};
			game.updateAI();
		});

		//gui.add(controlsProps, 'ShaderSpeed').options(1,2,3,4,5);
		//var f1 = gui.addFolder('Flow Field');
    // gui.add(controlProps, 'CameraMode').options( {'Orthographic': 1, 'Perspective': 2} ).onChange(function(newValue){
    //  var val = parseInt(newValue,0);
    //  cameraStyle = {
    //    persp: val === 2,
    //    ortho: val === 1
    //  };
    // });
		gui.add(controlProps, 'cameraX').min(-200).max(200).step(10).listen().onChange(function(newValue){
			game.updateCamera(controlProps.cameraX, 'x');
		});
		gui.add(controlProps, 'cameraY').min(-200).max(200).step(10).listen().onChange(function(newValue){
			game.updateCamera(controlProps.cameraY, 'y');
		});
		gui.add(controlProps, 'cameraZ').min(-200).max(200).step(10).listen().onChange(function(newValue){
			game.updateCamera(controlProps.cameraZ, 'z');
		});
		
    	gui.close();
	}

})();