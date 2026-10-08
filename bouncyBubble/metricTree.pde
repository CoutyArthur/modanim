class MetricTree {
  int id = -1;
  ArrayList<Ball> particles;
  MetricTree mtInside = null;
  MetricTree mtOutside = null;
  float mtRadius;
  
  
  void insert(int newId, ArrayList<Ball> _particles, float mtR)
  {
    if(this.id == -1)
    {
      this.id = newId;
      this.mtRadius = mtR;
      this.particles = _particles;
      return;
    }
    Ball newPos = this.particles.get(newId);
    Ball myPos = this.particles.get(this.id);
    float d = dist(newPos.x, newPos.y, myPos.x, myPos.y);
    if(d<this.mtRadius)
    {
      if(this.mtInside == null)
      {
        this.mtInside = new MetricTree();
      }
      this.mtInside.insert(newId, _particles, this.mtRadius/2);
    }
    else
    {
      if(this.mtOutside == null)
      {
        this.mtOutside = new MetricTree();
      }
      this.mtOutside.insert(newId, _particles, this.mtRadius);
    }
  }
  
  void search(PVector pos, float rInteraction, IntList neighbours)
  {
    if (this.id == -1) return;
    Ball myPos = this.particles.get(this.id);
    float d = dist(pos.x, pos.y, myPos.x, myPos.y);
    if(d<rInteraction) neighbours.append(this.id);
    if(d<mtRadius)
    {
      if(this.mtInside != null)
      {
        this.mtInside.search(pos, rInteraction, neighbours);
      }
      if((this.mtOutside != null) && (d +  rInteraction > this.mtRadius))
      {
        this.mtOutside.search(pos, rInteraction, neighbours);
      }
    }
    else
    {
      if(this.mtOutside != null)
      {
        this.mtOutside.search(pos, rInteraction, neighbours);
      }
      if((this.mtInside != null) && (d +  this.mtRadius < rInteraction))
      {
        this.mtInside.search(pos, rInteraction, neighbours);
      }
    }
  }
}
