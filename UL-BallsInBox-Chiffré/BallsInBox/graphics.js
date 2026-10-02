/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
 * Note : Some part of this code have been freely adaptated from Nehe webgl tutorial
*/
var gl;
var shaderProgram;
var mvMatrixStack = [];

/*
 * ModelView Matrix stack handling 
 */
function pushMatrix(matrix)
{
  let copy = mat4.create();
  mat4.set(matrix, copy);
  mvMatrixStack.push(copy);
}

function popMatrix()
{
  if (mvMatrixStack.length == 0)
  {
      throw "Invalid popMatrix!";
  }
  return mvMatrixStack.pop();
}

/*
 * Shader initialization
 */
function initShaders()
{
  let fragshader;
  fragshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragshader,fragsrc);
  gl.compileShader(fragshader);
  if (!gl.getShaderParameter(fragshader, gl.COMPILE_STATUS))
  {
    alert(gl.getShaderInfoLog(fragshader));
  }
  
  let vertshader;
  vertshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertshader,vertsrc);
  gl.compileShader(vertshader);
  if (!gl.getShaderParameter(vertshader, gl.COMPILE_STATUS))
  {
    alert(gl.getShaderInfoLog(vertshader));
  }
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertshader);
  gl.attachShader(shaderProgram, fragshader);
  gl.linkProgram(shaderProgram);
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
  {
    alert("Could not initialise shaders");
  }
  
  gl.useProgram(shaderProgram);
  setGlVariables(shaderProgram);
}

/*
 * Webgl initialization
 */
function initWGL(canvas)
{
  try
  {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  }
  catch (e) {}
  if (!gl)
  {
    alert("Could not initialise WebGL, sorry :-(");
  }
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  initShaders();
}

/*
 * Definition of an cube (faces are oriented inward)
 */
function InternalCube()
{
  /* Constructor */
  /* ----------- */
  // Warning : the faces of this cube are inside-oriented,
  // since only the inside of the cube must be displayed
  this.vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
  vertexdata = [
      // Front face
      -0.5, -0.5,  0.5,
      -0.5,  0.5,  0.5,
       0.5,  0.5,  0.5,
       0.5, -0.5,  0.5,
  
      // Back face
      -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,        
       0.5,  0.5, -0.5,         
      -0.5,  0.5, -0.5,
  
      // Top face
      -0.5,  0.5, -0.5,
       0.5,  0.5, -0.5,        
       0.5,  0.5,  0.5,
      -0.5,  0.5,  0.5,
  
      // Bottom face
      -0.5, -0.5, -0.5,
      -0.5, -0.5,  0.5,
       0.5, -0.5,  0.5,
       0.5, -0.5, -0.5,
  
      // Right face
       0.5, -0.5, -0.5,
       0.5, -0.5,  0.5,
       0.5,  0.5,  0.5,
       0.5,  0.5, -0.5,
  
      // Left face
      -0.5, -0.5, -0.5,
      -0.5,  0.5, -0.5,
      -0.5,  0.5,  0.5,
      -0.5, -0.5,  0.5
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexdata), gl.STATIC_DRAW);
  this.vertices.itemSize = 3;
  this.vertices.numItems = 24;
  
  this.normals = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
  let packed_normals = [
    [0.0,  0.0, -1.0], // Front face
    [0.0,  0.0, 1.0], // Back face
    [0.0,  -1.0,  0.0], // Top face
    [0.0,  1.0,  0.0], // Bottom face
    [-1.0,  0.0,  0.0], // Right face
    [1.0,  0.0,  0.0], // Left face
  ];
  // Duplicate normals for each vertex of a face
  let unpacked_normals = [];
  for (let i in packed_normals)
  {
    let normal = packed_normals[i];
    for (let j=0; j < 4; j++)
    {
      unpacked_normals = unpacked_normals.concat(normal);
    }
  }  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpacked_normals), gl.STATIC_DRAW);
  this.normals.itemSize = 3;
  this.normals.numItems = 24;
  
  this.indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
  let faces = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);
  this.indices.itemSize = 1;
  this.indices.numItems = 36;

  /* Methods */
  /* ------- */
  this.drawWireframe = function ()
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
    setPositionsPointer(this.vertices.itemSize,gl.FLOAT);
  
    // Not used.... be required.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
    setNormalsPointer(this.normals.itemSize,gl.FLOAT);
  
    for(let i=0;i<6;i++)
    {
      gl.drawArrays(gl.LINE_LOOP, i*4, 4);
    }
  }
}

/*
 * Definition of a sphere
 */
function Sphere(radius,slices,stacks)
{
  /* Constructor */
  /* ----------- */
  let vertexPositionData = [];
  let normalData = [];

  for (let latitude=0; latitude <= stacks; latitude++)
  {
    let theta = latitude * Math.PI / stacks;
    let sintheta = Math.sin(theta);
    let costheta = Math.cos(theta);

    for (let longitude=0; longitude <= slices; longitude++)
    {
      let phi = longitude * 2 * Math.PI / slices;
      let sinphi = Math.sin(phi);
      let cosphi = Math.cos(phi);

      let x = cosphi * sintheta;
      let y = costheta;
      let z = sinphi * sintheta;

      normalData.push(x);
      normalData.push(y);
      normalData.push(z);
      vertexPositionData.push(radius * x);
      vertexPositionData.push(radius * y);
      vertexPositionData.push(radius * z);
    }
  }

  let indexData = [];
  for (let latitude=0; latitude < stacks; latitude++)
  {
    for (let longitude=0; longitude < slices; longitude++)
    {
      let first = (latitude * (slices + 1)) + longitude;
      let second = first + slices + 1;
      indexData.push(first);
      
      indexData.push(first + 1);
      indexData.push(second);

      indexData.push(second);
      indexData.push(first + 1);
      indexData.push(second + 1);
    }
  }

  this.normals = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
  this.normals.itemSize = 3;
  this.normals.numItems = normalData.length / 3;

  this.vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
  this.vertices.itemSize = 3;
  this.vertices.numItems = vertexPositionData.length / 3;

  this.indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
  this.indices.itemSize = 1;
  this.indices.numItems = indexData.length;
}

/*
 * generic function to  display VBO using adapted attributes
 */ 
function drawObject(object)
{
  gl.bindBuffer(gl.ARRAY_BUFFER, object.vertices);
  setPositionsPointer(object.vertices.itemSize,gl.FLOAT);

  gl.bindBuffer(gl.ARRAY_BUFFER, object.normals);
  setNormalsPointer(object.normals.itemSize,gl.FLOAT);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indices);
  gl.drawElements(gl.TRIANGLES, object.indices.numItems, gl.UNSIGNED_SHORT, 0);    
}
