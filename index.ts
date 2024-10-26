const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

interface RawTileValue {
  transform(): Tile;
}
class AirValue implements RawTileValue {
  transform() {
    return new Air();
  }
}
class FluxValue implements RawTileValue {
  transform() {
    return new Flux();
  }
}
class UnbreakableValue implements RawTileValue {
  transform() {
    return new Unbreakable();
  }
}
class PlayerValue implements RawTileValue {
  transform() {
    return new PlayerTile();
  }
}
class StoneValue implements RawTileValue {
  transform() {
    return new Stone(new Resting());
  }
}
class FallingStoneValue implements RawTileValue {
  transform() {
    return new Stone(new Falling());
  }
}
class BoxValue implements RawTileValue {
  transform() {
    return new Box(new Resting());
  }
}
class FallingBoxValue implements RawTileValue {
  transform() {
    return new Box(new Falling());
  }
}
class Key1Value implements RawTileValue {
  transform() {
    return new Key(YELLOW_KEY);
  }
}
class Lock1Value implements RawTileValue {
  transform() {
    return new Locks(YELLOW_KEY);
  }
}
class Key2Value implements RawTileValue {
  transform() {
    return new Key(BLUE_KEY);
  }
}
class Lock2Value implements RawTileValue {
  transform() {
    return new Locks(BLUE_KEY);
  }
}

class RawTile2 {
  private constructor(private value: RawTileValue) {}
  static readonly AIR = new AirValue();
  static readonly FLUX = new FluxValue();
  static readonly UNBREAKABLE = new UnbreakableValue();
  static readonly PLAYER = new PlayerValue();
  static readonly STONE = new StoneValue();
  static readonly FALLING_STONE = new FallingStoneValue();
  static readonly BOX = new BoxValue();
  static readonly FALLING_BOX = new FallingBoxValue();
  static readonly KEY1 = new Key1Value();
  static readonly LOCK1 = new Lock1Value();
  static readonly KEY2 = new Key2Value();
  static readonly LOCK2 = new Lock2Value();
}

const RAW_TILES = [
  RawTile2.AIR,
  RawTile2.FLUX,
  RawTile2.UNBREAKABLE,
  RawTile2.PLAYER,
  RawTile2.STONE,
  RawTile2.FALLING_STONE,
  RawTile2.BOX,
  RawTile2.FALLING_BOX,
  RawTile2.KEY1,
  RawTile2.LOCK1,
  RawTile2.KEY2,
  RawTile2.LOCK2,
];

let rawMap: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];

class Map {
  private map: Tile[][];
  constructor() {
    this.map = new Array(rawMap.length);
    for (let y = 0; y < rawMap.length; y++) {
      this.map[y] = new Array(rawMap[y].length);
      for (let x = 0; x < rawMap[y].length; x++) {
        const rawTile = RAW_TILES[rawMap[y][x]];
        this.map[y][x] = rawTile.transform();
      }
    }
  }
  getBlockOnTopState(x: number, y: number) {
    return this.isAir(x, y + 1) ? new Falling() : new Resting();
  }
  remove(shouldRemove: RemoveStrategy) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (shouldRemove.check(this.map[y][x])) {
          this.map[y][x] = new Air();
        }
      }
    }
  }
  setMap(map: Tile[][]) {
    this.map = map;
  }
  draw(g: CanvasRenderingContext2D) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].draw(g, x, y);
      }
    }
  }
  update() {
    for (let y = this.map.length - 1; y >= 0; y--) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].update(this, x, y);
      }
    }
  }
  moveToTile(x: number, y: number, newx: number, newy: number) {
    this.map[y][x] = new Air();
    this.map[newy][newx] = new PlayerTile();
  }
  moveHorizontal(player: Player, x: number, y: number, dx: number) {
    this.map[y][x + dx].moveHorizontal(this, player, dx);
  }
  moveVertical(player: Player, x: number, y: number, dy: number) {
    this.map[y + dy][x].moveVertical(this, player, dy);
  }
  isAir(x: number, y: number) {
    return this.map[y][x].isAir();
  }
  setTile(x: number, y: number, tile: Tile) {
    this.map[y][x] = tile;
  }
  pushHorizontal(player: Player, tile: Tile, x: number, y: number, dx: number) {
    if (this.isAir(x + dx + dx, y) && !this.isAir(x + dx, y + 1)) {
      this.setTile(x + dx + dx, y, tile);
      player.move(this, dx, 0);
    }
  }
}

class Player {
  private x = 1;
  private y = 1;
  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = "#ff0000";
    g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  private moveToTile(map: Map, newx: number, newy: number) {
    map.moveToTile(this.x, this.y, newx, newy);
    this.x = newx;
    this.y = newy;
  }
  move(map: Map, dx: number, dy: number) {
    this.moveToTile(map, this.x + dx, this.y + dy);
  }
  moveHorizontal(map: Map, dx: number) {
    map.moveHorizontal(this, this.x, this.y, dx);
  }
  moveVertical(map: Map, dy: number) {
    map.moveVertical(this, this.x, this.y, dy);
  }
  pushHorizontal(map: Map, tile: Tile, dx: number) {
    map.pushHorizontal(this, tile, this.x, this.y, dx);
  }
}

interface Tile {
  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  moveHorizontal(map: Map, player: Player, dx: number): void;
  moveVertical(map: Map, player: Player, dy: number): void;
  update(map: Map, x: number, y: number): void;
  isAir(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;
}

class Air implements Tile {
  update(map: Map, x: number, y: number) {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {}
  moveHorizontal(map: Map, player: Player, dx: number) {
    player.move(map, dx, 0);
  }
  moveVertical(map: Map, player: Player, dy: number) {
    player.move(map, 0, dy);
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
  update(map: Map, x: number, y: number) {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {
    player.move(map, dx, 0);
  }
  moveVertical(map: Map, player: Player, dy: number) {
    player.move(map, 0, dy);
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
  update(map: Map, x: number, y: number) {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {}
  moveVertical(map: Map, player: Player, dy: number) {}
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
  update(map: Map, x: number, y: number) {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {}
  isEdible() {
    return false;
  }
  moveHorizontal(map: Map, player: Player, dx: number) {}
  moveVertical(map: Map, player: Player, dy: number) {}
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
  moveHorizontal(map: Map, player: Player, tile: Tile, dx: number): void;
}

class Falling implements FallingState {
  isFalling() {
    return true;
  }
  moveHorizontal(map: Map, player: Player, tile: Tile, dx: number) {}
}

class Resting implements FallingState {
  isFalling() {
    return false;
  }
  moveHorizontal(map: Map, player: Player, tile: Tile, dx: number) {
    player.pushHorizontal(map, tile, dx);
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
  drop(map: Map, tile: Tile, x: number, y: number) {
    if (this.falling.isFalling()) {
      map.setTile(x, y + 1, tile);
      map.setTile(x, y, new Air());
    }
  }
  update(map: Map, tile: Tile, x: number, y: number) {
    this.falling = map.getBlockOnTopState(x, y);
    this.drop(map, tile, x, y);
  }
}

class Stone implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }
  update(map: Map, x: number, y: number) {
    this.fallStrategy.update(map, this, x, y);
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {
    this.fallStrategy.getFalling().moveHorizontal(map, player, this, dx);
  }
  moveVertical(map: Map, player: Player, dy: number) {}
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
  update(map: Map, x: number, y: number) {
    this.fallStrategy.update(map, this, x, y);
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {
    this.fallStrategy.getFalling().moveHorizontal(map, player, this, dx);
  }
  moveVertical(map: Map, player: Player, dy: number) {}
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
  remove(map: Map) {
    map.remove(this.removeStrategy);
  }
}

class Key implements Tile {
  constructor(private keyConf: KeyConfiguration) {}
  update(map: Map, x: number, y: number): void {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {
    this.keyConf.remove(map);
    player.move(map, dx, 0);
  }
  moveVertical(map: Map, player: Player, dy: number): void {
    this.keyConf.remove(map);
    player.move(map, 0, dy);
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
  update(map: Map, x: number, y: number): void {}
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {}
  moveVertical(map: Map, player: Player, dy: number) {}
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

function assertExhausted(x: never): never {
  throw new Error("Unexpected object: " + x);
}

const YELLOW_KEY = new KeyConfiguration("#ffcc00", true, new RemoveLock1());
const BLUE_KEY = new KeyConfiguration("#00ccff", false, new RemoveLock2());

interface Input {
  handle(map: Map, player: Player): void;
}

enum RawInput {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

class Right implements Input {
  handle(map: Map, player: Player) {
    player.moveHorizontal(map, 1);
  }
}
class Left implements Input {
  handle(map: Map, player: Player) {
    player.moveHorizontal(map, -1);
  }
}
class Up implements Input {
  handle(map: Map, player: Player) {
    player.moveVertical(map, -1);
  }
}
class Down implements Input {
  handle(map: Map, player: Player) {
    player.moveVertical(map, 1);
  }
}

let inputs: Input[] = [];

function handleInputs(map: Map, player: Player) {
  while (inputs.length > 0) {
    let input = inputs.pop();
    input.handle(map, player);
  }
}

function updateMap(map: Map) {
  map.update();
}

function update(map: Map, player: Player) {
  handleInputs(map, player);
  updateMap(map);
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");
  g.clearRect(0, 0, canvas.width, canvas.height);

  return g;
}

function draw(map: Map, player: Player) {
  const g = createGraphics();
  map.draw(g);
  player.draw(g);
}

function gameLoop(map: Map, player: Player) {
  let before = Date.now();
  update(map, player);
  draw(map, player);
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(map, player), sleep);
}

window.onload = () => {
  const map = new Map();
  const player = new Player();
  gameLoop(map, player);
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
