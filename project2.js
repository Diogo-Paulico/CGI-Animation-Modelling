var canvas;
var gl;
var program;
var turn = 0;
var aspect;

var mProjectionLoc, mModelViewLoc, colorPickLoc, colorLoc;

var projection;
let useFixedColor = false;
var matrixStack = [];
var modelView;
var at = [0, 0, 0];
var eye = [1, 1, 1];
var up = [0, 1, 0];
var atUP = [0,0,0];
var eyeUP =[0,1,0];
var upUP = [0,0,-1];

var eye2 = [0,0,1]; // LATERAL
var eye3 = [1,0,0]; // frontal
var up1 = [0, 1, 0];

var desloc = 0;
let speed = 0;
var spin = 0;
var armTurn = 0;
var armUp = 0;
var currentView;



//COLORS
const PURPLE = vec4(0.6,0.5,1.0, 1.0);
const RED = vec4(1.0,0.0,0.0, 1.0);
const GREEN = vec4(0.0, 1.0, 0.0, 1.0);
const BLUE = vec4(0.0, 0.0, 1.0, 1.0);
const WHITE = vec4(1.0, 1.0, 1.0, 1.0);
const ORANGE = vec4(1.0, 0.6, 0.2, 1.0);
const DIRTY_GREEN = vec4(0.8, 0.8, 0.3, 1.0);
const BRIGHT_YELLOW = vec4(1.0, 0.1, 0.8, 1.0);

//views
const CUSTOM_VIEW = lookAt(eye, at, up)
const SIDE_VIEW = lookAt(eye2, at, up);
const FRONT_VIEW  = lookAt(eye3, at, up);
const TOP_VIEW = lookAt(eyeUP, atUP, upUP);
const VP_DISTANCE = 550;

const TURN_STEP = 8;
const UP_STEP = 8;
const SPEED_STEP = 0.0005;
const MAX_FORWARD_SPEED = 0.5;
const MAX_REVERSE_SPEED = 0.2;

const SCALE = 212.0;

const FLOOR = (11/650) * VP_DISTANCE;

function pushMatrix() {
    var m =  mat4(modelView[0], modelView[1],
           modelView[2], modelView[3]);
    matrixStack.push(m);
}
function popMatrix() {
    modelView = matrixStack.pop();
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
    let key = String.fromCharCode(event.keyCode);
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
        case 'l':
            turnArm("left");
            break;
        case 'j':
            turnArm("right");
            break;
        case 'i':
            upAndDownArm("up");
            break;
        case 'k':
            upAndDownArm("down");
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
    sphereInit(gl);
    paraboloidInit(gl);

    currentView = SIDE_VIEW;
    render();
}


function makeFloor(){
    for (let i = 0; i < FLOOR; i += 1 ) {
        for(let j = 0; j < FLOOR; j += 1) {
            if((j %2 == 1 && i%2 == 0 )|| (j %2 == 0 && i%2 == 1 )) {
                pushMatrix();
                multTranslation([1.5*SCALE * (i - (FLOOR /2)), 0, 1.5*SCALE * (j - (FLOOR /2) )]);
                multRotationX(90);
                multScale([1.5*SCALE, 1.5*SCALE, 0]);
                gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
                gl.uniform4fv(colorLoc, flatten(DIRTY_GREEN));

                cubeDrawWireFrame(gl, program);

                popMatrix();
            }
        }
    }
}

function mainBodyPiece() {
   	  multScale([2 * SCALE, 1 * SCALE, 1 * SCALE]);
   	  gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
   	  gl.uniform4fv(colorLoc, flatten(PURPLE));
         cubeDrawWireFrame(gl,program);
}

function cabin()
{
    multTranslation([1.35 * SCALE,-0.15 * SCALE,0.0 * SCALE]);
    multScale([0.7 * SCALE, 0.7 * SCALE,1.0 * SCALE]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(RED));
        cubeDrawWireFrame(gl,program);
}

function axis(){
    multRotationY(90);
    multRotationZ(90);
    multScale([1/15 * SCALE, 1.15 * SCALE, 1/15 * SCALE]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(GREEN));
        cylinderDrawWireFrame(gl,program);
}

function turnWheel(angle) {
    if (speed == 0 && ((angle > 0 && turn < 30) || (angle < 0 && turn > -30)))
        turn += angle;
}


function wheel(){
    multRotationY(spin);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(BLUE));
        torusDrawWireFrame(gl,program);
}

function antennaBase(){
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(GREEN));
        cylinderDrawWireFrame(gl,program);
}

function antennaArm(){
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(BRIGHT_YELLOW));
        cylinderDrawWireFrame(gl,program);
}

function antennaKnee(){
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(WHITE));
        sphereDrawWireFrame(gl,program);
}

function antennaCenter(){
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(WHITE));
        cylinderDrawWireFrame(gl,program);
}

function antennaDish(){
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(ORANGE));
        paraboloidDrawWireFrame(gl,program);
}

function turnArm(direction) {

    armTurn += direction=="left" ? (-TURN_STEP) : TURN_STEP;
    armTurn = armTurn % 360;
}

function upAndDownArm(upOrDown) {
    console.log(armUp);
    if((armUp == -UP_STEP &&  upOrDown == "down") || (armUp == 176 && upOrDown == "up"))
        return ;
    armUp += upOrDown=="down" ? (-UP_STEP) : UP_STEP;
    armUp = armUp % 360;
}
function changeColorMode(){
    useFixedColor = !useFixedColor;
    gl.uniform1i(colorPickLoc,useFixedColor ? 1:0);
}

function increaseSpeed(){
    if(turn != 0)
        turn =0;
    speed += speed < MAX_FORWARD_SPEED ? SPEED_STEP : 0;
}

function decreaseSpeed(){
    if(turn != 0)
        turn =0;
    speed -= speed > -MAX_REVERSE_SPEED ? SPEED_STEP : 0;
}
function  buildBody(){
    pushMatrix();
        mainBodyPiece();
    popMatrix();
    pushMatrix();
        cabin();
    popMatrix();
}

function sceneBuilder(){
    makeFloor();
    multTranslation([(-1.0+ desloc) * SCALE  ,0.71 * SCALE,(1.0 ) * SCALE]);
    buildBody();
    pushMatrix(); // antenna base
        multTranslation([0 * SCALE, 0.55 *SCALE, 0*SCALE]);
        multRotationY(90);
        multScale([1/15 * SCALE, 0.10 * SCALE, 1/15 * SCALE]);
        antennaBase();
    popMatrix();

        pushMatrix();
        multTranslation([0*SCALE, 0.635 * SCALE, 0 *SCALE]);
        multRotationY(armTurn);
        multRotationZ(armUp);
            pushMatrix(); // antena Knee
                multScale([0.08* SCALE, 0.08 * SCALE, 0.08* SCALE]);
                antennaKnee();
            popMatrix();
            pushMatrix(); // antenna Arm
                multTranslation([0.39 * SCALE, 0* SCALE, 0.00 * SCALE]);
                multRotationZ(90);
                multScale([0.04* SCALE, 0.7 * SCALE, 0.04* SCALE]);
                antennaArm();
            popMatrix();
            pushMatrix(); //antenna center
                multTranslation([0.7 * SCALE, 0.03* SCALE, 0 * SCALE]);
                multRotationY(90);
                multScale([0.04* SCALE, 0.1 * SCALE, 0.04* SCALE]);
                antennaCenter();
            popMatrix(); // antenna dish
                multTranslation([0.7 * SCALE, 0.01* SCALE, 0 * SCALE]);
                multScale([0.5 *SCALE, 0.5* SCALE, 0.5*SCALE]);
                antennaDish();
        popMatrix();

    pushMatrix(); // front axis
        multTranslation([0.6 * SCALE, -0.5 * SCALE, 0 * SCALE]);
    pushMatrix();
        axis();
    popMatrix();
    pushMatrix(); // front left wheel
        multTranslation([0 * SCALE,0 * SCALE,-0.6 * SCALE]);
        multRotationX(90);
        multRotationZ(-turn);
        multScale([0.3 * SCALE,0.3 * SCALE,0.3 * SCALE]);
        wheel();
    popMatrix(); // front right wheel
        multTranslation([0 * SCALE,0 * SCALE,0.6 * SCALE]);
        multRotationX(90);
        multRotationZ(-turn); // turns wheel it seems
        multScale([0.3 * SCALE,0.3 * SCALE,0.3 * SCALE]);
        wheel();
    popMatrix();

    pushMatrix(); //rear axis
        multTranslation([-0.6 * SCALE, -0.5 * SCALE, 0 * SCALE]);
    pushMatrix();
        axis();
    popMatrix();
    pushMatrix(); //rear right wheel
        multTranslation([0 * SCALE,0 * SCALE,0.6 * SCALE]);
        multRotationX(90);
        multScale([0.3 * SCALE,0.3 * SCALE,0.3 * SCALE]);
        wheel();
    popMatrix();//rear left wheel
        multTranslation([0 * SCALE,0 * SCALE,-0.6 * SCALE]);
        multRotationX(90);
        multScale([0.3 * SCALE,0.3 * SCALE,0.3 * SCALE]);
        wheel();
}

function move(){
    if(0 != Math.abs(speed) && Math.abs(speed) < SPEED_STEP)
        speed = 0;
    desloc += speed;
    spin -= ((speed * SCALE) / (torus_RADIUS * SCALE * 0.3)) * SCALE;
    spin = spin % 360;
}


function render()
{
    projection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);
    modelView = currentView;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    move();
    sceneBuilder();

   requestAnimationFrame(render);
}