import {test} from 'node:test';
import assert from 'node:assert/strict';
import {act,initial,spawn,ghost,fits,empty} from './game.ts';

test('hard drop locks a piece and awards distance points without mutating the board',()=>{
  const game={...initial('playing'),piece:spawn(1)};
  assert.equal(ghost(game).y,18);
  const result=act(game,'drop');
  assert.equal(result.score,36);
  assert.equal(result.board[19][4],2);
  assert.equal(game.board[19][4],0);
});
test('two completed lines clear together and award level-scaled points',()=>{
  const board=empty();
  for(const y of [18,19]) board[y]=Array.from({length:10},(_,x)=>x===4||x===5?0:3);
  const result=act({...initial('playing'),board,piece:{...spawn(1),y:18},lines:10},'tick');
  assert.equal(result.lines,12);
  assert.equal(result.score,600);
  assert.ok(result.board.every(row=>row.every(cell=>cell===0)));
});
test('walls block movement and paused games cannot move',()=>{
  const game={...initial('playing'),piece:{...spawn(1),x:0}};
  assert.equal(act(game,'left'),game);
  const paused=act(game,'pause');
  assert.equal(act(paused,'drop'),paused);
  assert.equal(act(paused,'pause').status,'playing');
});
test('a blocked spawn ends the game',()=>{
  const board=empty();board[0][4]=1;
  const result=act({...initial('playing'),board,next:1,piece:{...spawn(1),y:18}},'tick');
  assert.equal(result.status,'over');
});
test('each seven-piece bag includes every piece and wall rotation remains valid',()=>{
  let game=initial('playing');const colors=[];
  for(let i=0;i<7;i++) {colors.push(game.piece.color);game=act({...game,board:empty()},'drop');}
  assert.equal(new Set(colors).size,7);
  const rotated=act({...initial('playing'),piece:{shape:[[1],[1],[1],[1]],color:1,x:8,y:0}},'rotate');
  assert.equal(rotated.piece.shape[0].length,4);
  assert.ok(fits(rotated.board,rotated.piece));
});

test('replaying the same action is deterministic for React Strict Mode',()=>{
  const game=initial('playing',12345);
  assert.deepEqual(act(game,'drop'),act(game,'drop'));
  assert.deepEqual(act(game,'start'),act(game,'start'));
});

test('four-line clear awards 800 points and restart resets progress',()=>{
  const board=empty();
  for(let y=16;y<20;y++) board[y]=Array.from({length:10},(_,x)=>x===4?0:2);
  const game={...initial('playing',5),board,piece:{shape:[[1],[1],[1],[1]],color:1,x:4,y:16}};
  const result=act(game,'tick');
  assert.equal(result.lines,4);
  assert.equal(result.score,800);
  const restart=act(result,'start');
  assert.equal(restart.lines,0);
  assert.equal(restart.score,0);
  assert.ok(restart.board.every(row=>row.every(cell=>cell===0)));
});
