import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const BOARD_SIZE = 40;
const MAX_PLAYERS = 4;

const ASSETS = {
  logoPolizia: '/assets/POLIZIA.png',
  signs: {
    stop: '/assets/stop.png',
    divietoAccesso: '/assets/divieto-accesso.png',
    lavori: '/assets/lavori-in-corso.png',
    pistaCiclabile: '/assets/pista-ciclabile.png',
    divietoPedoni: '/assets/divieto-pedoni.png',
    divietoSosta: '/assets/divieto-sosta.png',
    parcoMonza: '/assets/parco-monza.png',
    bambini: '/assets/bambini.png',
    attraversamento: '/assets/attraversamento-pedonale.png',
    pericolo: '/assets/pericolo-generico.png',
    obbligoDiritto: '/assets/obbligo-diritto.png',
    darePrecedenza: '/assets/dare-precedenza.png',
    sorpassoVietato: '/assets/sorpasso-vietato.png',
    passoCarrabile: '/assets/passo-carrabile.png',
    poliziaLocaleDirezione: '/assets/direzione-polizia-locale.png',
    prontoSoccorso: '/assets/direzione-pronto-soccorso.png',
    municipio: '/assets/direzione-municipio.png'
  },
  scenes: {
    autoBus: '/assets/scena-auto-bus.png',
    biciBambini: '/assets/scena-bici-bambini.png',
    pedoniCitta: '/assets/scena-pedoni-citta.png',
    agenteTutor: '/assets/agente-tutor.png',
    agenti: '/assets/agenti-polizia-locale.png',
    agentiCitta: '/assets/agenti-citta.png'
  }
};

const PLAYERS = [
  { name: 'Pedone', token: 'P', color: '#ef4444', gradient: 'linear-gradient(135deg,#fecdd3,#ef4444)' },
  { name: 'Bicicletta', token: 'B', color: '#2563eb', gradient: 'linear-gradient(135deg,#bae6fd,#2563eb)' },
  { name: 'Monopattino', token: 'M', color: '#9333ea', gradient: 'linear-gradient(135deg,#e9d5ff,#9333ea)' },
  { name: 'Automobile', token: 'A', color: '#ea580c', gradient: 'linear-gradient(135deg,#fed7aa,#ea580c)' },
  { name: 'Autobus', token: 'BUS', color: '#16a34a', gradient: 'linear-gradient(135deg,#bbf7d0,#16a34a)' },
  { name: 'Polizia Locale', token: 'PL', color: '#0284c7', gradient: 'linear-gradient(135deg,#a5f3fc,#0284c7)' }
];

const CELL_LABELS = {
  partenza: 'Partenza', quiz: 'Quiz', missione: 'Missione', imprevisto: 'Imprevisto', attraversamento: 'Mini gioco', arrivo: 'Arrivo'
};

const CATEGORY_LABELS = {
  cartelli: 'Cartelli stradali', pedoni: 'Pedoni', bici: 'Bicicletta', monopattino: 'Monopattino', auto: 'Automobile', trasporto: 'Trasporto pubblico', emergenze: 'Emergenze', agente: 'Polizia Locale', civica: 'Educazione civica', meteo: 'Meteo e imprevisti'
};

const DICE_DOTS = { 1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8] };

const SIGN_DETAILS = {
  STOP: { title:'STOP', image: ASSETS.signs.stop, color:'#dc2626', text:'Obbliga a fermarsi completamente prima di proseguire.', tip:'Allo STOP non si rallenta soltanto: ci si ferma davvero.' },
  'DARE PRECEDENZA': { title:'Dare precedenza', image: ASSETS.signs.darePrecedenza, color:'#f59e0b', text:'Bisogna lasciare passare chi sta arrivando sulla strada principale.', tip:'Prima guardo chi arriva, poi posso passare.' },
  'ATTRAVERSAMENTO PEDONALE': { title:'Attraversamento pedonale', image: ASSETS.signs.attraversamento, color:'#0284c7', text:'Avvisa che vicino possono attraversare persone a piedi.', tip:'Le auto devono prestare attenzione ai pedoni.' },
  'PISTA CICLABILE': { title:'Pista ciclabile', image: ASSETS.signs.pistaCiclabile, color:'#2563eb', text:'Indica uno spazio dedicato alle biciclette.', tip:'Pedoni e ciclisti devono rispettare gli spazi degli altri.' },
  'PERICOLO GENERICO': { title:'Pericolo generico', image: ASSETS.signs.pericolo, color:'#f97316', text:'Segnala una situazione che richiede più attenzione.', tip:'Quando lo vedi rallenta e osserva meglio.' },
  'DIVIETO DI ACCESSO': { title:'Divieto di accesso', image: ASSETS.signs.divietoAccesso, color:'#dc2626', text:'Indica che non si può entrare in quella strada o area.', tip:'Serve a evitare traffico contrario o situazioni pericolose.' },
  'LAVORI IN CORSO': { title:'Lavori in corso', image: ASSETS.signs.lavori, color:'#f97316', text:'Segnala un cantiere o persone che lavorano sulla strada.', tip:'Non si entra nei cantieri e non si spostano coni o barriere.' },
  'ATTRAVERSAMENTO BAMBINI': { title:'Bambini / Scuola', image: ASSETS.signs.bambini, color:'#0284c7', text:'Avvisa che vicino possono esserci bambini o scuole.', tip:'In zona scuola si rallenta e si osserva con più attenzione.' },
  'DIREZIONE OBBLIGATORIA': { title:'Direzione obbligatoria', image: ASSETS.signs.obbligoDiritto, color:'#2563eb', text:'Indica la direzione che bisogna seguire.', tip:'Se il cartello indica una direzione, non si sceglie un percorso diverso.' },
  'DIVIETO DI SOSTA': { title:'Divieto di sosta', image: ASSETS.signs.divietoSosta, color:'#1d4ed8', text:'Indica che non si può lasciare il veicolo in sosta.', tip:'Parcheggiare dove è vietato può creare ostacoli e pericoli.' },
  'PASSO CARRABILE': { title:'Passo carrabile', image: ASSETS.signs.passoCarrabile, color:'#334155', text:'Indica un accesso veicoli che deve restare libero.', tip:'Non si parcheggia davanti a un passo carrabile.' },
  'SORPASSO VIETATO': { title:'Sorpasso vietato', image: ASSETS.signs.sorpassoVietato, color:'#dc2626', text:'Indica che non è consentito superare altri veicoli.', tip:'Il divieto serve dove il sorpasso sarebbe pericoloso.' },
  'PARCO DI MONZA': { title:'Parco di Monza', image: ASSETS.signs.parcoMonza, color:'#92400e', text:'Segnale turistico/direzionale verso un luogo importante della città.', tip:'I cartelli marroni indicano spesso mete turistiche o culturali.' },
  'POLIZIA LOCALE': { title:'Polizia Locale', image: ASSETS.signs.poliziaLocaleDirezione, color:'#0f172a', text:'Indica la direzione verso un ufficio o presidio della Polizia Locale.', tip:'La Polizia Locale aiuta i cittadini e contribuisce alla sicurezza urbana e stradale.' },
  'PRONTO SOCCORSO': { title:'Pronto Soccorso', image: ASSETS.signs.prontoSoccorso, color:'#dc2626', text:'Indica la direzione verso un servizio sanitario di emergenza.', tip:'In caso di malore o incidente grave si avvisano subito adulti e soccorsi.' },
  MUNICIPIO: { title:'Municipio', image: ASSETS.signs.municipio, color:'#475569', text:'Indica la direzione verso il Comune, luogo importante per i servizi cittadini.', tip:'Il Municipio rappresenta l’amministrazione comunale.' }
};

const VISUAL_SIGNS = Object.keys(SIGN_DETAILS).map(label => ({ label, ...SIGN_DETAILS[label] }));

function q(id, category, type, question, answers, correct, explanation, image = null) { return { id, category, type, question, answers, correct, explanation, image }; }

function buildQuestionBank() {
  return [
    q('cartelli-001','cartelli','quiz','Cosa significa il cartello STOP?',['Fermarsi completamente e controllare','Rallentare soltanto','Accelerare se non arriva nessuno'],0,'Allo STOP bisogna fermarsi sempre.',ASSETS.signs.stop),
    q('cartelli-002','cartelli','quiz','Quale forma hanno spesso i segnali di pericolo?',['Triangolare','Quadrata verde','Rotonda blu'],0,'I segnali di pericolo sono spesso triangolari.',ASSETS.signs.pericolo),
    q('cartelli-003','cartelli','quiz','Che cosa indica questo segnale blu con la bicicletta?',['Pista o percorso ciclabile','Divieto per biciclette','Parcheggio auto'],0,'Il simbolo della bici indica un percorso ciclabile.',ASSETS.signs.pistaCiclabile),
    q('cartelli-004','cartelli','quiz','Che cosa devi fare se vedi il segnale “lavori in corso”?',['Rallentare e osservare','Entrare nel cantiere','Spostare i coni'],0,'I cantieri richiedono prudenza.',ASSETS.signs.lavori),
    q('cartelli-005','cartelli','quiz','Che cosa indica il divieto di accesso?',['Non si può entrare','C’è un parcheggio','Ci sono bambini'],0,'Il divieto di accesso vieta l’ingresso.',ASSETS.signs.divietoAccesso),
    q('cartelli-006','cartelli','quiz','Perché non si parcheggia davanti al passo carrabile?',['Per lasciare libero l’accesso ai veicoli','Perché è una pista ciclabile','Perché è una fermata del bus'],0,'Il passo carrabile deve restare libero.',ASSETS.signs.passoCarrabile),
    q('cartelli-007','cartelli','quiz','Che cosa segnala il cartello “Pronto Soccorso”?',['La direzione verso un servizio sanitario di emergenza','Un negozio','Un parco giochi'],0,'Il Pronto Soccorso serve nelle emergenze sanitarie.',ASSETS.signs.prontoSoccorso),
    q('cartelli-008','cartelli','quiz','Quale cartello aiuta a raggiungere un ufficio della Polizia Locale?',['Polizia Locale','Parco di Monza','Divieto di sosta'],0,'Il cartello direzionale indica dove trovare un servizio.',ASSETS.signs.poliziaLocaleDirezione),
    q('pedoni-001','pedoni','quiz','Prima di attraversare devi...',['Guardare entrambi i lati','Chiudere gli occhi','Correre senza fermarti'],0,'Controllare la strada è il primo gesto di sicurezza.'),
    q('pedoni-002','pedoni','quiz','Dove si attraversa correttamente?',['Sulle strisce pedonali','Dietro un autobus','In curva'],0,'Le strisce sono il punto corretto per attraversare.',ASSETS.signs.attraversamento),
    q('pedoni-003','pedoni','missione','Un pallone finisce in strada. Cosa fai?',['Mi fermo e chiedo aiuto a un adulto','Corro subito a prenderlo','Attraverso senza guardare'],0,'Non bisogna correre in strada all’improvviso.'),
    q('bici-001','bici','quiz','Prima di usare la bici è utile controllare...',['Freni e luci','Solo il colore','Solo il cestino'],0,'Freni e luci sono essenziali per la sicurezza.',ASSETS.scenes.biciBambini),
    q('bici-002','bici','quiz','Perché un ciclista deve evitare musica troppo alta nelle cuffie?',['Per sentire veicoli e campanelli','Per andare più veloce','Per consumare meno batteria'],0,'Sentire i rumori della strada aiuta a prevenire i pericoli.'),
    q('bici-003','bici','missione','Scegli la bici più sicura.',['Bici con luci, freni e casco','Bici senza freni','Bici senza luci di sera'],0,'Una bici sicura deve essere controllata.',ASSETS.scenes.biciBambini),
    q('auto-001','auto','quiz','In auto i bambini devono usare...',['Cintura o seggiolino adeguato','Niente','Lo zaino come protezione'],0,'Cintura e seggiolino proteggono i passeggeri.',ASSETS.scenes.autoBus),
    q('trasporto-001','trasporto','quiz','Quando scendi dal bus devi...',['Aspettare e controllare prima di attraversare','Passare davanti al bus senza guardare','Correre subito'],0,'Il bus può coprire la visuale.',ASSETS.scenes.autoBus),
    q('emergenze-001','emergenze','imprevisto','Senti una sirena: cosa fai?',['Lascio libero il passaggio','Mi metto davanti','Ignoro la sirena'],0,'I mezzi di soccorso devono arrivare rapidamente.'),
    q('agente-001','agente','quiz','Quale attività può svolgere la Polizia Locale?',['Aiutare davanti alle scuole e gestire il traffico','Vendere biciclette','Guidare autobus turistici'],0,'La Polizia Locale aiuta la sicurezza della città e della strada.',ASSETS.scenes.agenti),
    q('agente-002','agente','missione','L’agente ti dice di aspettare. Cosa fai?',['Rispetto l’indicazione','Passo lo stesso','Corro'],0,'Le indicazioni dell’agente servono alla sicurezza.',ASSETS.scenes.agenteTutor),
    q('civica-001','civica','quiz','Perché è importante rispettare chi attraversa lentamente?',['Perché ogni persona ha tempi e bisogni diversi','Per far diventare verde il semaforo','Perché le auto spariscono'],0,'La strada è uno spazio condiviso da rispettare con pazienza.',ASSETS.scenes.pedoniCitta),
    q('meteo-001','meteo','imprevisto','Piove forte: cosa cambia?',['Serve più attenzione','Si può correre di più','I veicoli spariscono'],0,'Con pioggia la strada può essere più scivolosa.')
  ];
}
const QUESTION_BANK = buildQuestionBank();

function getCellType(n) { if (n === 1) return 'partenza'; if (n === 10) return 'attraversamento'; if (n === 40) return 'arrivo'; if ([3,7,14,19,23,27,28,32,33,37].includes(n)) return 'missione'; if ([5,8,12,15,20,24,30,34,39].includes(n)) return 'imprevisto'; return 'quiz'; }
function clamp(value) { return Math.min(BOARD_SIZE, Math.max(1, value)); }
function pickRandomQuestion({ type, usedIds }) { const exact = QUESTION_BANK.filter(q => q.type === type && !usedIds.includes(q.id)); const pool = exact.length ? exact : QUESTION_BANK.filter(q => !usedIds.includes(q.id)); return pool.length ? pool[Math.floor(Math.random()*pool.length)] : null; }
function getGrado(xp) { if (xp >= 700) return 'Super Agente'; if (xp >= 450) return 'Esperto Sicurezza'; if (xp >= 220) return 'Agente Junior'; return 'Cadetto'; }
function createPlayer(p, i) { return { id: `${p.name}-${i}`, ...p, position: 1, score: 0, xp: 0, badges: [], skip: false }; }

function App() {
  const board = useMemo(() => Array.from({ length: BOARD_SIZE }, (_, i) => i+1), []);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [dice, setDice] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [usedIds, setUsedIds] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [pending, setPending] = useState(null);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('Scegli da 1 a 4 pedine e premi “Inizia partita”.');
  const [tutor, setTutor] = useState('Sono il Tutor della Polizia Locale. Ti guiderò nel gioco.');
  const [showSignals, setShowSignals] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [crosswalk, setCrosswalk] = useState(false);
  const [light, setLight] = useState('rosso');
  const [lookL, setLookL] = useState(false);
  const [lookR, setLookR] = useState(false);
  const current = players[currentIndex];
  const sortedPlayers = [...players].sort((a,b) => b.score-a.score);

  function updateCurrent(updater) { setPlayers(list => list.map((p,i) => i === currentIndex ? updater(p) : p)); }
  function nextTurn() { setCurrentIndex(i => players.length <= 1 ? i : (i+1)%players.length); }
  function togglePlayer(p) { if (gameStarted) return; setSelectedPlayers(list => list.some(x=>x.name===p.name) ? list.filter(x=>x.name!==p.name) : list.length >= MAX_PLAYERS ? list : [...list,p]); }
  function startGame() { if (!selectedPlayers.length) { setMessage('Prima devi scegliere almeno una pedina.'); return; } const newPlayers = selectedPlayers.map(createPlayer); setPlayers(newPlayers); setGameStarted(true); setCurrentIndex(0); setUsedIds([]); setMessage(`Partita iniziata! Tocca a ${newPlayers[0].name}.`); setTutor('Il dado indica la casella da conquistare: si avanza solo rispondendo bene.'); }
  function award(score,xp,badge) { updateCurrent(p => ({...p, score:p.score+score, xp:p.xp+xp, badges: p.badges.includes(badge) ? p.badges : [...p.badges,badge]})); }
  function moveTo(pos) { const np = clamp(pos); updateCurrent(p => ({...p, position:np})); if (np === BOARD_SIZE && current) { setWinner({...current, position:np}); setMessage(`${current.name} è arrivato a scuola in sicurezza!`); } }
  function rollDice() { if (!gameStarted || !current) return; if (isRolling || challenge || crosswalk || winner) return; setIsRolling(true); setMessage(`${current.name} sta lanciando il dado...`); setTimeout(() => { const result = Math.floor(Math.random()*6)+1; const target = clamp(current.position+result); setDice(result); setPending(target); setIsRolling(false); if (target === 10) { setCrosswalk(true); setLookL(false); setLookR(false); setLight('rosso'); setTimeout(()=>setLight('giallo'),700); setTimeout(()=>setLight('verde'),1500); setMessage(`Per conquistare la casella ${target}, completa l’attraversamento sicuro.`); return; } const type = getCellType(target) === 'arrivo' ? 'missione' : getCellType(target); const question = pickRandomQuestion({type, usedIds}); if (!question) { moveTo(target); setTimeout(nextTurn,700); return; } setUsedIds(ids => [...ids, question.id]); setChallenge({...question, target}); setTutor('La domanda è casuale e non si ripeterà in questa partita.'); }, 600); }
  function answer(index) { if (!challenge || pending == null) return; if (index === challenge.correct) { const score = challenge.type === 'missione' ? 25 : challenge.type === 'imprevisto' ? 20 : 15; award(score, score, challenge.type); moveTo(pending); setMessage(`Risposta corretta! ${challenge.explanation}`); setTutor(`Conquisti la casella ${pending}.`); } else { setMessage(`Risposta non corretta. ${challenge.explanation} Rimani dove sei.`); setTutor('Non avanzi, ma hai imparato una regola importante.'); } setChallenge(null); setPending(null); setTimeout(nextTurn,900); }
  function completeCrosswalk() { if (!lookL || !lookR) { setMessage('Devi guardare sia a sinistra sia a destra.'); return; } if (light !== 'verde') { setMessage('Hai attraversato senza verde: rimani dove sei.'); setCrosswalk(false); setPending(null); setTimeout(nextTurn,900); return; } award(35,40,'Maestro Strisce'); moveTo(pending ?? current.position); setCrosswalk(false); setPending(null); setMessage('Attraversamento perfetto!'); setTimeout(nextTurn,900); }
  function resetGame() { setSelectedPlayers([]); setPlayers([]); setGameStarted(false); setDice(null); setChallenge(null); setCrosswalk(false); setWinner(null); setPending(null); setUsedIds([]); setMessage('Scegli da 1 a 4 pedine e premi “Inizia partita”.'); }

  return <div className="app-shell">
    {challenge && <Modal title={challenge.type === 'missione' ? 'Missione da completare' : challenge.type === 'imprevisto' ? 'Imprevisto da risolvere' : 'Quiz sicurezza stradale'}>
      <div className="target-banner">Casella da conquistare: {pending}</div>
      <div className="category">Categoria: {CATEGORY_LABELS[challenge.category]} · Domanda {usedIds.length}/{QUESTION_BANK.length}</div>
      {challenge.image && <AssetImage src={challenge.image} className="challenge-image" alt="immagine domanda" fallback="" />}
      <h2 className="question-text">{challenge.question}</h2>
      <div className="choices">{challenge.answers.map((a,i)=><button className="choice" onClick={()=>answer(i)} key={a}>{a}</button>)}</div>
    </Modal>}
    {crosswalk && <Modal title="Attraversamento sicuro"><div className="crosswalk-game"><div className="traffic-light"><button className={light==='rosso'?'red on':'red'} /><button className={light==='giallo'?'yellow on':'yellow'} /><button className={light==='verde'?'green on':'green'} /></div><div className="street-scene"><div className="road-band"><span /><span /><span /><span /></div><div className="look-buttons"><button onClick={()=>setLookL(true)} className={lookL?'done':''}>Guarda sinistra</button><button onClick={()=>setLookR(true)} className={lookR?'done':''}>Guarda destra</button></div><button className="cross-button" onClick={completeCrosswalk}>ATTRAVERSA</button></div></div></Modal>}
    {winner && <Modal title="Diploma Agente Junior"><div className="winner"><h2>{winner.name} ha attraversato Monza in sicurezza!</h2><p>Punteggio finale: {winner.score}</p><button onClick={resetGame}>Gioca ancora</button></div></Modal>}
    {selectedSign && <Modal title={selectedSign.title}><div className="sign-detail" style={{'--accent': selectedSign.color}}><AssetImage src={selectedSign.image} className="sign-detail-img" alt={selectedSign.title} fallback="" /><p>{selectedSign.text}</p><strong>{selectedSign.tip}</strong><button onClick={()=>setSelectedSign(null)}>Chiudi scheda</button></div></Modal>}

    <div className="lim-frame">
      <header className="topbar"><div className="brand"><AssetImage src={ASSETS.logoPolizia} alt="Polizia Locale Monza" className="logo" fallback="PL"/><div><h1>Agente Junior</h1><p>Modalità LIM · Gioco dell’oca educativo</p></div></div><div className="turn-box"><span>Turno</span>{current && <PlayerToken player={current}/>}<b>{current?.name || '-'}</b></div><div className="dice-box"><DiceCube value={dice} rolling={isRolling}/><div><b>{usedIds.length}/{QUESTION_BANK.length}</b><span>Domande usate</span><b>Casella {pending || '-'}</b></div></div></header>
      <section className="play-layout"><aside className="sidebar"><h2>Giocatori</h2>{!gameStarted && <div className="player-select">{PLAYERS.map(p => <button key={p.name} onClick={()=>togglePlayer(p)} className={selectedPlayers.some(x=>x.name===p.name)?'selected':''}><PlayerToken player={p}/><span>{p.name}</span></button>)}</div>}<div className="ranking"><h3>Classifica</h3>{(players.length?sortedPlayers:selectedPlayers.map(createPlayer)).map(p => <div className="rank-card" style={{background:p.color}} key={p.id}><PlayerToken player={p} small/><div><b>{p.name}</b><span>{p.score} punti · XP {p.xp}</span><small>{getGrado(p.xp)}</small></div></div>)}</div><div className="controls">{!gameStarted ? <button className="primary" onClick={startGame}>Inizia partita</button> : <button className="primary" onClick={rollDice} disabled={isRolling || challenge || crosswalk || winner}>{isRolling?'Lancio...':'Lancia dado'}</button>}<button onClick={resetGame}>Nuova partita</button><div className="small-controls"><button onClick={()=>setShowSignals(true)}>Segnali</button><button onClick={()=>setShowRules(true)}>Regole</button></div></div></aside>
      <main className="board-area"><div className="map-label top-left">Centro</div><div className="map-label top-right">Parco</div><div className="map-label bottom-left">Stazione</div><div className="map-label bottom-right">Scuola</div><svg viewBox="0 0 1000 500" className="road-svg"><path d="M90 400 C190 400, 210 120, 360 120 C520 120, 520 390, 690 390 C840 390, 840 130, 930 130" stroke="#1e293b" strokeWidth="88" fill="none" strokeLinecap="round"/><path d="M90 400 C190 400, 210 120, 360 120 C520 120, 520 390, 690 390 C840 390, 840 130, 930 130" stroke="#475569" strokeWidth="70" fill="none" strokeLinecap="round"/><path d="M90 400 C190 400, 210 120, 360 120 C520 120, 520 390, 690 390 C840 390, 840 130, 930 130" stroke="#facc15" strokeWidth="6" fill="none" strokeDasharray="18 18" strokeLinecap="round"/></svg><div className="board-grid">{board.map(n=>{const type=getCellType(n); const here=players.filter(p=>p.position===n); return <div key={n} className={`cell ${type} ${pending===n?'target':''} ${here.length?'occupied':''}`}><div className="tokens">{here.map(p=><PlayerToken key={p.id} player={p} tiny/>)}</div><b>{n}</b><span>{CELL_LABELS[type]}</span></div>})}</div></main></section>
      <footer className="footer"><div className="tutor"><AssetImage src={ASSETS.scenes.agenteTutor} className="tutor-img" alt="Tutor" fallback="PL"/><div><b>Tutor della Polizia Locale</b><p>{tutor}</p></div></div><div className="message"><b>Centrale Operativa</b><p>{message}</p></div></footer>
    </div>
    {showSignals && <SidePanel title="Segnaletica Interattiva" onClose={()=>setShowSignals(false)}><div className="sign-grid">{VISUAL_SIGNS.map(s=><button key={s.label} onClick={()=>setSelectedSign(s)}><AssetImage src={s.image} className="sign-img" alt={s.label} fallback=""/><b>{s.label}</b></button>)}</div></SidePanel>}
    {showRules && <SidePanel title="Regole rapide" onClose={()=>setShowRules(false)}><div className="rules"><InfoCard title="Missioni" text="Prove pratiche su comportamenti sicuri."/><InfoCard title="Quiz" text="Domande casuali mai ripetute nella partita."/><InfoCard title="Imprevisti" text="Pioggia, traffico, soccorsi e pericoli reali."/><InfoCard title="Modalità Pro" text="Si avanza solo se si risponde correttamente."/></div></SidePanel>}
  </div>
}

function AssetImage({src, alt, className, fallback}) { const [failed,setFailed]=useState(false); if (!src || failed) return <div className={`${className||''} asset-fallback`}>{fallback}</div>; return <img src={src} alt={alt||''} className={className} onError={()=>setFailed(true)}/>; }
function PlayerToken({player, small=false, tiny=false}) { return <div className={`token ${small?'small':''} ${tiny?'tiny':''}`} style={{background:player.gradient}}>{player.token}</div>; }
function DiceCube({value, rolling}) { const dots = DICE_DOTS[value||1]; return <div className={`dice ${rolling?'rolling':''}`}>{Array.from({length:9},(_,i)=><span key={i} className={dots.includes(i)?'dot':''}/>)}</div>; }
function Modal({title, children}) { return <div className="modal"><div className="modal-card"><h1>{title}</h1>{children}</div></div>; }
function SidePanel({title, children, onClose}) { return <div className="side-overlay"><div className="side-panel"><div className="side-head"><h1>{title}</h1><button onClick={onClose}>Chiudi</button></div>{children}</div></div>; }
function InfoCard({title,text}) { return <div className="info-card"><h3>{title}</h3><p>{text}</p></div>; }

createRoot(document.getElementById('root')).render(<App/>);
