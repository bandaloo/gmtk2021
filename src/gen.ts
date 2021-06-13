import "phaser";
import { Bat } from "./Bat";
import { TILE_COLS, TILE_ROWS, TILE_SIZE } from "./consts";
import Demo from "./game";
import { Player } from "./Player";

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
      if (tile === "s" || tile === "e") {
        return tile;
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
        //const int = parseInt(tile);
        const bat = new Bat(
          scene.physics.add.sprite(
            (i + 0.5) * TILE_SIZE,
            (j + 0.5) * TILE_SIZE,
            "bat_flying"
          )
        );
        scene.enemies.push(bat);
        console.log("adding bat to world");
      } else if (tile === "s") {
        if (tile === "s") {
          scene.player = new Player(
            scene.physics.add.sprite(
              (i + 0.5) * TILE_SIZE - TILE_SIZE * 0.1, // Slightly offset so you don't fall through the ground
              (j + 0.5) * TILE_SIZE - TILE_SIZE * 0.1,
              "blob_move"
            ),
            scene.input.keyboard,
            scene.playerGroup,
            scene.grappleGroup
          );
        }
      }
    }
  }
}
