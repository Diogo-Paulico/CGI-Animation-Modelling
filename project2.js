var canvas;
var gl;
var program;
var turn = 0;
var aspect;

var mProjectionLoc, mModelViewLoc, colorPickLoc;

var projection;
let useFixedColor = false;
var pickLoc;
var matrixStack = [];
var modelView;
let wireFrame = true;
var at = [0, 0, 0];
var eye = [1, 1, 1];
var up = [0, 1, 0];
var atUP = [0,0,0];
var eyeUP =[0,1,0];
var upUP = [0,0,-1];
var desloc = 0;
let speed = 0;

var spin = 0;

var eye1 = [0,0,1]; // LATERAL
var eye2 = [1,0,0]; // frontal
var up1 = [0, 1, 0];

const SPEED_STEP = 0.005;
const PURPLE = vec4(0.6,0.5,1.0, 1.0);
const RED = vec4(1.0,0.0,0.0, 1.0);
const GREEN = vec4(0.0, 1.0, 0.0, 1.0);
const BLUE = vec4(0.0, 0.0, 1.0, 1.0);
const WHITE = vec4(1.0, 1.0, 1.0, 1.0);

//views
const CUSTOM_VIEW = lookAt(eye, at, up)
const SIDE_VIEW = lookAt(eye1, at, up);
const FRONT_VIEW  = lookAt(eye2, at, up);
const TOP_VIEW = lookAt(eyeUP, atUP, upUP);

var currentView = CUSTOM_VIEW;
// Stack related operations
function pushMatrix() {
    var m =  mat4(modelView[0], modelView[1],
           modelView[2], modelView[3]);
    matrixStack.push(m);
}
function popMatrix() {
    modelView = matrixStack.pop();
}
// Append transformations to modelView
function multMatrix(m) {
    modelView = mult(modelView, m);
}
function multTranslation(t) {
    modelView = mult(modelView, translate(t));
}
function multScale(s) { 
    modelView = mult(modelView, scalem(s)); 
}
function multRotationX(angle) {
    modelView = mult(modelView, rotateX(angle));
}
function multRotationY(angle) {
    modelView = mult(modelView, rotateY(angle));
}
function multRotationZ(angle) {
    modelView = mult(modelView, rotateZ(angle));
}

function fit_canvas_to_window()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    aspect = canvas.width / canvas.height;
    gl.viewport(0, 0,canvas.width, canvas.height);

}

window.onresize = function () {
    fit_canvas_to_window();
}

function changeViewMode(key) {
    console.log(key);
    switch(key){
        case '0':
            currentView = CUSTOM_VIEW;
            break;
        case '1':
            currentView = TOP_VIEW;
            break;
        case '2':
            currentView = SIDE_VIEW;
            break;
        case '3':
            currentView = FRONT_VIEW;
            break;
    }

}

window.onkeypress = function(event){
    var key = String.fromCharCode(event.keyCode);
    switch (key.toLocaleLowerCase()){
        case ' ':
            changeColorMode();
            break;
        case 'w':
            increaseSpeed();
            break;
        case 's':
            decreaseSpeed();
            break;
        case 'a':
            turnWheel(2);
            break;
        case 'd':
            turnWheel(-2);
            break;
        case '0':
        case '1':
        case '2':
        case '3':
            changeViewMode(key);
            break;

    }
};

window.onload = function() {

    canvas = document.getElementById('gl-canvas');

    gl = WebGLUtils.setupWebGL(document.getElementById('gl-canvas'));
    fit_canvas_to_window();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, 'default-vertex', 'default-fragment');

    gl.useProgram(program);

    mModelViewLoc = gl.getUniformLocation(program, "mModelView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");
    colorLoc = gl.getUniformLocation(program, "color");
    colorPickLoc = gl.getUniformLocation(program, "colorPick");

    cubeInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    render();
}

const SCALAR = 350.0;

function mainBodyPiece()
{
   	  multScale([2 * SCALAR,1 * SCALAR,1 * SCALAR]);
   	  gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
   	  gl.uniform4fv(colorLoc, flatten(PURPLE));
     if(wireFrame)
         cubeDrawWireFrame(gl,program);
        else
         cubeDrawFilled(gl, program);
}

function cabin()
{
    multTranslation([1.35 * SCALAR,-0.15 * SCALAR,0.0 * SCALAR]);
    multScale([0.7 * SCALAR, 0.7 * SCALAR,1.0 * SCALAR]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(RED));
    if(wireFrame)
        cubeDrawWireFrame(gl,program);
    else
        cubeDrawFilled(gl, program);
}

function front_axis(){

    multRotationY(90);
    multRotationZ(90);
    multScale([1/15 * SCALAR, 1.15 * SCALAR, 1/15 * SCALAR]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(GREEN));
    if(wireFrame)
        cylinderDrawWireFrame(gl,program);
    else
        cylinderDrawFilled(gl,program);
}

function turnWheel(angle) {
    if (speed == 0 && ((angle > 0 && turn < 30) || (angle < 0 && turn > -30)))
        turn += angle;
}

function frontLeftWheel(){
    multTranslation([0 * SCALAR,0 * SCALAR,-0.6 * SCALAR]);
    multRotationY(turn); // turns wheel it seems
    multRotationX(90);
    multScale([0.3 * SCALAR,0.3 * SCALAR,0.3 * SCALAR]); // torus_Radius * scale
    wheel();
}

function frontRightWheel(){
    multTranslation([0 * SCALAR,0 * SCALAR,0.6 * SCALAR]);
    multRotationY(turn); // turns wheel it seems
    multRotationX(90);
    multScale([0.3 * SCALAR,0.3 * SCALAR,0.3 * SCALAR]);
    wheel();
}


function rearRightWheel(){
    multTranslation([0 * SCALAR,0 * SCALAR,0.6 * SCALAR]);
    multRotationX(90);
    multScale([0.3 * SCALAR,0.3 * SCALAR,0.3 * SCALAR]);
    wheel();
}

function rearLeftWheel(){
    multTranslation([0 * SCALAR,0 * SCALAR,-0.6 * SCALAR]);
    multRotationX(90);
    multScale([0.3 * SCALAR,0.3 * SCALAR,0.3 * SCALAR]); // torus_Radius * scale
    wheel();
}

function wheel(){
    multRotationY(spin);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(BLUE));
    if(wireFrame)
        torusDrawWireFrame(gl,program);
    else
        torusDrawFilled(gl,program);
}

function antenaBase(){
    multTranslation([0 * SCALAR, 0.65 *SCALAR, 0*SCALAR]);
    multRotationY(90);
   // multRotationZ(90);
    multScale([1/15 * SCALAR, 0.10 * SCALAR, 1/15 * SCALAR]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(GREEN));
    if(wireFrame)
        cylinderDrawWireFrame(gl,program);
    else
        cylinderDrawFilled(gl,program);
}

function antenaArm(){

}

function antenaMiddle(){}

function antenaDish(){

}

function changeColorMode(){

    useFixedColor = !useFixedColor;
    gl.uniform1i(colorPickLoc,useFixedColor ? 1:0);
}

function increaseSpeed(){
    if(turn != 0)
        turn =0;
    speed += SPEED_STEP;

}

function decreaseSpeed(){
    if(turn != 0)
        turn =0;
    speed -= SPEED_STEP;
}

function sceneBuilder(){
    multTranslation([(-1.0+ desloc) * SCALAR  ,1.0 * SCALAR,1.0 * SCALAR]); // ALIGNING OVERALL SCENE
    pushMatrix();
      mainBodyPiece();
    popMatrix();
    pushMatrix();
        cabin();
    popMatrix();
    pushMatrix();
        antenaBase();
    popMatrix();
    pushMatrix();
        multTranslation([0.6 * SCALAR, -0.5 * SCALAR, 0 * SCALAR]);
    pushMatrix();
        front_axis();
    popMatrix();
    pushMatrix();
        frontLeftWheel();
    popMatrix();
    pushMatrix();
        frontRightWheel();
    popMatrix();
    popMatrix();

    pushMatrix();
        multTranslation([-0.6 * SCALAR, -0.5 * SCALAR, 0 * SCALAR]);
    pushMatrix();
        front_axis(); //rear actualkly
    popMatrix();
    pushMatrix();
        rearRightWheel()
    popMatrix();
    pushMatrix();
        rearLeftWheel();
    popMatrix();
}

    const VP_DISTANCE =  1000; //VALOR ALTO LIKE 1000 TO MAKE TRANSLATE BIG
function render()
{
    var projection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);


    modelView = currentView;
 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));

    if(0 != Math.abs(speed) && Math.abs(speed) < SPEED_STEP)
        speed = 0;



    desloc += speed;

    spin -= (speed * SCALAR) / (torus_RADIUS * 0.3);
    console.log(spin);
    sceneBuilder();

   requestAnimationFrame(render);


}
