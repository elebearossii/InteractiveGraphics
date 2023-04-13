
"use strict";
var kangaroo = function(){
var canvas;
var gl;
var program;
var projectionMatrix;
var modelViewMatrix;
var nMatrix;

var instanceMatrix;

var modelViewMatrixLoc;
var projectionMatrixLoc ;

var Kanimation = false;


var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

// VIEW POSITION ----------------------------------------------------- 
var radius = 0.1;
var theta_view = 1.9953981633974475;
var phi =2.8; 
var dr = 5.0 * Math.PI/180.0;
//var theta_view = 0.7;

// position of the camera
var eye;
   var eye_x;
   var eye_y;
   var eye_z;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
// ---------------------------------------------------------------------


//TEXTURE----------------------------------------------------------------------------
var texSize =  400;
var texSizeF =  400;

var ChooseTexture;
var tBuffer;
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
var texCoordsArray = [];
var grassTexture;
var faceTexture;


function configureGrassTexture() {
    grassTexture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, grassTexture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, grassDrawing);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}
function configureFaceTexture() {
    faceTexture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, faceTexture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, faceDrawing);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    }

var grassDrawing = new Uint8Array(4*texSize*texSize);
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j <texSize; j++) {
        grassDrawing[4*i*texSize+4*j] = 300;
        grassDrawing[4*i*texSize+4*j+1] = 150*(0.1*i+j);
        grassDrawing[4*i*texSize+4*j+2] = (0.2*i);
        grassDrawing[4*i*texSize+4*j+3] = 200;
       }
}

var faceDrawing = new Uint8Array(4*texSizeF*texSizeF);
for (var i = 0; i < texSizeF; i++) {
    for (var j = 0; j <texSizeF; j++) {
        faceDrawing[4*i*texSizeF+4*j] = 200;
        faceDrawing[4*i*texSizeF+4*j+1] = 400;
        faceDrawing[4*i*texSizeF+4*j+2] = 100;
        faceDrawing[4*i*texSizeF+4*j+3] = 255;
       }
}

//--------------------------------------------------------------------------
//BUMP TEXTURE-------------------------------------------------------------
var normal = vec4(0.0, 1.0, 0.0, 1.0);
var tangent = vec3(0.0, 1.0, 0.0);
var lightPosition = vec4(0.0, 2.0, 1.0, 1.0);
var lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
var materialDiffuse = vec4(0.2, 0.3, 0.2, 1.0);

// Bump Data

var texSizeBump =20;
var data = new Array()
    for (var i = 0; i<= texSizeBump; i++)  data[i] = new Array();
    for (var i = 0; i<= texSizeBump; i++) for (var j=0; j<=texSizeBump; j++)
        data[i][j] = Math.random()*100;

// Bump Map Normals

var normalst = new Array()
    for (var i=0; i<texSizeBump; i++)  normalst[i] = new Array();
    for (var i=0; i<texSizeBump; i++) for ( var j = 0; j < texSizeBump; j++)
        normalst[i][j] = new Array();
    for (var i=0; i<texSizeBump; i++) for ( var j = 0; j < texSizeBump; j++) {
        normalst[i][j][0] = data[i][j]-data[i+1][j];
        normalst[i][j][1] = data[i][j]-data[i][j+1];
        normalst[i][j][2] = 1;
    }

// Scale to Texture Coordinates

    for (var i=0; i<texSizeBump; i++) for (var j=0; j<texSizeBump; j++) {
       var d = 0;
       for(k=0;k<3;k++) d+=normalst[i][j][k]*normalst[i][j][k];
       d = Math.sqrt(d);
       for(k=0;k<3;k++) normalst[i][j][k]= 0.5*normalst[i][j][k]/d + 0.5;
    }

// Normal Texture Array

var normals = new Uint8Array(3*texSizeBump*texSizeBump);
    for (var i = 0; i < texSizeBump; i++)
        for (var j = 0; j < texSizeBump; j++)
           for(var k= 0; k<3; k++)
                normals[3*texSizeBump*i+3*j+k] = 255*normalst[i][j][k];



function configureTexture( image ) {
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSizeBump, texSizeBump, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

}
var time=0;
//-------------------------------------------------------------------------


//Hill------------------------------------------------------
var nRows = 60;
var nColumns = 60;
var colorLoc;
const green = vec4(0.3, 0.9, 0.2, 1.0);
const brown = vec4(0.9, 0.4, 0.3, 1.0);

// data for radial hat function: sin(Pi*r)/(Pi*r)

var dataHill = new Array(nRows);
    for(var i =0; i<nRows; i++) dataHill[i]=new Array(nColumns);
    
    for(var i=0; i<nRows; i++) {
        var x = Math.PI*(4*i/nRows-2.0);
        for(var j=0; j<nColumns; j++) {
            var y = Math.PI*(4*j/nRows-2.0);
            var r = Math.sqrt(x*x+y*y)
    
            // take care of 0/0 for r = 0

            if(r) dataHill[i][j] = Math.sin(r)/r;
            else dataHill[i][j] = 1;
        }
    }

//--------------------------------------------------------


var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var torso2Id = 11;
var neckId = 12;
//orecchie
var earSxId = 13;
var earDxId = 14;
//coda
var tailId = 15;
var tail2Id = 16;
var tail3Id = 17;
//cosce
var cosciaDxId = 18;
var cosciaSxId = 19;
//prato
var grassId = 20;
var HillId = 21;

var torsoOrientationId=22;
var torsoOrientationZId=23;




var torsoHeight = 5.0;
var torsoWidth = 2.0;
var upperArmHeight = 2.2;
var lowerArmHeight = 0.9;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.5;
var upperLegHeight = 2.5;
var headHeight = 2.3;
var headWidth = 1.1;
var torso2Height = 2.5;
var torso2Width = 2.5;
var neckHeight = 2.0;
var neckWidth = 1.0;

//orecchie
var earWidth = 0.5;
var earHeight = 2.0;

//coda
var tailHeight = 5;
var tailWidth = 1.5;

var tail2Height = 3.0;
var tail2Width = 1.0;

var tail3Height = 2.0;
var tail3Width = 0.5;
//cosce
var cosciaDxHeight= 2.5;
var cosciaDxWidth= 1.0;

//prato
var grassWidth = 90;
var grassHeight = 0.5;
var HillWidth = 8.0;
var HillHeight = 6.5;


var numNodes = 100;
var numAngles = 100;
var angle = 0;

var theta = [30, 90, 110, 0, 110, 0, 190, -100, 190, -100, 0, 0,
     -30 //COLLO
     , -90 //EARSX
     , -90  //EARDX
     , 10 //CODA1
     , 10  //CODA2  
     , 20  //CODA3
     , -30 //COSCIADX
     , -30 //CosciaSX
     , 0  //Grass
     , 0  //Hill  
     , 0
     , 0
     , 0
    ];

var numVertices = 700;

var stack = [];

var figure = [];
var grassField = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);
for( var i=0; i<numNodes; i++) grassField[i] = createNode(null, null, null, null);


var vBuffer;
var modelViewLoc;

var pointsArray = [];
var normalsArray = [];

var kPosition=[0.0,-16.5,21.999888392094256];
init();

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {
    //RADICE
    case torsoId:
    m = translate(kPosition[0],kPosition[1],kPosition[2]);
    m = mult(m,rotate(theta[torsoId], vec3(1, 0, 0) ));
    m = mult(m,rotate(theta[torsoOrientationId], vec3(0, 1, 0) ));
    m = mult(m,rotate(theta[torsoOrientationZId], vec3(0, 0, 1) ));
    figure[torsoId] = createNode( m, torso, null, torso2Id );
    break;
    //-------    

    case torso2Id:
        m = translate(0.0,0.0,-0.3);
        m = mult(m,rotate(theta[torso2Id], vec3(0, 1, 0) ));
        figure[torso2Id] = createNode( m, torso2, neckId, null);
        break;

        
    
    case neckId:
        m = translate(0.0, torsoHeight-0.25, 0.0);
        m = mult(m, rotate(theta[neckId] ,vec3(1, 0, 0)));
        figure[neckId] = createNode(m, neck, tailId , headId);
        break;

    case headId:
        m = translate(0.0,neckHeight,-0.65);
        m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
        m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
        m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
        figure[headId] = createNode( m, head,  null ,earSxId );
        break;
    //ORECCHIO SINISTRO    
    case earSxId:
        m = translate(-headWidth+3/2,0.3,0.0);
            m = mult(m, rotate(theta[earSxId], vec3(1, 0, 0)));
        figure[earSxId] = createNode( m, ear, earDxId, null );
        break;
    //ORECCHIO DESTRO    
    case earDxId:
        m = translate(-headWidth/2,0.3,0.0);
            m = mult(m, rotate(theta[earDxId], vec3(1, 0, 0)));
        figure[earDxId] = createNode( m, ear, null, null );
        break;
    

    //..CODA...
    case tailId:

    m = translate(0.0,0.0,0.85);
	  m = mult(m, rotate(theta[tailId], vec3(1, 0, 0)));
    figure[tailId] = createNode( m, tail, leftUpperArmId, tail2Id );
    break;

    case tail2Id:

    m = translate(0.0,-2.5,0.5);
	  m = mult(m, rotate(theta[tail2Id], vec3(1, 0, 0)));
    figure[tail2Id] = createNode( m, tail2, null, tail3Id );
    break;

    case tail3Id:

    m = translate(0.0,-1.5,0.5);
	  m = mult(m, rotate(theta[tail3Id], vec3(1, 0, 0)));
    figure[tail3Id] = createNode( m, tail3, null, null );
    break;
    
    //...FINE CODA...

    case leftUpperArmId:

    m = translate(-(torsoWidth/2), 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate(torsoWidth/2, 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, cosciaSxId, rightLowerArmId );
    break;
    
    //COSCIA SX
    case cosciaSxId:

    m = translate(-(0.8*torso2Height)/2,-1.3,-0.8);
	  m = mult(m , rotate(theta[cosciaSxId], vec3(1, 0, 0)));
    figure[cosciaSxId] = createNode( m, coscia, cosciaDxId, leftUpperLegId );
    break;
    //----

    case leftUpperLegId:

    m = translate(-(torsoWidth-cosciaDxWidth)/6, 0.1*upperLegHeight, 0.0);
	  m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, null, leftLowerLegId );
    break;

    //COSCIA DX
    case cosciaDxId:

    m = translate(0.8*torso2Height/2,-1.3,-0.8);
	  m = mult(m , rotate(theta[cosciaDxId], vec3(1, 0, 0)));
    figure[cosciaDxId] = createNode( m, coscia, null, rightUpperLegId );
    break;
    //----


    case rightUpperLegId:

    m = translate((torsoWidth-cosciaDxWidth)/6, 0.1*upperLegHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;
    
     
    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;
    
     
   

    case grassId:
     
    m = translate(0.0, -21., 0.0);
    m = mult(m, rotate(theta[grassId], vec3(1, 0, 0)));
    grassField[grassId] = createNode( m, grass, null, HillId );
    break;

    

    case HillId:
    
        m = translate(0.0,-grassHeight*7.1, 0.0);
        m = mult(m, rotate(theta[HillId], vec3(1, 0, 0)));
        grassField[HillId] = createNode( m, Hill, null, null );
        break;
    }
}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function traverseGrass(Id) {
    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, grassField[Id].transform);
    grassField[Id].render();
    if (grassField[Id].child != null) traverseGrass(grassField[Id].child);
    modelViewMatrix = stack.pop();
    if (grassField[Id].sibling != null) traverseGrass(grassField[Id].sibling);
}

function torso() {
   
    configureTexture(normals);
    ChooseTexture = 3;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
   // for(var i =0; i<1; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
   // gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
   // for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    configureFaceTexture();
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    ChooseTexture=1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    for(var i=0; i<3; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    for(var i=4; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture=2;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    for(var i=3; i<4; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture=1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    
    
    
}



function leftUpperArm() {
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {
    configureTexture(normals);
    ChooseTexture = 3;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {
    configureTexture(normals);
    ChooseTexture = 3;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    configureTexture(normals);
    ChooseTexture = 3;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {
    configureTexture(normals);
    ChooseTexture = 3;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
}
function torso2() {
    configureTexture(normals);
    ChooseTexture = 4;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torso2Height, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(torso2Width, torso2Height, torso2Width) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
}

function neck(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * neckHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(neckWidth, neckHeight, neckWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);

}
function tail() {
    configureTexture(normals);
    ChooseTexture = 3;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
}

function tail2() {
    configureTexture(normals);
    ChooseTexture = 3;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tail2Height, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tail2Width, tail2Height, tail2Width) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
}

function tail3() {
    configureTexture(normals);
    ChooseTexture = 3;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tail3Height, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tail3Width, tail3Height, tail3Width) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
}
function coscia() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * cosciaDxHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(cosciaDxWidth, cosciaDxHeight, cosciaDxWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function ear() {
    configureTexture(normals);
    ChooseTexture = 3;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * earHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(earWidth, earHeight, earWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    ChooseTexture = 1;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
}

function grass() {
    configureGrassTexture();
    ChooseTexture=2;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * grassHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(grassWidth, grassHeight, grassWidth) )
    gl.uniformMatrix4fv(projectionMatrixLoc,false,flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<4; i++) gl.drawArrays(gl.TRIANGLE_FAN, 6*i, 4);
   
}


function Hill() {
    ChooseTexture=5;
    gl.uniform1i(gl.getUniformLocation(program, "ChooseTexture"),ChooseTexture);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*HillHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(HillWidth*2, HillHeight*0.6, HillWidth*2) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i=25; i<pointsArray.length; i+=4) {
        gl.uniform4fv(colorLoc, brown);
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(colorLoc, green);
        gl.drawArrays( gl.LINE_LOOP, i, 2 );
    }
}


function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);
    
    t1 = vec3(Math.abs(t1[0]), Math.abs(t1[1]), Math.abs(t1[2]));
    
     pointsArray.push(vertices[a]);
     texCoordsArray.push(texCoord[0]);
    

     pointsArray.push(vertices[b]);
     texCoordsArray.push(texCoord[1]);
    
    
     pointsArray.push(vertices[c]);
     texCoordsArray.push(texCoord[2]);
   
     pointsArray.push(vertices[d]);
     texCoordsArray.push(texCoord[3]);

     
     
    
}


function cube()
{
   
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
    
}

    



function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.4, 1.0, 0.5 );

    
    
    cube();

  //HILL/HAT SHAPES
    for(var i=0; i<nRows-1; i++) {
        for(var j=0; j<nColumns-1;j++) {
            pointsArray.push( vec4(2*i/nRows-1, dataHill[i][j], 2*j/nColumns-1, 1.0));
            texCoordsArray.push(texCoord[0]);

            pointsArray.push( vec4(2*(i+1)/nRows-1, dataHill[i+1][j], 2*j/nColumns-1, 1.0));
            texCoordsArray.push(texCoord[1]);
 
            pointsArray.push( vec4(2*(i+1)/nRows-1, dataHill[i+1][j+1], 2*(j+1)/nColumns-1, 1.0));
            texCoordsArray.push(texCoord[2]);
  
            pointsArray.push( vec4(2*i/nRows-1, dataHill[i][j+1], 2*(j+1)/nColumns-1, 1.0) );
            texCoordsArray.push(texCoord[3]);

        }
}
    

  
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);
    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    instanceMatrix = mat4();

    modelViewMatrix = mat4();
    nMatrix = normalMatrix(modelViewMatrix, lightPosition);

    gl.uniformMatrix4fv(gl.getUniformLocation( program, "uModelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "uProjectionMatrix"), false, flatten(projectionMatrix)  );
    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix")

    gl.uniformMatrix3fv( gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  
    colorLoc = gl.getUniformLocation(program, "uColor");
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    
    //TEXTURES-------------------------------------------------
    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
    //BUMP
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);

    gl.uniform4fv( gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct);
   // gl.uniform4fv( gl.getUniformLocation(program, "uLightPosition"), lightPosition);
    gl.uniform4fv( gl.getUniformLocation(program, "uNormal"), normal);
    gl.uniform3fv( gl.getUniformLocation(program, "uObjTangent"), tangent);
   
   //BUTTONS---------------------------------------------------------------------------------
    
    document.getElementById("Button3").onclick = function(){radius *= 2.0;};
    document.getElementById("Button4").onclick = function(){radius *= 0.5;};
    document.getElementById("Button5").onclick = function(){theta_view += dr;};
    document.getElementById("Button6").onclick = function(){theta_view -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr; };
    document.getElementById("Button8").onclick = function(){phi -= dr;};
    document.getElementById("animation").onclick = function(){Kanimation =! Kanimation};
//---------------------------------------------------------------------------------------------------
    for(i=0; i<numNodes; i++) initNodes(i);
    render();
}


function render() {
    
        gl.enable(gl.DEPTH_TEST);
        var lightPosition = vec4(0.0, 2.0, 1.0, 1.0);

        gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPosition);
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        eye_x = radius*Math.sin(theta_view)*Math.cos(phi);
        eye_y = radius*Math.sin(theta_view)*Math.sin(phi);
        eye_z = radius*Math.cos(theta_view);
        eye = vec3(2*eye_x, 2*eye_y, 2*eye_z);
        modelViewMatrix = lookAt(eye, at, up);
       

        traverseGrass(grassId);
        traverse(torsoId);
        if(Kanimation){KangarooJumpAnimation();}
        
        requestAnimationFrame(render);       
}

var Segnalino=0.0;

function KangarooJumpAnimation(){
    
//MOVIMENTO CIRCOLARE
if(Segnalino < 62.63){
    
      Segnalino +=0.2;
      kPosition[2] = Math.cos(Segnalino*0.1)*22;
      kPosition[0] = Math.sin(Segnalino*0.1)*22;
      //SALTO
      
      kPosition[1] += Math.sin(Segnalino*0.7)*0.4;
      
      //console.log(kPosition[1]);
      //ROTAZIONE DEL CORPO IN BASE ALLA ZONA
      if(Segnalino < 10){
      theta[torsoOrientationId]-=0.5;
      theta[torsoOrientationZId]-=0.4;
      theta[torsoId]+=0.1;
      //MOVIMENTO GAMBE DURANTE IL SALTO
      if(Segnalino > 0 && Segnalino < 3){
      theta[leftUpperLegId]+=2;
      theta[rightUpperLegId]+=2;
      initNodes(leftUpperLegId); 
      initNodes(rightUpperLegId); 

      theta[leftLowerLegId]+=3;
      initNodes(leftLowerLegId);
      theta[rightLowerLegId]+=3;
      initNodes(rightLowerLegId); 
      }
      if(Segnalino > 3 && Segnalino < 7){
        theta[leftUpperLegId]-=2;
        theta[rightUpperLegId]-=2;
        initNodes(leftUpperLegId); 
        initNodes(rightUpperLegId);
        
        theta[leftLowerLegId]-=3;
        initNodes(leftLowerLegId);
        theta[rightLowerLegId]-=3;
        initNodes(rightLowerLegId); 
        
     }
     if(Segnalino > 7 && Segnalino < 10){
        theta[leftUpperLegId]+=2;
        theta[rightUpperLegId]+=2;
        initNodes(leftUpperLegId); 
        initNodes(rightUpperLegId);
 
        theta[leftLowerLegId]+=4;
        initNodes(leftLowerLegId);
        theta[rightLowerLegId]+=4;
        initNodes(rightLowerLegId); 
        }
      }
      if(Segnalino > 10 && Segnalino < 20){
        theta[torsoOrientationId]-=0.6;
        theta[torsoOrientationZId]-=0.8;
        theta[torsoId]+=0.5;
        //MOVIMENTO GAMBE DURANTE IL SALTO
        if(Segnalino > 10 && Segnalino < 15){
            theta[leftUpperLegId]-=2;
            theta[rightUpperLegId]-=2;
            initNodes(leftUpperLegId); 
            initNodes(rightUpperLegId); 

            theta[leftLowerLegId]-=2;
            initNodes(leftLowerLegId); 
            theta[rightLowerLegId]-=2;
            initNodes(rightLowerLegId); 

            }
            if(Segnalino > 15 && Segnalino < 20){
              theta[leftUpperLegId]+=2;
              theta[rightUpperLegId]+=2;
              initNodes(leftUpperLegId); 
              initNodes(rightUpperLegId); 

              theta[leftLowerLegId]+=3;
              initNodes(leftLowerLegId);
              theta[rightLowerLegId]+=3;
              initNodes(rightLowerLegId); 
           }
             
      }
      if(Segnalino > 20 && Segnalino < 30){
        theta[torsoId]+=0.1;
        theta[torsoOrientationId]+=0.05;
        theta[torsoOrientationZId]-=0.1;
        //MOVIMENTO GAMBE DURANTE IL SALTO
        if(Segnalino > 20 && Segnalino < 25){
            theta[leftUpperLegId]-=2;
            theta[rightUpperLegId]-=2;
            initNodes(leftUpperLegId); 
            initNodes(rightUpperLegId);
 
            theta[leftLowerLegId]-=3;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId]-=3;
            initNodes(rightLowerLegId); 
            }
            if(Segnalino > 25 && Segnalino < 30){
              theta[leftUpperLegId]+=2;
              theta[rightUpperLegId]+=2;
              initNodes(leftUpperLegId); 
              initNodes(rightUpperLegId);
 
              theta[leftLowerLegId]+=3;
              initNodes(leftLowerLegId);
              theta[rightLowerLegId]+=3;
              initNodes(rightLowerLegId); 
           }
          
             
      }
      if(Segnalino > 30 && Segnalino < 35){
        theta[torsoId]+=2.3;
        theta[torsoOrientationId]-=0.0;
        theta[torsoOrientationZId]-=3;
        //MOVIMENTO GAMBE DURANTE IL SALTO
            if(Segnalino > 30 && Segnalino < 35){
              theta[leftUpperLegId]-=2;
              theta[rightUpperLegId]-=2;
              initNodes(leftUpperLegId); 
              initNodes(rightUpperLegId);
 
              theta[leftLowerLegId]-=2;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId]-=2;
            initNodes(rightLowerLegId); 
           }
      }
      if(Segnalino > 35 && Segnalino < 40){
        theta[torsoId]+=0.6;
        theta[torsoOrientationId]+=1.6;
        theta[torsoOrientationZId]-=0.9;
        //MOVIMENTO GAMBE DURANTE IL SALTO
        if(Segnalino > 35 && Segnalino < 40){
            theta[leftUpperLegId]+=2;
            theta[rightUpperLegId]+=2;
            initNodes(leftUpperLegId); 
            initNodes(rightUpperLegId); 

            theta[leftLowerLegId]+=2;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId]+=2;
            initNodes(rightLowerLegId); 
        }
           
      }
      if(Segnalino > 40 && Segnalino < 45){
        theta[torsoId]+=0.4;
        theta[torsoOrientationId]+=1.0;
        theta[torsoOrientationZId]-=0.5;
       //MOVIMENTO GAMBE DURANTE IL SALTO
            if(Segnalino > 40 && Segnalino < 45){
              theta[leftUpperLegId]-=2;
              theta[rightUpperLegId]-=2;
              initNodes(leftUpperLegId); 
              initNodes(rightUpperLegId); 

              theta[leftLowerLegId]-=2;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId]-=2;
            initNodes(rightLowerLegId); 
           }
      }
      
      if(Segnalino > 45 && Segnalino < 50){
        theta[torsoId]+=0.6;
        theta[torsoOrientationId]+=1.3;
        theta[torsoOrientationZId]-=0.7;
        //MOVIMENTO GAMBE DURANTE IL SALTO
        if(Segnalino > 45 && Segnalino < 50){
            theta[leftUpperLegId]+=2;
            theta[rightUpperLegId]+=2;
            initNodes(leftUpperLegId); 
            initNodes(rightUpperLegId); 

            theta[leftLowerLegId]+=2;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId]+=2;
            initNodes(rightLowerLegId); 
            }
           
      }
      if(Segnalino > 50 && Segnalino < 55){
        theta[torsoId]-=1.0;
        theta[torsoOrientationId]+=1.2;
        theta[torsoOrientationZId]-=1;
        //MOVIMENTO GAMBE DURANTE IL SALTO
            if(Segnalino > 50 && Segnalino < 55){
              theta[leftUpperLegId]-=2;
              theta[rightUpperLegId]-=2;
              initNodes(leftUpperLegId); 
              initNodes(rightUpperLegId); 

              theta[leftLowerLegId]-=2;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId]-=2;
            initNodes(rightLowerLegId); 
           }
      }
      if(Segnalino > 55 && Segnalino < 60){
        theta[torsoId]+=2.9;
        theta[torsoOrientationId]+=2.1;
        theta[torsoOrientationZId]+=1.2;
        //MOVIMENTO GAMBE DURANTE IL SALTO
        if(Segnalino > 55 && Segnalino < 60){
            theta[leftUpperLegId]+=3;
            theta[rightUpperLegId]+=3;
            initNodes(leftUpperLegId); 
            initNodes(rightUpperLegId); 

            theta[leftLowerLegId]+=1;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId]+=1;
            initNodes(rightLowerLegId);
            }
            
      }
      if(Segnalino > 60 && Segnalino < 63){
        theta[torsoId]-=0.0;
        theta[torsoOrientationId]+=3.0;
        theta[torsoOrientationZId]+=0.4;
        //MOVIMENTO GAMBE DURANTE IL SALTO
        if(Segnalino > 60 && Segnalino < 63){
            theta[leftUpperLegId]-=3;
            theta[rightUpperLegId]-=3;
            initNodes(leftUpperLegId); 
            initNodes(rightUpperLegId); 
            theta[leftLowerLegId]-=3;
            initNodes(leftLowerLegId);
            theta[rightLowerLegId]-=3;
            initNodes(rightLowerLegId); 
            }
      }

      
      initNodes(torsoId); 
      console.log(theta[rightLowerLegId]);
     
    
    }
    //fUNZIONE DI RESET COMPLETATO UN GIRO
    if(Segnalino >= 62.63){
    //RESET BOTTONE
    Kanimation =!Kanimation;
    //RESET SEGNALINO
    Segnalino = 0.0;
    //RESET ANGOLI
    theta = [30, 90, 110, 0, 110, 0, 190, -100, 190, -100, 0, 0,
        -30 
        , -90 
        , -90 
        , 10 
        , 10  
        , 20 
        , -30 
        , -30 
        , 0 
        , 0 
        , 0
        , 0
       ]; 
    //RESET POSITION
       kPosition=[0.0,-16.5,21.999888392094256];

    }


    
    
//23.454429443956084
      
       /* if(theta[torsoId]<37){
        theta[torsoId]+=1.0;
        initNodes(torsoId);
       
        theta[cosciaDxId]-=0.4;
        initNodes(cosciaDxId); 
        theta[cosciaSxId]-=0.4;
        initNodes(cosciaSxId); 
*/
    
/*
        theta[leftUpperLegId]+=7;
        theta[rightUpperLegId]+=7;
        initNodes(leftUpperLegId);
        initNodes(rightUpperLegId);
      
        theta[leftLowerLegId]-=5.0;
        theta[rightLowerLegId]-=5.0;
        initNodes(leftLowerLegId);
        initNodes(rightLowerLegId);
*/      

        }
       

       

}



    kangaroo();


