import { HeartDisplay } from "./HeartDisplay";
import {
  ENTITY_SIZE,
  MAX_TINT_TIMER,
  PLAYER_ACC_AIR,
  PLAYER_ACC_GROUND,
  PLAYER_DRAG,
  PLAYER_MAX_SPEED_GRAPPLE_X,
  PLAYER_MAX_SPEED_NORMAL_X,
  PLAYER_MAX_SPEED_NORMAL_Y,
  VELOCITY_EPSILON,
} from "./consts";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import KeyboardPlugin = Phaser.Input.Keyboard.KeyboardPlugin;
import { Grapple } from "./Grapple";
import { Enemy } from "./Enemy";
import { colorToNum } from "./utils";
import RandomLevel, { crunchSound } from "./game";
import Demo from "./game"; // TODO this should be the same TOO BAD!
import { jumpSound, slurp, takeDamageSound } from "./game";

export type PlayerAction = (player: Player, demo: Demo) => void;

type PlayerAnimationKeys = {
  still: string;
  move: string;
  dropping: string;
  egg: string;
  falling: string;
  rising: string;
};

export class Player {
  maxHealth = 3;
  public currentHealth = this.maxHealth;
  /** the maximum number of hearts you can have even with upgrades */
  maxMaxHealth = 10;
  private heartDisplay: HeartDisplay;
  public grapple: Grapple | undefined;
  public grapplePull: boolean;
  public direction: "right" | "left" | "forward";
  private shootAngle: integer;
  public cosmetics: {
    sprite: Phaser.GameObjects.Sprite;
    keys: PlayerAnimationKeys;
  }[] = [];
  private grappleAction: PlayerAction = () => {
    if (!this.grapple) {
      slurp.play();
      this.grapple = new Grapple(
        this.sprite.scene.physics.add.sprite(
          this.sprite.body.position.x + this.sprite.displayWidth / 4,
          this.sprite.body.position.y + this.sprite.displayHeight / 4,
          "grapple_hand"
        ),
        this.shootAngle,
        this,
        this.grappleGroup
      );
    }
  };
  private primaryAction: PlayerAction = this.grappleAction;

  tintTimer = 0;

  private actionCharges = 0;
  private isDead: boolean;
  private actionCooldown = 30;
  private actionTimer = this.actionCooldown;

  public constructor(
    public sprite: SpriteWithDynamicBody,
    public kbp: KeyboardPlugin,
    public playerGroup: Phaser.Physics.Arcade.Group,
    public grappleGroup: Phaser.Physics.Arcade.Group,
    public demo: Demo,
    health?: number,
    maxHealth?: number
  ) {
    if (maxHealth !== undefined) {
      this.maxHealth = maxHealth;
      console.log("max health", this.maxHealth);
    }

    if (health !== undefined) {
      this.currentHealth = health;
    }

    this.heartDisplay = new HeartDisplay(this.sprite.scene, this.maxMaxHealth);
    this.heartDisplay.redisplay(this.currentHealth, this.maxHealth);
    this.sprite.name = "player";
    this.sprite.setData("outerObject", this);
    this.sprite.body.setSize(ENTITY_SIZE, ENTITY_SIZE);
    this.sprite.setSize(ENTITY_SIZE, ENTITY_SIZE);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setBounce(0, 0);
    this.sprite.body.setDrag(PLAYER_DRAG, 0);
    this.direction = "forward";
    this.grapplePull = false;
    this.isDead = false;
    this.sprite.setDepth(100);
    playerGroup.add(sprite);

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

    this.sprite.anims.create({
      key: "player_rising",
      frames: this.sprite.anims.generateFrameNumbers("blob_rising", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.sprite.anims.create({
      key: "player_falling",
      frames: this.sprite.anims.generateFrameNumbers("blob_falling", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.sprite.anims.create({
      key: "player_egg",
      frames: this.sprite.anims.generateFrameNumbers("blob_egg", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.sprite.anims.create({
      key: "player_dropping",
      frames: this.sprite.anims.generateFrameNumbers("blob_dropping", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.kbp.on("keydown-SPACE", () => {
      if (!this.isDead) {
        if (this.sprite.body.touching.down) {
          this.sprite.body.setVelocityY(-900);
        }
        if (this.grapplePull) {
          this.grapple.destroy();
          this.grapplePull = false;
        }
        if (this.sprite.body.touching.down) {
          jumpSound.play();
          this.sprite.body.setVelocityY(-900);
        }
        if (this.grapplePull) {
          this.grapple.destroy();
          this.grapplePull = false;
        }
      }
    });

    this.kbp.on("keyup-SPACE", () => {
      if (!this.isDead) {
        if (this.sprite.body.velocity.y < 0) {
          this.sprite.body.setVelocityY(this.sprite.body.velocity.y / 2);
        }
      }
    });

    this.kbp.on("keydown-SHIFT", () => {
      if (!this.isDead) {
        if (this.actionTimer <= 0) {
          this.primaryAction(this, this.demo);
          this.actionTimer = this.actionCooldown;
          if (this.primaryAction !== this.grappleAction) {
            this.actionCharges--;
            if (this.actionCharges === 0) {
              this.resetCosmetics();
              this.primaryAction = this.grappleAction;
            }
          }
        }
      }
    });
    this.resetCosmetics();
  }

  private resetCosmetics(): void {
    for (const c of this.cosmetics) {
      c.sprite.destroy();
    }
    this.cosmetics = [];
  }

  /**
   * @param zIndex note that the base sprite's z index is 100.
   */
  public addCosmetic(
    sprite: Phaser.GameObjects.Sprite,
    keys: PlayerAnimationKeys
  ): void {
    this.cosmetics.push({ sprite: sprite, keys: keys });
  }

  public update(): void {
    if (this.tintTimer > 0) this.tintTimer--;
    const gb = Math.floor(255 - 255 * (this.tintTimer / MAX_TINT_TIMER));
    const red = colorToNum(255, gb, gb);
    this.sprite.setTint(red);
    if (!this.sprite.body.touching.down) {
      const fallingSpeed = this.sprite.body.velocity.y;
      if (fallingSpeed > 400) {
        this.sprite.anims.play("player_dropping", true);
        for (const c of this.cosmetics) {
          c.sprite.anims.play(c.keys.dropping, true);
        }
      } else if (fallingSpeed > 200) {
        this.sprite.anims.play("player_egg", true);
        for (const c of this.cosmetics) {
          c.sprite.anims.play(c.keys.egg, true);
        }
      } else if (fallingSpeed > -200) {
        this.sprite.anims.play("player_falling", true);
        for (const c of this.cosmetics) {
          c.sprite.anims.play(c.keys.falling, true);
        }
      } else {
        this.sprite.anims.play("player_rising", true);
        for (const c of this.cosmetics) {
          c.sprite.anims.play(c.keys.rising, true);
        }
      }
    } else if (Math.abs(this.sprite.body.velocity.x) > VELOCITY_EPSILON) {
      this.sprite.anims.play("player_move", true);
      this.sprite.setFlipX(this.sprite.body.velocity.x > 0);
      for (const c of this.cosmetics) {
        c.sprite.anims.play(c.keys.move, true);
      }
    } else {
      this.sprite.anims.play("player_still", true);
      for (const c of this.cosmetics) {
        c.sprite.anims.play(c.keys.still, true);
      }
    }
    for (const c of this.cosmetics) {
      c.sprite.setFlipX(this.direction !== "left");
    }

    const cursors = this.kbp.createCursorKeys();

    const acc = this.sprite.body.touching.down
      ? PLAYER_ACC_GROUND
      : PLAYER_ACC_AIR;

    if (cursors.right.isDown) {
      this.sprite.body.setAccelerationX(acc);
      this.direction = "right";
    } else if (cursors.left.isDown) {
      this.sprite.body.setAccelerationX(-acc);
      this.direction = "left";
    } else {
      this.sprite.body.setAccelerationX(0);
    }

    if (this.grapplePull) {
      this.sprite.body.setMaxVelocity(
        PLAYER_MAX_SPEED_GRAPPLE_X,
        PLAYER_MAX_SPEED_NORMAL_Y
      );
    } else {
      this.sprite.body.setMaxVelocity(
        PLAYER_MAX_SPEED_NORMAL_X,
        PLAYER_MAX_SPEED_NORMAL_Y
      );
    }

    // Grapple Pull
    if (this.grapplePull) {
      const dir = {
        x:
          this.grapple.sprite.body.x -
          this.grapple.sprite.body.width / 2 -
          this.sprite.body.position.x,
        y:
          this.grapple.sprite.body.y -
          this.grapple.sprite.body.height / 2 -
          this.sprite.body.position.y,
      };

      this.sprite.body.setVelocityX(dir.x * 10);
      this.sprite.body.setVelocityY(dir.y * 10);
    }

    // This is a dumb way to get player angle. Too bad!
    if (this.direction == "right") this.shootAngle = 0;
    if (this.direction == "left") this.shootAngle = 180;

    if (this.direction == "right" && cursors.up.isDown) this.shootAngle = -45;
    if (this.direction == "left" && cursors.down.isDown) this.shootAngle = 135;

    if (this.direction == "right" && cursors.down.isDown) this.shootAngle = 45;
    if (this.direction == "left" && cursors.up.isDown) this.shootAngle = -135;

    if (this.grapple) {
      this.grapple.update();
    }

    // keep cosmetic sprites attached to this
    for (const c of this.cosmetics) {
      c.sprite.x = this.sprite.x;
      c.sprite.y = this.sprite.y;
    }

    this.actionTimer--;
  }

  public takeDamage(damage = 1): void {
    damage = Math.floor(damage);
    if (this.tintTimer > 0) return;
    if (damage <= 0) return;
    this.currentHealth -= damage;
    takeDamageSound.play();
    this.tintTimer = MAX_TINT_TIMER;
    this.heartDisplay.redisplay(this.currentHealth, this.maxHealth);
    if (this.currentHealth <= 0) {
      // only set gameOver one time
      const level = this.sprite.scene as RandomLevel;
      level.gameOver = true;
      this.isDead = true;
      this.sprite.body.setVelocity(0, this.sprite.body.velocity.y);
    }
  }

  public dead(): void {
    this.sprite.body.setMaxVelocity(0, 1000); // only limit x
    if (this.sprite.scene instanceof RandomLevel) {
      this.sprite.scene.storePlayerHealthBetweenLevels = 3;
      this.sprite.scene.storePlayerMaxHealthBetweenLevels = 3;
    }
    if (this.grapple) this.grapple.destroy();
  }

  public eatFruit(): void {
    this.currentHealth = Math.min(this.currentHealth + 1, this.maxHealth);
    this.heartDisplay.redisplay(this.currentHealth, this.maxHealth);
  }

  public absorb(enemy: Enemy): void {
    enemy.playerStuff.initialize(this);
    this.primaryAction = enemy.playerStuff.action;
    this.actionCharges = enemy.playerStuff.charges;
    this.actionCooldown = enemy.playerStuff.cooldown;
    this.actionTimer = 0; // let the player use the action immediately
    crunchSound.play();
  }
}
