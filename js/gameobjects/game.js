/* The actual game. This part renders using WebGL */
function Game(container) {
    this.container = container;
    this.players = [];
    this.prevY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
	
	this.allowZoom = false;
	
	// demo
    this.mode = {
        player1: false,
        player2: false,
        demo: true
    };
    
    this.textureUnis = {
		time:  { type: "f", value: 1.0 },
		uSpeed:  { type: "f", value: 0.2 },
		scale: { type: "v2", value: new THREE.Vector2( 1, 1 ) },
		color1: { type: "f", value: 2.1},
		color2: { type: "f", value: 1.0}
	};

    // menu options        
    this.showMenu = true; // i'll use this guy to pause the game too
    //document.getElementById('ortho').checked = true;
    // Initate Three.js, the 3d engine
    this.scene = new THREE.Scene();

    this.prepareEvents();
    this.prepareGameObjects();
    this.prepareScene();

    this.updateScores();
	
    this.renderer = new THREE.WebGLRenderer({antialias:true});
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    // Add the renderer to the DOM
    container.appendChild(this.renderer.domElement);
}

Game.prototype.updateGameSpeed = function(speed) {
	gamespeed = speed;
	var playerIndex;
    for (playerIndex in this.players) {
        this.players[playerIndex].speed = speed;
    }
    if(typeof this.balls[0] !== "undefined"){
        var directionx = this.balls[0].speed.x > 0 ? 1 : -1;
        var directiony = this.balls[0].speed.y > 0 ? 1 : -1;
        this.balls[0].speed = { x: directionx * speed, y: directiony * speed };
    }
};

Game.prototype.updateAI = function(){
	this.players[0].human = (this.mode.player1 || this.mode.player2);
	this.players[1].human = this.mode.player2;
};

Game.prototype.newGame = function() {
	finished = false;
    this.playerFailed(playerIndex);
    this.removeBalls();
    var positions = {
        first: -field.width / 2,
        second: field.width / 2
    };
    this.resetScores(positions);
    setTimeout(this.resetBalls.bind(this), 2000);

};

Game.prototype.resetScores = function(positions) {
	finished = false;
    if (typeof positions === "undefined") {
        for (playerIndex in this.players) {
            this.players[playerIndex].reset();
        }
    } else {
        this.players[0].reset(positions.first, 0);
        this.players[1].reset(positions.second, 0);
    }
    this.updateScores();
    this.showMenu = false;
    this.toggleMenu(this.showMenu);
};

Game.prototype.prepareEvents = function() {

    document.addEventListener('keydown', (function(data) {
        if(!data.shiftKey){
        	if (data.keyCode !== 27 ){
           		if (!this.mode.demo){
            	    this.players[0].handleKeyCode(data.keyCode);
            	}
        	}else{
            	this.showMenu = !this.showMenu;
            	this.toggleMenu(this.showMenu);
        	}
        }
    }).bind(this));

    document.addEventListener('mousemove', (function(data) {
        if (!data.shiftKey) {
            if (this.prevY == 0) {
                this.prevY = data.clientY;
            }
            if (this.mode.player2) {
                this.players[1].handleKeyCode(this.prevY > data.clientY ? 38 : 40);
            }
            this.prevY = data.clientY;
        } else {
            this.mouseX = (event.clientX - window.innerWidth / 2);
            this.mouseY = (event.clientY - window.innerHeight / 2);
        }
    }).bind(this));
};

Game.prototype.toggleMenu = function(toggle) {
    if (!toggle) {
        $('#menuid').addClass("hide");
    } else {
    	//zoomCamera.position.z = 700;
        $('#menuid').removeClass("hide");
    }
};

// This method prepares the players
Game.prototype.prepareGameObjects = function() {
    this.players = [new Player('Player', -field.width / 2, 0), new Player('Computer', field.width / 2, 0)];
};

var quadTarget, orbiter;

// This method prepares all the objects that needs to be drawn to the scene
Game.prototype.prepareScene = function() {

    this.camera = new THREE.Camera(45, this.container.clientWidth / this.container.clientHeight, 1, 2000);
    this.originalCameraProject = this.camera.projectionMatrix;
    this.camera.projectionMatrix = THREE.Matrix4.makeOrtho(-this.container.clientWidth, this.container.clientWidth, this.container.clientHeight, -this.container.clientHeight, 1, 2000);
    this.camera.position.y = 0;
    this.camera.position.z = 1000;
    //0x202020
    this.scene.addLight(new THREE.AmbientLight(0x202020));
	
    this.scene.addLight( pointLight );
	var sphere          = new THREE.SphereGeometry( 139, 8, 8 );
    orbiter               = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color:0xf0f0f0 } ) );
    orbiter.position      = pointLight.position;
	orbiter.scale.x       = orbiter.scale.y = orbiter.scale.z = 0.05;
	//this.scene.addObject(orbiter);
	//this.createGalaxy();
	
    // Set a box around the play field 0x00cc00
    
	//shaderMaterial = new THREE.MeshShaderMaterial({
	//	uniforms:		paddleUnis.top,
	//	vertexShader:   $('#vs').text(),
	//	fragmentShader: $('#fs').text()
	//});
	
	//jiglib setup
	system = jigLib.PhysicsSystem.getInstance();
	csystem = new jigLib.CollisionSystem();
	system.setGravity([0,-1,0,0]);//-120
	system.setSolverType('ACCUMULATED');//FAST, NORMAL, ACCUMULATED

	var ground = new jigLib.JPlane(null,[0, 0, 1, 0]);
	ground.set_friction(-10);
	ground.set_movable(false);
	ground.moveTo([0,0,0,0]);
	//system.addBody(ground);
	
	
	//var top = new jigLib.JPlane(null, [0,1,0,0]);
	var top = new jigLib.JBox(null, field.width - 50, 5, 100);
	top.set_friction(10);
	top.moveTo([0,field.height / 2 + 60,0,0]);
	top.set_movable(false);
	top.set_restitution(50);
	system.addBody(top);
	
	//var bottom = new jigLib.JPlane(null, [0,1,0,0]);
	var bottom = new jigLib.JBox(null, field.width - 50, 5, 100);
	bottom.set_friction(10);
	bottom.moveTo([0,-field.height / 2 - 60,0,0]);
	bottom.set_movable(false);
	bottom.set_restitution(50);
	system.addBody(bottom);

	//panel = new jigLib.JBox(null, 1.2*field.width, 10, 1.2*field.width);
	//panel.set_mass(50);
	//panel.moveTo([0, 0, 0, 0]);
	//panel.set_movable(false);
	//system.addBody(panel);

	// for(var i = 0; i < offset.length; i++) {

		// obj[i] = new jigLib.JBox(null, 160, 10, 160);
		// obj[i].set_mass(200);//100
		// obj[i].set_friction(10);
		// obj[i].moveTo([offset[i], (i % 2 == 1 ? -110 : -150), 0, 0]);
		// system.addBody(obj[i]);

		// if(worldPoint) {

			// con[i] = new jigLib.JConstraintWorldPoint(obj[i], [0,80,0,0], [offset[i], (i % 2 == 1 ? -130 : -170), 0, 0]);
			// system.addConstraint(con[i]);
		// }
		// else {

			// pin[i] = new jigLib.JBox(null, 1, 1, 1);
			// pin[i].moveTo([offset[i], 0, 0, 0]);
			// pin[i].set_movable(false);
			// system.addBody(pin[i]);

	// //		con[i] = new jigLib.JConstraintMaxDistance(obj[i], jigLib.Vector3DUtil.Y_AXIS.slice(), pin[i], jigLib.Vector3DUtil.Y_AXIS.slice(), (i % 2 == 1 ? 130 : 170));
	// //		con[i] = new jigLib.JConstraintMaxDistance(obj[i], [0,80,0,0], pin[i], jigLib.Vector3DUtil.Y_AXIS.slice(), (i % 2 == 1 ? 130 : 170));
			// con[i] = new jigLib.JConstraintPoint(obj[i], [0,80,0,0], pin[i], jigLib.Vector3DUtil.Y_AXIS.slice(), (i % 2 == 1 ? 30 : 70));
			// system.addConstraint(con[i]);
		// }
	// }
	
	var materials = [
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/wood.jpg")}), // right
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/wood.jpg")}), // left
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/wood.jpg")}), //top
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/wood.jpg")}), // bottom
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/wood.jpg")}), // back
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/wood.jpg")}) // front
                //shaderMaterial
       ];

    var mesh = new THREE.Mesh(new THREE.CubeGeometry(field.width - 50, 5, 100), materials);

    mesh.position.x = 0;
    mesh.position.y = -field.height / 2;
    mesh.position.z = 0;
    this.scene.addObject(mesh);

    mesh = new THREE.Mesh(new THREE.CubeGeometry(field.width - 50, 5, 100), materials);

    mesh.position.x = 0;
    mesh.position.y = field.height / 2;
    mesh.position.z = 0;
    this.scene.addObject(mesh);

    materials = [new THREE.MeshLambertMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.5 }),
    	                 new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.5 })];
	
    //var image = new Image();
	var plane = new THREE.PlaneGeometry( 1.2*field.width, 1.2*field.height );
    quadTarget = new THREE.Mesh( plane, new THREE.MeshPhongMaterial( { ambient: 0x000000, color: 0x5500ff, specular: 0x555555, shininess: 30 } ) );
	quadTarget.position.z = -80;
	this.scene.addObject( quadTarget );
	
	mesh = this.initObjects([0,0,0]);

	var paddlematerial1 = [
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle.jpg")}), // right
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle.jpg")}), // left
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle.jpg")}), //top
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle.jpg")}), // bottom
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle.jpg")}), // back
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle.jpg")}) // front
       			//shaderMaterial
       ];
	 var paddlematerial2 = [
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle2.jpg")}), // right
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle2.jpg")}), // left
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle2.jpg")}), //top
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle2.jpg")}), // bottom
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle2.jpg")}), // back
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("textures/paddle2.jpg")}) // front
       			//shaderMaterial
       ];
    // Prepare player objects
    this.playerMeshes = []; // for players 0 to 1
    for (var playerIndex in this.players) {
        var player = this.players[playerIndex];
		//shaderMaterial = new THREE.MeshShaderMaterial({
		//	uniforms:		playerIndex == 0 ? paddleUnis.paddle1: paddleUnis.paddle2,
		//	vertexShader:   $('#vs').text(),
		//	fragmentShader: $('#fs').text()
		//});
		
        mesh = new THREE.Mesh(new THREE.CubeGeometry(player.thickness, player.height, player.width), playerIndex == 0 ? paddlematerial2 : paddlematerial1 );
        mesh.position.x = player.position.x;
        mesh.position.y = player.position.y;
        mesh.position.z = 0;
		mesh.overdraw = true;
		mesh.matrixAutoUpdate = false;
		
		paddles.push(new jigLib.JBox(null, player.thickness, player.height, player.width));
		paddles[playerIndex].set_mass(50);//100
		paddles[playerIndex].set_friction(0);
		paddles[playerIndex].set_restitution(100);
		paddles[playerIndex].moveTo([player.position.x, player.position.y, 0, 0]);
		paddles[playerIndex].set_movable(true);
		//paddles[playerIndex].addEventListener("collision",function(e){
		//	jball.setVelocity([layer.position.x > 0 ? 30 : -30, 20,0,0]);
		//});
		csystem.addCollisionBody(paddles[playerIndex]);
	    system.addBody(paddles[playerIndex]);

        this.scene.addObject(mesh);
        this.playerMeshes.push(mesh);
    }

    // Prepare ball objects
    this.resetBalls();

};

var currentBallPos = {x:0, y:0, rate: 1.0}

Game.prototype.updateScene = function() {
	
	if(this.showMenu){
		then = new Date().getTime();
		return;
	}
	now = new Date().getTime();
	system.integrate((now - then) / 75);//400
	then = now;
    if (!this.showMenu && !finished) {
        for (ballIndex in this.balls) {
            if (cameraStyle.ortho) {
                this.camera.projectionMatrix = THREE.Matrix4.makeOrtho(-this.container.clientWidth, this.container.clientWidth, this.container.clientHeight, -this.container.clientHeight, 1, 2000);
            } else {
                this.camera.projectionMatrix = this.originalCameraProject;
                this.camera.position.z = 2000;
            }
            this.camera.position.x += (this.mouseX - this.camera.position.x) * .1;
            this.camera.position.y += (-this.mouseY - this.camera.position.y) * .1;
            var ball = this.balls[ballIndex];

            // Let the ball do one step
            ball.move(this.players);
			//jball.setVelocity([2*ball.speed.x,0,0,0]);
            if (this.mode.player1 || this.mode.demo) {
                this.moveComputerPlayer();
            }

            if (this.mode.demo) {
                this.movePlayer1();
            }

            // See if any of the balls was behind any of the players...
            // And if so, give all the other players a point.
            for (playerIndex in this.players) {
                this.players[playerIndex].hitTest(ball, function() {
                    this.playerFailed(playerIndex);
                   	this.players[0].resetPosition(-field.width / 2, 0);
                   	this.players[1].resetPosition(field.width / 2, 0);
                    this.removeBalls();
                    setTimeout(this.resetBalls.bind(this), 2000);
                } .bind(this));
            }

            //this.ballMeshes[ballIndex].position.x = ball.position.x;
            //this.ballMeshes[ballIndex].position.y = ball.position.y;
            //jball.moveTo([this.ballMeshes[ballIndex].position.x, this.ballMeshes[ballIndex].position.y, this.ballMeshes[ballIndex].position.z, 0]);
            currentBallPos = {
				x: ball.position.x,
				y: ball.position.y,
				rate: ball.speedPer
            };
            
        }

        // Set the player's positions
        for (playerIndex in this.players) {
            var player = this.players[playerIndex];
            var playerMesh = this.playerMeshes[playerIndex];
            playerMesh.position.y = player.position.y;
			paddles[playerIndex].moveTo([this.playerMeshes[playerIndex].position.x, this.playerMeshes[playerIndex].position.y, this.playerMeshes[playerIndex].position.z, 0]);
        }
		
	
	for(var i in this.playerMeshes){
		//paddles[i].moveTo([this.playerMeshes[i].position.x, this.playerMeshes[i].position.y, this.playerMeshes[i].position.z, 0])
		if(paddles[i].collisions.length> 0){
			jball.applyBodyWorldImpulse([paddles[i].collisions[0].dirToBody[0]*10,30,0], [0,0,0])
		}
		this.JL2THREE(this.playerMeshes[i], paddles[i].get_currentState().position, paddles[i].get_currentState().get_orientation().glmatrix);
	}
	
	for(var i in this.ballMeshes){
		//jball.set_worldPosition([this.ballMeshes[i].position.x, this.ballMeshes[i].position.y, this.ballMeshes[i].position.z, 0]);
		//jball.moveTo([this.ballMeshes[i].position.x, this.ballMeshes[i].position.y, this.ballMeshes[i].position.z, 0])
		//if(jball.collisions.length> 0)
		//	console.log("Collision!");
		this.JL2THREE(this.ballMeshes[i], jball.get_currentState().position, jball.get_currentState().get_orientation().glmatrix);
	}
    }else if(finished){
    		this.showMenu = true;
            this.toggleMenu(true);
    }

};

Game.prototype.moveComputerPlayer = function() {
    var player = this.players[1];
    if (this.balls.length == 0) {
        return;
    }
    if (this.players[1].position.y > jball.get_currentState().position[1]) {
        //player.handleKeyCode(40);
		player.position.y = jball.get_currentState().position[1];
    }
    else {
        //player.handleKeyCode(38);
		player.position.y = jball.get_currentState().position[1];
    }
};

Game.prototype.movePlayer1 = function() {
    var player = this.players[0];
    if (this.balls.length == 0) {
        return;
    }
    if (this.players[0].position.y > jball.get_currentState().position[1]) {
        //player.handleKeyCode(40);
		player.position.y = jball.get_currentState().position[1];
    } else {
        //player.handleKeyCode(38);
		player.position.y = jball.get_currentState().position[1];
    }
};

Game.prototype.removeBalls = function() {
    this.balls = [];
    for (ballIndex in this.ballMeshes) {
        this.scene.removeObject(this.ballMeshes[ballIndex]);
    }
};

//uniform shader variables for the sun object
var sununiforms = {
		amplitude: {
			type: 'f', // a float
			value: 1
		},
		lightsource:
		{
			type: 'v3', // a vec3
			value: []
		},
		image:{ type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( 'textures/sun.gif')}
	};
//attributes shader variables for the sun	
var attributes = {
	displacement: {
		type: 'f', // a float
		value: 1 // an empty array
	}
};

// heat property for the background shader texture
var properties = {
		heat: 0.0185
	};

// control properties from the front drop-down menu
var controlsProps = {	
	Color1: 0.7,
    Color2: 1.0,
	ShaderSpeed: 0.005,
	GameSpeed: 10,
	GameMode: 3,
	CameraMode: 1
};

// --- Lights

var pointLight = new THREE.PointLight( 0x2D2D2D );

Game.prototype.initObjects = function(position){

	//this.noiseMaterial = new THREE.MeshShaderMaterial({
	//	uniforms:		 this.textureUnis,
	//	vertexShader:   $('#noisevertex').text(),
	//	fragmentShader: $('#noisefragment').text(),
	//	lights: false
	//});

	// make the gnawrly background
	//this.noiseMap  = new THREE.WebGLRenderTarget( this.container.clientWidth, this.container.clientHeight, { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat } );
};

Game.prototype.resetBalls = function() {

    this.balls = [Ball.getBall()];
    this.ballMeshes = [];
	csystem.removeCollisionBody(jball);
    for (ballIndex in this.balls) {
        var ball = this.balls[ballIndex];

        var materials = [new THREE.MeshLambertMaterial({ color: 0x00ff00 })];
		var shaderMaterial = new THREE.MeshShaderMaterial({
			uniforms:       sununiforms,
			attributes:     attributes,
			vertexShader:   $('#vs').text(),
			fragmentShader: $('#fs').text()
		});
		
		var sphere = new THREE.SphereGeometry(20, 20, 20);
        var mesh = new THREE.Mesh(sphere, shaderMaterial);

        mesh.position.x = ball.position.x;
        mesh.position.y = ball.position.y;
        mesh.position.z = 0;
		mesh.overdraw = true;
		mesh.matrixAutoUpdate = false;
		
		jball=new jigLib.JSphere(null,20);
		jball.set_mass(1);
		jball.set_friction(0);
		jball.set_restitution(100);
		jball.moveTo([ball.position.x,ball.position.y,0,0]);
		jball.set_movable(true);
		//jball.setLinearVelocityDamping([1,1,1,1]);
		system.addBody(jball);
		csystem.addCollisionBody(jball);
		jball.setVelocity([100,20,0,0]);
		
		//orbiter.position.y = ball.position.y;

        this.scene.addObject(mesh);
        this.ballMeshes.push(mesh);
    }
};

Game.prototype.playerFailed = function(player) {
    for (playerIndex in this.players) {
        if (playerIndex == player) continue;
        this.players[playerIndex].score++;
    }
    this.updateScores();
};

var frame,frame2;
frame=frame2=0;
var diameter = 50;

// This method causes the scene to be re-rendered.
Game.prototype.render = function(callback) {

	this.updateAI();
    this.updateScene();
	
	//change the position of the planets
	//this.movePlanets(frame, frame2);
	
	frame+=0.1;
	frame2+=0.01;

	//calculate new shadered texture background
	//this.textureUnis.time.value += properties.heat*.5;
	
	//set the background plane
	//quadTarget.materials[ 0 ] = this.noiseMaterial;
	
	//render
	if(this.allowZoom){
    	this.renderer.render(this.scene, !this.showMenu ? this.camera : zoomCamera);
    }else{
    	this.renderer.render(this.scene, this.camera);
	}
    
    if (callback) {
        setTimeout(callback, 33);
    }
};

// Move the Planets
// Game.prototype.movePlanets = function(frame, frame2){
	// orbiter.position.x = currentBallPos.x + diameter*Math.cos(frame);
	// orbiter.position.y = currentBallPos.y - diameter*Math.sin(frame);
    // orbiter.position.z = diameter*Math.sin(frame);
    // if(orbiters.length > 0){
    	// for(orb in orbiters){
    		// var speed = orbiters.length-orb;
    		// orbiters[orb].position.x = currentBallPos.x + (orb*0.5)*diameter*Math.cos(planets[orb].speed*(0.01)*frame);
			// orbiters[orb].position.y = currentBallPos.y - (orb*0.5)*diameter*Math.sin(planets[orb].speed*(0.01)*frame);
    		// orbiters[orb].position.z =  15*Math.sin(orb*(0.1)*frame);
    		// //orbiters[orb].rotation.y =  planets[orb].speed*frame*0.1;
    		// planets[orb].uniform.lightsource.value = new THREE.Vector3(currentBallPos.x - orbiters[orb].position.x, currentBallPos.y - orbiters[orb].position.y, currentBallPos.z - orbiters[orb].position.z);
    		
    	// }
    // }
    // for (ballIndex in this.ballMeshes){
    	// this.ballMeshes[ballIndex].rotation.y = frame*0.1;
    // }
    
    // paddleUnis.paddle1.lightsource.value = new THREE.Vector3(currentBallPos.x - this.players[0].position.x, currentBallPos.y- this.players[0].position.y, currentBallPos.z- this.players[0].position.z);
	// paddleUnis.paddle2.lightsource.value = new THREE.Vector3(currentBallPos.x- this.players[1].position.x, currentBallPos.y- this.players[1].position.y, currentBallPos.z- this.players[1].position.z);
	// //paddleUnis.top.lightsource.value = new THREE.Vector3(currentBallPos.x, currentBallPos.y - field.width/2, currentBallPos.z);
	// //paddleUnis.bottom.lightsource.value = new THREE.Vector3(currentBallPos.x, currentBallPos.y + field.width/2, currentBallPos.z);
	
// };
Game.prototype.JL2THREE = function(target, pos, dir) {
	var position = new THREE.Matrix4();
	position.setTranslation(pos[0], pos[1], pos[2])
	//var position = THREE.Matrix4.setTranslation( pos[0], pos[1], pos[2] );
	var rotate = new THREE.Matrix4(dir[0], dir[1], dir[2], dir[3], dir[4], dir[5], dir[6], dir[7], dir[8], dir[9], dir[10], dir[11], dir[12], dir[13], dir[14], dir[15]);
	position.multiplySelf(rotate);
	target.matrix = position;
	target.update(false, true, this.camera);
};

Game.prototype.updateScores = function() {
    $('#scores').html('');
    for (playerIndex in this.players) {
        var player = this.players[playerIndex];
        $('#scores').append('<div>' + player.name + '<span>' + player.score + '</span></div>');
        if(player.score == winnerScore){
        	$('#scores').empty();
        	$('#scores').append('<div>' + " WINS"  + '<span>' + player.name + '</span></div>');
        	finished = true;
        	break;
        }
        
    }
    
};
