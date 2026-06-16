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
  function today(){return new Date().toISOString().slice(0,10);}
  function saveState(){if(typeof save==='function')save();}
  function notify(text){if(typeof toast==='function')toast(text);}
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
      {date:today(),type:'Recompensa',amount:80,detail:'Eight-Coins iniciales'},
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
  function syncUserFields(){
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
  function addCoins(amount,detail){
    const me=u();
    me.coins=currentCoins()+amount;
    me.eightCoins=me.coins;
    me.usd=ecToUsd(me.coins);
    me.totalGanado=Number(me.totalGanado||0)+amount;
    addWalletMovement('Ingreso',amount,detail);
    coinBurst(`+${fmt.format(amount)} EightCoins`);
    syncFirebase();
  }
  function selectedRechargeForm(){
    if(!selectedRecharge) return '';
    return `<div class="institution-recharge-form">
      <div><strong>Solicitud institucional simulada</strong><span>${selectedRecharge.label}: $${selectedRecharge.usd} USD = ${fmt.format(selectedRecharge.coins)} EC</span></div>
      <label>Responsable autorizado<input id="walletResponsible" placeholder="Nombre del DECE o Administrador"></label>
      <label>Código interno<input id="walletCode" placeholder="WOLVES-${new Date().getFullYear()}"></label>
      <label>Referencia / orden institucional<input id="walletReference" placeholder="ORD-${Math.floor(1000+Math.random()*9000)}"></label>
      <div class="wallet-form-actions"><button class="wallet-confirm-recharge">Autorizar recarga</button><button class="wallet-cancel-recharge" type="button">Cancelar</button></div>
      <small>Simulación lista para demo: no cobra dinero real, pero deja comprobante en Historial Wolves.</small>
    </div>`;
  }

  window.wallet=function walletPremium(){
    syncUserFields();
    const coins=currentCoins();
    const usd=ecToUsd(coins);
    const level=levelInfo();
    const totalToday=DAILY_EARNINGS.reduce((a,b)=>a+b.coins,0);
    const t=totals();
    return `<section class="wallet-shell">
      <div class="wallet-header">
        <div><span class="wallet-kicker">🐺 Wolf Wallet</span><h2>Tu esfuerzo se transforma en recompensas</h2></div>
      </div>

      <section class="wallet-main-grid">
        <article class="wallet-premium-card tilt-card">
          <div class="wallet-card-particles"><span></span><span></span><span></span><span></span></div>
          <div class="wallet-card-top"><span>💰 Balance Actual Real</span><div class="coin-orb">🪙</div></div>
          <strong class="wallet-balance" data-wallet-count="${coins}" data-suffix=" EightCoins">${fmt.format(coins)} EightCoins</strong>
          <p class="wallet-usd"><b data-wallet-count="${usd}" data-prefix="≈ $" data-suffix=" USD simulados" data-decimals="2">≈ $${money.format(usd)} USD simulados</b> <span class="wallet-tip" data-tip="1 EightCoin equivale a $0.01 USD para referencia educativa institucional.">?</span></p>
          <div class="wallet-card-chip"></div>
          <small>Equivalencia real demo: 1 EC = $0.01 USD</small>
        </article>

        <article class="wallet-level-card tilt-card">
          <div class="level-head"><span>Nivel Actual: <b>${level.name}</b></span><em>Meta: ${level.next}</em></div>
          <div class="level-bar"><div style="width:${level.percent}%"><i></i></div></div>
          <p><b>${fmt.format(level.coins)} EC acumuladas</b> / Meta ${fmt.format(level.goal)} EC</p>
          <div class="level-reward">Faltan <b>${fmt.format(level.missing)} EC</b> para el siguiente reconocimiento de la manada.</div>
        </article>
      </section>

      <section class="wallet-grid-3">
        <article class="wallet-panel today-card">
          <h3>Ganaste Hoy</h3>
          ${DAILY_EARNINGS.map(x=>`<div class="today-row"><span>${x.label}</span><b>+${x.coins}</b></div>`).join('')}
          <div class="today-total"><span>Total del día</span><b>+${totalToday} EC</b></div>
        </article>

        <article class="wallet-panel streak-card">
          <h3>🔥 Racha Actual</h3>
          <strong>${u().racha||7} días consecutivos</strong>
          <div class="week-streak">${['L','M','M','J','V','S','D'].map((day,i)=>`<div class="${i<5?'done':'miss'}"><span>${day}</span><b>${i<5?'✓':'×'}</b></div>`).join('')}</div>
        </article>

        <article class="wallet-panel reward-card">
          <h3>Recompensas desbloqueadas</h3>
          ${[['🏆','Insignia Empático'],['🌟','Lobo Constante'],['💎','Primeras 1000 Coins']].map(x=>`<button class="reward-pill"><span>${x[0]}</span>${x[1]}</button>`).join('')}
        </article>
      </section>

      <article class="wallet-panel wallet-stats-panel">
        <h3>📈 Estadísticas de la Wallet</h3>
        <div class="wallet-stats-strip">
          <div><b data-wallet-count="${t.gained}">${fmt.format(t.gained)}</b><span>Total Ganado</span></div>
          <div><b data-wallet-count="${t.spent}">${fmt.format(t.spent)}</b><span>Total Gastado</span></div>
          <div><b data-wallet-count="${completedChallenges()}">${completedChallenges()}</b><span>Retos Completados</span></div>
          <div><b data-wallet-count="${moodChecks()}">${moodChecks()}</b><span>Mood Checks</span></div>
          <div><b data-wallet-count="${activeDays()}">${activeDays()}</b><span>Días Activos</span></div>
        </div>
      </article>

      <section class="wallet-bottom-grid">
        <article class="wallet-panel recharge-card">
          <h3>Recargas institucionales simuladas</h3>
          <p class="wallet-note">Cada recarga respeta la equivalencia 1 EC = $0.01 USD y genera comprobante interno para la institución.</p>
          <div class="recharge-grid">${RECHARGES.map(x=>`<button class="wallet-recharge tilt-card" data-usd="${x.usd}" data-coins="${x.coins}" data-label="${x.label}"><b>💵 $${x.usd}</b><span>+${fmt.format(x.coins)} EC</span><small>${x.label}</small></button>`).join('')}</div>
          ${selectedRechargeForm()}
        </article>

        <article class="wallet-panel timeline-card">
          <h3>Historial Wolves</h3>
          <div class="wallet-timeline">${historyHtml()}</div>
        </article>
      </section>
    </section>`;
  };

  const previousBind=window.bindStudent;
  window.bindStudent=function bindStudentWallet(){
    if(typeof previousBind==='function') previousBind();
    if(active!=='Wallet') return;
    animateCounts();
    document.querySelectorAll('.wallet-recharge').forEach(btn=>btn.onclick=()=>{
      selectedRecharge={usd:Number(btn.dataset.usd),coins:Number(btn.dataset.coins),label:btn.dataset.label};
      render();
    });
    const confirm=document.querySelector('.wallet-confirm-recharge');
    if(confirm) confirm.onclick=()=>{
      const responsible=document.getElementById('walletResponsible')?.value.trim();
      const code=document.getElementById('walletCode')?.value.trim();
      const reference=document.getElementById('walletReference')?.value.trim();
      if(!responsible||!code||!reference){notify('Completa responsable, código y referencia institucional.');return;}
      addCoins(selectedRecharge.coins,`${selectedRecharge.label} autorizado por ${responsible} · ${code} · ${reference}`);
      notify(`Recarga institucional aprobada: +${fmt.format(selectedRecharge.coins)} EC`);
      selectedRecharge=null;
      render();
    };
    const cancel=document.querySelector('.wallet-cancel-recharge');
    if(cancel) cancel.onclick=()=>{selectedRecharge=null;render();};
  };

  document.addEventListener('DOMContentLoaded',()=>syncFirebase());
})();