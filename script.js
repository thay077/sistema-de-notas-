/* Sistema de Notas Interativo - completo */
// Elementos
const form = document.getElementById('form');
const nomeInput = document.getElementById('nome');
const tri1Input = document.getElementById('tri1');
const tri2Input = document.getElementById('tri2');
const tri3Input = document.getElementById('tri3');
const adicionarBtn = document.getElementById('adicionar');
const tabelaBody = document.getElementById('tabela-body');
const themeToggle = document.getElementById('theme-toggle');
const btnRanking = document.getElementById('btn-ranking');
const btnMedia = document.getElementById('btn-media');
const limparTabelaBtn = document.getElementById('limpar-tabela');

const welcomeModal = document.getElementById('welcome-modal');
const startBtn = document.getElementById('start-btn');
const infoModal = document.getElementById('info-modal');
const infoContent = document.getElementById('info-content');
const confettiCanvas = document.getElementById('confetti-canvas');

let alunos = JSON.parse(localStorage.getItem('alunos')) || [];
let theme = localStorage.getItem('tema') || 'light';

// sounds (simple tones generated on the fly)
const audioCtx = window.AudioContext ? new AudioContext() : null;
function playTone(type='ok'){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type==='ok' ? 'sine' : 'triangle';
  o.frequency.value = type==='ok' ? 880 : 220;
  g.gain.value = 0.02;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  setTimeout(()=>{ o.stop(); }, 120);
}

// confetti util (simple)
const confetti = {
  ctx: confettiCanvas.getContext ? confettiCanvas.getContext('2d') : null,
  pieces: [],
  resize(){ confettiCanvas.width = innerWidth; confettiCanvas.height = innerHeight },
  spawn(amount=40){
    if(!confetti.ctx) return;
    confetti.pieces = [];
    for(let i=0;i<amount;i++){
      confetti.pieces.push({
        x: Math.random()*innerWidth,
        y: -20 - Math.random()*200,
        r: Math.random()*8+4,
        d: Math.random()*2+1,
        color: [getComputedStyle(document.documentElement).getPropertyValue('--gold').trim(), getComputedStyle(document.documentElement).getPropertyValue('--baby').trim(), getComputedStyle(document.documentElement).getPropertyValue('--lilac').trim()][Math.floor(Math.random()*3)],
        tiltx: Math.random()*0.4 - 0.2
      });
    }
    confetti.run();
  },
  run(){
    if(!confetti.ctx) return;
    let ctx = confetti.ctx;
    let pieces = confetti.pieces;
    let loop = function(){
      ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
      pieces.forEach(p=>{
        p.y += p.d + 1;
        p.x += Math.sin(p.y*0.01) * 2;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.tiltx);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*0.6);
        ctx.restore();
      });
      pieces = pieces.filter(p=>p.y < innerHeight + 40);
      confetti.pieces = pieces;
      if(pieces.length) requestAnimationFrame(loop);
    };
    loop();
  }
};
confetti.resize();
window.addEventListener('resize', confetti.resize);

// helpers
function salvarLocal(){ localStorage.setItem('alunos', JSON.stringify(alunos)); }
function calcularMedia(t1,t2,t3){ return Number(((t1+t2+t3)/3).toFixed(2)); }
function atualizarResumo(){
  const medias = alunos.map(a=>calcularMedia(a.tri1,a.tri2,a.tri3));
  const mediaGeral = medias.length ? (medias.reduce((s,v)=>s+v,0)/medias.length).toFixed(2) : '—';
  const aprovados = medias.filter(m=>m>=6).length;
  const reprovados = medias.filter(m=>m<6).length;
  document.getElementById('media-geral').textContent = mediaGeral;
  document.getElementById('aprovados-count').textContent = aprovados;
  document.getElementById('reprovados-count').textContent = reprovados;
}

// render tabela
function renderizarTabela(){
  tabelaBody.innerHTML = '';
  alunos.forEach((aluno, idx)=>{
    const media = calcularMedia(aluno.tri1,aluno.tri2,aluno.tri3);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${aluno.nome}</td>
      <td>${aluno.tri1.toFixed(2)}</td>
      <td>${aluno.tri2.toFixed(2)}</td>
      <td>${aluno.tri3.toFixed(2)}</td>
      <td>${media.toFixed(2)}</td>
      <td class="${media>=6 ? 'aprovado' : 'reprovado'}">${media>=6 ? 'Aprovado' : 'Reprovado'}</td>
      <td>
        <button class="editar" data-i="${idx}">✏️</button>
        <button class="excluir" data-i="${idx}">🗑️</button>
      </td>`;
    tabelaBody.appendChild(tr);
  });
  atualizarResumo();
}

// adicionar aluno
form.addEventListener('submit', e=>{
  e.preventDefault();
  const nome = nomeInput.value.trim();
  const t1 = parseFloat(tri1Input.value);
  const t2 = parseFloat(tri2Input.value);
  const t3 = parseFloat(tri3Input.value);
  if(!nome || isNaN(t1)||isNaN(t2)||isNaN(t3)){ alert('Preencha todos os campos corretamente!'); playTone('err'); return; }
  alunos.push({nome,tri1:t1,tri2:t2,tri3:t3});
  salvarLocal(); renderizarTabela();
  nomeInput.value=''; tri1Input.value=''; tri2Input.value=''; tri3Input.value='';
  showToast(`${nome} adicionado! ✅`, 'ok');
  playTone('ok');
  confetti.spawn(28);
});

// delegação para editar/excluir
tabelaBody.addEventListener('click', e=>{
  const editarBtn = e.target.closest('.editar');
  const excluirBtn = e.target.closest('.excluir');
  if(editarBtn){
    const i = +editarBtn.dataset.i;
    editarAluno(i);
  } else if(excluirBtn){
    const i = +excluirBtn.dataset.i;
    if(confirm('Remover esse aluno?')){ alunos.splice(i,1); salvarLocal(); renderizarTabela(); showToast('Aluno removido ✨'); }
  }
});

// editar
function editarAluno(i){
  const aluno = alunos[i];
  const novoNome = prompt('Editar nome:', aluno.nome);
  if(novoNome === null) return;
  const novoT1 = prompt('Editar Tri 1:', aluno.tri1);
  const novoT2 = prompt('Editar Tri 2:', aluno.tri2);
  const novoT3 = prompt('Editar Tri 3:', aluno.tri3);
  if([novoT1,novoT2,novoT3].some(v=>v===null)) return;
  const t1 = parseFloat(novoT1), t2=parseFloat(novoT2), t3=parseFloat(novoT3);
  if(isNaN(t1)||isNaN(t2)||isNaN(t3)){ alert('Notas inválidas'); return; }
  alunos[i] = { nome: novoNome.trim() || aluno.nome, tri1:t1, tri2:t2, tri3:t3 };
  salvarLocal(); renderizarTabela(); showToast('Aluno editado ✏️');
}

// limpar tabela
limparTabelaBtn.addEventListener('click', ()=>{
  if(confirm('Limpar todos os registros?')){
    alunos=[]; salvarLocal(); renderizarTabela(); showToast('Todos os registros foram removidos');
  }
});

// ranking modal (top3)
btnRanking.addEventListener('click', ()=>{
  if(!alunos.length){ alert('Sem alunos cadastrados'); return; }
  const sorted = [...alunos].sort((a,b)=>calcularMedia(b.tri1,b.tri2,b.tri3) - calcularMedia(a.tri1,a.tri2,a.tri3));
  const top3 = sorted.slice(0,3);
  let html = `<h2>🏆 Ranking - Top ${Math.min(3,sorted.length)}</h2><ol style="text-align:left">`;
  top3.forEach((a,idx)=>{
    html += `<li style="margin:8px 0"><strong>${a.nome}</strong> — ${calcularMedia(a.tri1,a.tri2,a.tri3).toFixed(2)} ${idx===0? '🥇' : idx===1? '🥈' : '🥉'}</li>`;
  });
  html += `</ol><div style="margin-top:12px"><button id="close-info" class="btn primary">Fechar</button></div>`;
  openInfoModal(html);
  confetti.spawn(30);
});

// média da turma modal
btnMedia.addEventListener('click', ()=>{
  if(!alunos.length){ alert('Sem alunos cadastrados'); return; }
  const medias = alunos.map(a=>calcularMedia(a.tri1,a.tri2,a.tri3));
  const mediaGeral = (medias.reduce((s,v)=>s+v,0)/medias.length).toFixed(2);
  const aprov = medias.filter(m=>m>=6).length;
  const rep = medias.filter(m=>m<6).length;
  const html = `<h2>📊 Média da Turma</h2>
    <p style="color:var(--muted)">Média geral: <strong>${mediaGeral}</strong></p>
    <p style="color:var(--muted)">Aprovados: ${aprov} • Reprovados: ${rep}</p>
    <div style="margin-top:12px"><button id="close-info" class="btn primary">Fechar</button></div>`;
  openInfoModal(html);
});

// modal helpers
function openInfoModal(html){
  infoContent.innerHTML = html;
  infoModal.classList.add('show');
  document.getElementById('close-info')?.addEventListener('click', ()=>infoModal.classList.remove('show'));
  // click outside to close
  infoModal.addEventListener('click', e=>{ if(e.target===infoModal) infoModal.classList.remove('show'); }, {once:true});
}

// toast simple
function showToast(msg, type='') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position='fixed';
  el.style.right='18px';
  el.style.bottom='18px';
  el.style.padding='10px 14px';
  el.style.borderRadius='10px';
  el.style.background = type==='ok' ? 'linear-gradient(90deg,var(--baby),var(--gold))' : 'rgba(0,0,0,0.75)';
  el.style.color = type==='ok' ? '#041627' : '#fff';
  el.style.boxShadow='0 10px 30px rgba(0,0,0,0.15)';
  el.style.zIndex = 99;
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.transition='all .5s'; el.style.opacity=0; el.style.transform='translateY(12px)'; },1500);
  setTimeout(()=>el.remove(),2100);
}

// Welcome modal flow
startBtn.addEventListener('click', ()=>{
  welcomeModal.classList.remove('show');
  playTone('ok');
});

// theme
function applyTheme(t){
  if(t==='dark'){ document.body.classList.add('dark'); themeToggle.textContent='☀️'; }
  else{ document.body.classList.remove('dark'); themeToggle.textContent='🌙'; }
  localStorage.setItem('tema', t);
}
themeToggle.addEventListener('click', ()=>{
  theme = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(theme);
});

// init
(function init(){
  if(localStorage.getItem('alunos')) alunos = JSON.parse(localStorage.getItem('alunos'));
  renderizarTabela();
  applyTheme(localStorage.getItem('tema') || 'light');
})();
