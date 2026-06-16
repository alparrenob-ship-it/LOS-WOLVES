(()=>{
  const RECHARGES=[
    {usd:5,coins:500,label:'Paquete Aula'},
    {usd:10,coins:1000,label:'Paquete Curso'},
    {usd:20,coins:2000,label:'Paquete Bienestar'},
    {usd:50,coins:5000,label:'Paquete Institucional'}
  ];
  const DAILY_EARNINGS=[
    {label:'Mood Check',coins:10},
    {label:'Wolf AI',coins:15},
    {label:'Reto Escucha Activa',coins:40}
  ];
  const fmt=new Intl.NumberFormat('es-EC');
  const money=new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  let selectedRecharge=null;

  function u(){return typeof user==='function'?user():S.users.find(x=>x.email===S.currentUser)||S.users[0];}
  function byEmail(email){return S.users.find(x=>x.email===email);}
  function today(){return new Date().toISOString().slice(0,10);}
  function stamp(){return new Date().toLocaleString('es-EC');}
  function rid(){return 'REC-'+Math.random().toString(36).slice(2,7).toUpperCase();}
  function saveState(){if(typeof save==='function')save();}
  function notify(text){if(typeof toast==='function')toast(text);}
  function initRequests(){S.rechargeRequests=Array.isArray(S.rechargeRequests)?S.rechargeRequests:[];}
  function currentCoins(){const me=u();me.coins=Number(me.coins||me.eightCoins||0);me.eightCoins=me.coins;return me.coins;}
  function walletEntries(){S.wallet=Array.isArray(S.wallet)?S.wallet:[];return S.wallet;}
  function ecToUsd(coins){return coins/100;}
  function numericAmount(v){
    if(typeof v==='number') return v;
    if(typeof v==='string'){
      const n=Number(v.replace(/[^0-9.-]/g,''));
      return Number.isFinite(n)?n:0;
    }
    return 0;
  }
  function totals(){
    const entries=walletEntries();
    const gained=entries.reduce((sum,item)=>{const n=numericAmount(item.amount);return n>0?sum+n:sum;},0);
    const spent=entries.reduce((sum,item)=>{const n=numericAmount(item.amount);return n<0?sum+Math.abs(n):sum;},0);
    const me=u();
    me.totalGanado=Math.max(Number(me.totalGanado||0),gained,currentCoins());
    me.totalGastado=Math.max(Number(me.totalGastado||0),spent);
    return {gained:me.totalGanado,spent:me.totalGastado};
  }
  function completedChallenges(){
    try{
      const local=Object.keys(localStorage).filter(k=>k.startsWith('wolves_challenge_progress_v2_')).map(k=>JSON.parse(localStorage.getItem(k)||'{}'))[0]||{};
      return Object.values(local).filter(x=>x&&x.completado).length||S.challenges?.length||0;
    }catch{return S.challenges?.length||0;}
  }
  function moodChecks(){return Array.isArray(S.moods)?S.moods.length:0;}
  function activeDays(){
    const days=new Set();
    (S.moods||[]).forEach(x=>x.date&&days.add(String(x.date).slice(0,10)));
    walletEntries().forEach(x=>x.date&&days.add(String(x.date).slice(0,10)));
    return Math.max(days.size,7);
  }
  function levelInfo(){
    const coins=currentCoins();
    const tiers=[
      {name:'Lobo Explorador',next:'Lobo Guardián',goal:1500},
      {name:'Lobo Guardián',next:'Lobo Alfa',goal:3000},
      {name:'Lobo Alfa',next:'Lobo Legendario',goal:6000},
      {name:'Lobo Legendario',next:'Manada Élite',goal:10000},
      {name:'Manada Élite',next:'Reconocimiento Institucional',goal:15000}
    ];
    const tier=tiers.find(x=>coins<x.goal)||tiers[tiers.length-1];
    const percent=Math.min(100,(coins/tier.goal)*100);
    const missing=Math.max(0,tier.goal-coins);
    u().nivel=tier.name;
    return {name:tier.name,next:tier.next,coins,goal:tier.goal,missing,percent};
  }
  function historyItems(){
    const entries=walletEntries().slice(0,8);
    if(entries.length) return entries;
    return [
      {date:today(),type:'Recompensa',amount:80,detail:'EightCoins iniciales'},
      {date:today(),type:'Mood Check',amount:10,detail:'Registro emocional diario'}
    ];
  }
  function historyHtml(){
    return historyItems().map(item=>{
      const n=numericAmount(item.amount);
      const sign=n>=0?'+':'-';
      const cls=n>=0?'income':'expense';
      const amount=Math.abs(n)||item.amount;
      return `<div class="wallet-time-row ${cls}">
        <div class="time-dot"></div>
        <div><strong>${item.date||today()}</strong><span>${item.detail||item.type||'Movimiento Wolves'}</span></div>
        <b>${sign}${fmt.format(amount)} EC</b>
      </div>`;
    }).join('');
  }
  function myRequestsHtml(){
    initRequests();
    const email=u().email;
    const rows=S.rechargeRequests.filter(x=>x.studentEmail===email).slice(0,4);
    if(!rows.length) return '<p class="wallet-note">Aún no tienes solicitudes de recarga.</p>';
    return rows.map(r=>`<div class="wallet-request-row ${r.status.toLowerCase()}"><div><b>${r.id} · ${r.status}</b><span>$${r.usd} USD · ${fmt.format(r.coins)} EC · ${r.method}</span></div><small>${r.date}</small></div>`).join('');
  }
  function syncUserFields(){
    initRequests();
    const me=u();
    const t=totals();
    const level=levelInfo();
    me.eightCoins=currentCoins();
    me.usd=ecToUsd(me.eightCoins);
    me.totalGanado=t.gained;
    me.totalGastado=t.spent;
    me.nivel=level.name;
    me.racha=Number(me.racha||7);
    me.historial=walletEntries();
    saveState();
  }
  async function syncFirebase(){
    syncUserFields();
    if(!window.WolvesFirebase) return;
    try{
      const ctx=await window.WolvesFirebase.ready();
      if(!ctx.enabled) return;
      const {doc,setDoc,serverTimestamp}=ctx.dbMod;
      const me=u();
      await setDoc(doc(ctx.db,'users',ctx.auth.currentUser.uid),{
        uid:ctx.auth.currentUser.uid,
        nombre:me.name||me.profileName||'Estudiante Wolves',
        curso:me.grade||'Curso demo',
        eightCoins:me.eightCoins,
        usdSimulado:me.usd,
        totalGanado:me.totalGanado,
        totalGastado:me.totalGastado,
        nivel:me.nivel,
        racha:me.racha,
        historial:me.historial,
        rechargeRequests:S.rechargeRequests,
        updatedAt:serverTimestamp()
      },{merge:true});
    }catch(error){console.warn('Wallet Firebase fallback:',error);}
  }
  function coinBurst(text){
    const burst=document.createElement('div');
    burst.className='wallet-coin-burst';
    burst.textContent=`✨ ${text}`;
    document.body.appendChild(burst);
    setTimeout(()=>burst.remove(),1600);
  }
  function animateCounts(){
    document.querySelectorAll('[data-wallet-count]').forEach(el=>{
      const end=Number(el.dataset.walletCount||0);
      const suffix=el.dataset.suffix||'';
      const prefix=el.dataset.prefix||'';
      const decimals=Number(el.dataset.decimals||0);
      const duration=900;
      const t0=performance.now();
      function frame(t){
        const p=Math.min(1,(t-t0)/duration);
        const eased=1-Math.pow(1-p,3);
        const value=end*eased;
        el.textContent=`${prefix}${decimals?money.format(value):fmt.format(Math.round(value))}${suffix}`;
        if(p<1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }
  function addWalletMovement(type,amount,detail){
    walletEntries().unshift({date:today(),type,amount,detail});
  }
  function selectedRechargeForm(){
    if(!selectedRecharge) return '';
    return `<div class="institution-recharge-form">
      <div><strong>Solicitar recarga al administrador</strong><span>${selectedRecharge.label}: pagas $${selectedRecharge.usd} USD y recibes ${fmt.format(selectedRecharge.coins)} EC.</span></div>
      <label>Método de pago al administrador<select id="walletMethod"><option>Efectivo en secretaría</option><option>Transferencia bancaria</option><option>Pago autorizado por representante</option></select></label>
      <label>Referencia de pago<input id="walletReference" placeholder="Comprobante, número de orden o nota del pago"></label>
      <label>Mensaje para Admin<input id="walletNote" placeholder="Ej: Ya entregué $10 al administrador"></label>
      <div class="wallet-form-actions"><button class="wallet-confirm-recharge">Enviar solicitud</button><button class="wallet-cancel-recharge" type="button">Cancelar</button></div>
      <small>La recarga queda pendiente. Las EightCoins solo se acreditan cuando el Administrador aprueba la solicitud.</small>
    </div>`;
  }
  function createRechargeRequest(){
    initRequests();
    const method=document.getElementById('walletMethod')?.value;
    const reference=document.getElementById('walletReference')?.value.trim();
    const note=document.getElementById('walletNote')?.value.trim();
    if(!reference){notify('Escribe una referencia de pago para el administrador.');return;}
    const me=u();
    S.rechargeRequests.unshift({
      id:rid(),studentEmail:me.email,studentName:me.name,grade:me.grade,usd:selectedRecharge.usd,coins:selectedRecharge.coins,
      label:selectedRecharge.label,method,reference,note,status:'Pendiente',date:stamp(),approvedBy:'',approvedAt:''
    });
    addWalletMovement('Solicitud',0,`Solicitud enviada a Admin: $${selectedRecharge.usd} USD por ${fmt.format(selectedRecharge.coins)} EC`);
    selectedRecharge=null;
    saveState();
    syncFirebase();
    notify('Solicitud enviada al Administrador. Pendiente de aprobación.');
    render();
  }
  function approveRecharge(id){
    initRequests();
    const req=S.rechargeRequests.find(x=>x.id===id);
    if(!req||req.status!=='Pendiente') return;
    const target=byEmail(req.studentEmail);
    if(!target){notify('No se encontró el estudiante.');return;}
    target.coins=Number(target.coins||target.eightCoins||0)+req.coins;
    target.eightCoins=target.coins;
    target.usd=ecToUsd(target.coins);
    target.totalGanado=Number(target.totalGanado||0)+req.coins;
    req.status='Aprobada';
    req.approvedBy=u().name||'Administrador WOLVES';
    req.approvedAt=stamp();
    addWalletMovement('Recarga aprobada',req.coins,`${req.studentName}: ${req.label} · $${req.usd} USD · ${req.reference}`);
    coinBurst(`+${fmt.format(req.coins)} EC aprobadas`);
    saveState();
    syncFirebase();
    notify('Recarga aprobada y EightCoins acreditadas.');
    render();
  }
  function rejectRecharge(id){
    initRequests();
    const req=S.rechargeRequests.find(x=>x.id===id);
    if(!req||req.status!=='Pendiente') return;
    req.status='Rechazada';
    req.approvedBy=u().name||'Administrador WOLVES';
    req.approvedAt=stamp();
    addWalletMovement('Recarga rechazada',0,`${req.studentName}: ${req.label} · ${req.reference}`);
    saveState();
    notify('Solicitud rechazada.');
    render();
  }
  function adminRechargePanel(){
    initRequests();
    const rows=S.rechargeRequests;
    const pending=rows.filter(x=>x.status==='Pendiente').length;
    return `<section class="wallet-shell admin-wallet-shell">
      <div class="wallet-header"><div><span class="wallet-kicker">💳 Control Wallet</span><h2>Solicitudes de recarga EightCoins</h2></div></div>
      <article class="wallet-panel wallet-admin-panel">
        <div class="admin-wallet-summary"><b>${pending}</b><span>pendientes por aprobar</span></div>
        ${rows.length?rows.map(r=>`<div class="admin-recharge-row ${r.status.toLowerCase()}">
          <div><strong>${r.id} · ${r.studentName}</strong><span>${r.grade||'Estudiante'} · ${r.studentEmail}</span><small>${r.date}</small></div>
          <div><b>$${r.usd} USD</b><span>${fmt.format(r.coins)} EC</span><small>${r.method} · ${r.reference}</small></div>
          <p>${r.note||'Sin mensaje adicional.'}</p>
          <div class="admin-recharge-actions">${r.status==='Pendiente'?`<button class="approve-recharge" data-id="${r.id}">Aprobar</button><button class="reject-recharge" data-id="${r.id}">Rechazar</button>`:`<span>${r.status} por ${r.approvedBy||'Admin'} ${r.approvedAt?`· ${r.approvedAt}`:''}</span>`}</div>
        </div>`).join(''):'<p class="wallet-note">No hay solicitudes de recarga todavía.</p>'}
      </article>
    </section>`;
  }

  window.wallet=function walletPremium(){
    syncUserFields();
    const coins=currentCoins();
    const usd=ecToUsd(coins);
    const level=levelInfo();
    const totalToday=DAILY_EARNINGS.reduce((a,b)=>a+b.coins,0);
    const t=totals();
    return `<section class="wallet-shell">
      <div class="wallet-header"><div><span class="wallet-kicker">🐺 Wolf Wallet</span><h2>Tu esfuerzo se transforma en recompensas</h2></div></div>
      <section class="wallet-main-grid">
        <article class="wallet-premium-card tilt-card"><div class="wallet-card-particles"><span></span><span></span><span></span><span></span></div><div class="wallet-card-top"><span>💰 Balance Actual Real</span><div class="coin-orb">🪙</div></div><strong class="wallet-balance" data-wallet-count="${coins}" data-suffix=" EightCoins">${fmt.format(coins)} EightCoins</strong><p class="wallet-usd"><b data-wallet-count="${usd}" data-prefix="≈ $" data-suffix=" USD simulados" data-decimals="2">≈ $${money.format(usd)} USD simulados</b> <span class="wallet-tip" data-tip="1 EightCoin equivale a $0.01 USD para referencia educativa institucional.">?</span></p><div class="wallet-card-chip"></div><small>Equivalencia real demo: 1 EC = $0.01 USD</small></article>
        <article class="wallet-level-card tilt-card"><div class="level-head"><span>Nivel Actual: <b>${level.name}</b></span><em>Meta: ${level.next}</em></div><div class="level-bar"><div style="width:${level.percent}%"><i></i></div></div><p><b>${fmt.format(level.coins)} EC acumuladas</b> / Meta ${fmt.format(level.goal)} EC</p><div class="level-reward">Faltan <b>${fmt.format(level.missing)} EC</b> para el siguiente reconocimiento de la manada.</div></article>
      </section>
      <section class="wallet-grid-3"><article class="wallet-panel today-card"><h3>Ganaste Hoy</h3>${DAILY_EARNINGS.map(x=>`<div class="today-row"><span>${x.label}</span><b>+${x.coins}</b></div>`).join('')}<div class="today-total"><span>Total del día</span><b>+${totalToday} EC</b></div></article><article class="wallet-panel streak-card"><h3>🔥 Racha Actual</h3><strong>${u().racha||7} días consecutivos</strong><div class="week-streak">${['L','M','M','J','V','S','D'].map((day,i)=>`<div class="${i<5?'done':'miss'}"><span>${day}</span><b>${i<5?'✓':'×'}</b></div>`).join('')}</div></article><article class="wallet-panel reward-card"><h3>Recompensas desbloqueadas</h3>${[['🏆','Insignia Empático'],['🌟','Lobo Constante'],['💎','Primeras 1000 Coins']].map(x=>`<button class="reward-pill"><span>${x[0]}</span>${x[1]}</button>`).join('')}</article></section>
      <article class="wallet-panel wallet-stats-panel"><h3>📈 Estadísticas de la Wallet</h3><div class="wallet-stats-strip"><div><b data-wallet-count="${t.gained}">${fmt.format(t.gained)}</b><span>Total Ganado</span></div><div><b data-wallet-count="${t.spent}">${fmt.format(t.spent)}</b><span>Total Gastado</span></div><div><b data-wallet-count="${completedChallenges()}">${completedChallenges()}</b><span>Retos Completados</span></div><div><b data-wallet-count="${moodChecks()}">${moodChecks()}</b><span>Mood Checks</span></div><div><b data-wallet-count="${activeDays()}">${activeDays()}</b><span>Días Activos</span></div></div></article>
      <section class="wallet-bottom-grid"><article class="wallet-panel recharge-card"><h3>Solicitar recarga al Administrador</h3><p class="wallet-note">El estudiante paga en dólares al administrador. El administrador aprueba la solicitud y el sistema acredita las EightCoins.</p><div class="recharge-grid">${RECHARGES.map(x=>`<button class="wallet-recharge tilt-card" data-usd="${x.usd}" data-coins="${x.coins}" data-label="${x.label}"><b>💵 $${x.usd}</b><span>+${fmt.format(x.coins)} EC</span><small>${x.label}</small></button>`).join('')}</div>${selectedRechargeForm()}<div class="student-request-list"><h3>Mis solicitudes</h3>${myRequestsHtml()}</div></article><article class="wallet-panel timeline-card"><h3>Historial Wolves</h3><div class="wallet-timeline">${historyHtml()}</div></article></section>
    </section>`;
  };

  const previousBind=window.bindStudent;
  window.bindStudent=function bindStudentWallet(){
    if(typeof previousBind==='function') previousBind();
    if(active!=='Wallet') return;
    animateCounts();
    document.querySelectorAll('.wallet-recharge').forEach(btn=>btn.onclick=()=>{selectedRecharge={usd:Number(btn.dataset.usd),coins:Number(btn.dataset.coins),label:btn.dataset.label};render();});
    const confirm=document.querySelector('.wallet-confirm-recharge');
    if(confirm) confirm.onclick=createRechargeRequest;
    const cancel=document.querySelector('.wallet-cancel-recharge');
    if(cancel) cancel.onclick=()=>{selectedRecharge=null;render();};
  };

  if(typeof menus!=='undefined'&&menus.admin&&!menus.admin.includes('Recargas Wallet')) menus.admin.splice(1,0,'Recargas Wallet');
  const previousAdmin=window.admin;
  window.admin=function walletAdminOverride(){
    if(active==='Recargas Wallet'){
      e('adminView').innerHTML=shell('Panel Administrador')+adminRechargePanel();
      document.querySelectorAll('.approve-recharge').forEach(btn=>btn.onclick=()=>approveRecharge(btn.dataset.id));
      document.querySelectorAll('.reject-recharge').forEach(btn=>btn.onclick=()=>rejectRecharge(btn.dataset.id));
      saveState();
      return;
    }
    if(typeof previousAdmin==='function') previousAdmin();
  };

  document.addEventListener('DOMContentLoaded',()=>syncFirebase());
})();