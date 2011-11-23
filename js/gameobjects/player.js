/* Player */
function Player(name, startX, startY) {
    this.name = name;

    if (startX > 0) {
        startX -= this.thickness;
    }
    else {
        startX += this.thickness;
    }

    this.position = {
        x: startX,
        y: startY
    };
    this.score = 0;
}

Player.prototype.hitTest = function(ball, isHitCallback) {
    if (ball.get_currentState().position[0] < -(field.width / 2 + 120)) {
        if (isHitCallback) {
            isHitCallback(0);
        }
    }
    if (ball.get_currentState().position[0] > field.width / 2 + 120) {
        if (isHitCallback) {
            isHitCallback(1);
        }
    }
}

Player.prototype.reset = function(startX, startY) {
    this.score = 0;
    if (typeof startX !== "undefined") {
        if (startX > 0) {
            startX -= this.thickness;
        }
        else {
            startX += this.thickness;
        }
        this.position = {
            x: startX,
            y: startY
        };
    }
}

Player.prototype.resetPosition = function(startX, startY) {
    if (startX > 0) {
        startX -= this.thickness;
    }
    else {
        startX += this.thickness;
    }
    this.position = {
        x: startX,
        y: startY
    };
}

Player.prototype.handleKeyCode = function(keyCode, keyCode2) {
    if (keyCode !== "undefined") {
        switch (keyCode) {
        case 87:
            //W
            if ((this.position.y + this.height / 2) + this.speed < field.height / 2) {
                this.position.y += this.human ? 5 * this.speed: this.speed;
            }
            break;
        case 83:
            //S
            if ((this.position.y - this.height / 2) - this.speed > -field.height / 2) {
                this.position.y -= this.human ? 5 * this.speed: this.speed;
            }
            break;
        case 68:
            //D
            if (this.position.x < -350) {
                this.position.x += this.human ? 5 * this.speed: this.speed;
            }
            break;
        case 65:
            //A
            if ((this.position.x - this.width / 2) - this.speed > -field.width / 2) {
                this.position.x -= this.human ? 5 * this.speed: this.speed;
            }
            break;
        }
    }
    if (keyCode2 !== "undefined") {
        switch (keyCode2) {
        case 38:
            //up arrow
            if ((this.position.y + this.height / 2) + this.speed < field.height / 2) {
                this.position.y += this.human ? 5 * this.speed: this.speed;
            }
            break;
        case 40:
            //down arrow
            if ((this.position.y - this.height / 2) - this.speed > -field.height / 2) {
                this.position.y -= this.human ? 5 * this.speed: this.speed;
            }
            break;
        case 39:
            //right arrow
            if ((this.position.x + this.width / 2) + this.speed < field.width / 2) {
                this.position.x += this.human ? 5 * this.speed: this.speed;
            }
            break;
        case 37:
            //left arrow
            if (this.position.x > 350) {
                this.position.x -= this.human ? 5 * this.speed: this.speed;
            }
            break;
        }
    }
}
/*Player.prototype.handleKeyCode = function(keyCode, keyCode2) {
    switch (keyCode) {
    case 38:
        if ((this.position.y + this.height / 2) + this.speed < field.height / 2) {
            this.position.y += this.human ? 5 * this.speed: this.speed;
            //this.mesh.position.y = this.position.y;
        }
        break;
    case 40:
        if ((this.position.y - this.height / 2) - this.speed > -field.height / 2) {
            this.position.y -= this.human ? 5 * this.speed: this.speed;
            //this.mesh.position.y = this.position.y;
        }
        break;
    case 87:
        //w
        if ((this.position.y + this.height / 2) + this.speed < field.height / 2) {
            this.position.y += this.human ? 5 * this.speed: this.speed;
            //this.mesh.position.y = this.position.y;
        }
        break;
    case 65:
        //a
        if ((this.position.x - this.width / 2) - this.speed > -field.width / 2) {
            this.position.x -= this.human ? 5 * this.speed: this.speed;
            //this.mesh.position.y = this.position.y;
        }
        break;
    case 83:
        //s
        if ((this.position.y - this.height / 2) - this.speed > -field.height / 2) {
            this.position.y -= this.human ? 5 * this.speed: this.speed;
            //this.mesh.position.y = this.position.y;
        }
        break;
    case 68:
        //d
        if ((this.position.x + this.width / 2) + this.speed < field.width / 2) {
            this.position.x += this.human ? 5 * this.speed: this.speed;
            //this.mesh.position.y = this.position.y;
        }
        break;
    }

    //possible solution for mouse move in 2d?
    if (typeof keyCode2 !== "undefined") {
        switch (keyCode2) {
        case 39:
            if ((this.position.x + this.width / 2) + this.speed < field.width / 2) {
                this.position.x += this.human ? 5 * this.speed: this.speed;
                //this.mesh.position.y = this.position.y;
            }
            break;
        case 37:
            if ((this.position.x - this.width / 2) - this.speed > -field.width / 2) {
                this.position.x -= this.human ? 5 * this.speed: this.speed;
                //this.mesh.position.y = this.position.y;
            }
            break;
        }
    }

}*/

// Default values
Player.prototype.speed = 7.5;
Player.prototype.width = 50;
Player.prototype.height = 100;
Player.prototype.thickness = 10;
Player.prototype.human = false;