/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
*/
function Box(sizex,sizey,sizez,col)
{
  /* Constructor */
  /* ----------- */
  this.color=col;
  this.xmin = -sizex/2.0;
  this.ymin = -sizey/2.0;
  this.zmin = -sizez/2.0;
  this.xmax = sizex/2.0;
  this.ymax = sizey/2.0;
  this.zmax = sizez/2.0;
  this.scale= [sizex,sizey,sizez];
  this.phi=0.0;
  this.dphi=0.0005;
  this.rotmat=mat3.identity();
  this.invrotmat=mat3.identity();
}

/*
 * simulation step : all states of the object goes one dt further
 */
Box.prototype.step = function ()
{ 
  this.phi+=this.dphi;
  mat3.rotationZ(this.phi,this.rotmat);
  mat3.transpose(this.rotmat,this.invrotmat);
}
/*
 * Compute a point position after box rotation
 */
Box.prototype.rotate = function(vin,vout)
{
  mat3.multiplyVec3(this.rotmat,vin,vout);
}
/*
 * Compute the original position of a rotated point (inverse rotation)
 */
Box.prototype.rotateinv = function(vin,vout)
{
  mat3.multiplyVec3(this.invrotmat,vin,vout);
}
