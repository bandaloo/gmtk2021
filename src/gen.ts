import "phaser";
import { Bat } from "./Bat";
import { Cannon } from "./Cannon";
import { TILE_COLS, TILE_ROWS, TILE_SIZE } from "./consts";
import Demo from "./game";

const MAX_ENEMY = 2;

export function splitRoom(str: string): string[][] {
  return str
    .substring(1, str.length - 1)
    .split("\n")
    .map((n) => n.split(" "));
}

export function randomizeRoom(
  room: string[][],
  enemyChance: number,
  itemChance: number
): string[][] {
  return room.map((row) =>
    row.map((tile) => {
      if (tile === "?") {
        tile = "" + Math.floor(Math.random() * MAX_ENEMY);
      }
      if (tile === "X" || tile === ".") return tile;
      if (tile === "!") {
        if (Math.random() < itemChance) return tile;
        return ".";
      }
      if (!isNaN(parseInt(tile))) {
        if (Math.random() < enemyChance) return tile;
        return ".";
      }
      throw new Error("unidentified tile! " + tile);
    })
  );
}

export function padRoom(room: string[][]): string[][] {
  const f = () => [...new Array(TILE_COLS - 2)].map(() => "X");
  room.unshift(f());
  room.push(f());
  return room.map((row) => {
    row.unshift("X");
    row.push("X");
    return row;
  });
}

function solidAt(room: string[][], i: number, j: number) {
  if (j < 0 || j >= room.length || i < 0 || i >= room[0].length) {
    return false;
  }
  return room[j][i] === "X";
}

export function addObjects(
  room: string[][],
  platforms: Phaser.Physics.Arcade.StaticGroup,
  pickups: Phaser.Physics.Arcade.StaticGroup,
  scene: Demo
): void {
  for (let i = 0; i < TILE_COLS; i++) {
    for (let j = 0; j < TILE_ROWS; j++) {
      const tile = room[j][i];
      if (tile === "X") {
        let tileIndex = "" + Phaser.Math.Between(1, 3);
        if (Math.random() < 0.01) tileIndex = "bart";
        const b = scene.physics.add.staticSprite(
          (i + 0.5) * TILE_SIZE,
          (j + 0.5) * TILE_SIZE,
          "tile_" + tileIndex
        );

        b.body.checkCollision.down = !solidAt(room, i, j + 1);
        b.body.checkCollision.up = !solidAt(room, i, j - 1);
        b.body.checkCollision.left = !solidAt(room, i - 1, j);
        b.body.checkCollision.right = !solidAt(room, i + 1, j);

        platforms.add(b);
      } else if (tile === "!") {
        const p = scene.physics.add.staticSprite(
          (i + 0.5) * TILE_SIZE,
          (j + 0.5) * TILE_SIZE,
          "fruit"
        );
        p.body.setSize(120, 120);
        p.setSize(120, 120);
        p.setOrigin(0.5, 0.5);
        p.setScale(0.4);
        p.setName("fruit");
        pickups.add(p);
      } else if (!isNaN(parseInt(tile))) {
        const x = (i + 0.5) * TILE_SIZE;
        const y = (j + 0.5) * TILE_SIZE;
        const int = parseInt(tile);
        if (int === 1) {
          const bat = new Bat(scene.physics.add.sprite(x, y, "bat_flying"));
          scene.enemies.push(bat);
        } else if (int === 0) {
          const cannon = new Cannon(
            scene.physics.add.sprite(x, y, "cannon_walk"),
            scene
          );
          scene.enemies.push(cannon);
        } else {
          throw new Error("enemy number out of bounds");
        }
      }
    }
  }
}
