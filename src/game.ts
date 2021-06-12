import "phaser";

// class GameObject {
//   body: { update: () => void };
// }

class Player {
  body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  size: number;
  isGrounded: boolean;
  direction: "left" | "right";
  tilt: "up" | "forward" | "down";
  grappleOut: boolean;
  grapplePull: boolean;
  getPos = () => this.body.body.position;
}

export default class Demo extends Phaser.Scene {
  player: Player;
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
    this.player = new Player();
    this.player.body = this.physics.add.sprite(200, 0, "circle");
    this.player.size = 100;

    this.player.body.setBounce(0);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setDrag(1200, 0);
    this.player.body.setMaxVelocity(300, 10000);

    this.anims.create({
      key: "left",
      frames: [{ key: "circle", frame: 0 }],
      frameRate: 10,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "circle", frame: 1 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: [{ key: "circle", frame: 2 }],
      frameRate: 10,
    });
  }

  setupControls(): void {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.cursors.left.onDown = () => {
      this.cursors.left.isDown = true;
      this.player.body.setAccelerationX(-1800);
      this.player.body.anims.play("left", true);
      this.player.direction = "left";
    };
    this.cursors.right.onDown = () => {
      this.cursors.right.isDown = true;
      this.player.body.setAccelerationX(1800);
      this.player.body.anims.play("right", true);
      this.player.direction = "right";
    };
    this.cursors.space.setEmitOnRepeat(false);
    this.cursors.space.onDown = () => {
      this.cursors.space.isDown = true;
      if (this.player.isGrounded) {
        this.player.body.setVelocityY(-500);
      }
    };

    //Shoot Grapple
    this.cursors.shift.onDown = () => {
      // Make Grapple Object
      if (!this.player.grappleOut) {
        this.grapplePoint = this.emitGrapple();
        this.player.grappleOut = true;

        // Wait until the grapple hits a platform
        this.physics.add.overlap(
          this.grapplePoint,
          this.platforms,
          (grapple: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
            grapple.setVelocity(0);
            this.player.grapplePull = true;
            this.player.body.setMaxVelocity(1000, 1000);

            // this.player.grapplePoint = new Phaser.Math.Vector2(
            //   grapplePoint.body.position
            // );

            // Wait until player catches up to grapple, destroy it then
            this.physics.add.overlap(
              this.grapplePoint,
              this.player.body,
              (grapple: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
                this.player.grappleOut = false;
                this.player.grapplePull = false;
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
    console.log("grapple");
    console.log(this.arrow.angle);

    this.arrow.angle = this.arrow.angle + 90;

    const grapplePoint = this.physics.add.sprite(
      this.player.getPos().x + this.player.size / 2,
      this.player.getPos().y + this.player.size / 2,
      "grapple"
    );
    grapplePoint.body.setAllowGravity(false);

    grapplePoint.setVelocity(
      1000 * Math.sin(this.arrow.angle / (Math.PI / 180)),
      1000 * Math.cos(this.arrow.angle / (Math.PI / 180))
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

    this.setupMouse();

    // Add physics collisions
    this.physics.add.collider(this.player.body, this.platforms);

    // Place arrow
    this.arrow = this.add.sprite(500, 500, "arrow");
  }

  setupMouse(): void {
    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        if (!this.pointerDown) {
          console.log(pointer.worldX);
          console.log(pointer.worldY);
          this.pointerDown = true;
        }
      },
      this
    );

    this.input.on(
      "pointerup",
      () => {
        if (this.pointerDown) {
          this.pointerDown = false;
        }
      },
      this
    );
  }

  pointerDown = false;

  update(): void {
    // Player Logic
    this.player.isGrounded = this.player.body.body.touching.down;

    if (this.cursors.up.isDown) this.player.tilt = "up";
    else if (this.cursors.down.isDown) this.player.tilt = "down";
    else this.player.tilt = "forward";

    if (!(this.cursors.right.isDown || this.cursors.left.isDown)) {
      this.player.body.setAccelerationX(0);
      this.player.body.anims.play("turn");
    }

    // Arrow logic
    const arrowPos = {
      x: this.player.body.body.position.x + this.player.size / 2,
      y: this.player.body.body.position.y + this.player.size / 2,
    };

    this.arrow.visible = true;

    if (this.player.direction == "left") {
      this.arrow.angle = 180;
      arrowPos.x -= this.player.size / 2;
    } else if (this.player.direction == "right") {
      this.arrow.angle = 0;
      arrowPos.x += this.player.size / 2;
    } else {
      this.arrow.visible = false;
    }

    if (this.player.tilt == "up") {
      this.arrow.angle += this.player.direction == "left" ? 45 : -45;
      arrowPos.y -= this.player.size / 4;
    } else if (this.player.tilt == "down") {
      this.arrow.angle += this.player.direction == "left" ? -45 : 45;
      arrowPos.y += this.player.size / 4;
    }

    this.arrow.setPosition(arrowPos.x, arrowPos.y);

    // Grapple Pull
    if (this.player.grapplePull) {
      console.log(this.grapplePoint.body.position);
      // const dir = this.player.getPos().subtract(this.player.grapplePoint);
      const dir = {
        x: this.grapplePoint.body.position.x - this.player.getPos().x,
        y: this.grapplePoint.body.position.y - this.player.getPos().y,
      };

      console.log(dir);
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
