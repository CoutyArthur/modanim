/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
*/
function Ball(_envi,_color,_mass,_damp,r,x,y,z,vx,vy,vz)
{
  /* Constructor */
  /* ----------- */
  this.position=vec3.create([x,y,z]);
  this.velocity=vec3.create([vx,vy,vz]);
  this.collisforce=vec3.zero();
  this.mass=_mass;
  this.damp=_damp;
  this.radius=r;
  this.color=_color;
  this.envi=_envi;
}

/*
 * Take into account a collision applied to the box
 */
Ball.prototype.addCollisionForce=function (force)
{
  vec3.add(this.collisforce,force);
}

/*
 * Go one step further...
 */
Ball.prototype.step = function ()
{

  /* To complete...
     compute new value for this.position and this.velocity
     Use this.envi.gravity, this.damp, this.collisforce, this.envi.dt, this.mass, etc. 
  */

  let a = vec3.zero();
  vec3.addscale(this.envi.gravity, - this.damp/(this.mass) , this.velocity ,a);
  vec3.addscale(a, 1/this.mass,this.collisforce);
  vec3.addscale(this.velocity, this.envi.dt, a);
  vec3.addscale(this.position, this.envi.dt, this.velocity);
  
  
  vec3.zero(this.collisforce); // Do not remove !!!! Mandatory RAZ of collision force...
}
