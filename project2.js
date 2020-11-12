var canvas;
var gl;
var program;

var aspect;

var mProjectionLoc, mModelViewLoc;

var projection;

var matrixStack = [];
var modelView;

var at = [0, 0, 0];
var eye = [1, 1, 1];
var up = [0, 1, 0];

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

    cubeInit(gl);

    render();
}

function update_ctm()
{
    
    let tx = 0;
    let ty = 0;
    let tz = 1;
    let rx = 10;
    let ry = 10;
    let rz = 100;
    let sx = 1;
    let sy = 1;
    let sz = 3;

    let m = mult(translate([tx, ty, tz]), 
          mult(rotateZ(rz), 
          mult(rotateY(ry),
          mult(rotateX(rx),
          scalem([sx,sy,sz])))));

          return m;
}

function render() 
{
    projection = ortho(-2,2,-2,2,10,-10);
    modelView = lookAt(eye, at, up);
 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

    let m = mult(modelView,update_ctm());
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(m));

    
    cubeDrawWireFrame(gl,program);

    requestAnimationFrame(render);


}
