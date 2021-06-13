/**
 * Key:
 * x = tile
 * . = air
 * ? = any random enemy
 * ! = random item
 * s = start (player spawn)
 * e = end (portal spawn)
 * 0 = cannon
 * 1 = flying
 */
export const rooms = [
  `
. . . . . . . . . . . . . .
. . . . . ! ! ! ! . . . . .
. . . . . X X X X . e . . .
. . . ? . . . . . . ? . . .
. . X X X . . . . X X X . .
. . . . . . . . . . . . . .
. s . . . 0 . . 0 . . . . .
`,

  `
. . . . . . . . . . X . . .
. . . . . . . . . . X . . .
. . . . . . . . . . X . . .
. . . X . 1 . . 1 . X . e .
. . . X . . . . . . . . . .
. . . X . . . . . . . . . .
. s . X . . . . . . . . . .
`,

  `
. . . . . ! ! ! ! . . . . .
. . . X X X X X X X X . . .
. . 1 . . . . . . . . 1 . .
. . . . . . . . . . . . . .
. . . 0 . 0 . . 0 . 0 . . .
. . . X X X X X X X X . e .
s . . X . . . . . . X . . .
`,

  `
. . . . X X X X X X . . . .
. . 1 . 1 X X X X 1 . 1 . .
. . . . . . X X . . . . . .
s . . . . . 0 0 . . . . e .
. . . . . 0 X X 0 . . . . .
. . . . ! X X X X ! . . . .
. . . 1 X X X X X X 1 . . .
`,

  `
X X X . . . . . . . . X X X
X X X . . . . . . . . X X X
X X X . 1 . . . . 1 . X X X
s . . . . . . . . . . . . e
X X X . . . 0 0 . . . X X X
X X X . . X X X X . . X X X
X X X . 0 ! ! ! ! 0 . X X X
`,

  `
! . . . . . . . . . . . . !
X X . X . X X X X . X . X X
. . ? X . ? . . ? . X ? . .
. X X X . X X X X . X X X .
s . . X . ? . . ? . X . . e
X X . X . X X X X . X . X X
! . . . . . . . . . . . . !
`,
];
