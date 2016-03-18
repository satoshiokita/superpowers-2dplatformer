class PlayerBehavior extends Sup.Behavior {
  speed:number = 0.3;
  jumpSpeed:number = 0.45;

  solidBodies:Sup.ArcadePhysics2D.Body[] = [];
  platformBodies:Sup.ArcadePhysics2D.Body[] = [];
  goalBody:Sup.ArcadePhysics2D.Body;

  awake() {
    // We get ant store all the physic bodies in two list.
    // Map and T-Rex
    let solidActors = Sup.getActor("Solids").getChildren();
    for (let solidActor of solidActors) {
      this.solidBodies.push(solidActor.arcadeBody2D);
    }
    
    // Platforms
    let platformActors = Sup.getActor("Platforms").getChildren();
    for (let platformActor of platformActors) {
      this.platformBodies.push(platformActor.arcadeBody2D);
    }
    
    this.goalBody = Sup.getActor("Goal").arcadeBody2D;
  }

  update() {
    // First, we do the check with solid bodies(map and t-rex)
    Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, this.solidBodies);
    let touchSolids = this.actor.arcadeBody2D.getTouches().bottom;
    let velocity = this.actor.arcadeBody2D.getVelocity();
    
    Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, this.goalBody);
    let touchGoal = this.actor.arcadeBody2D.getTouches();
    if (touchGoal.left || touchGoal.right || touchGoal.bottom) {
      // Clear stage.
      Sup.loadScene("Goal/Scene");
    }
    
    // When falling, we do the check with one-way platforms
    let touchPlatforms = false;
    if (velocity.y < 0) {
      // We must change the size of the player body so only the feet are checked to do so,
      // we reduce the height of the body and adapt the offset
      this.actor.arcadeBody2D.setSize(1.5, 0.4);
      this.actor.arcadeBody2D.setOffset({x: 0, y: 0.2});
      
      // Now, we can do check with every platform
      for (let platformBody of this.platformBodies) {
        Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, platformBody);
        if (this.actor.arcadeBody2D.getTouches().bottom) {
          touchPlatforms = true;
          velocity.y = 0;
          break;
        }
      }
      
      // After the check, we have to reset the phycis body to its normal size
      this.actor.arcadeBody2D.setSize(1.5, 1.8);
      this.actor.arcadeBody2D.setOffset({x:0, y:0.9});
    }
    
    
    // We orverride the `.x` component based on the player's input
    if (Sup.Input.isKeyDown("LEFT")) {
      velocity.x = -this.speed;
      // When going left, we have to flip the sprite
      this.actor.spriteRenderer.setHorizontalFlip(true);
    } else if (Sup.Input.isKeyDown("RIGHT")) {
      velocity.x = this.speed;
      // When goint right, we cancel the flip
      this.actor.spriteRenderer.setHorizontalFlip(false);
    } else {
      velocity.x = 0;
    }
    
    // If hte player is on the gournd and want to jump,
    // we update the `.y` component accoringly
    let touchBottom = touchSolids || touchPlatforms;
    if (touchBottom) {
      if (Sup.Input.wasKeyJustPressed("SPACE")) {
        velocity.y = this.jumpSpeed;
        this.actor.spriteRenderer.setAnimation("Jump");
      } else {
        // There, we sould play either 'Idle' or 'Run' depending on the horizontal speed
        if (velocity.x == 0) this.actor.spriteRenderer.setAnimation("Idle");
        else this.actor.spriteRenderer.setAnimation("Run");
      }
    } else {
      // There, we sould play either 'Jump' or 'Fall' depending on the vertical speed
      if (velocity.y >= 0) this.actor.spriteRenderer.setAnimation("Jump");
      else this.actor.spriteRenderer.setAnimation("Fall");
    }
    
    // Finally, we apply the velocity back to the ArcadePhysics body
    this.actor.arcadeBody2D.setVelocity(velocity);
  }
}
Sup.registerBehavior(PlayerBehavior);
