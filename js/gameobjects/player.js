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
}

Player.prototype.handleKeyCode = function (keyCode, keyCode2) {
    if (keyCode !== "undefined") {
        switch (keyCode) {
            case 87: //W
                if ((this.position.y + this.height / 2) + this.speed < field.height / 2) {
                    this.position.y += this.human ? 5 * this.speed : this.speed;
                }
                break;
            case 83: //S
                if ((this.position.y - this.height / 2) - this.speed > -field.height / 2) {
                    this.position.y -= this.human ? 5 * this.speed : this.speed;
                }
                break;
            case 68: //D
                if (this.position.x  < -350) {
                    this.position.x += this.human ? 5 * this.speed : this.speed;
                }
                break;
            case 65: //A
                if ((this.position.x - this.width / 2) - this.speed > -field.width / 2) {
                    this.position.x -= this.human ? 5 * this.speed : this.speed;
                }
                break;
        }
    }
    if (keyCode2 !== "undefined") {
        switch (keyCode2) {
            case 38: //up arrow  
                if ((this.position.y + this.height / 2) + this.speed < field.height / 2) {
                    this.position.y += this.human ? 5 * this.speed : this.speed;
                }
                break;
            case 40: //down arrow  
                if ((this.position.y - this.height / 2) - this.speed > -field.height / 2) {
                    this.position.y -= this.human ? 5 * this.speed : this.speed;
                }
                break;
            case 39: //right arrow  
                if ((this.position.x + this.width / 2) + this.speed < field.width / 2) {
                    this.position.x += this.human ? 5 * this.speed : this.speed;
                }
                break;
            case 37: //left arrow  
                if (this.position.x  > 350) {
                    this.position.x -= this.human ? 5 * this.speed : this.speed;111
                }
                break;
        }
    }
}

// Default values
Player.prototype.speed = 10;
Player.prototype.width = 50;
Player.prototype.height = 100;
Player.prototype.thickness = 10;
Player.prototype.human = false;