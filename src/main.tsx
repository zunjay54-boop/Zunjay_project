import React, {useEffect, useReducer, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {act, initial, ghost, shapes, WIDTH, HEIGHT, type Action} from './game';
import './style.css';

function readBest() { try {const value = Number(localStorage.getItem('zunjay-best'));return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;} catch {return 0;} }
function App() {
  const [game,dispatch] = useReducer(act,undefined,() => initial());
  const [best,setBest] = useState(readBest);
  const level = Math.floor(game.lines/10)+1;
  useEffect(() => {
    if(game.status !== 'playing') return;
    const timer = window.setInterval(() => dispatch('tick'),Math.max(90,800-(level-1)*65));
    return () => clearInterval(timer);
  },[game.status,level]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if(event.ctrlKey || event.metaKey || event.altKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || (event.target instanceof HTMLElement && event.target.isContentEditable)) return;
      if(event.target instanceof HTMLButtonElement && (event.code === 'Space' || event.code === 'Enter')) return;
      const actions: Record<string,Action> = {ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',Space:'drop',KeyP:'pause',Escape:'pause'};
      if(actions[event.code]) {event.preventDefault(); if(!event.repeat || !['drop','pause','rotate'].includes(actions[event.code])) dispatch(actions[event.code]);}
      if(event.code==='Enter' && (game.status==='ready'||game.status==='over')) dispatch('start');
    };
    const onBlur = () => {if(game.status==='playing') dispatch('pause');};
    const onVisibility = () => {if(document.hidden) onBlur();};
    window.addEventListener('keydown',onKey);window.addEventListener('blur',onBlur);document.addEventListener('visibilitychange',onVisibility);
    return () => {window.removeEventListener('keydown',onKey);window.removeEventListener('blur',onBlur);document.removeEventListener('visibilitychange',onVisibility);};
  },[game.status]);
  useEffect(() => {
    if(game.score > best) {setBest(game.score);try {localStorage.setItem('zunjay-best',String(game.score));} catch { /* Storage can be disabled. */ }}
  },[game.score,best]);
  const board = game.board.map(row => [...row]);
  if(game.status !== 'ready' && game.status !== 'over') {
    const shadow = ghost(game);
    shadow.shape.forEach((row,y) => row.forEach((cell,x) => {if(cell && !board[shadow.y+y][shadow.x+x]) board[shadow.y+y][shadow.x+x] = -shadow.color;}));
    game.piece.shape.forEach((row,y) => row.forEach((cell,x) => {if(cell) board[game.piece.y+y][game.piece.x+x] = game.piece.color;}));
  }
  return <div className="app">
    <header><a className="brand" href="./"><span className="brand-icon">▦</span> ZUNJAY<span className="brand-sub">ARCADE</span></a><span className="header-tag"><i/> PLAY SOMETHING GOOD</span></header>
    <main><section className="intro"><div className="eyebrow">01 / THE CLASSICS, REIMAGINED</div><h1>BLOCK<span>DROP</span><span className="title-dot">.</span></h1><p>한 블록씩, 나만의 리듬으로.<br className="mobile-break"/> 빈틈없이 쌓고 시원하게 지워보세요.</p></section>
      <div className="game-layout">
        <aside className="left-panel"><section className="card score-card"><div className="label">YOUR SCORE</div><div className="score">{String(game.score).padStart(6,'0')}</div><div className="best"><span>↗ BEST RECORD</span><strong>{best.toLocaleString()}</strong></div></section>
          <section className="card stats"><div><span className="label">LEVEL</span><strong>{String(level).padStart(2,'0')}<small>LV</small></strong></div><div><span className="label">LINES</span><strong>{String(game.lines).padStart(2,'0')}<small>개</small></strong></div><div className="progress"><span style={{width:`${game.lines%10*10}%`}}/></div><p>다음 레벨까지 {10-game.lines%10}줄</p></section>
          <div className="little-note"><span>✦</span><p>완벽한 자리는 있어요.<br/>다음 블록을 기다려 보세요.</p></div>
        </aside>
        <section className="board-section" aria-label="테트리스 게임"><div className="board-top"><span><i className={game.status==='playing'?'live':''}/>{({ready:'READY TO PLAY',playing:'IN THE ZONE',paused:'TAKE A BREATH',over:'GAME OVER'})[game.status]}</span><span>{WIDTH} × {HEIGHT}</span></div>
          <div className="board-wrap"><div className="board" style={{gridTemplateColumns: `repeat(${WIDTH}, 1fr)`, aspectRatio: `${WIDTH} / ${HEIGHT}`}} role="img" aria-label={`게임 보드. 점수 ${game.score}, 지운 줄 ${game.lines}`}>
            {board.flatMap((row,y) => row.map((cell,x) => <div key={`${y}-${x}`} className={`cell ${cell<0?'ghost':''} c${Math.abs(cell)}`}/>))}
          </div>{game.status !== 'playing' && <div className="overlay"><div className="overlay-mark">{game.status==='over'?'↻':game.status==='paused'?'Ⅱ':'▦'}</div><h2>{game.status==='over'?'다시, 한 판 더?':game.status==='paused'?'잠시 쉬어가기':'LET’S DROP.'}</h2><p>{game.status==='over'?`${game.score.toLocaleString()}점! 새로운 기록에 도전해 보세요.`:game.status==='paused'?'준비되면 이어서 플레이하세요.':'블록을 맞추고, 한 줄을 완성하세요.'}</p><button className="primary" onClick={()=>dispatch(game.status==='paused'?'pause':'start')}>{game.status==='paused'?'계속하기':game.status==='over'?'다시 도전':'게임 시작'} <span>→</span></button><small>{game.status==='paused'?'P 키로도 계속할 수 있어요':'ENTER TO PLAY'}</small></div>}</div>
          <div className="board-bottom"><span>↓ SOFT DROP</span><span>SPACE HARD DROP</span></div>
        </section>
        <aside className="right-panel"><section className="card next-card"><div className="label">UP NEXT <span>01</span></div><div className="next-piece" style={{gridTemplateColumns:`repeat(${shapes[game.next][0].length}, 25px)`}}>{shapes[game.next].flatMap((row,y)=>row.map((cell,x)=><div key={`${y}-${x}`} className={`preview-cell ${cell?'c'+(game.next+1):''}`}/>))}</div><p>다음 한 수를 생각해 보세요</p></section>
          <section className="card controls"><div className="label">HOW TO PLAY</div><div><span>이동</span><kbd>←</kbd><kbd>→</kbd></div><div><span>회전</span><kbd>↑</kbd></div><div><span>빠르게 내리기</span><kbd>↓</kbd></div><div><span>바로 떨어뜨리기</span><kbd className="wide">SPACE</kbd></div><div><span>일시정지</span><kbd>P</kbd></div></section>
          <button className="secondary" disabled={game.status==='ready'||game.status==='over'} onClick={()=>dispatch('pause')}>{game.status==='paused'?'▶ 계속하기':'Ⅱ 일시정지'}</button>
          <button className="text-button" onClick={()=>{if(game.status==='ready'||game.status==='over'||window.confirm('현재 점수를 초기화하고 다시 시작할까요?')) dispatch('start');}}>↻ 처음부터 다시</button>
        </aside>
      </div>
      <div className="touch-controls" aria-label="터치 조작">{([['left','←','왼쪽'],['rotate','↻','회전'],['right','→','오른쪽'],['down','↓','내리기'],['drop','⤓','바로 떨어뜨리기']] as const).map(([action,label,title])=><button key={action} aria-label={title} disabled={game.status!=='playing'} onClick={()=>dispatch(action)}>{label}</button>)}</div>
    </main><footer><span>MADE FOR YOUR LITTLE BREAK.</span><span>ZUNJAY PROJECT <span className="footer-plus">✦</span> 2026</span></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
