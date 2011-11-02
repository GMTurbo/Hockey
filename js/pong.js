var field = { width: 1000, height: 1000};
var game = null;
var gamespeed = 10;
var cameraStyle = {
	persp: false,
	ortho: true
};

//jiglib stuff
var system;
var csystem;
var paddles = [];
var walls = [];
var jball;
var then = new Date().getTime();
var effect;

var winnerScore = 5;
var finished = false;

(function() {

	var drawingContext;
	
	$(document).ready(function() {
	
		var renderTarget = document.getElementById('gamefield');
		
		game = new Game(renderTarget);
		showGUI(game);
		renderGame();
	});
	
	function renderGame() {
		game.render(renderGame);
	}
	function showGUI(game) {
		var gui = new DAT.GUI();
		DAT.GUI.autoPlace = true;

		$("#uiContainer").append(gui.domElement);

		gui.add(controlsProps, 'Color1').min(0).max(5.0).listen().onChange(function(newValue){
			game.textureUnis.color1.value = newValue;
		});
        
        gui.add(controlsProps, 'Color2').min(0).max(5.0).listen().onChange(function(newValue){
			game.textureUnis.color2.value = newValue;
		});
		
		gui.add(controlsProps, 'ShaderSpeed').min(0.005).max(1.0).listen().onChange(function(newValue){
			game.textureUnis.uSpeed.value = newValue;
		});
		
		gui.add(controlsProps, 'GameSpeed').min(10).max(20).listen().onChange(function(newValue){
			game.updateGameSpeed(parseInt(newValue,0));
		});
		
		gui.add(controlsProps, 'GameMode').options( {'Demo': 1, '1 Player': 2, '2 Player': 3} ).onChange(function(newValue){
			var val = parseInt(newValue,0);
			game.mode = {
				player1: val === 2,
				player2: val === 3,
				demo: val === 1
			};
			game.updateAI();
		});
		
		//gui.add(controlsProps, 'ShaderSpeed').options(1,2,3,4,5);
		
		gui.add(controlsProps, 'CameraMode').options( {'Orthographic': 1, 'Perspective': 2} ).onChange(function(newValue){
			var val = parseInt(newValue,0);
			cameraStyle = {
				persp: val === 2,
				ortho: val === 1
			};
		});

		/*var inputEl = document.createElement("input");
		inputEl.id = "myField1";

		gui.add("color",inputEl);

		var myPicker = new jscolor.color(document.getElementById('myField1'), {})
		myPicker.fromString('99FF33')  // now you can access API via 'myPicker' variable
	*/
		gui.close();
	}
	
})();