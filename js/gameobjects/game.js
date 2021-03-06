/* The actual game. This part renders using WebGL */
function Game(container) {
    this.container = container;
    this.players = [];
    this.prevY = 0,
    this.prevX = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.projector = new THREE.Projector();

    this.allowZoom = false;

    // demo
    this.mode = {
                player1: false,
                player2: false,
                demo: true
            };
	// this.mode = {
	// 		player1: true,
	// 		player2: true,
	// 		demo: false
	// 	}

    // menu options
    this.showMenu = true;

    // Initate Three.js, the 3d engine
    this.scene = new THREE.Scene();

    this.prepareEvents();
    this.prepareGameObjects();
    this.prepareScene();

    this.updateScores();

    this.renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMapEnabled = true;

    // Add the renderer to the DOM
    container.appendChild(this.renderer.domElement);
}

Game.prototype.updateGameSpeed = function(speed) {
    gamespeed = speed;
    var playerIndex;
    for (playerIndex in this.players) {
        this.players[playerIndex].speed = speed;
    }
    if (typeof this.balls[0] !== "undefined") {
        var directionx = this.balls[0].speed.x > 0 ? 1: -1;
        var directiony = this.balls[0].speed.y > 0 ? 1: -1;
        this.balls[0].speed = {
            x: directionx * speed,
            y: directiony * speed
        };
    }
};

Game.prototype.updateAI = function() {
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

    //keypress events
    document.addEventListener('keydown', (function(data) {
        event.preventDefault();
        if (!data.shiftKey) {
            if (data.keyCode !== 27) {
                if (!this.mode.demo) {
                    this.players[0].handleKeyCode(data.keyCode);
                }
            } else {
                this.showMenu = !this.showMenu;
                this.toggleMenu(this.showMenu);
            }
        }
    }).bind(this));

    //mousemove
    document.addEventListener('mousemove', (function(data) {
        event.preventDefault();
        if (!data.shiftKey) {
            var mousex,
            mousey;
            mousex = (event.clientX / window.innerWidth) * 2 + 1;
            mousey = -(event.clientY / window.innerHeight) * 2 + 1;
            var vector = new THREE.Vector3(mousex, mousey, -300);
            this.projector.unprojectVector(vector, this.camera);
            var ray = new THREE.Ray(this.camera.position, vector.subSelf(this.camera.position).normalize());
            var intersects = ray.intersectObject(this.floor);
            if (typeof intersects[0] !== "undefined") {
                var point = intersects[0].point
				//if(onField(point)){
                	mousey = point.y;
					mousex = point.x;
				//}else{
				//	return;
				//}
                //console.log(mousex + ', ' + mousey + " vs " + this.players[1].position.x + "," + this.players[1].position.y);
                if (this.prevY == 0) {
                    this.prevY = mousey;
                }
                if (this.prevX == 0) {
                    this.prevX = mousex;
                }
                if (this.mode.player2) {
                    //this.players[1].handleKeyCode(this.prevY < mousey ? 38: 40, this.prevX < mousex ? 39: 37);
					if(mousex/2-1100 > 70){
                    	this.players[1].position.x = mousex/2-1100;
					}
                    this.players[1].position.y = mousey/2;
                }
                this.prevY = mousex;
                this.prevX = mousey;
            }
        } else {
            this.mouseX = mousex;
            this.mouseY = mousey;
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

// This method prepares all the objects that needs to be drawn to the scene
Game.prototype.prepareScene = function() {

    // setting up the camera
    var aspect_ratio = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.Camera(45, aspect_ratio, 1, 10000);
    this.camera.position.set(0, 0, 1100);
    var origin = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(origin);

    // create an ambient light so everything is lit somewhat
    ambientLight = new THREE.AmbientLight();
    this.scene.addLight(ambientLight);

    //create a SpotLight so the top is completely lit and we can have shadows
    var mainLight = new THREE.SpotLight();
    mainLight.position.set(0, 0, 900);
    // mainLight.intensity = 1;
    mainLight.castShadow = true;
    this.scene.addLight(mainLight);

    //jiglib setup
    system = jigLib.PhysicsSystem.getInstance();
    system.setGravity([0, 0, 0, 0]);
    system.setSolverType('ACCUMULATED');
    //FAST, NORMAL, ACCUMULATED
    // add walls for physics collisions
    // variables for walls
    var longWallWidth = 1.2 * field.width;
    var longWallHeight = 5;
    var longWallLength = 200;
    var longWallX = 0;
    var longWallY = field.height / 2;
    var longWallZ = 0;

    var smallWallWidth = 5;
    var smallWallHeight = field.height / 3 + 60;
    var smallWallLength = 200;
    var smallWallX = field.width / 2 + 90;
    var smallWallY = field.height / 4 + 60;
    var smallWallZ = 0;

    //Game.prototype.addWall = function(width, height, depth, positionX, positionY, positionZ)
    // add long walls
    this.addWall(longWallWidth, longWallHeight, longWallLength, longWallX, -longWallY, longWallZ, true, 1);
    this.addWall(longWallWidth, longWallHeight, longWallLength, longWallX, longWallY, longWallZ, true, -1);
    //add small walls
    this.addWall(smallWallWidth, smallWallHeight, smallWallLength, -smallWallX, -smallWallY, smallWallZ, false);
    this.addWall(smallWallWidth, smallWallHeight, smallWallLength, -smallWallX, smallWallY, smallWallZ, false);
    this.addWall(smallWallWidth, smallWallHeight, smallWallLength, smallWallX, -smallWallY, smallWallZ, false);
    this.addWall(smallWallWidth, smallWallHeight, smallWallLength, smallWallX, smallWallY, smallWallZ, false);

    // load the hockeytable model from the js file and load it into the scene.
    // need to update position/scale to make everything coplanar (paddles/walls for physics engine/ball/etc)
    var tempScene = this.scene
    var jsonLoader = new THREE.JSONLoader();
    jsonLoader.load({
        model: "js/gameobjects/table.js",
        callback: function(geometry) {
            createScene(tempScene, geometry)
        }
    });
    function createScene(scene, geometry) {
        // geometry.materials[0][0].shading = THREE.FlatShading;
        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
        mesh.position.set(520, -335, -600);
        mesh.scale.set(17, 16, 19);
        mesh.rotation.set(Math.PI / 2, Math.PI / 2, 0);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.addObject(mesh);
    }

    // creating a floor plane
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000, 100, 100), new THREE.MeshBasicMaterial({
        color: 0xffffff
    }));
    this.floor.position.set(0, 0, -600);
    this.floor.receiveShadow = true;
    this.scene.addObject(this.floor);

    // Prepare player objects
    this.playerMeshes = [];
    // for players 0 to 1
    for (var playerIndex in this.players) {
        var player = this.players[playerIndex];
        var cylinder = new THREE.CylinderGeometry(40, 40, 40, 5, 5, false);
        var mesh = new THREE.Mesh(cylinder, new THREE.MeshBasicMaterial({
            color: Math.random() * 0xffffff
        }));
        mesh.position.x = player.position.x;
        mesh.position.y = player.position.y;
        mesh.position.z = -100;
        mesh.overdraw = true;
        mesh.matrixAutoUpdate = false;
        mesh.oldPosition = new THREE.Vector3(player.position.x, player.position.y, -100);

        paddles.push(new jigLib.JSphere(null, 35));
        paddles[playerIndex].set_mass(100);
        paddles[playerIndex].set_friction(5);
        paddles[playerIndex].set_restitution(120);
        paddles[playerIndex].moveTo([player.position.x, player.position.y, -100, 0]);
        paddles[playerIndex].set_movable(false);
        system.addBody(paddles[playerIndex]);

        this.scene.addObject(mesh);
        this.playerMeshes.push(mesh);
    }

    // Prepare ball objects
    this.resetBalls();

};

Game.prototype.addWall = function(width, height, depth, positionX, positionY, positionZ, plane, direction) {

    // uncomment these if you want to create visable walls in addition to the jiglib physics objs
    // material = new THREE.MeshBasicMaterial({
    //     color: Math.random() * 0xfffff
    // })
    // ThreeMesh = new THREE.Mesh(new THREE.CubeGeometry(width, height, depth), material);
    // ThreeMesh.position.set(positionX, positionY, positionZ);
    // this.scene.addObject(ThreeMesh);
    //JBox(skin, width, depth, height)
    var physicsObj;

    if (!plane) {
        physicsObj = new jigLib.JBox(null, width, depth, height);
        physicsObj.set_friction(10);
        physicsObj.moveTo([positionX, positionY, positionZ, 0]);
        physicsObj.set_movable(false);
        physicsObj.set_restitution(200);
        system.addBody(physicsObj);
    } else {
        physicsObj = new jigLib.JPlane(null, [0, direction, 0, 0]);
        physicsObj.set_friction(10);
        physicsObj.moveTo([positionX, positionY, positionZ, -100]);
        physicsObj.set_movable(false);
        physicsObj.set_restitution(200);
        system.addBody(physicsObj);
    }

};

var oldPos = new THREE.Vector3(),
currentPos = new THREE.Vector3();

//Sychronize the physics models with the THREE Meshes
Game.prototype.updateScene = function() {

    // if menu is showing, pause the game by returning early
    if (this.showMenu) {
        then = new Date().getTime();
        return;
    }

    //update time step for physics engine
    now = new Date().getTime();
    system.integrate((now - then) / 100);
    then = now;

    // if the game isn't over, keep rendering
    if (!finished) {

        if (this.mode.player1 || this.mode.demo) {
            this.moveComputerPlayer();
        }

        if (this.mode.demo) {
            this.movePlayer1();
        }

        // Synchronize the players positions
        for (playerIndex in this.players) {
            var player = this.players[playerIndex];
            var playerMesh = this.playerMeshes[playerIndex];
            playerMesh.position.y = player.position.y;
            playerMesh.position.x = player.position.x;
            paddles[playerIndex].moveTo([playerMesh.position.x, playerMesh.position.y, playerMesh.position.z, 0]);
        }


        for (var i in this.playerMeshes) {

            // check for collisions
            if (paddles[i].collisions.length > 0) {
                if (paddles[i].collisions[0].objInfo.body1._type !== "PLANE" || paddles[i].collisions[0].objInfo.body1._type !== "BOX") {
                    boing.play();
                    // play sound
                    array = jball.get_currentState().position;
                    // get the current physics ball location
                    currentPos = new THREE.Vector3(array[0], array[1], array[2]);
                    // match the mesh to the ball
                    diff = currentPos.subSelf(oldPos);
                    // get the vector of the ball
                    mag = diff.length();
                    // store the length (get speed)
                    diffn = diff.normalize();
                    // normalize vector
                    // try to keep the ball moving
                    var scaleMag = function(oldMag) {
                        if (oldMag < 10) return 35;
                        if (oldMag > 35) return 35;
                        return oldMag;
                    };

                    mag = scaleMag(mag);
                    // scale the mag
                    jball.applyBodyWorldImpulse([diffn.x * mag, diffn.y * mag, 0], [0, 0, 0])
                    // add a force to the ball to keep it going
                }
            }

            this.players[playerIndex].hitTest(jball,
            function(player) {
                player === 0 ? yay.play() : woohoo.play();
                this.playerFailed(player);
                this.players[0].resetPosition( - field.width / 2, 0);
                this.players[1].resetPosition(field.width / 2, 0);
                this.playerMeshes[0].position.set( - field.width / 2, 0, -100);
                this.playerMeshes[1].position.set(field.width / 2, 0, -100);
                this.JL2THREE(this.playerMeshes[0], paddles[0].get_currentState().position, paddles[0].get_currentState().get_orientation().glmatrix);
                this.JL2THREE(this.playerMeshes[1], paddles[1].get_currentState().position, paddles[1].get_currentState().get_orientation().glmatrix);
                this.removeBalls();
                setTimeout(this.resetBalls.bind(this), 2000);
            }.bind(this));

            playerMesh = this.playerMeshes[i];
            var pos1 = new THREE.Vector3(paddles[i].get_currentState().position[0], paddles[i].get_currentState().position[1], 0);
            var trajectory = pos1.subSelf(playerMesh.oldPosition);
            playerMesh.speed = trajectory.length();
            playerMesh.oldPosition.set(pos1.x, pos1.y, 0);

            trajectory.normalize();
            var angle = Math.atan(trajectory.y / trajectory.x);

            paddles[i].setVelocity([-playerMesh.speed/25 * Math.cos(angle), -playerMesh.speed/25 * Math.sin(angle), 0, 0]);

            //sync meshes
            this.JL2THREE(this.playerMeshes[i], paddles[i].get_currentState().position, paddles[i].get_currentState().get_orientation().glmatrix);
        }

        //sync ball
        for (var i in this.ballMeshes) {
            this.JL2THREE(this.ballMeshes[i], jball.get_currentState().position, jball.get_currentState().get_orientation().glmatrix);
        }

        //move light
        // this.pointLight.position = new THREE.Vector3(jball.get_currentState().position[0], jball.get_currentState().position[1], 0);
    } else if (finished) {
        this.showMenu = true;
        this.toggleMenu(true);
    }

    //record the position of the physics ball
    oldPos.set(jball.get_currentState().position[0], jball.get_currentState().position[1], jball.get_currentState().position[2]);
};

// AI Move Player 2
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

//AI Move Player 1
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
        jball.moveTo([0, 0, -100, 0]);
        // /jball.set_Velocity([0,0,0,0]);
    }
};

Game.prototype.resetBalls = function() {

    this.balls = [Ball.getBall()];
    this.ballMeshes = [];
    for (ballIndex in this.balls) {
        this.initializeBall(this.balls[ballIndex]);
    }
};

Game.prototype.initializeBall = function(ball) {
    var materials = [new THREE.MeshLambertMaterial({
        color: 0x000000
    })];

    // var sphere = new THREE.Geometry(20, 20, 20);
    var cylinder = new THREE.CylinderGeometry(20, 20, 20, 5, 5, false);
    var mesh = new THREE.Mesh(cylinder, materials);
    mesh.castShadow = true;

    mesh.position.x = ball.position.x;
    mesh.position.y = ball.position.y;
    mesh.position.z = -100;
    mesh.overdraw = true;
    mesh.matrixAutoUpdate = false;

    if (!jball) {
        jball = new jigLib.JSphere(null, 20);
        jball.set_mass(10);
        jball.set_friction(5);
        jball.set_restitution(200);
        jball.set_movable(true);
        jball.set_rotVelocityDamping([0.995, 0.995, 0.995]);
        //jball.set_linVelocityDamping([1, 1, 1]);
        jball.moveTo([ball.position.x, ball.position.y, -100, 0]);
        system.addBody(jball);
    }

    var dir1,
    dir2;
    dir1 = [ - 1, 1][Math.round(Math.random())];
    dir2 = [ - 1, 1][Math.round(Math.random())];
    jball.setVelocity([dir1 * 50, dir2 * 30, 0, 0]);

    this.scene.addObject(mesh);
    this.ballMeshes.push(mesh);
};

Game.prototype.playerFailed = function(player) {
    for (playerIndex in this.players) {
        if (playerIndex == player) continue;
        this.players[playerIndex].score++;
    }
    this.updateScores();
};
Game.prototype.updateCamera = function(val, dim) {
    switch (dim) {
    case 'x':
        this.camera.position.x = 10 * val;
        break;
    case 'y':
        this.camera.position.y = 10 * val;
        break;
    case 'z':
        this.camera.position.z = 1100 + 10 * val;
        break;
    }
    var origin = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(origin);
}

Game.prototype.updatePaddlesShape = function(value){
	switch(value){
		case 0://circular
			for(var playerIndex in this.players){
				this.scene.removeObject(this.playerMeshes[playerIndex]);
				this.playerMeshes[playerIndex] = null;
				
				var player = this.players[playerIndex];
		        var cylinder = new THREE.CylinderGeometry(40, 40, 40, 5, 5, false);
		        var mesh = new THREE.Mesh(cylinder, new THREE.MeshBasicMaterial({
		            color: Math.random() * 0xffffff
		        }));
		        mesh.position.x = player.position.x;
		        mesh.position.y = player.position.y;
		        mesh.position.z = -100;
		        mesh.overdraw = true;
		        mesh.matrixAutoUpdate = false;
		        mesh.oldPosition = new THREE.Vector3(player.position.x, player.position.y, -100);

		        system.removeBody(paddles[playerIndex]);
				paddles[playerIndex] = new jigLib.JSphere(null, 35);
	        	paddles[playerIndex].set_mass(100);
	        	paddles[playerIndex].set_friction(5);
	        	paddles[playerIndex].set_restitution(120);
	        	paddles[playerIndex].moveTo([player.position.x, player.position.y, -100, 0]);
	        	paddles[playerIndex].set_movable(false);
				system.addBody(paddles[playerIndex]);

		        this.scene.addObject(mesh);
		        this.playerMeshes[playerIndex] = mesh;
			}
		break;
		case 1://square
			for(var playerIndex in this.players){
				this.scene.removeObject(this.playerMeshes[playerIndex]);
				this.playerMeshes[playerIndex] = null;
				
				var player = this.players[playerIndex];
		        var cylinder = new THREE.CubeGeometry(55, 55, 55, 5, 5, false);
		        var mesh = new THREE.Mesh(cylinder, new THREE.MeshBasicMaterial({
		            color: Math.random() * 0xffffff
		        }));
		        mesh.position.x = player.position.x;
		        mesh.position.y = player.position.y;
		        mesh.position.z = -100;
		        mesh.overdraw = true;
		        mesh.matrixAutoUpdate = false;
		        mesh.oldPosition = new THREE.Vector3(player.position.x, player.position.y, -100);
				
				system.removeBody(paddles[playerIndex]);
				paddles[playerIndex] = null;
				paddles[playerIndex] = new jigLib.JBox(null, 55, 55, 55);
	        	paddles[playerIndex].set_mass(100);
	        	paddles[playerIndex].set_friction(5);
	        	paddles[playerIndex].set_restitution(120);
	        	paddles[playerIndex].moveTo([player.position.x, player.position.y, -100, 0]);
	        	paddles[playerIndex].set_movable(false);
				system.addBody(paddles[playerIndex]);
				
				this.scene.addObject(mesh);
		        this.playerMeshes[playerIndex] = mesh;
			}
		break;
	}
}
// This method causes the scene to be re-rendered.
Game.prototype.render = function(callback) {

    //this.updateAI();
    this.updateScene();

    //render
    this.renderer.render(this.scene, this.camera);

    if (callback) {
        setTimeout(callback, 16);
    }
};

Game.prototype.JL2THREE = function(target, pos, dir) {
    var position = new THREE.Matrix4();
    position.setTranslation(pos[0], pos[1], pos[2])
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
        if (player.score === winnerScore) {
            $('#scores').empty();
            $('#scores').append('<div>' + " WINS" + '<span>' + player.name + '</span></div>');
            finished = true;
            break;
        }
    }
};

