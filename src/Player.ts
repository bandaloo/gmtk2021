import { HeartDisplay } from "./HeartDisplay";
import { ENTITY_SIZE, VELOCITY_EPSILON } from "./consts";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import KeyboardPlugin = Phaser.Input.Keyboard.KeyboardPlugin;
import { Grapple } from "./grapple";

export class Player {
  private maxHealth = 3;
  private currentHealth = this.maxHealth;
  /** the maximum number of hearts you can have even with upgrades */
  private maxMaxHealth = 10;
  private heartDisplay: HeartDisplay;
  public grapple: Grapple | undefined;

  public constructor(
    public sprite: SpriteWithDynamicBody,
    public kbp: KeyboardPlugin,
    public platforms: Phaser.Physics.Arcade.StaticGroup
  ) {
    this.heartDisplay = new HeartDisplay(this.sprite.scene, this.maxMaxHealth);
    this.heartDisplay.redisplay(this.currentHealth, this.maxHealth);
    this.sprite.name = "player";
    this.sprite.setData("outerObject", this);
    this.sprite.body.setBounce(0, 0);
    this.sprite.body.setSize(ENTITY_SIZE, ENTITY_SIZE);
    this.sprite.setSize(ENTITY_SIZE, ENTITY_SIZE);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setDrag(1200, 0);
    this.sprite.body.setMaxVelocity(300, 10000);
    this.sprite.setData("direction", "forward");

    this.sprite.body.offset.add({ x: 0, y: 30 });
    this.sprite.anims.create({
      key: "player_move",
      frames: this.sprite.anims.generateFrameNumbers("blob_move", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.sprite.anims.create({
      key: "player_still",
      frames: this.sprite.anims.generateFrameNumbers("blob_still", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.kbp.on("keydown-SPACE", () => {
      if (this.sprite.body.touching.down) {
        this.sprite.body.setVelocityY(-900);
      }
      if (this.sprite.getData("grapplePull")) {
        this.grapple.destroy();
        this.sprite.setData("grapplePull", false);
        this.sprite.setData("grappleOut", false);
      }
    });

    this.kbp.on("keyup-SPACE", () => {
      if (this.sprite.body.velocity.y < 0) {
        this.sprite.body.setVelocityY(this.sprite.body.velocity.y / 2);
      }
    });

    this.kbp.on("keyup-SHIFT", () => {
      if (!this.sprite.getData("grappleOut")) {
        this.grapple = new Grapple(
          this.sprite.scene.physics.add.sprite(
            this.sprite.body.position.x + this.sprite.displayWidth / 4,
            this.sprite.body.position.y + this.sprite.displayHeight / 4,
            "grapple_hand"
          ),
          this.sprite.getData("angle"),
          this,
          this.platforms
        );
        this.sprite.setData("grappleOut", true);
      }
    });
  }

  public update(): void {
    if (Math.abs(this.sprite.body.velocity.x) > VELOCITY_EPSILON) {
      this.sprite.anims.play("player_move", true);
      this.sprite.setFlipX(this.sprite.body.velocity.x > 0);
    } else {
      this.sprite.anims.play("player_still", true);
    }

    const cursors = this.kbp.createCursorKeys();

    if (cursors.right.isDown) {
      this.sprite.body.setAccelerationX(1800);
      this.sprite.setData("direction", "right");
    } else if (cursors.left.isDown) {
      this.sprite.body.setAccelerationX(-1800);
      this.sprite.setData("direction", "left");
    } else {
      this.sprite.body.setAccelerationX(0);
    }

    // Grapple Pull
    if (this.sprite.getData("grapplePull")) {
      const dir = {
        x: this.grapple.sprite.x - this.sprite.body.position.x,
        y: this.grapple.sprite.y - this.sprite.body.position.y,
      };

      this.sprite.body.setVelocityX(dir.x * 10);
      this.sprite.body.setVelocityY(dir.y * 10);
    }

    // This is a dumb way to get player angle. Too bad!
    if (this.sprite.getData("direction") == "right")
      this.sprite.setData("angle", 0);
    if (this.sprite.getData("direction") == "left")
      this.sprite.setData("angle", 180);

    if (this.sprite.getData("direction") == "right" && cursors.up.isDown)
      this.sprite.setData("angle", -45);
    if (this.sprite.getData("direction") == "left" && cursors.down.isDown)
      this.sprite.setData("angle", 135);

    if (this.sprite.getData("direction") == "right" && cursors.down.isDown)
      this.sprite.setData("angle", 45);
    if (this.sprite.getData("direction") == "left" && cursors.up.isDown)
      this.sprite.setData("angle", -135);

    // TODO this doesn't seem to work
    if (
      (this.sprite.body.touching.left && this.sprite.body.acceleration.x < 0) ||
      (this.sprite.body.touching.right && this.sprite.body.acceleration.x > 0)
    ) {
      this.sprite.body.setVelocityX(0);
      this.sprite.body.setAccelerationX(0);
      return;
    }

    if (this.grapple) {
      this.grapple.update();
    }
  }

  public takeDamage(): void {
    this.currentHealth--;
    this.heartDisplay.redisplay(this.currentHealth, this.maxHealth);
    if (this.currentHealth <= 0) {
      // TODO lose the game
    }
  }
}
