/**
 * Bouncy Bubbles  
 * based on code from Keith Peters. 
 * 
 * Multiple-object collision.
 */
 
 
int numBalls = 12000;
float spring = 0.05;
float gravity = 0.03;
float friction = -0.9;
ArrayList<Ball> balls = new ArrayList<Ball>();

void setup() {
  size(640, 360);
  for (int i = 0; i < numBalls; i++) {
    Ball b= new Ball(random(width), random(height), random(3, 7), i);
    balls.add(b);
  }
  noStroke();
  fill(255, 204);
}

void draw() {
  background(0);
  
  MetricTree mt = new MetricTree();
  for(int i = 0;i<numBalls; i++)
  {
    mt.insert(i, balls, width/2);
  }
  
  for (Ball ball : balls) {
    ball.collide(mt, balls);
    ball.move();
    ball.display();  
  }
}
