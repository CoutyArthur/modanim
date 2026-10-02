/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
*/
function Simulation(sizex,sizey,sizez,nb)
{
  /* Constructor */
  /* ----------- */
  // rotation angle of the observer
  this.rotview = 0.0;
  // Gravity
  this.gravity=vec3.create([0.0,-9.81,0.0]);
  // Integration time step
  this.dt=1e-3;
  // Inter-balls collision stiffness
  this.collisstiff=1000;
  // Box' definition
  let color=[0.2,0.5,1.0,1.0];
  this.box=new Box(sizex,sizey,sizez,color);
  this.epsilon=0.9;
  
  // balls' definition
  this.balls=[];
  for(let i=0;i<nb;i++)
  {
    let r=0.04+Math.random()*0.07;
    let m=100.0*r*r*r; /* ball are made of the same matter and are homogeneous */
    let l=2.0*m;
    let color=[Math.random()*0.7+0.3,Math.random()*0.7+0.3,Math.random()*0.7+0.3,1.0];
    let x=(Math.random()-0.5)*sizex;
    let y=(Math.random()-0.5)*sizey;
    let z=(Math.random()-0.5)*sizez;
    let vx=(Math.random()-0.5)*0.0002;
    let vy=(Math.random()-0.5)*0.0002;
    let vz=(Math.random()-0.5)*0.0002;
    
    if (x<this.box.xmin+r) { x=this.box.xmin+r; vx=Math.abs(vx); }
    if (x>this.box.xmax-r) { x=this.box.xmax-r; vx=-Math.abs(vx); }
    
    if (y<this.box.ymin+r) { y=this.box.ymin+r; vy=Math.abs(vy); }
    if (y>this.box.ymax-r) { y=this.box.ymax-r; vy=-Math.abs(vy); }
    
    if (z<this.box.zmin+r) { z=this.box.zmin+r; vz=Math.abs(vz); }
    if (z>this.box.zmax-r) { z=this.box.zmax-r; vz=-Math.abs(vz); }
    let ball=new Ball(this,
      color,
      m, // Kilograms
      l, // Air damping coefficient in N.s/m
      r, // meters
      x,y,z, // meters
      vx,vy,vz); // meters by second
    this.balls.push(ball);
  }
}

/*
 * Detect balls overlap and compute collision response.
 * Collision force is sent to the colliding balls.
 */
Simulation.prototype.handleCollision=function(s1,s2)
{
  /* To complete */
  let ab = vec3.zero();
  vec3.subtract(s1.position, s2.position, ab);
  let dx = ab[0];
  let dy = ab[1];
  let dz = ab[2];
  let d2 = ((dx*dx)+(dy*dy)+(dz*dz));
  let radius2 = s1.radius+s2.radius;
  if(d2<(radius2)*(radius2)){

    let d = Math.sqrt(d2);

    let l = radius2 - d; 
    let f = this.collisstiff * l;

    vec3.normalize(ab);
    vec3.scale(ab, f);

    let fb = vec3.zero();
    vec3.scale(ab, -1.0,fb);

    s1.addCollisionForce(ab);
    s2.addCollisionForce(fb);
  }
}
  
/*
 * Apply constraints to each ball by projection
 * in order fot it to stay inside the box
 */
Simulation.prototype.applyBoxConstraints=function(ball)
{
  let p=vec3.create();
  let v=vec3.create();

  this.box.rotateinv(ball.position,p);
  this.box.rotateinv(ball.velocity,v);
  
  /* to complete */
  /* Modify directly p and v only !!! */

  if( p[0] < this.box.xmin + ball.radius ){
    p[0] = this.box.xmin + ball.radius;
    v[0] *= -this.epsilon;
  }
  if( p[1] < this.box.ymin + ball.radius ){
    p[1] = this.box.ymin + ball.radius;
    v[1] *= -this.epsilon;
  }
  if( p[2] < this.box.zmin + ball.radius ){
    p[2] = this.box.zmin + ball.radius;
    v[2] *= -this.epsilon;
  }
  if( p[0] > this.box.xmax - ball.radius ){
    p[0] = this.box.xmax - ball.radius;
    v[0] *= -this.epsilon;
  }
  if( p[1] > this.box.ymax - ball.radius ){
    p[1] = this.box.ymax - ball.radius;
    v[1] *= -this.epsilon;
  }
  if( p[2] > this.box.zmax - ball.radius ){
    p[2] = this.box.zmax - ball.radius;
    v[2] *= -this.epsilon;
  }

  
  this.box.rotate(p,ball.position);
  this.box.rotate(v,ball.velocity);

  
}

/*
 * Simulation step : state of box and balls go one dt further in time
 */
Simulation.prototype.step = function ()
{ 
  for(let i=0;i<this.balls.length-1;i++)
    for(let j=i+1;j<this.balls.length;j++)
      this.handleCollision(this.balls[i],this.balls[j]);

  this.box.step();
  for(let i=0;i<this.balls.length;i++)
  {
    this.balls[i].step();
    this.applyBoxConstraints(this.balls[i]);
  }
  
}
  
/*
 * Initialization of graphical elements
 */
Simulation.prototype.initGraphics = function()
{
  let pmatrix=mat4.create();    
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pmatrix);
  setProjectionMatrix(pmatrix);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.disable(gl.BLEND);
  setLighting(true);
  setAmbiantLight([0.2,0.2,0.2,1.0]);
  setLightPosition([10.0,20.0,10.0]);
  setLightColor([0.8,0.8,0.8,1.0]);
  setLightSpecular([1.0,1.0,1.0,1.0]);
  setLightAttenuation(1.0,0.0,0.0);
  setNormalizing(true);
  this.cube=new InternalCube();
  this.sphere=new Sphere(1.0,20,20);
}

/*
 * Drawing function
 */
Simulation.prototype.draw = function(elapsed)
{
  let mvmatrix = mat4.create();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.identity(mvmatrix);
  mat4.translate(mvmatrix, [0.0, 0.0, -2.2]);
  mat4.rotate(mvmatrix, Math.PI/6.0, [1, 0, 0]);
  mat4.rotate(mvmatrix, this.rotview, [0, 1, 0]);
  
  // mat4.translate(mvmatrix, [0.0, 0.0, 0.0]);
  setMaterialColor(this.box.color);
  setMaterialSpecular([0.0,0.0,0.0,1.0]);
//    setMaterialShininess(200.0);
  pushMatrix(mvmatrix);
  {
    mat4.rotateZ(mvmatrix,this.box.phi);
    mat4.scale(mvmatrix,this.box.scale);
    setModelViewMatrix(mvmatrix);
    
    setLighting(false);
    gl.disable(gl.CULL_FACE);
    this.cube.drawWireframe();
    gl.enable(gl.CULL_FACE);
    setLighting(true);
    drawObject(this.cube);  
  }
  mvmatrix=popMatrix();

  setMaterialSpecular([1.0,1.0,1.0,1.0]);
  setMaterialShininess(200.0);
  for(let i=0;i<this.balls.length;i++)
  {
    let ball=this.balls[i];
    setMaterialColor(ball.color);
    pushMatrix(mvmatrix);
    {
      mat4.translate(mvmatrix,ball.position);
      mat4.uniformscale(mvmatrix,ball.radius);
      setModelViewMatrix(mvmatrix);
      drawObject(this.sphere);
    }
    mvmatrix=popMatrix();
  }
  this.rotview += elapsed*1e-4;
           // modify view angle by the way of a rotation velocity in rad/s
}



