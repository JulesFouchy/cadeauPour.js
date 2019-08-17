let canvas;
let gl;

let backgroundShader;
let rightWingShader;

let positionAttributeLocationBG;
let positionAttributeLocationWing;
let texCoordLocation;
let mvpLocation;

let whRatio;

let papillons;

let noise;

let viewMatrix;
let currentScale;

let zoomOut;

function setup(){
	// Get A WebGL context
	canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl");
	if (!gl) {
		console.log("noWEBGL :0");
	  	return;
	}
	else{
		console.log("WEBGL !");
	}
	//Set clear color
	gl.clearColor(0, 0, 0, 0);
	//Enable transparency
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	//Initialize a few things
	noise = new SimplexNoise();
	setupBackground();
	// Initialize variables
    papillons = [];
    zoomOut = false;
	glLocations = {};
	//Initialize view matrix
	currentScale = 1;
	viewMatrix = m4.identity();
	//Load shaders
	backgroundShader = loadShader("vertex-shader","background-frag");
	rightWingShader = loadShader("texture-vert","rightWing-frag");
	//Get attributes and uniforms locations
	positionAttributeLocationBG = gl.getAttribLocation(backgroundShader, "a_position");
	positionAttributeLocationWing = gl.getAttribLocation(rightWingShader, "a_position");
	texCoordLocation = gl.getAttribLocation(rightWingShader, "a_texcoord");
	mvpLocation = gl.getUniformLocation(rightWingShader,"u_mvp");
	//Set window size properly
	window.onresize();
}

function draw(now){
	//Get time since last frame
	now *= 0.001; //conversion in seconds
	var dt = now - lastTime;
	lastTime = now;
  	// Clear the canvas
  	gl.clear(gl.COLOR_BUFFER_BIT);
	drawBackground();
	//Draw the papiiiiillons <3 <3 :3
	for( var k = 0; k < papillons.length; ++k){
		papillons[k].show(viewMatrix);
		papillons[k].update(dt);
		if(papillons[k].remove){
			papillons.splice(k,1);
		}
	}
	//Zoom out
	if( zoomOut ){
		currentScale = Math.max(currentScale*(1-0.1*dt),0.2);
		viewMatrix = m4.scaling(currentScale,currentScale,1);
		if( currentScale < 0.200001 ){
			zoomOut = false;
		}
	}
	//Loop again
	requestAnimationFrame(draw);
}

window.onresize = function(event) {
	//Update width and height
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
    whRatio = canvas.width / canvas.height;
    //Update gl
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    //Regenerate buffers
    generateBuffers();
};

window.onmousedown = function(event){
	createPapillon(event.pageX/canvas.width*2-1, 1-event.pageY/canvas.height*2);
	if( papillons.length == 15 ){
		zoomOut = true;
	}
}

window.onkeydown = function(event){
	//For debug only. No cheating for you ! ;)
	/*if(event.key == 'a'){
		while(targetPositions.length>0){
			createPapillon(random(-1,1),random(-1,1));
		}
	}*/
}

window.onwheel = function(event){
	if( event.deltaY < 0 ){
		currentScale *= 1.05;
	}
	else{
		currentScale = Math.max(currentScale*0.95,0.2);
	}
	viewMatrix = m4.scaling(currentScale,currentScale,1);
}

setup();
let lastTime = 0;
requestAnimationFrame(draw);