(()=>{
  const STEPS=[
    {n:1,title:'Registro',text:'El estudiante completa un reto saludable o canjea un objeto meritorio.',icon:'registro'},
    {n:2,title:'Transacción',text:'La red genera una transacción transparente para ser firmada.',icon:'transaccion'},
    {n:3,title:'Criptografía',text:'La acción se firma con SHA-256 y se liga al bloque anterior.',icon:'cripto'},
    {n:4,title:'Bloque',text:'La constancia queda inmutable en el Libro Mayor sin guardar datos sensibles.',icon:'bloque'}
  ];
  function saveState(){if(typeof save==='function')save();}
  function notify(t){if(typeof toast==='function')toast(t);}
  function shortHash(hash){return hash?`${hash.slice(0,16)}...${hash.slice(-8)}`:'Pendiente';}
  function now(){return new Date().toLocaleString('es-EC');}
  function chainList(){S.chain=Array.isArray(S.chain)?S.chain:[];return S.chain;}
  async function makeHash(text){
    const source=new TextEncoder().encode(text);
    const buf=await crypto.subtle.digest('SHA-256',source);
    return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  async function addDemoBlock(){
    const list=chainList();
    const previous=list[0]?.hash||'GENESIS-WOLVES';
    const actions=['Reto completado: Respiración Controlada 4-7-8','Canje de tienda: Taza Wolves','Logro desbloqueado: Racha escolar semanal','Recompensa: Biblioteca de retos completada'];
    const action=actions[list.length%actions.length];
    const number=list.length+1;
    const date=now();
    const hash=await makeHash(`${number}|${date}|${action}|${previous}`);
    list.unshift({number,date,action,hash,previous});
    saveState();
    notify('Bloque demo agregado al Libro Mayor Wolves');
    render();
  }
  function stepIcon(type){
    const map={registro:'✍️',transaccion:'🔁',cripto:'🔐',bloque:'🧱'};
    return map[type]||'◇';
  }
  function rows(){
    const list=chainList();
    if(!list.length){
      return `<div class="bc-empty-row"><div class="bc-empty-visual"><span>◇</span></div><p>No se han registrado bloques en la bitácora todavía.</p><small>Presiona “Generar bloque demo” para visualizar un ejemplo sin guardar emociones ni datos privados.</small></div>`;
    }
    return list.map(block=>`<article class="bc-block-card">
      <div class="bc-block-number"><span>#${block.number}</span><small>Bloque</small></div>
      <div class="bc-block-main"><h3>${block.action}</h3><p>${block.date}</p><div class="bc-hash-line"><b>SHA-256</b><code>${shortHash(block.hash)}</code></div><div class="bc-hash-line muted"><b>Anterior</b><code>${shortHash(block.previous)}</code></div></div>
      <div class="bc-image-slot"><span>Imagen futura</span></div>
    </article>`).join('');
  }
  window.chain=function blockchainExplorerUpgrade(){
    const count=chainList().length;
    return `<section class="bc-shell">
      <article class="bc-how-card">
        <div class="bc-section-head"><div><span>¿Cómo funciona la blockchain de Wolves?</span><h2>Privacidad, constancia y recompensas claras</h2></div><button class="bc-demo-btn" id="bcDemoBlock">Generar bloque demo</button></div>
        <div class="bc-step-grid">${STEPS.map(step=>`<div class="bc-step-card"><div class="bc-img-placeholder"><span>${stepIcon(step.icon)}</span><small>Imagen aquí</small></div><h3>${step.n}. ${step.title}</h3><p>${step.text}</p></div>`).join('')}</div>
      </article>
      <article class="bc-explorer-card">
        <div class="bc-explorer-head"><div><h2>Wolves Blockchain Explorer</h2><p>Se registran retos superados, logros, recompensas y canjes. Nunca emociones, comentarios personales ni información sensible.</p></div><span class="bc-status">Libro Mayor Activo</span></div>
        <div class="bc-summary-grid"><div><b>${count}</b><span>Bloques</span></div><div><b>SHA-256</b><span>Firma conceptual</span></div><div><b>Privado</b><span>Sin datos emocionales</span></div></div>
        <div class="bc-table-head"><span>Bloque</span><span>Descripción meritoria</span><span>Hash criptográfico</span></div>
        <div class="bc-block-list">${rows()}</div>
      </article>
    </section>`;
  };
  const prevBind=window.bindStudent;
  window.bindStudent=function bindBlockchainUpgrade(){
    if(typeof prevBind==='function')prevBind();
    if(active!=='Blockchain Explorer')return;
    const demo=document.getElementById('bcDemoBlock');
    if(demo)demo.onclick=addDemoBlock;
  };
})();
