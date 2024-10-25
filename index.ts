let map: Tile[][];

// let playerx = 1;
// let playery = 1;

class Player {
  private x = 1;
  private y = 1;
  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = "#ff0000";
    g.fillRect(
      player.getX() * TILE_SIZE,
      player.getY() * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }
  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
  setX(x: number) {
    this.x = x;
  }
  setY(y: number) {
    this.y = y;
  }
}
const player = new Player();

const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

function moveToTile(newx: number, newy: number) {
  map[player.getY()][player.getX()] = new Air();
  map[newy][newx] = new PlayerTile();
  player.setX(newx);
  player.setY(newy);
}

interface Tile {
  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  moveHorizontal(player: Player, dx: number): void;
  moveVertical(player: Player, dy: number): void;
  update(x: number, y: number): void;
  isAir(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;
}

class Air implements Tile {
  update(x: number, y: number) {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {}
  moveHorizontal(player: Player, dx: number) {
    moveToTile(player.getX() + dx, player.getY());
  }
  moveVertical(player: Player, dy: number) {
    moveToTile(player.getX(), player.getY() + dy);
  }
  drop() {}
  rest() {}
  isAir() {
    return true;
  }
  isLock1() {
    return false;
  }
  isLock2() {
    return false;
  }
}
class Flux implements Tile {
  update(x: number, y: number) {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    moveToTile(player.getX() + dx, player.getY());
  }
  moveVertical(player: Player, dy: number) {
    moveToTile(player.getX(), player.getY() + dy);
  }
  drop() {}
  rest() {}
  isAir() {
    return false;
  }
  isLock1() {
    return false;
  }
  isLock2() {
    return false;
  }
}
class Unbreakable implements Tile {
  update(x: number, y: number) {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {}
  moveVertical(player: Player, dy: number) {}
  drop() {}
  rest() {}
  isAir() {
    return false;
  }
  isLock1() {
    return false;
  }
  isLock2() {
    return false;
  }
}
class PlayerTile implements Tile {
  update(x: number, y: number) {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {}
  isEdible() {
    return false;
  }
  moveHorizontal(player: Player, dx: number) {}
  moveVertical(player: Player, dy: number) {}
  drop() {}
  rest() {}
  isAir() {
    return false;
  }
  isLock1() {
    return false;
  }
  isLock2() {
    return false;
  }
}

interface FallingState {
  isFalling(): boolean;
  moveHorizontal(player: Player, tile: Tile, dx: number): void;
}

class Falling implements FallingState {
  isFalling() {
    return true;
  }
  moveHorizontal(player: Player, tile: Tile, dx: number) {}
}

class Resting implements FallingState {
  isFalling() {
    return false;
  }
  moveHorizontal(player: Player, tile: Tile, dx: number) {
    if (
      map[player.getY()][player.getX() + dx + dx].isAir() &&
      !map[player.getY() + 1][player.getX() + dx].isAir()
    ) {
      map[player.getY()][player.getX() + dx + dx] = tile;
      moveToTile(player.getX() + dx, player.getY());
    }
  }
}

interface RemoveStrategy {
  check(tile: Tile): boolean;
}

class RemoveLock1 implements RemoveStrategy {
  check(tile: Tile): boolean {
    return tile.isLock1();
  }
}

class RemoveLock2 implements RemoveStrategy {
  check(tile: Tile): boolean {
    return tile.isLock2();
  }
}

class FallStrategy {
  constructor(private falling: FallingState) {}
  getFalling() {
    return this.falling;
  }
  drop(tile: Tile, x: number, y: number) {
    if (this.falling.isFalling()) {
      map[y + 1][x] = tile;
      map[y][x] = new Air();
    }
  }
  update(tile: Tile, x: number, y: number) {
    this.falling = map[y + 1][x].isAir() ? new Falling() : new Resting();
    this.drop(tile, x, y);
  }
}

class Stone implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }
  update(x: number, y: number) {
    this.fallStrategy.update(this, x, y);
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    this.fallStrategy.getFalling().moveHorizontal(player, this, dx);
  }
  moveVertical(player: Player, dy: number) {}
  isAir() {
    return false;
  }
  isLock1() {
    return false;
  }
  isLock2() {
    return false;
  }
}

class Box implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }
  update(x: number, y: number) {
    this.fallStrategy.update(this, x, y);
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    this.fallStrategy.getFalling().moveHorizontal(player, this, dx);
  }
  moveVertical(player: Player, dy: number) {}
  isAir() {
    return false;
  }
  isLock1() {
    return false;
  }
  isLock2() {
    return false;
  }
}

class KeyConfiguration {
  constructor(
    private color: string,
    private _1: boolean,
    private removeStrategy: RemoveStrategy
  ) {}
  setColor(g: CanvasRenderingContext2D) {
    g.fillStyle = this.color;
  }
  is1() {
    return this._1;
  }
  remove() {
    removeLock(this.removeStrategy);
  }
}

class Key implements Tile {
  constructor(private keyConf: KeyConfiguration) {}
  update(x: number, y: number): void {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    this.keyConf.remove();
    moveToTile(player.getX() + dx, player.getY());
  }
  moveVertical(player: Player, dy: number): void {
    this.keyConf.remove();
    moveToTile(player.getX(), player.getY() + dy);
  }
  drop() {}
  rest() {}
  isStony() {
    return false;
  }
  isAir() {
    return false;
  }
  isLock1() {
    return false;
  }
  isLock2() {
    return false;
  }
}

class Locks implements Tile {
  constructor(private keyConf: KeyConfiguration) {}
  update(x: number, y: number): void {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {}
  moveVertical(player: Player, dy: number) {}
  drop() {}
  rest() {}
  isAir() {
    return false;
  }
  isLock1() {
    return this.keyConf.is1();
  }
  isLock2() {
    return !this.keyConf.is1();
  }
}

let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];

function assertExhausted(x: never): never {
  throw new Error("Unexpected object: " + x);
}

const YELLOW_KEY = new KeyConfiguration("#ffcc00", true, new RemoveLock1());
const BLUE_KEY = new KeyConfiguration("#00ccff", false, new RemoveLock2());

function transformTile(tile: RawTile) {
  switch (tile) {
    case RawTile.AIR:
      return new Air();
    case RawTile.PLAYER:
      return new PlayerTile();
    case RawTile.UNBREAKABLE:
      return new Unbreakable();
    case RawTile.STONE:
      return new Stone(new Resting());
    case RawTile.FALLING_STONE:
      return new Stone(new Falling());
    case RawTile.BOX:
      return new Box(new Resting());
    case RawTile.FALLING_BOX:
      return new Box(new Falling());
    case RawTile.FLUX:
      return new Flux();
    case RawTile.KEY1:
      return new Key(YELLOW_KEY);
    case RawTile.LOCK1:
      return new Locks(YELLOW_KEY);
    case RawTile.KEY2:
      return new Key(BLUE_KEY);
    case RawTile.LOCK2:
      return new Locks(BLUE_KEY);
    default:
      assertExhausted(tile);
  }
}

function transformMap() {
  map = new Array(rawMap.length);
  for (let y = 0; y < rawMap.length; y++) {
    map[y] = new Array(rawMap[y].length);
    for (let x = 0; x < rawMap[y].length; x++) {
      map[y][x] = transformTile(rawMap[y][x]);
    }
  }
}

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE,
  FALLING_STONE,
  BOX,
  FALLING_BOX,
  KEY1,
  LOCK1,
  KEY2,
  LOCK2,
}

interface Input {
  handle(): void;
}

enum RawInput {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

class Right implements Input {
  handle() {
    moveHorizontal(1);
  }
}
class Left implements Input {
  handle() {
    moveHorizontal(-1);
  }
}
class Up implements Input {
  handle() {
    moveVertical(-1);
  }
}
class Down implements Input {
  handle() {
    moveVertical(1);
  }
}

let inputs: Input[] = [];

function removeLock(shouldRemove: RemoveStrategy) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (shouldRemove.check(map[y][x])) {
        map[y][x] = new Air();
      }
    }
  }
}

function moveHorizontal(dx: number) {
  map[player.getY()][player.getX() + dx].moveHorizontal(player, dx);
}

function moveVertical(dy: number) {
  map[player.getY() + dy][player.getX()].moveVertical(player, dy);
}

function handleInputs() {
  while (inputs.length > 0) {
    let input = inputs.pop();
    input.handle();
  }
}

function updateMap() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].update(x, y);
    }
  }
}

function update() {
  handleInputs();
  updateMap();
}

function drawMap(g: CanvasRenderingContext2D) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].draw(g, x, y);
    }
  }
}

function drawPlayer(g: CanvasRenderingContext2D) {
  player.draw(g);
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");
  g.clearRect(0, 0, canvas.width, canvas.height);

  return g;
}

function draw() {
  const g = createGraphics();
  drawMap(g);
  drawPlayer(g);
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  transformMap();
  gameLoop();
};

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", (e) => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});
