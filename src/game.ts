export const WIDTH = 26;
export const HEIGHT = 20;
export type Grid = number[][];
export const shapes = [ [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]] ];
export type Piece = { shape: Grid; color: number; x: number; y: number };
export type Game = { board: Grid; piece: Piece; next: number; bag: number[]; seed: number; score: number; lines: number; status: 'ready'|'playing'|'paused'|'over' };
export const empty = (): Grid => Array.from({length: HEIGHT}, () => Array(WIDTH).fill(0));
function draw(bag: number[], seed: number): [number, number[], number] {
  const pool = bag.length ? [...bag] : [0,1,2,3,4,5,6];
  const nextSeed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
  const index = Math.floor(nextSeed / 4294967296 * pool.length);
  return [pool.splice(index,1)[0], pool, nextSeed];
}
export function spawn(index: number): Piece {
  const shape = shapes[index].map(row => [...row]);
  return { shape, color:index+1, x: Math.floor((WIDTH-shape[0].length)/2), y:0 };
}
export function initial(status: Game['status'] = 'ready', seed = Math.floor(Math.random()*4294967296)): Game {
  const [first, bag, firstSeed] = draw([],seed); const [next, rest, nextSeed] = draw(bag,firstSeed);
  return {board:empty(),piece:spawn(first),next,bag:rest,seed:nextSeed,score:0,lines:0,status};
}
export function fits(board: Grid, piece: Piece): boolean {
  return piece.shape.every((row,y) => row.every((cell,x) => !cell || (piece.x+x >= 0 && piece.x+x < WIDTH && piece.y+y >= 0 && piece.y+y < HEIGHT && board[piece.y+y][piece.x+x] === 0)));
}
export function ghost(game: Game): Piece {
  let piece = {...game.piece};
  while (fits(game.board,{...piece,y:piece.y+1})) piece = {...piece,y:piece.y+1};
  return piece;
}
function lock(game: Game): Game {
  const board = game.board.map(row => [...row]);
  game.piece.shape.forEach((row,y) => row.forEach((cell,x) => {if(cell) board[game.piece.y+y][game.piece.x+x] = game.piece.color;}));
  const remaining = board.filter(row => row.some(cell => !cell));
  const cleared = HEIGHT - remaining.length;
  while(remaining.length < HEIGHT) remaining.unshift(Array(WIDTH).fill(0));
  const piece = spawn(game.next); const [next,bag,seed] = draw(game.bag,game.seed);
  return {...game, board:remaining,piece,next,bag,seed,lines:game.lines+cleared,score:game.score+[0,100,300,500,800][cleared]*(Math.floor(game.lines/10)+1),status:fits(remaining,piece)?'playing':'over'};
}
export type Action = 'left'|'right'|'down'|'rotate'|'drop'|'tick'|'pause'|'start';
export function act(game: Game, action: Action): Game {
  if(action === 'start') return initial('playing',game.seed);
  if(action === 'pause') return {...game,status:game.status==='playing'?'paused':game.status==='paused'?'playing':game.status};
  if(game.status !== 'playing') return game;
  if(action === 'drop') {const piece = ghost(game); return lock({...game,piece,score:game.score+(piece.y-game.piece.y)*2});}
  if(action === 'rotate') {
    const shape = game.piece.shape[0].map((_,x) => game.piece.shape.map(row=>row[x]).reverse());
    for(const offset of [0,-1,1,-2,2]) {const piece = {...game.piece,shape,x:game.piece.x+offset}; if(fits(game.board,piece)) return {...game,piece};}
    return game;
  }
  const piece = {...game.piece,x:game.piece.x+(action==='left'?-1:action==='right'?1:0),y:game.piece.y+(action==='down'||action==='tick'?1:0)};
  if(fits(game.board,piece)) return {...game,piece,score:game.score+(action==='down'?1:0)};
  return action==='down'||action==='tick'?lock(game):game;
}
