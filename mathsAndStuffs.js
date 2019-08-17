/* -------------- MY_MATHS ------------------------------------------------------------*/
const TAU = 6.28318530717958647692; // = 2*PI mais TAU est une constante beaucoup mieux choisie. Plus d'info sur le débat PI vs TAU : https://www.youtube.com/watch?v=ZPv1UV0rD8U et partout sur internet 

function random(a, b){
  return Math.random()*(b-a)+a;
}

function smoothstep(x, a, b){
  //smoothly maps x from the interval [a,b] to [0,1] (function with continuous derivative)
  //View and play around with the function here : https://www.geogebra.org/classic/nsbg7d5n
  if( x < a ){
    return 0;
  }
  else if( x > b ){
    return 1;
  }
  var oneOver = 1/(b-a);
  var oneOverCubed = Math.pow(oneOver,3);
  var alpha = -2 * oneOverCubed;
  var beta = (a+b) * oneOverCubed;
  return (x-a)*((x-b)*(alpha*x+beta)+oneOver);
}

/* -------------- COLORS ------------------------------------------------------------*/

//https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [r,g,b];
}

/* --------------SHADERS UNIFORMS and BACKGROUND------------------------------------------*/
//https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function loadShader(vertex, fragment){
    // Get the strings for our GLSL shaders
    var vertexShaderSource = document.getElementById(vertex).text;
    var fragmentShaderSource = document.getElementById(fragment).text;

    // create GLSL shaders, upload the GLSL source, compile the shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link the two shaders into a program
    return createProgram(gl, vertexShader, fragmentShader);
}

let glLocations;

function getUniformLocation(shader,uniformName){
  var uniformLocation;
  if( glLocations.hasOwnProperty(uniformName) ){
    uniformLocation = glLocations[uniformName];
  }
  else{
    uniformLocation = gl.getUniformLocation(shader, uniformName);
    glLocations[uniformName] = uniformLocation;
  }
  return uniformLocation;
}

function setUniform1f(shader,uniformName,value){
  var uniformLocation = getUniformLocation(shader,uniformName);
  gl.uniform1f(uniformLocation, value);
}

function setUniform2f(shader,uniformName,v1,v2){
  var uniformLocation = getUniformLocation(shader,uniformName);
  gl.uniform2f(uniformLocation, v1, v2);
}

function setUniform3f(shader,uniformName,v1,v2,v3){
  var uniformLocation = getUniformLocation(shader,uniformName);
  gl.uniform3f(uniformLocation, v1, v2, v3);
}

let bgPositionBuffer;

function setupBackground(){
  bgPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bgPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    -1, 1,
    1, -1,

    1, -1,
    1, 1,
    -1, 1
  ]), gl.STATIC_DRAW);
}

function drawBackground(){
  gl.useProgram(backgroundShader);
  gl.enableVertexAttribArray(positionAttributeLocationBG);
  gl.bindBuffer(gl.ARRAY_BUFFER, bgPositionBuffer);
  gl.vertexAttribPointer(positionAttributeLocationBG, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

/* -------------- VECTORS ------------------------------------------*/

//https://evanw.github.io/lightgl.js/docs/vector.html

function Vector(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Vector.prototype = {
  negative: function() {
    return new Vector(-this.x, -this.y, -this.z);
  },
  add: function(v) {
    if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    else return new Vector(this.x + v, this.y + v, this.z + v);
  },
  subtract: function(v) {
    if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    else return new Vector(this.x - v, this.y - v, this.z - v);
  },
  multiply: function(v) {
    if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
    else return new Vector(this.x * v, this.y * v, this.z * v);
  },
  divide: function(v) {
    if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
    else return new Vector(this.x / v, this.y / v, this.z / v);
  },
  equals: function(v) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  cross: function(v) {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  },
  length: function() {
    return Math.sqrt(this.dot(this));
  },
  unit: function() {
    return this.divide(this.length());
  },
  min: function() {
    return Math.min(Math.min(this.x, this.y), this.z);
  },
  max: function() {
    return Math.max(Math.max(this.x, this.y), this.z);
  },
  toAngles: function() {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length())
    };
  },
  rotateZ: function(angle){
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    return new Vector(
      this.x *   cos  + this.y * sin,
      this.x * (-sin) + this.y * cos,
      this.z
    );
  },
  angleTo: function(a) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  },
  toArray: function(n) {
    return [this.x, this.y, this.z].slice(0, n || 3);
  },
  clone: function() {
    return new Vector(this.x, this.y, this.z);
  },
  init: function(x, y, z) {
    this.x = x; this.y = y; this.z = z;
    return this;
  }
};

Vector.negative = function(a, b) {
  b.x = -a.x; b.y = -a.y; b.z = -a.z;
  return b;
};
Vector.add = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x + b.x; c.y = a.y + b.y; c.z = a.z + b.z; }
  else { c.x = a.x + b; c.y = a.y + b; c.z = a.z + b; }
  return c;
};
Vector.subtract = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x - b.x; c.y = a.y - b.y; c.z = a.z - b.z; }
  else { c.x = a.x - b; c.y = a.y - b; c.z = a.z - b; }
  return c;
};
Vector.multiply = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x * b.x; c.y = a.y * b.y; c.z = a.z * b.z; }
  else { c.x = a.x * b; c.y = a.y * b; c.z = a.z * b; }
  return c;
};
Vector.divide = function(a, b, c) {
  if (b instanceof Vector) { c.x = a.x / b.x; c.y = a.y / b.y; c.z = a.z / b.z; }
  else { c.x = a.x / b; c.y = a.y / b; c.z = a.z / b; }
  return c;
};
Vector.cross = function(a, b, c) {
  c.x = a.y * b.z - a.z * b.y;
  c.y = a.z * b.x - a.x * b.z;
  c.z = a.x * b.y - a.y * b.x;
  return c;
};
Vector.unit = function(a, b) {
  var length = a.length();
  b.x = a.x / length;
  b.y = a.y / length;
  b.z = a.z / length;
  return b;
};
Vector.fromAngles = function(theta, phi) {
  return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
};
Vector.randomDirection = function() {
  return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
};
Vector.min = function(a, b) {
  return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
};
Vector.max = function(a, b) {
  return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
};
Vector.lerp = function(a, b, fraction) {
  return b.subtract(a).multiply(fraction).add(a);
};
Vector.fromArray = function(a) {
  return new Vector(a[0], a[1], a[2]);
};
Vector.angleBetween = function(a, b) {
  return a.angleTo(b);
};