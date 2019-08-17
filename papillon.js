let positionBuffer;
let texCoordBuffer;

function createPapillon(x, y){
  var target = getTarget();
  if(target){
    papillons.push( new Papillon(x, y, target[0], target[1], 1, false) );
  }
  else{
    papillons.push( new Papillon(x, y, random(-1,1), random(-1,1), 1, true) );
  }
}

class Papillon {

  constructor(x, y, targetX, targetY, wingSize, bEphemere) {
    //Set
    this.pos = new Vector(x, y, 0);
    this.wingSize = wingSize;
    this.age = 0;
		this.target = new Vector(targetX, targetY, 0);
    this.speed = 0.2;
    this.ephemere = bEphemere;
    this.noiseSeed = Math.random()*1000;
    this.remove = false;
    //Parameters that you can play around with
    this.wingsPuls = 7;                 // Vitesse du battement d'aile
    this.wingsMaxRotation = 0.08*TAU;   // Amplitude du battement d'aile
		this.motifPow = random(-0.25, 1.2); // Paramètre qui génère le motif sur les ailes
		this.wingShapePow = random(0.5, 3); // Idem
      //Motif offset
    var xOff = random(0,1);             
    var yOff = random(-0.36+xOff*1.1,xOff*0.9); 
    this.motifOffset = [xOff,yOff];     //Idem
      //
    this.motifNoiseOffset = [random(0,10),random(0,10)]; //Idem
      //
    var h = random(0,1);                //Teinte de l'aile
    this.baseColor = HSVtoRGB(h,random(0.6,0.95),random(0.6,0.95)); //Teinte saturation luminosité
    var h2 = h+0.5+random(-0.15,0.15); //Teinte du motif (couleur complémentaire)
    this.tacheColor = HSVtoRGB(h2-Math.floor(h2),random(0.6,0.8),random(0.5,0.7));
  }
	
	drawRightWing(modelMatrix){
    // Bind shader
    gl.useProgram(rightWingShader);
    // Set uniforms
    setUniform1f(rightWingShader,"u_motifPow",this.motifPow);
    setUniform1f(rightWingShader,"u_wingShapePow",this.wingShapePow);
    setUniform2f(rightWingShader,"u_motifOffset",this.motifOffset[0],this.motifOffset[1]);
    setUniform2f(rightWingShader,"u_motifNoiseOffset",this.motifNoiseOffset[0],this.motifNoiseOffset[1]);
    setUniform3f(rightWingShader,"u_baseColor",this.baseColor[0],this.baseColor[1],this.baseColor[2]);
    setUniform3f(rightWingShader,"u_tacheColor",this.tacheColor[0],this.tacheColor[1],this.tacheColor[2]);
    // Transparency
    if(!this.ephemere){
      setUniform1f(rightWingShader,"u_alpha",1.0);
    }
    else{
      var alpha = 1-smoothstep(this.age,2,5);
      setUniform1f(rightWingShader,"u_alpha",alpha);
      if( alpha < 0.00001 ){
        this.remove = true;
      }
    }
    // Matrix
    gl.uniformMatrix4fv(mvpLocation, false, modelMatrix);
    // Bind position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocationWing, 2, gl.FLOAT, false, 0, 0);
    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  show(viewMatrix) {
    // Battement d'aile
    var wingAngle = this.wingsMaxRotation * Math.sin(this.age * this.wingsPuls);
    // Model matrices
    var modelMatrixRight = m4.translation(this.pos.x, this.pos.y, this.pos.z);                      //Translate
    modelMatrixRight = m4.multiply(modelMatrixRight, m4.scaling(this.wingSize, this.wingSize, 1));  //Scale
    modelMatrixRight = m4.multiply(modelMatrixRight, m4.xRotation(-0.1*TAU));                       //Penche en avant parce que ça rend mieux
    modelMatrixRight = m4.multiply(modelMatrixRight, m4.scaling(1,-1,1));                           //Flip upside down because it looks better
    var modelMatrixLeft = modelMatrixRight;
    modelMatrixRight = m4.multiply(modelMatrixRight, m4.yRotation(wingAngle));                      //Rotation du battement d'aile
    modelMatrixLeft = m4.multiply(modelMatrixLeft, m4.scaling(-1,1,1));                             //Symétrie verticale pour faire l'aile gauche
    modelMatrixLeft = m4.multiply(modelMatrixLeft, m4.yRotation(wingAngle));                        //Battement d'aile de l'aile gauche
    // Draw
    this.drawRightWing(m4.multiply(modelMatrixRight,viewMatrix));
    this.drawRightWing(m4.multiply(modelMatrixLeft,viewMatrix));
  }

  update(dt) {
    this.age += dt;
    //Move towards the target
    var dir = this.target.subtract(this.pos);
    dir = dir.rotateZ(noise.noise2D(this.age,this.noiseSeed) * 0.2 * TAU * (1-Math.min(this.age*0.2,1)) );
    var dist = dir.length();
    dir = dir.multiply(1 / dist);
    dir = dir.multiply(dt * this.speed * smoothstep(dist,0,0.2));
    this.pos = this.pos.add(dir);
  }

}

function generateBuffers(){
    //Position
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var xMin = 0;
    var yMin = -0.5 ;
    var xMax = 1/whRatio;
    var yMax = 0.5;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      xMin, yMax,
      xMin, yMin,
      xMax, yMax,

      xMax, yMax,
      xMax, yMin,
      xMin, yMin
    ]), gl.STATIC_DRAW);

    //Texture coordinates
    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
   
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 1,
      0, 0,
      1, 1,

      1, 1,
      1, 0,
      0, 0
    ]), gl.STATIC_DRAW);
}