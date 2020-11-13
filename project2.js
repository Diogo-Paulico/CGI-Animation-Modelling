var canvas;
var gl;
var program;

var aspect;

var mProjectionLoc, mModelViewLoc, colorLoc;

var projection;

var matrixStack = [];
var modelView;
let wireFrame = true;
var at = [0, 0, 0];
var eye = [1, 1, 1];
var up = [0, 1, 0];


const PURPLE = vec4(0.6,0.5,1.0, 1.0);
const RED = vec4(1.0,0.0,0.0, 1.0);
const GREEN = vec4(0.0, 1.0, 0.0, 1.0);

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

window.onkeypress = function(event){
    var key = String.fromCharCode(event.keyCode);
    switch (key){
        case ' ':
            wireFrame = !wireFrame;
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

    cubeInit(gl);
    cylinderInit(gl);
    render();
}

const SCALAR = 1.0;

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
    multTranslation([1.35,-0.15,0.0]);
    multScale([0.7, 0.7,1.0]);
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
    multScale([1/15, 1.1, 1/15]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, flatten(GREEN));
    if(wireFrame)
        cylinderDrawWireFrame(gl,program);
    else
        cylinderDrawFilled(gl,program);
}

function sceneBuilder(){
    multTranslation([-1.0,1.0,1.0]); // ALIGNING OVERALL SCENE
    pushMatrix();
      mainBodyPiece();
    popMatrix();
    pushMatrix();
        cabin();
    popMatrix();
    pushMatrix();
        multTranslation([0.6, -1, 0]);
    pushMatrix();
        front_axis();
    popMatrix();
    popMatrix();
        multTranslation([-0.6, -1, 0]);
    pushMatrix();
    front_axis();
    popMatrix();
}

    const VP_DISTANCE = 2;
function render() 
{
    var projection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);
    modelView = lookAt([0,1,0], [0,0,0], [0,0,-1]);
 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

//    let m = mult(modelView,update_ctm());
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));

    
    sceneBuilder();

    requestAnimationFrame(render);


}
