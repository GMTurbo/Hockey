/* Player */
function Player(name, startX, startY) {
	this.name = name;
	
	if (startX > 0) {
		startX -= this.thickness;
	}
	else {
		startX += this.thickness;
	}
	
	this.position = { x: startX, y: startY };
	this.score = 0;
	//this.mesh = mesh;
}

Player.prototype.hitTest = function(ball, isHitCallback) {
	if ((this.position.x < 0 && jball.get_currentState().position[0] <= this.position.x + this.thickness) || 
			(this.position.x > 0 && jball.get_currentState().position[0] >= this.position.x - this.thickness)) {
		if (jball.get_currentState().position[1] > this.position.y + this.height/2 ||
			jball.get_currentState().position[1] < this.position.y - this.height/2) {
			if(isHitCallback) {
				isHitCallback();
			}
		}
	}
}

Player.prototype.reset = function(startX,startY){
    this.score = 0;
    if(typeof startX !== "undefined"){
    	if (startX > 0) {
			startX -= this.thickness;
		}
		else {
			startX += this.thickness;
		}
        this.position = { x: startX, y: startY };
    }
}

Player.prototype.resetPosition = function(startX,startY){
	if (startX > 0) {
		startX -= this.thickness;
	}
	else {
		startX += this.thickness;
	}
    this.position = { x: startX, y: startY };
	//this.mesh.position.x = this.position.x;
	//this.mesh.position.y = this.position.y;
}

Player.prototype.handleKeyCode = function(keyCode) {
	switch (keyCode) {
		case 38:
			if ((this.position.y + this.height/2) + this.speed < field.height/2) {
				this.position.y += this.human ? 5*this.speed: this.speed;
				//this.mesh.position.y = this.position.y;
			}
		break;
		case 40:
			if ((this.position.y - this.height/2) - this.speed > -field.height/2) {
				this.position.y -= this.human ? 5*this.speed: this.speed;
				//this.mesh.position.y = this.position.y;
			}
		break;
	}
}

// Default values
Player.prototype.speed = 10;
Player.prototype.width = 50;
Player.prototype.height = 100;
Player.prototype.thickness = 10;
Player.prototype.human = false;