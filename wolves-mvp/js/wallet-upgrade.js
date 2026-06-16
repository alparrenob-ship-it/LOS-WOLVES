(()=>{
  const RECHARGES=[
    {usd:5,coins:500},{usd:10,coins:1000},{usd:20,coins:2000},{usd:50,coins:5000}
  ];
  const QUICK_SHOP=[
    {id:'avatar',icon:'🎨',label:'Comprar Avatar',cost:350},
    {id:'mascota',icon:'🦊',label:'Comprar Mascota',cost:650},
    {id:'insignia',icon:'🏆',label:'Comprar Insignia',cost:250},
    {id:'store',icon:'🎁',label:'Ver Tienda Completa',cost:0}
  ];
  const DAILY_EARNINGS=[
    {label:'Mood Check',coins:10},
    {label:'Wolf AI',coins:15},
    {label:'Reto Escucha Activa',coins:40}
  ];
  const fmt=new Intl.NumberFormat('es-EC');

  function u(){return typeof user==='function'?user():S.users.find(x=>x.email===S.currentUser)||S.users[0];}
  function today(){return new Date().toISOString().slice(0,10);}
  function saveState(){if(typeof save==='function')save();}
  function notify(text){if(typeof toast==='function')toast(text);}
  function currentCoins(){const me=u();me.coins=Number(me.coins||me.eightCoins||0);me.eightCoins=me.coins;return me.coins;}
  function walletEntries(){S.wallet=Array.isArray(S.wallet)?S.wallet:[];return S.wallet;}
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
    const me=u();
    const coins=currentCoins();
    const xp=Number(me.xp||coins||0);
    me.xp=xp;
    if(xp>=1500) return {name:'Lobo Alfa',next:'Leyenda de la Manada',xp,max:3000,percent:Math.min(100,(xp/3000)*100)};
    return {name:'Lobo Explorador',next:'Lobo Alfa',xp,max:1500,percent:Math.min(100,(xp/1500)*100)};
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
        <b>${sign}${fmt.format(amount)} EightCoins</b>
      </div>`;
    }).join('');
  }
  function syncUserFields(){
    const me=u();
    const t=totals();
    const level=levelInfo();
    me.eightCoins=currentCoins();
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
        totalGanado:me.totalGanado,
        totalGastado:me.totalGastado,
        nivel:me.nivel,
        xp:me.xp,
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
      const start=0;
      const duration=900;
      const t0=performance.now();
      function frame(t){
        const p=Math.min(1,(t-t0)/duration);
        const eased=1-Math.pow(1-p,3);
        el.textContent=`${prefix}${fmt.format(Math.round(start+(end-start)*eased))}${suffix}`;
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
    me.usd=Number(me.usd||0)+(amount/100);
    me.xp=Number(me.xp||0)+amount;
    me.totalGanado=Number(me.totalGanado||0)+amount;
    addWalletMovement('Ingreso',amount,detail);
    coinBurst(`+${fmt.format(amount)} EightCoins`);
    syncFirebase();
  }
  function spendCoins(amount,detail){
    const me=u();
    if(currentCoins()<amount){notify('Necesitas más EightCoins para este canje.');return false;}
    me.coins=currentCoins()-amount;
    me.eightCoins=me.coins;
    me.totalGastado=Number(me.totalGastado||0)+amount;
    addWalletMovement('Canje',-amount,detail);
    coinBurst(`-${fmt.format(amount)} EightCoins`);
    syncFirebase();
    return true;
  }

  window.wallet=function walletPremium(){
    syncUserFields();
    const coins=currentCoins();
    const usd=(coins/100).toFixed(2);
    const level=levelInfo();
    const totalToday=DAILY_EARNINGS.reduce((a,b)=>a+b.coins,0);
    const t=totals();
    return `<section class="wallet-shell">
      <div class="wallet-header">
        <div><span class="wallet-kicker">🐺 Wolf Wallet</span><h2>Tu esfuerzo se transforma en recompensas</h2></div>
        <button class="wallet-store-link" data-wallet-store>🎁 Ver Tienda Completa</button>
      </div>

      <section class="wallet-main-grid">
        <article class="wallet-premium-card tilt-card">
          <div class="wallet-card-particles"><span></span><span></span><span></span><span></span></div>
          <div class="wallet-card-top"><span>💰 Balance Actual</span><div class="coin-orb">🪙</div></div>
          <strong class="wallet-balance" data-wallet-count="${coins}" data-suffix=" EightCoins">${fmt.format(coins)} EightCoins</strong>
          <p class="wallet-usd">≈ $${usd} USD simulados <span class="wallet-tip" data-tip="Valor educativo referencial">?</span></p>
          <div class="wallet-card-chip"></div>
          <small>WOLVES Eight Academy · Manada activa</small>
        </article>

        <article class="wallet-level-card tilt-card">
          <div class="level-head"><span>Nivel Actual: <b>${level.name}</b></span><em>Siguiente: ${level.next}</em></div>
          <div class="level-bar"><div style="width:${level.percent}%"><i></i></div></div>
          <p><b>${fmt.format(level.xp)}</b> / ${fmt.format(level.max)} XP</p>
          <div class="level-reward">Al completar: desbloqueo visual de <b>${level.next}</b></div>
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

      <section class="wallet-shop-recharge">
        <article class="wallet-panel">
          <h3>📈 Estadísticas</h3>
          <div class="wallet-stats-grid">
            <div><b data-wallet-count="${t.gained}">${fmt.format(t.gained)}</b><span>Total Ganado</span></div>
            <div><b data-wallet-count="${t.spent}">${fmt.format(t.spent)}</b><span>Total Gastado</span></div>
            <div><b data-wallet-count="${completedChallenges()}">${completedChallenges()}</b><span>Retos Completados</span></div>
            <div><b data-wallet-count="${moodChecks()}">${moodChecks()}</b><span>Mood Checks</span></div>
            <div><b data-wallet-count="${activeDays()}">${activeDays()}</b><span>Días Activos</span></div>
          </div>
        </article>

        <article class="wallet-panel quick-shop-card">
          <h3>Tienda rápida</h3>
          <div class="quick-shop-grid">${QUICK_SHOP.map(x=>`<button class="quick-buy" data-shop="${x.id}" data-cost="${x.cost}"><span>${x.icon}</span><b>${x.label}</b>${x.cost?`<small>${x.cost} EC</small>`:'<small>Abrir módulo</small>'}</button>`).join('')}</div>
        </article>
      </section>

      <section class="wallet-bottom-grid">
        <article class="wallet-panel recharge-card">
          <h3>Recargas premium</h3>
          <div class="recharge-grid">${RECHARGES.map(x=>`<button class="wallet-recharge tilt-card" data-usd="${x.usd}" data-coins="${x.coins}"><b>💵 $${x.usd}</b><span>+${fmt.format(x.coins)} EC</span></button>`).join('')}</div>
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
      addCoins(Number(btn.dataset.coins),`Recarga premium $${btn.dataset.usd} USD`);
      notify(`Recarga simulada: +${fmt.format(Number(btn.dataset.coins))} EC`);
      render();
    });
    document.querySelectorAll('.quick-buy').forEach(btn=>btn.onclick=()=>{
      const id=btn.dataset.shop;
      const cost=Number(btn.dataset.cost||0);
      if(id==='store'){
        active='Tienda Wolves';
        render();
        return;
      }
      if(spendCoins(cost,btn.textContent.trim())){
        notify('Canje premium agregado a tu perfil Wolves.');
        render();
      }
    });
    document.querySelectorAll('[data-wallet-store]').forEach(btn=>btn.onclick=()=>{active='Tienda Wolves';render();});
  };

  document.addEventListener('DOMContentLoaded',()=>syncFirebase());
})();