import "phaser";

// class Player extends Phaser.Physics.Arcade.Sprite {
//   constructor(scene: Scene, x: integer, y: integer) {
//     super(scene, x, y, "circle", 1);
//   }
//   // torename: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
//   body: ABody;
//   size: number;
//   isGrounded: boolean;
//   direction: "left" | "right";
//   tilt: "up" | "forward" | "down";
//   angle: integer;
//   grappleOut: boolean;
//   grapplePull: boolean;
//   // getPos = () => this.bo
// }

export default class Demo extends Phaser.Scene {
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  arrow: Phaser.GameObjects.Sprite;
  grapplePoint: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super("demo");
  }

  preload(): void {
    this.load.image("rectangle", "assets/rectangle.png");
    this.load.glsl("stars", "assets/starfields.glsl.js");
    this.load.image("oldcircle", "assets/blank circle.png");
    this.load.image("arrow", "assets/arrow.png");
    this.load.spritesheet("circle", "assets/circle tileset.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
  }

  placePlatforms(): void {
    // Create Platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms
      .create(
        +this.game.config.width / 2,
        +this.game.config.height,
        "rectangle"
      )
      .setScale(10, 1)
      .refreshBody();
    this.platforms
      .create(+this.game.config.width / 2, 0, "rectangle")
      .setScale(10, 1)
      .refreshBody();

    this.platforms
      .create(0, +this.game.config.height / 2, "rectangle")
      .setScale(1, 10)
      .refreshBody();
    this.platforms
      .create(
        +this.game.config.width,
        +this.game.config.height / 2,
        "rectangle"
      )
      .setScale(1, 10)
      .refreshBody();
  }

  createPlayer(): void {
    this.player = this.physics.add.sprite(200, 200, "circle");

    this.player.body.setBounce(0, 0);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setDrag(1200, 0);
    this.player.body.setMaxVelocity(300, 10000);

    this.player.anims.create({
      key: "left",
      frames: [{ key: "circle", frame: 0 }],
      frameRate: 20,
    });

    this.player.anims.create({
      key: "turn",
      frames: [{ key: "circle", frame: 1 }],
      frameRate: 20,
    });

    this.player.anims.create({
      key: "right",
      frames: [{ key: "circle", frame: 2 }],
      frameRate: 20,
    });
  }

  setupControls(): void {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.cursors.left.onDown = () => {
      this.cursors.left.isDown = true;
      this.player.body.setAccelerationX(-1800);
      console.log("left");
      this.player.anims.play("left", true);
      this.player.setData("direction", "left");
    };
    this.cursors.right.onDown = () => {
      this.cursors.right.isDown = true;
      this.player.body.setAccelerationX(1800);
      console.log("right");
      this.player.anims.play("right", true);
      this.player.setData("direction", "right");
    };
    this.cursors.space.setEmitOnRepeat(false);
    this.cursors.space.onDown = () => {
      this.cursors.space.isDown = true;
      if (this.player.body.touching.down) {
        this.player.body.setVelocityY(-500);
      }
    };

    //Shoot Grapple
    this.cursors.shift.onDown = () => {
      // Make Grapple Object
      if (!this.player.getData("grappleOut")) {
        this.grapplePoint = this.emitGrapple();
        this.player.setData("grappleOut", true);

        // Wait until the grapple hits a platform
        this.physics.add.overlap(
          this.grapplePoint,
          this.platforms,
          (grapple: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
            grapple.setVelocity(0);
            this.player.setData("grapplePull", true);
            this.player.body.setMaxVelocity(1000, 1000);

            // Wait until player catches up to grapple, destroy it then
            this.physics.add.overlap(
              this.grapplePoint,
              this.player,
              (grapple: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
                this.player.setData("grappleOut", false);
                this.player.setData("grapplePull", false);
                // this.player.grapplePoint = undefined;
                grapple.destroy();
                this.player.body.setMaxVelocity(300, 10000);
              },
              null,
              this
            );
          },
          null,
          this
        );
      }
    };
  }

  emitGrapple(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    const grapplePoint = this.physics.add.sprite(
      this.player.body.position.x + this.player.body.width / 2,
      this.player.body.position.y + this.player.body.width / 2,
      "grapple"
    );
    grapplePoint.body.setAllowGravity(false);

    grapplePoint.setVelocity(
      1000 * Math.cos(this.arrow.rotation),
      1000 * Math.sin(this.arrow.rotation)
    );
    grapplePoint.setAngle(this.arrow.angle);

    return grapplePoint;
  }

  create(): void {
    // Background shader
    this.add.shader("RGB Shift Field", 0, 0, 800, 600).setOrigin(0);

    this.placePlatforms();

    this.createPlayer();

    this.setupControls();

    // Add physics collisions
    this.physics.add.collider(this.player, this.platforms);

    // Place arrow
    this.arrow = this.add.sprite(500, 500, "arrow");
  }

  update(): void {
    // Player Logic
    // if (this.cursors.up.isDown) this.player.tilt = "up";
    // else if (this.cursors.down.isDown) this.player.tilt = "down";
    // else this.player.tilt = "forward";

    if (!(this.cursors.right.isDown || this.cursors.left.isDown)) {
      this.player.body.setAccelerationX(0);
      this.player.anims.play("turn");
    }

    // Arrow logic
    const arrowPos = {
      x: this.player.body.position.x + this.player.body.width / 2,
      y: this.player.body.position.y + this.player.body.width / 2,
    };

    this.arrow.visible = true;

    // Determine player angle
    // TODO: this seems like a really stupid way to do this, and could be made better
    if (this.player.getData("direction") == "right") this.player.angle = 0;
    if (this.player.getData("direction") == "left") this.player.angle = 180;

    if (this.player.getData("direction") == "right" && this.cursors.up.isDown)
      this.player.angle = -45;
    if (this.player.getData("direction") == "left" && this.cursors.down.isDown)
      this.player.angle = 135;

    if (this.player.getData("direction") == "right" && this.cursors.down.isDown)
      this.player.angle = 45;
    if (this.player.getData("direction") == "left" && this.cursors.up.isDown)
      this.player.angle = -135;

    // Determine arrow pos
    this.arrow.angle = this.player.angle;

    if (this.player.getData("direction") == "left") {
      arrowPos.x -= this.player.body.width / 2;
    } else if (this.player.getData("direction") == "right") {
      arrowPos.x += this.player.body.width / 2;
    } else {
      this.arrow.visible = false;
    }

    if (this.cursors.up.isDown) {
      arrowPos.y -= this.player.body.width / 4;
    } else if (this.cursors.down.isDown) {
      arrowPos.y += this.player.body.width / 4;
    }

    this.arrow.setPosition(arrowPos.x, arrowPos.y);

    // Grapple Pull
    if (this.player.getData("grapplePull")) {
      const dir = {
        x: this.grapplePoint.body.position.x - this.player.body.position.x,
        y: this.grapplePoint.body.position.y - this.player.body.position.y,
      };

      this.player.body.setVelocityX(dir.x * 10);
      this.player.body.setVelocityY(dir.y * 10);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#125555",
  width: 800,
  height: 600,
  scene: Demo,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 800 },
    },
  },
};

new Phaser.Game(config);
