export type Coords = {
  x: number;
  y: number;
};

export enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

export type ScrollEdge = {
  direction: Direction;
  speed: number;
};
