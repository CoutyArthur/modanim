/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
 * Note : this code has been freely adapted from Nehe webgl tutorials
*/
var lasttime = 0;
var cumultime = 0;

var simul;

function tick()
{
  requestAnimFrame(tick);

  let timenow = new Date().getTime(); // in ms
  if (lasttime != 0)
  {
    let elapsed = timenow - lasttime;

    for (let i=0;i<elapsed/(1000.0*simul.dt);i++) // how many timestep (in seconds)?
      simul.step();
    cumultime+=elapsed; // in ms
    if (cumultime>30) // >30ms means a framerate at most 33Hz but not more....
    {
      simul.draw(cumultime);
      cumultime=0;
    }
  }
  lasttime = timenow;
}

function startSimul()
{
  var canvas = document.getElementById("webglcanvas");
  initWGL(canvas);
  simul=new Simulation(1.0,1.0,1.0,30);
  simul.initGraphics();

  tick();
}

