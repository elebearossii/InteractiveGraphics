"use strict";


var canvas;
var gl;

var numPositions  = 180;

var program;
var positions = [];
var colors = [];
var normalsArray=[];
var nMatrix, nMatrixLoc;


//ROTATION

var direction = true;
var speed = 100;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];
var thetaLoc;
var flag = false;

// VIEW AND PROJECTION 

var near = 2;
var far = 10.0;
var radius = 3.5;
var phi = 0.2;
var dr = 5.0 * Math.PI/180.0;
var theta_view = -35;
var scaling = 1;
var  fovy = 15.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1;       // Viewport aspect ratio
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye; 
const at = vec3(-0.1, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);



// SPOTLIGHT
var xDirection = 0;
var yDirection = 0;
var zDirection = -5;

var lightPosition = vec4(0, 0, -10, 1);
var SpotlightAmbient = vec4(0.9, 0.9, 0.9, 1.0 );
var SpotlightDiffuse = vec4(0.9, 0.9, 0.9, 1.0);
var spotLightSpecular = vec4(1, 1, 1, 1.0 );
var SpotlightDirection = vec4(xDirection , yDirection, zDirection, 0.0);

var constantAttenuation =  -0.1;
var spotLightAngle  = 10.0;
var spotLightCutOff = 50.0;

var enableSpotLight=0.0;

// MATERIAL
var materialAmbient = vec4(0.9, 0.9, 0.9, 1.0);
var materialDiffuse = vec4(0.9, 0.9, 0.9, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);



//TEXTURE
var texture;
var texture1;
var texture2;
var texCoordsArray = [];
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
var enableTexture=0.0;
var blur = 1.0;
var framebuffer;
var depthBuffer;
var renderbuffer;
var buffer;
var i = 0;


//SWITCH
var changeShading = true;

var vertices = [

    //piano
    vec4(-0.8, -0.05,  0.5, 1.0), //A 0
    vec4(-0.8,  0.08,  0.5, 1.0), //B 1
    vec4(0.8,  0.08,  0.5, 1.0), //C 2
    vec4(0.8, -0.05,  0.5, 1.0), //D 3
    vec4(-0.8, -0.05, -0.5, 1.0), //E 4
    vec4(-0.8,  0.08, -0.5, 1.0), //F 5
    vec4(0.8,  0.08, -0.5, 1.0), //G 6
    vec4(0.8, -0.05, -0.5, 1.0), //H 7

    //prima gamba, vertice in comune A
    //A(-1,-1,1)
    vec4(-0.8, -0.5,  0.5, 1.0), //p1 8
    vec4(-0.6,-0.05, 0.5, 1.0), // a2 9
    vec4(-0.6,-0.5, 0.5, 1.0), //p2 10
    vec4(-0.8,-0.05, 0.35, 1.0),//a4 11
    vec4(-0.8,-0.5, 0.35, 1.0),//p4 12
    vec4(-0.6,-0.5, 0.35, 1.0), //p3 13
    vec4(-0.6,-0.05, 0.35, 1.0), //a3 14

    //seconda gamba vertice in comune D
    //D(1,-1,1)
   vec4(0.6, -0.05, 0.5, 1.0), //a1 15
   vec4(0.8, -0.5, 0.5, 1.0),//p2 16
   vec4(0.6,-0.5,0.5,1.0), //p1 17
   vec4(0.8,-0.05,0.35,1.0),//a3 18
   vec4(0.8,-0.5,0.35,1.0),//p3 19
   vec4(0.6,-0.05,0.35,1.0),//a4 20
   vec4(0.6,-0.5,0.35,1.0),//p4 21

   //terza gamba vertice in comune H
    //D(1,-1,-1)

    vec4(0.8,-0.5,-0.5, 1.0), //p3 22
    vec4(0.6,-0.05,-0.5,1.0), //a4 23
    vec4(0.6,-0.5,-0.5,1.0), //p4 24
    vec4(0.8,-0.05,-0.35,1.0), //a2 25
    vec4(0.8,-0.5,-0.35,1.0), //p2 26
    vec4(0.6,-0.05,-0.35,1.0), //a1 27
    vec4(0.6, -0.5, -0.35, 1.0), //p1 28

    //quarta gamba vertice in comune E
    //E(-1,-1,-1)

    vec4(-0.8,-0.5,-0.5,1.0), //p4 29
    vec4(-0.6, -0.05,-0.5,1.0), //a3 30
    vec4(-0.6, -0.5,-0.5,1.0), //p3 31
    vec4(-0.8,-0.05,-0.35,1.0), //a1  32
    vec4(-0.6, -0.05,-0.35,1.0), //a2 33
    vec4(-0.8,-0.5,-0.35,1.0), //p1 34
    vec4(-0.6, -0.5,-0.35,1.0) //p2 35

    

    
];

var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 0.0, 0.0, 1.0),  // red
];


init();

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 0);
    
}




// Allocate a frame buffer object
//gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);
// Attach color buffer
//gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fb, 0);
// check for completeness
//var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
//if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');
//gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    

/*
function configureTexture(image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    //gl.uniform1i(gl.getUniformLocation(program, "uBlurEffect"), 0);
   
  }
*/
function init()
{

   
    
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    
    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.6, 0.3, 0.3, 0.5);

    gl.enable(gl.DEPTH_TEST);

    //FRAMEBUFFER 
    
   
    texture1 = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 600, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);    
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );    
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    framebuffer.width = 512;
    framebuffer.height = 600;
    renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 600);
   // Attach color buffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    
   // check for completeness
      var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');
   
    //FINE FRAMEBUFFER

    
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);
   
    //var cBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    //var colorLoc = gl.getAttribLocation( program, "aColor" );
    //gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( colorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
 
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);


    thetaLoc = gl.getUniformLocation(program, "uTheta");
    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    
    
   
     //LIGHT
    //gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPosition );
    gl.uniform4fv(gl.getUniformLocation(program, 'uMaterialAmbient'), 
    flatten(materialAmbient)) ;// TO DO: change

    // spotlight x material
    var ambientProductSpotlight  =  mult(SpotlightAmbient, materialAmbient);
    var diffuseProductSpotlight  =  mult(SpotlightDiffuse, materialDiffuse);
    var A = mult(ambientProductSpotlight, materialAmbient);
    var SpotSpecularProduct = mult(spotLightSpecular, materialSpecular);

    //SWITCH
    document.getElementById("ShadingButton").onclick = function(){
        console.log("cambio shader");
        changeShading = !changeShading;};

    //LIGHT AND MATERIAL
    gl.uniform4fv(gl.getUniformLocation(program, 'uAmbientProductSpotlight'), flatten(ambientProductSpotlight))
    gl.uniform4fv(gl.getUniformLocation(program, 'uDiffuseProductSpotlight'), flatten(diffuseProductSpotlight))
    gl.uniform4fv(gl.getUniformLocation(program, "A"),flatten(A));
    gl.uniform4fv(gl.getUniformLocation(program,"uMaterialDiffuse"),flatten(materialDiffuse));
    gl.uniform4fv( gl.getUniformLocation(program, "uSpotSpecularProduct"), SpotSpecularProduct);
    

    // TEXTURE 
    //
    // Initialize a texture
    //

    var image = new Image();
    image.onload = function() {
       configureTexture( image );
    }
    image.src = "WoodTexture.png"

    //var image = document.getElementById("texImage");
    //configureTexture(image);
     
    
   
    //event listeners for buttons
    //ROTATION

    document.getElementById( "xButton" ).onclick = function () {axis = xAxis;};
    document.getElementById( "yButton" ).onclick = function () {axis = yAxis;};
    document.getElementById( "zButton" ).onclick = function () {axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("Direction").onclick = function (event) {direction = !direction;}
    
    
    
    //VIEW AND PROJECTION
    document.getElementById("ButtonZZ").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("ButtonZ").onclick = function(){near *= 0.9; far *= 0.9;};
    document.getElementById("radiusSlider").onchange = function(event) {radius = event.target.value;};
    document.getElementById("phiSlider").onchange = function(event) {phi = event.target.value* Math.PI/180.0;};
    document.getElementById("aspectSlider").onchange = function(event) {aspect = event.target.value;};
    document.getElementById("fovSlider").onchange = function(event) {fovy = event.target.value;};
    document.getElementById("thetaSlider").onchange = function(event) {theta_view = event.target.value* Math.PI/180.0;};

    //SPOTLIGHT
    document.getElementById("spotLightCutOff").oninput =  function(event){spotLightCutOff = event.target.value};
    document.getElementById("spotAngle").oninput =  function(event){ spotLightAngle = event.target.value};
    document.getElementById("EnableSpotLight").onclick = function(){
        if(enableSpotLight == 1.0){ enableSpotLight = 0.0 }
        else{enableSpotLight = 1.0}
    
    };
    document.getElementById("xDirection").onchange = function(event) {
        xDirection = event.target.value;
        SpotlightDirection[0] = xDirection;
        
    };
    document.getElementById("yDirection").onchange = function(event) {
        yDirection = event.target.value;
        SpotlightDirection[1] = yDirection;
       
    };
    document.getElementById("zDirection").onchange = function(event) {
        zDirection = event.target.value;
        SpotlightDirection[2] = zDirection;
    
    };
    
    
    //TEXTURE
    document.getElementById("EnableTexture").onclick = function(){
        if(enableTexture == 1.0){ enableTexture = 0.0 }
        else{enableTexture = 1.0}
    
    };
    document.getElementById("BlurButton").onclick = function(){
       if(blur== 1.0){ 
            
         // Bind FBO and render
         gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
         gl.viewport(0, 0, 512, 600);
         //gl.bindTexture(gl.TEXTURE_2D,texture);
         //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
         gl.bindTexture(gl.TEXTURE_2D, texture);
         gl.clear( gl.COLOR_BUFFER_BIT);
         gl.drawArrays(gl.TRIANGLES, 0, numPositions);
       }
        
       else{blur=0.0;}
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   
    }
    render();
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);

    quad(0,8,10,9);
    quad(12,11,14,13);
    quad(8,10,13,12);
    quad(14,9,10,13);
    quad(8,12,11,0);
    quad(0,9,14,11);

    quad(15,17,16,3);
    quad(21,20,18,19);
    quad(17,16,19,21);
    quad(18,3,16,19);
    quad(17,21,20,15);
    quad(15,3,18,20);

    quad(27,28,26,25);
    quad(24,23,7,22);
    quad(28,26,22,24);
    quad(7,25,26,22);
    quad(28,24,23,27);
    quad(27,25,7,23);

    quad(32,34,35,33);
    quad(29,4,30,31);
    quad(34,35,31,29);
    quad(30,33,35,31);
    quad(34,29,4,32);
    quad(32,33,30,4);


}

function quad(a, b, c, d)
{
     
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);


    positions.push(vertices[a]);
    normalsArray.push(normal);
    //colors.push(vertexColors[a])
    texCoordsArray.push(texCoord[0]);


    positions.push(vertices[b]);
    normalsArray.push(normal);
    //colors.push(vertexColors[b])
    texCoordsArray.push(texCoord[1]);


    positions.push(vertices[c]);
    normalsArray.push(normal);
    //colors.push(vertexColors[c])
    texCoordsArray.push(texCoord[2]);
    
    
    positions.push(vertices[a]);
    normalsArray.push(normal);
    //colors.push(vertexColors[a])
    texCoordsArray.push(texCoord[0]);
    
    
    positions.push(vertices[c]);
    normalsArray.push(normal);
    //colors.push(vertexColors[c])
    texCoordsArray.push(texCoord[2]);

    
    positions.push(vertices[d]);
    normalsArray.push(normal);
    //colors.push(vertexColors[d])
    texCoordsArray.push(texCoord[3]);
    
}
    
    
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //ROTATION
    if(flag) theta[axis] += (direction ? 2 : -2);
    gl.uniform3fv(thetaLoc, theta);

    //VIEW AND PROJECTION
    eye = vec3(radius*Math.sin(theta_view)*Math.cos(phi),
                radius*Math.sin(theta_view)*Math.sin(phi),
                radius*Math.cos(theta_view));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    modelViewMatrix = mult(modelViewMatrix, translate(-0.6, -0.05, 0.35));
    modelViewMatrix = mult(modelViewMatrix, scale(scaling, scaling, scaling));

    //LIGHT
    gl.uniform1f(gl.getUniformLocation(program,"spotLightCutOff"),spotLightCutOff);
    gl.uniform1f(gl.getUniformLocation(program,"spotLightAngle")  ,spotLightAngle);
    gl.uniform1f(gl.getUniformLocation(program,"uConstantAttenuation"), constantAttenuation);
    gl.uniform4fv(gl.getUniformLocation(program, 'uSpotlightDirection'), flatten(SpotlightDirection));
   
    
    //TEXTURE
    gl.uniform1f( gl.getUniformLocation(program,"turnOn"), enableTexture );
    gl.uniform1f( gl.getUniformLocation(program,"off"), enableSpotLight );
    // gl.uniform1f( gl.getUniformLocation(program,"blur"), blur );
    // render to texture

    gl.useProgram(program);
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);
   
    //SWITCH
    gl.uniform1f(gl.getUniformLocation(program, "changeShading"),changeShading);

   
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    //gl.drawArraysInstanced(gl.TRIANGLES, 0, index, 1);
    requestAnimationFrame(render);
    
}


