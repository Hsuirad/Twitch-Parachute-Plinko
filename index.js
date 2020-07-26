let canvas = document.getElementById('canvas');
let c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let images = [];


//the booleans to switch on and off

let canPlayPlinko = true; //for the option to play plinko game
let canPlayPara = true; //for the option to play drop game
let movingTarget = true; //for a moving target
let minScoreForEffect = 50;

//the two factors to change

let wallSlideFactor = 0.1; //0.1 = 10% chance, 1 = 100% chance, 0.5 = 50% chance, etc.
let straightFallFactor = 0.1;

//the four velocity constraints

let minSpeedX = 2;
let maxSpeedX = 4;
let minSpeedY = 2;
let maxSpeedY = 4;


// this is just a variable i use to increase sizes of drawn objects
const scaleFactor = 1.5;





let highScore = 0;

const parachutes = [];
const fallingMen = [];

for(let i = 0; i < 5; i++){
	parachutes.push(new Image());
	parachutes[i].src = `images/parachute${i+1}.png`;
}

for(let i = 0; i < 3; i++){
	fallingMen.push(new Image());
	fallingMen[i].src = 'images/man'+(i+1)+'.png';
}

class Skydiver{
	constructor(body, x, xvel, yvel, index, name, scaleX = 0, scaleY = 0){
		this.body = body; //just the image
		this.x = x; //the x value
		this.playParticles = false; //whether or not to show the particle effect yet
		this.finished = false; //if it should be made grayed out
		this.p = []; //the particle array
		this.scaleX = 0;
		this.scaleY = 0;
		this.name = name // its name
		this.y = -this.body.naturalHeight; //the y value
		this.xvel = xvel * (Math.random() < 0.5 ? -1 : 1); //the x velocity
		this.yvel = yvel; //the y velocity
		this.alive = true; //whether it has hit the floor or not
		this.calcScore = true; //whether you should calculate its score yet
		this.wallSlide = (Math.random() <= wallSlideFactor ? true : false);
		this.fallStraight = (Math.random() <= straightFallFactor ? true : false);
		this.score = -1; //the score it currently has
		this.index = index; //the numbered index used in popArr to kill it
		this.hitFloor = false; //whether or not its hit the floor
		this.rot = 0; //its rotation
		this.globalAlpha = 1.0; //the amount of graying out it has 1.0 = 0% and 0.0 = 100%
		this.hitWall = false; //whether or not its hit a wall
		this.hit = false; //whether its hit something
		this.parachute = parachutes[Math.floor(Math.random()*3)]; //its parachute

		if(this.body.naturalHeight > fallingMen[0].naturalHeight || this.body.naturalWidth > fallingMen[0].naturalHeight){
			if(this.body.naturalHeight > this.body.naturalWidth){
				let sizing = fallingMen[0].naturalHeight / (this.body.naturalHeight);

				this.scaleX = sizing * scaleFactor;
				this.scaleY = sizing * scaleFactor;
			} else{
				let sizing = fallingMen[0].naturalHeight / (this.body.naturalWidth);

				this.scaleX = sizing * scaleFactor;
				this.scaleY = sizing * scaleFactor;
			}
		}
	}

	setParticles = () => {
		for(let i = 0; i < 10; i++){
			this.p.push({
				x: this.x + this.body.naturalWidth/2,
				y: this.y + this.body.naturalHeight/8,
				dx: ((Math.random()*2)) * (Math.random()<0.5?-1:1),
				dy: ((Math.random()*-1) - 1),
				r: Math.floor(Math.random()*9) + 1,
				color: `rgb(225, 225, 225)`
			})


		}	
	}

	particles = () => {
		
		for(let i = 0; i < this.p.length; i++){
			this.p[i].x += this.p[i].dx;
			this.p[i].y += this.p[i].dy;

			this.p[i].dy += 0.1;
			
			c.beginPath();
			c.arc(this.p[i].x, this.p[i].y, this.p[i].r, 0, 2*Math.PI);
			c.fillStyle = this.p[i].color;
			c.fill();

		}
	}

	draw = () => {
		c.globalAlpha = this.globalAlpha;
		c.scale(scaleFactor, scaleFactor)
		if(this.y>canvas.height/6 && this.y <canvas.height - this.body.naturalHeight)c.drawImage(this.parachute, -this.parachute.naturalWidth/2.4, -this.body.naturalHeight/2 - this.parachute.naturalHeight/2 + (this.scaleY<1 && this.scaleY>0?(1 - this.scaleY)*(this.body.naturalHeight>this.body.naturalWidth?this.body.naturalHeight:this.body.naturalWidth):0))
		c.scale(this.scaleX>0?this.scaleX/scaleFactor:1, this.scaleY>0?this.scaleY/scaleFactor:1)
		c.drawImage(this.body, -this.body.naturalWidth/2, -this.body.naturalHeight/2);
		c.globalAlpha = 1.0;
	}

	update = () => {
		for(let i = 0; i < jumpers.length; i++){
			if(this.index != i && jumpers[i].hitFloor == false && this.hitFloor == false && this.hit == false && jumpers[i].hit == false && Math.sign(this.xvel) != Math.sign(jumpers[i].xvel)){
				if(this.x + this.body.naturalWidth > jumpers[i].x && this.x + this.body.naturalWidth < jumpers[i].x + jumpers[i].body.naturalWidth){
					if((this.y + this.body.naturalHeight > jumpers[i].y && this.y + this.body.naturalHeight < jumpers[i].y + jumpers[i].body.naturalHeight) || (this.y < jumpers[i].y + jumpers[i].naturalHeight && this.y > jumpers[i].y)){
						this.xvel = -this.xvel*0.7;
						jumpers[i].xvel = -jumpers[i].xvel*0.7
						this.hit = true;
						jumpers[i].hit = true;
						
						setTimeout(()=>{
							jumpers[i].hit = false;
							this.hit = false;
						}, 200);
					}
				}
			}
		}
		if(this.xvel > maxSpeedX) this.xvel = maxSpeedX;
		if(this.xvel < -maxSpeedX) this.xvel = -maxSpeedX
		if(this.yvel > maxSpeedY) this.yvel = maxSpeedY;
		if(this.yvel < -maxSpeedY) this.yvel = -maxSpeedY
		this.y += (this.y > canvas.height/6? this.yvel:this.yvel*4);
		this.x += (this.y > canvas.height/6 ? this.xvel : 0);
		if(this.alive == true) this.xvel+=(this.xvel<0?-1:1)*0.05
		if(this.fallStraight == true || (this.wallSlide && this.hitWall)) this.xvel = 0;

		this.rot += (this.y > canvas.height/6?this.xvel/2500:0);
		c.save();
		c.translate(this.x + this.body.naturalWidth/2, this.y + this.body.naturalHeight/2);
		if(this.xvel > 0) c.scale(-1, 1);
		c.rotate(this.rot);
		this.draw();
		c.restore();
		
		c.globalAlpha = this.globalAlpha;
		c.font = '30px PixelFont'
		c.fillStyle = 'white'
		c.fillText(this.name, this.x + this.body.naturalWidth/2 - c.measureText(this.name).width/2, this.y - this.body.naturalHeight/10);
		c.strokeStyle = 'black'
		c.strokeText(this.name, this.x + this.body.naturalWidth/2 - c.measureText(this.name).width/2, this.y - this.body.naturalHeight/10);
		if(this.hitFloor){
			if(this.calcScore) this.score = ((this.x + this.body.naturalWidth/2 < (targetX+target.naturalWidth*scaleFactor)) && (this.x + this.body.naturalWidth/2 > (targetX)) ? (100 - 100 * Math.abs((this.x + this.body.naturalWidth/2) - (targetX + target.naturalWidth/2*scaleFactor))/(target.naturalWidth*scaleFactor)*2).toFixed(2) : 0);
			c.fillStyle = 'black'
			c.fillStyle = 'red';
			this.calcScore = false;
			if(this.score > 0)c.fillText(this.score, this.x + this.body.naturalWidth/2 - c.measureText(this.score).width/2, this.y - this.body.naturalHeight/2+ (this.scaleY<1 && this.scaleY>0?(1 - this.scaleY)*(this.body.naturalHeight>this.body.naturalWidth?this.body.naturalHeight:this.body.naturalWidth):0));
		}
		c.globalAlpha = 1.0

		if(this.x >= canvas.width - this.body.naturalWidth && this.xvel > 0){
			this.xvel = (this.wallSlide?0:-this.xvel*0.7);
			this.hitWall = true;
		} else if(this.x <= 0 && this.xvel < 0){
			this.xvel = (this.wallSlide?0:-this.xvel*0.7);
			this.hitWall = true;
		}
		if(this.y >= canvas.height - this.body.naturalHeight){
			this.hitFloor = true;
		}
		globalIndex.forEach(e => {if(this.index > e) this.index--});
		if(this.hitFloor && this.alive){
			this.xvel = this.yvel = 0;
			this.alive = false
			this.playParticles = true;
			this.setParticles();
		}

		if(!this.alive && this.playParticles && this.score >= 0){
			if(this.score > minScoreForEffect){
				this.particles(); setTimeout(() => {this.finished = true}, 6000)
			} else if(this.score > 0){
				setTimeout(() => {this.finished = true;}, 5000);
			} else this.finished = true;
		}

		if(!this.alive && this.score > 0){
			this.xvel = targetDx;
		}

		console.log(this.score, highScore)

		if(this.score >= highScore && this.score != 0){
			highScore = this.score;
			this.globalAlpha = 1.0
		} else if(this.finished == true){
			this.playParticles = false;
			this.finished = false;
			this.globalAlpha = 0.2;
			//setTimeout(() => {this.kill()}, 5000);
		}
	}

	kill = () => {
		popArr.push(this.index);
		globalIndex.push(this.index);
		index--;
	}
}

class Plinker{
	constructor(body, x, xvel, yvel, index, name){
		this.body = body; //the image
		this.x = x; //x position
		this.y = -this.body.naturalHeight; //y position
		this.xvel = xvel * (Math.random() < 0.5 ? -1 : 1);//x velocity
		this.previ; //the previously hit object index
		this.rot = 0; //the rotation
		this.yvel = yvel; //the y velocity
		this.scaleX = 0;
		this.scaleY = 0;
		this.finished = false; //whether or not its grayed out yet
		this.playParticles = false //whether or not to show particle effect
		this.alive = true; //whether or not its hit the ground yet
		this.calcScore = true; //whether or not to calculate the score
		this.score = -1; //its score
		this.name = name; //its name
		this.hit = false; //whether or not its hit something
		this.globalAlpha = 1.0; //its grayed out value
		this.index = index; //the numbered index, for popArrP
		this.r = []; //this is the reflection vector for the physics collisions
		this.hitFloor = false; //whether or not its hit the floor
		this.collided = false; //whether or not its collided with anyhting
		this.collisionX = 0; //the x value of that collision
		this.collisionY = 0; //the y value of that collision
		this.i = 0; //the index of that collision
		this.p = []; //the particle array

		if(this.body.naturalHeight * 2 * scaleFactor > plinkSizing || this.body.naturalWidth * 2 * scaleFactor > plinkSizing){
			if(this.body.naturalHeight > this.body.naturalWidth){
				let sizing = plinkSizing / (this.body.naturalHeight*2) / 2;

				this.scaleX = sizing * scaleFactor;
				this.scaleY = sizing * scaleFactor;
			} else{
				let sizing = plinkSizing / (this.body.naturalWidth*2) / 2;

				this.scaleX = sizing * scaleFactor;
				this.scaleY = sizing * scaleFactor;
			}
		}

		console.log(this.body.naturalHeight, this.body.naturalWidth, plinkSizing, this.scaleX, this.body)
	}

	draw = () => {
		c.globalAlpha = this.globalAlpha
		c.scale(this.scaleX>0?this.scaleX:scaleFactor, this.scaleY>0?this.scaleY:scaleFactor)
		c.drawImage(this.body, -this.body.naturalWidth/2, -this.body.naturalHeight/2);
		c.globalAlpha = 1.0;
	}

	setParticles = () => {
		for(let i = 0; i < 10; i++){
			this.p.push({
				x: this.x + this.body.naturalWidth/2,
				y: this.y + this.body.naturalHeight/8,
				dx: ((Math.random()*2)) * (Math.random()<0.5?-1:1),
				dy: ((Math.random()*-1) - 1),
				r: Math.floor(Math.random()*9) + 1,
				color: `rgb(225, 225, 225)`
			})


		}	
	}

	particles = () => {
		
		for(let i = 0; i < this.p.length; i++){
			this.p[i].x += this.p[i].dx;
			this.p[i].y += this.p[i].dy;

			this.p[i].dy += 0.1;
			
			c.beginPath();
			c.arc(this.p[i].x, this.p[i].y, this.p[i].r, 0, 2*Math.PI);
			c.fillStyle = this.p[i].color;
			c.fill();

		
		
		

		}
	}

	checkCollisions = () => {
		for(let i = 0; i < plinkBoard.length; i++){
			let distX = ((this.x + this.body.naturalWidth*(this.scaleX>0?this.scaleX:scaleFactor)/2) - plinkBoard[i].x);
			let distY = (plinkBoard[i].y - (this.y + this.body.naturalHeight*(this.scaleY>0?this.scaleY:scaleFactor)/2));

			if(Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)) < plinkRadius/2 + (this.body.naturalWidth*(this.scaleX>0?this.scaleX:scaleFactor) + this.body.naturalHeight*(this.scaleY>0?this.scaleY:scaleFactor))/2){
				this.collided = true;
				this.collisionX = plinkBoard[i].x;
				this.collisionY = plinkBoard[i].y;
				this.i = i;
			}

			if(this.collided == true){
				break;
			}
		}
	}

	update = () => {
		this.checkCollisions();
		if(this.collided == true && this.previ != this.i){
			//use the equation r = d - 2(d * n)n
			//r is the reflected vector, d is the original
			//and n is the normalized plane at which the circle is being hit
			
			let d = [this.xvel, this.yvel];
			let normalizePortion = Math.sqrt(Math.pow(plinkBoard[this.i].x - this.x - this.body.naturalWidth*(this.scaleX>0?this.scaleX:scaleFactor)/2, 2) + Math.pow(plinkBoard[this.i].y - this.y - this.body.naturalHeight*(this.scaleY>0?this.scaleY:scaleFactor)/2, 2));
			let n = [this.body.naturalWidth*(this.scaleX>0?this.scaleX:scaleFactor)/2 + this.x - plinkBoard[this.i].x, plinkBoard[this.i].y - this.y - this.body.naturalHeight*(this.scaleY>0?this.scaleY:scaleFactor)/2];

			n[0] = n[0] / normalizePortion;
			n[1] = n[1] / normalizePortion;

			this.r = [d[0] - 2 * (d[0] * n[0]) * n[0], d[1] - 2 * (d[1] * n[1]) * n[1]];

			this.offsetX = this.x + this.body.naturalWidth*(this.scaleX>0?this.scaleX:scaleFactor)/2 - this.collisionX;
			this.offsetY = this.collisionY - this.y - this.body.naturalHeight*(this.scaleY>0?this.scaleY:scaleFactor)/2;
			let extra = ((plinkRadius/2 + (this.body.naturalWidth*(this.scaleX>0?this.scaleX:scaleFactor) + this.body.naturalHeight*(this.scaleY>0?this.scaleY:scaleFactor))/2) - Math.sqrt(Math.pow(this.offsetX, 2) + Math.pow(this.offsetY, 2)));

			let yExcess = Math.cos(Math.atan(this.offsetX/this.offsetY)) * extra/2;
			let xExcess = Math.sin(Math.atan(this.offsetX/this.offsetY)) * extra/2;

			if(this.r[0] > 2){
				this.r[0] = 2;
			} else if(this.r[0] < -2){
				this.r[0] = -2;
			}		
			if(this.r[1] > 2){
				this.r[1] = 2;
			} else if(this.r[1] < -2){
				this.r[1] = -2
			}
			

			this.y -= yExcess;
			this.x += xExcess;

			this.xvel = this.r[0]*1.5;
			this.yvel = (this.r[1]<0?this.r[1]*1.5:this.r[1])*1.5;
			this.collided = false;
			this.previ = this.i;
			
		} else if(this.collided == true) this.collided = false;


		for(let i = 0; i < plinkers.length; i++){
			if(this.index != i && plinkers[i].hitFloor == false && this.hitFloor == false && this.hit == false && plinkers[i].hit == false){
				if(this.x + this.body.naturalWidth*(this.scaleX>0?this.scaleX:scaleFactor) > plinkers[i].x && this.x + this.body.naturalWidth*(this.scaleX>0?this.scaleX:scaleFactor) < plinkers[i].x + plinkers[i].body.naturalWidth){
					if((this.y + this.body.naturalHeight*(this.scaleY>0?this.scaleY:scaleFactor) > plinkers[i].y && this.y + this.body.naturalHeight*(this.scaleY>0?this.scaleY:scaleFactor) < plinkers[i].y + plinkers[i].body.naturalHeight) || (this.y < plinkers[i].y + plinkers[i].naturalHeight && this.y > plinkers[i].y)){
						this.xvel = -this.xvel*0.7;
						plinkers[i].xvel = -plinkers[i].xvel*0.7

						this.hit = true;
						plinkers[i].hit = true;
						setTimeout(function(){
							this.hit = false;
							plinkers[i].hit = false
						}, 200);
					}
				}
			}
		}
		this.x += this.xvel;
		this.y += this.yvel;
		this.yvel += (this.alive?0.1:0);
		
		if(this.alive == true) this.xvel+=(this.xvel<0?-1:1)*0.01
		
		this.rot += (this.hitFloor?0:this.xvel/20);
		
		c.save();
		c.translate(this.x + this.body.naturalWidth/2, this.y + this.body.naturalHeight/2);
		c.rotate(this.rot);
		
		this.draw();

		c.restore();


		c.globalAlpha = this.globalAlpha;
		c.font = '30px PixelFont'
		c.fillStyle = 'white'
		c.fillText(this.name, this.x + this.body.naturalWidth/2 - c.measureText(this.name).width/2, this.y - this.body.naturalHeight/10);
		c.strokeStyle = 'black'
		c.strokeText(this.name, this.x + this.body.naturalWidth/2 - c.measureText(this.name).width/2, this.y - this.body.naturalHeight/10);
		if(this.hitFloor){
			if(this.calcScore) this.score = ((this.x + this.body.naturalWidth/2 < (targetX+target.naturalWidth*scaleFactor)) && (this.x + this.body.naturalWidth/2 > (targetX)) ? (100 - 100 * Math.abs((this.x + this.body.naturalWidth/2) - (targetX + target.naturalWidth/2*scaleFactor))/(target.naturalWidth*scaleFactor)*2).toFixed(2) : 0);
			c.fillStyle = 'black'
			c.fillStyle = 'red';
			this.calcScore = false;
			if(this.score>0)c.fillText(this.score, this.x + this.body.naturalWidth/2 - c.measureText(this.score).width/2, this.y - this.body.naturalHeight/2);
		}
		c.globalAlpha = 1.0
		
		if(this.x >= canvas.width - this.body.naturalWidth && this.xvel > 0){
			this.xvel = -this.xvel*0.7;
		} else if(this.x <= 0 && this.xvel < 0){
			this.xvel = -this.xvel*0.7;
		}
		if(this.y >= canvas.height - this.body.naturalHeight){
			this.hitFloor = true;
		}
		
		
		globalIndexP.forEach(e => {if(this.index > e) this.index--});
		
		
		if(this.hitFloor && this.alive){
			this.xvel = this.yvel = 0;
			this.alive = false
			this.playParticles = true;
			this.setParticles();
		}

		
		if(!this.alive && this.playParticles && this.score >= 0){
			if(this.score > minScoreForEffect){
				this.particles(); setTimeout(() => {this.finished = true}, 6000)
			} else if(this.score > 0){
				setTimeout(() => {this.finished = true;}, 5000);
			} else this.finished = true;
		}
		
		if(!this.alive && this.score > 0){
			this.xvel = targetDx;
		}

		console.log(this.score, highScore, highScore)

		if(this.score >= highScore && this.score != 0){
			highScore = this.score;
			this.globalAlpha = 1.0
		} else if(this.finished == true){
			this.playParticles = false;
			this.finished = false;
			this.globalAlpha = 0.2;
			//setTimeout(() => {this.kill()}, 5000);
		}
	}

	kill = () => {
		popArrP.push(this.index);
		globalIndexP.push(this.index);
		indexP--;
	}
}

let index = 0; //just keeps an index of which photo is being added in the array
let globalIndex = []; //this is an array I can explain, but its not really used
let jumpers = []; //an array to house all the parachute characters
let popArr = []; //the array of which characters to remove off the screen based on the globalIndex
let showTarg = false; //whether or not to show the target
let target = ""; //its set to "" when showTarg is false
let gameStarted = false; //whether or not the games started
let targetX = 0; //target's x position
let targetY = 0; //target's y position
let indexP = 0; //the same verision of index but for the Plinkers
let imagesP = []; //houses the images of the Plinkers
let popArrP = []; //same as the popArr, but for Plinkers
let globalIndexP = []; //same deal
let usernames = []; //all the usernames of the people who have played the game
let plinkers = []; //all the plinker players
let plinkRadius = 10*scaleFactor; //the radius of the plink balls
let plinkSizing = 0;
let plinkBoard = []; //an array to house the plink board


let lastCommandTime; //the last time a character was dropped or plinked (after 90 seconds shuts down game)

function addJumper(name, emote = "", emoji = ""){
	let tempEmoji;
	let image;
	if(emote.includes('http') && canPlayPara){
		image = new Image();
		image.src = emote;
		setTimeout(function(){
			images.push(image);
			jumpers.push(new Skydiver(images[index], Math.floor(Math.random()*canvas.width - images[index].naturalWidth), Math.floor(Math.random()*(maxSpeedX -minSpeedX) + minSpeedX), Math.floor(Math.random()*(maxSpeedY - minSpeedY) + minSpeedY), index, name));
			index++;
		}, 1000);
	} else if(emoji.includes('http') && canPlayPara){
		tempEmoji = new Image();
		tempEmoji.src = emoji;
		console.log(emoji, tempEmoji)
		setTimeout(function(){
			console.log('test')
			images.push(tempEmoji);
			jumpers.push(new Skydiver(images[index], Math.floor(Math.random()*canvas.width - images[index].naturalWidth), Math.floor(Math.random()*(maxSpeedX - minSpeedX) + minSpeedX), Math.floor(Math.random()*(maxSpeedY - minSpeedY) + minSpeedY), index, name));
			index++;
		}, 1000);
	} else if(canPlayPara){
		let temp = Math.floor(Math.random()*fallingMen.length);
		images.push(image);
		jumpers.push(new Skydiver(fallingMen[temp], Math.floor(Math.random()*canvas.width - fallingMen[temp].naturalWidth), Math.floor(Math.random()*(maxSpeedX - minSpeedX) + minSpeedX), Math.floor(Math.random()*(maxSpeedY - minSpeedY) + minSpeedY), index, name));
		index++;
	}
}

function addPlinker(name, emote = "", emoji = ""){
	let temp
	let tempEmoji;
	let tempEmote;
	let image; let addPhoto;
	if(emote.includes('http') && canPlayPlinko){
		tempEmote = new Image();
		tempEmote.src = emote;
		setTimeout(function(){
			imagesP.push(tempEmote);
			plinkers.push(new Plinker(imagesP[indexP], Math.floor(Math.random()*canvas.width - imagesP[indexP].naturalWidth), Math.floor(Math.random()*(maxSpeedX - minSpeedX) + minSpeedX), Math.floor(Math.random()*(maxSpeedY-minSpeedY) + minSpeedY), indexP, name));
			indexP++;
		}, 1000); addPhoto = tempEmote;
	} else if(emoji.includes('http') && canPlayPlinko){
		tempEmoji = new Image();
		tempEmoji.src = emoji;
		setTimeout(function(){
			imagesP.push(tempEmoji);
			plinkers.push(new Plinker(imagesP[indexP], Math.floor(Math.random()*canvas.width - imagesP[indexP].naturalWidth), Math.floor(Math.random()*(maxSpeedX - minSpeedX) + minSpeedX), Math.floor(Math.random()*(maxSpeedY-minSpeedY) + minSpeedY), indexP, name));
			indexP++;
		}, 1000); addPhoto = tempEmoji;
	} else if(canPlayPlinko){
		temp = Math.floor(Math.random()*fallingMen.length);
		imagesP.push(fallingMen[temp])
		plinkers.push(new Plinker(fallingMen[temp], Math.floor(Math.random()*canvas.width - fallingMen[temp].naturalWidth), Math.floor(Math.random()*(maxSpeedX-minSpeedX) + minSpeedX), Math.floor(Math.random()*(maxSpeedY - minSpeedY) + minSpeedY), indexP, name));
		indexP++;
		image = fallingMen[temp]
	}

	if(plinkBoard.length == 0 && canPlayPlinko){
		setTimeout(()=>{
			plinkSizing = (fallingMen[0].naturalHeight*scaleFactor*2)
			generatePlinkBoard(fallingMen[0]);
		}, 200);
	}
}

function drawPlinkBoard(){
	for(let i = 0; i < plinkBoard.length; i++){
		c.beginPath();
		c.arc(plinkBoard[i].x, plinkBoard[i].y, plinkRadius, 0, 2*Math.PI);
		c.fillStyle = 'rgba(0, 0, 0, 0.1)'
		c.fill();
	}
}

function getSrc(txt){
	let retText = "";

	if(txt.includes("http")){
		for(let i = 0; i<txt.length; i++){
			if(txt.slice(i, i+3) == 'src'){
				for(let j = i+5; ;j++){
					if(txt[j]!="\""){
						retText+=txt[j];
					} else{
						break;
					}
				}
			}
		}
	}

	return retText;
}

function generatePlinkBoard(image){
	setTimeout(function(){	
		let howManyFit = (canvas.width/(image.naturalWidth>image.naturalHeight?image.naturalWidth:image.naturalHeight)/(2*scaleFactor));
		let howManyFitY = (canvas.height/(image.naturalWidth>image.naturalHeight?image.naturalWidth:image.naturalHeight)/(2*scaleFactor));
		let spacing = (image.naturalHeight > image.naturalWidth?image.naturalHeight : image.naturalWidth)
		for(let i = 1; i < howManyFitY-1; i++){
			for(let j = 1; j < howManyFit+(i%2 == 1?-2:-1); j++){
				plinkBoard.push({
					x: (2*scaleFactor)*j*spacing+(i%2==1?spacing*scaleFactor:0),
					y: (2*scaleFactor)*i*spacing
				})
			}
		}
	}, 100);
}

function setTarget(){
	target = new Image()
	target.src = 'images/target.png';
	target.onload = function(){showTarg = true; targetX = Math.floor(Math.random()*(canvas.width - target.naturalWidth)); targetY = canvas.height - target.naturalHeight/1.15};
}

let targetDx = (movingTarget?1:0);

let playGame = () => {
	gameStarted = true;
	c.clearRect(0, 0, canvas.width, canvas.height);
	if(target == ""){
		setTarget();
		showTarg = true;
	} else if(showTarg == true){
		if(movingTarget){
			if(targetX + target.naturalWidth > canvas.width && targetDx > 0){
				targetDx = -1;
			} else if(targetX < 0 && targetDx < 0){
				targetDx = 1;
			}
		}
		targetX += targetDx;
		c.drawImage(target, targetX, targetY-target.naturalHeight/2, target.naturalWidth*scaleFactor, target.naturalHeight*scaleFactor);
	}
	if(jumpers.length != 0 && canPlayPara){
		popArr.sort(function(a, b){return a - b})
		popArr.reverse();
		popArr.forEach(e => {
			images.splice(e, 1); 
			jumpers.splice(e, 1);
		});
		popArr = [];
		jumpers.forEach(e => e.update());
		globaIndex = []
	}
	if(plinkers.length != 0 && canPlayPara){
		popArrP.sort(function(a, b){return a-b});
		popArrP.reverse();
		popArrP.forEach(e => {
			imagesP.splice(e, 1);
			plinkers.splice(e, 1);
		});
		popArrP = [];
		plinkers.forEach(e => e.update());
		globalIndexP = [];
		drawPlinkBoard();
	}
	if(Math.abs(lastCommandTime - Date.now()) > 90*1000){
		plinkers = [];
		popArr = [];
		popArrP = [];
		highScore = highScore = 0;
		jumpers = [];
		clearInterval(gameInterval);
		lastCommandTime = 0;
		gameStarted = false;
		gameInterval = "";
		usernames = [];
		c.clearRect(0, 0, canvas.width, canvas.height);
		showTarg = false;
		target = ""
	}
}

setTimeout(startGame, 2001);

setInterval(() => {
	addJumper('test');
	addJumper('test', getSrc(twitchEmoji.parse('Kappa', {emojiSize: 'large'})))
	addPlinker('test')
}, 2000)

function startGame(){gameInterval = setInterval(playGame, 16.7);}
