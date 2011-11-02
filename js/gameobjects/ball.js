/* Ball */
function Ball(positionX, positionY, speedX, speedY) {
	this.position = {x: positionX, y: positionY};
	this.speed = {x: speedX, y: speedY};
	this.rotation = 0;
	this.speedPer = 1.0;
	//this.mesh = mesh;
}

Ball.prototype.move = function(players) {
	var bump = 0;
	if (jball.get_currentState().position[0] >= field.width/2 - Player.prototype.thickness || 
			jball.get_currentState().position[0] <= -field.width/2 + Player.prototype.thickness) {
		this.speedPer = this.getSpeed(players) * 7.5;
		//this.speedPer = 0;
		this.speed.x *= -1;
		bump = 20;
		
		//effect=new jigLib.Explosion([this.position.x,this.position.y,this.position.z,0],100,100,jball,true);
		//system.addEffect(effect);

		//jball.setVelocity([this.speed.x+ (dir*this.speedPer) + (dir*bump),this.speed.y,0,0]);
	}
	if (this.position.y+20 >= field.height/2 || 
			this.position.y-20 <= -field.height/2) {
		this.speed.y *= -1;
	}
	
	if(typeof this.speedPer === "undefined"){
		this.speedPer = 1;
	}
	var dir = parseInt(this.speed.x/Math.abs(this.speed.x));
	this.position.x += this.speed.x+ (dir*this.speedPer) + (dir*bump);
	this.position.y += this.speed.y;
	//this.mesh.position.x = this.position.x;
	//this.mesh.position.y = this.position.y;
}
Ball.getBall = function(accellerationX, accellerationY) {
	if (accellerationX == undefined) {
		var accellerationX = [-1, 1][ Math.round( Math.random() )];
	}
	if (accellerationY == undefined) {
		var accellerationY = [-1, 1][ Math.round( Math.random() )];
	}
	
	if (accellerationX == 0) {
	}
	
	return new Ball(0,0, gamespeed * accellerationX, gamespeed * accellerationY);
}

Ball.prototype.getSpeed = function(players){

	var isEqual = function(val, target, tolerance){
		if(Math.abs(Math.abs(val)-Math.abs(target)) <= tolerance){
			if(parseInt(val/Math.abs(val)) == parseInt(target/Math.abs(target)))
				return true;
		}
		//if(Math.abs(target)-Math.abs(val) < tolerance){
		//	if(parseInt(val/Math.abs(val)) == parseInt(target/Math.abs(target)))
		//	return true;
		//}
		return false;
	};
	
	for(player in players){
	//is ball on the paddle
		if(isEqual(players[player].position.x,this.position.x,20) ){
			var side = parseInt(players[player].position.x / Math.abs(players[player].position.x));
			switch(side){
				case -1: // player 1
					diff = players[0].position.y - this.position.y;
					return (1-Math.abs(2*diff/(players[0].height/2)));
				break;
				case 1: // player 2
					diff = players[1].position.y - this.position.y;
					return (1-Math.abs(2*diff/(players[1].height/2)));
				break;
			}
		}		
	}
	return 1;
}