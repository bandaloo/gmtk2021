import { VELOCITY_EPSILON } from "./consts";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import Vector2 = Phaser.Math.Vector2;
import { Projectile } from "./Projectile";
import Demo from "./game";

export class Bat extends Enemy {
  private timeBetweenFlaps = 120;
  private flapTimer = Phaser.Math.Between(30, this.timeBetweenFlaps);
  private timeBetweenSwoops = 500;
  private swoopTimer = Phaser.Math.Between(30, this.timeBetweenSwoops);
  /** -1 for left, 1 for right */
  private direction: -1 | 1 = 1;
  private swooping = false;

  public playerStuff = {
    initialize: this.playerInitialize,
    action: this.playerAction,
    charges: 3,
    cooldown: 25,
  };

  constructor(sprite: SpriteWithDynamicBody) {
    super(sprite);
    this.currentHealth = 1;
    this.maxHealth = 1;
    this.sprite.body.setAcceleration(0, 0);
    this.sprite.setSize(120, 120);
    this.sprite.body.setSize(120, 120);
    this.sprite.body.setBounce(0.5, 0.5);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setDrag(150, 150);
    this.sprite.body.setMaxVelocity(300, 10000);
    this.sprite.body.setAllowGravity(false);
    this.sprite.anims.create({
      key: "bat_flying",
      frames: this.sprite.anims.generateFrameNumbers("bat_flying", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.sprite.anims.create({
      key: "bat_swooping",
      frames: this.sprite.anims.generateFrameNumbers("bat_swooping", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.sprite.anims.play("bat_flying", true);
  }

  public update(): void {
    if (this.currentHealth <= 0 || this.sprite?.body === undefined) return;
    if (Math.abs(this.sprite.body.velocity.x) >= VELOCITY_EPSILON) {
      this.sprite.setFlipX(this.sprite.body.velocity.x >= 0);
    }
    if (this.swooping) {
      this.sprite.body.setAcceleration(this.sprite.body.acceleration.x, 2200);
    }

    // see if we should flap
    if (!this.swooping && this.flapTimer <= 0) {
      this.flap();
      this.flapTimer = this.timeBetweenFlaps;
    }
    // see if we can swoop at the player
    if (!this.swooping && this.swoopTimer <= 0) {
      const player = this.sprite.scene.children.getFirst("name", "player");
      const dx = this.sprite.body.position.x - player.body.position.x;
      const dy = this.sprite.body.position.y - player.body.position.y;
      if (Math.abs(dx) < 200 && dy < 0) {
        // swoop
        this.sprite.anims.play("bat_swooping", true);
        this.sprite.body.setVelocity(0, 0);
        this.sprite.body.setAcceleration(dx / 20, 2200);
        this.swooping = true;
      }
    }

    // bounce off of walls
    if (this.sprite.body.touching.right) {
      this.direction = -1;
    } else if (this.sprite.body.touching.left) {
      this.direction = 1;
    }
    if (this.sprite.body.touching.down && this.swooping) {
      this.swooping = false;
      this.sprite.anims.play("bat_flying", true);
      this.swoopTimer = this.timeBetweenSwoops;
      this.sprite.body.setAcceleration(0, 10);
    }

    this.flapTimer--;
    this.swoopTimer--;
  }

  onEaten(player: Player): void {
    this.currentHealth = 0;
    player.absorb(this);
  }

  private flap() {
    if (this.currentHealth <= 0 || this.sprite?.body === undefined) return;
    const acc = this.sprite.body.acceleration.add(
      new Vector2(400 * this.direction, -300)
    );
    this.sprite.body.setAcceleration(acc.x, acc.y);
    this.sprite.scene.time.delayedCall(500, () => {
      this.sprite?.body?.setAcceleration(0, 3);
    });
  }

  private playerAction(player: Player, demo: Demo): void {
    player.sprite.body.setVelocityY(-900);
    for (const i of [-1, 1]) {
      for (const j of [-1, 1]) {
        const projectileSprite = demo.physics.add.sprite(
          player.sprite.body.x + player.sprite.body.width / 2,
          player.sprite.body.y + player.sprite.body.height / 2,
          "gust"
        );
        projectileSprite.setRotation(Math.atan2(j, i) + Math.PI);
        new Projectile(
          projectileSprite,
          new Vector2(350 * i, 350 * j),
          demo,
          true,
          false
        );
      }
    }
  }

  private playerInitialize(player: Player): void {
    // set up cosmetic wings
    const s = player.sprite.scene.add.sprite(
      player.sprite.x,
      player.sprite.y,
      "blob_still_wings"
    );
    s.setDepth(90);

    s.anims.create({
      key: "player_still_wings",
      frames: s.anims.generateFrameNumbers("blob_still_wings", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_move_wings",
      frames: s.anims.generateFrameNumbers("blob_move_wings", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_dropping_wings",
      frames: s.anims.generateFrameNumbers("blob_falling_wings", {
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_egg_wings",
      frames: s.anims.generateFrameNumbers("blob_falling_wings", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_falling_wings",
      frames: s.anims.generateFrameNumbers("blob_jump_wings", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
    s.anims.create({
      key: "player_rising_wings",
      frames: s.anims.generateFrameNumbers("blob_jump_wings", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    player.addCosmetic(s, {
      still: "player_still_wings",
      move: "player_move_wings",
      dropping: "player_dropping_wings",
      egg: "player_egg_wings",
      falling: "player_falling_wings",
      rising: "player_rising_wings",
    });
  }
}
