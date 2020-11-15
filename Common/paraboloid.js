var paraboloid_points = [];
var paraboloid_normals = [];
var paraboloid_faces = [];
var paraboloid_edges = [];

var paraboloid_points_buffer;
var paraboloid_normals_buffer;
var paraboloid_faces_buffer;
var paraboloid_edges_buffer;

var paraboloid_LATS=20;
var paraboloid_LONS=30;

function paraboloidInit(gl, nlat, nlon) {
    nlat = nlat | paraboloid_LATS;
    nlon = nlon | paraboloid_LONS;
    paraboloidBuild(nlat, nlon);
    paraboloidUploadData(gl);
}

// Generate points using polar coordinates
function paraboloidBuild(nlat, nlon) 
{
    // phi will be latitude
    // theta will be longitude
 
    var d_phi = Math.PI / (nlat+1);
    var d_theta = 2*Math.PI / nlon;
    var r = 0.5;
    
    // Generate north polar cap
    var north = vec3(0,0,0);
    paraboloid_points.push(north);
    paraboloid_normals.push(vec3(0,1,0));
    
    // Generate middle
            let x;
            let z;
            let y;
    for(var i=0, phi=Math.PI/2-d_phi; i<nlat; i++, phi-=d_phi) {
        for(var j=0, theta=0; j<nlon; j++, theta+=d_theta) {
            x =r*Math.cos(phi)*Math.cos(theta);
            z =r*Math.cos(phi)*Math.sin(theta);
            y =x*x+z*z;
            var pt = vec3(x,y,z);
            paraboloid_points.push(pt);
            var n = vec3(pt);
            paraboloid_normals.push(normalize(n));
        }
    }
    
    // Generate the faces
    
    // north pole faces
    
    for(var i=0; i<nlon-1; i++) {
        paraboloid_faces.push(0);
        paraboloid_faces.push(i+2);
        paraboloid_faces.push(i+1);
    }
    paraboloid_faces.push(0);
    paraboloid_faces.push(1);
    paraboloid_faces.push(nlon);
    
    // general middle faces
    var offset=1;
    
    for(var i=0; i<nlat-1; i++) {
        for(var j=0; j<nlon-1; j++) {
            var p = offset+i*nlon+j;
            paraboloid_faces.push(p);
            paraboloid_faces.push(p+nlon+1);
            paraboloid_faces.push(p+nlon);
            
            paraboloid_faces.push(p);
            paraboloid_faces.push(p+1);
            paraboloid_faces.push(p+nlon+1);
        }
        var p = offset+i*nlon+nlon-1;
        paraboloid_faces.push(p);
        paraboloid_faces.push(p+1);
        paraboloid_faces.push(p+nlon);

        paraboloid_faces.push(p);
        paraboloid_faces.push(p-nlon+1);
        paraboloid_faces.push(p+1);
    }
    
    
    
    // Build the edges
    
    for(var i=0; i<nlon; i++) {
        paraboloid_edges.push(0);   // North pole 
        paraboloid_edges.push(i+1);
    }

    for(var i=0; i<nlat; i++, p++) {
        for(var j=0; j<nlon;j++, p++) {
            var p = 1 + i*nlon + j;
            paraboloid_edges.push(p);   // horizontal line (same latitude)
            if(j!=nlon-1) 
                paraboloid_edges.push(p+1);
            else paraboloid_edges.push(p+1-nlon);
            
            if(i!=nlat-1) {
                paraboloid_edges.push(p);   // vertical line (same longitude)
                paraboloid_edges.push(p+nlon);
            } 
            else {
                paraboloid_edges.push(p);
                paraboloid_edges.push(paraboloid_points.length-1);
            } 
        }
    }
    
}

function paraboloidUploadData(gl)
{
    paraboloid_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(paraboloid_points), gl.STATIC_DRAW);
    
    paraboloid_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(paraboloid_normals), gl.STATIC_DRAW);
    
    paraboloid_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, paraboloid_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(paraboloid_faces), gl.STATIC_DRAW);
    
    paraboloid_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, paraboloid_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(paraboloid_edges), gl.STATIC_DRAW);
}

function paraboloidDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_points_buffer);
    var vPosition = gl.getAttribLocation(program,"vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, paraboloid_edges_buffer);
    gl.drawElements(gl.LINES, paraboloid_edges.length, gl.UNSIGNED_SHORT, 0);
}

function paraboloidDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, paraboloid_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, paraboloid_faces_buffer);
    gl.drawElements(gl.TRIANGLES, paraboloid_faces.length, gl.UNSIGNED_SHORT, 0);
}

function paraboloidDraw(gl, program, filled=false) {
	if(filled) paraboloidDrawFilled(gl, program);
	else paraboloidDrawWireFrame(gl, program);
}
