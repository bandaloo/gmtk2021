import "phaser";
import { TILE_COLS, TILE_ROWS, TILE_SIZE } from "./consts";

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

export function addObjects(
  room: string[][],
  platforms: Phaser.Physics.Arcade.StaticGroup
): void {
  for (let i = 0; i < TILE_COLS; i++) {
    for (let j = 0; j < TILE_ROWS; j++) {
      const tile = room[j][i];
      if (tile === "X") {
        platforms.create(
          (i + 0.5) * TILE_SIZE,
          (j + 0.5) * TILE_SIZE,
          "rectangle"
        );
      }
    }
  }
}
