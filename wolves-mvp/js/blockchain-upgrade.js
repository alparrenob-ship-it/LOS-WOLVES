(()=>{
  const ASSET='assets/';
  const STEPS=[
    {n:1,title:'Acción positiva',short:'El alumno completa un reto, gana un logro o realiza un canje.',img:`${ASSET}CONTROLALAANSIEDAD.png`,tag:'Reto o canje'},
    {n:2,title:'Constancia segura',short:'Wolves crea una constancia pública sin guardar emociones ni comentarios.',img:`${ASSET}LOBOWALLET.png`,tag:'Registro limpio'},
    {n:3,title:'Firma SHA-256',short:'La acción se transforma en un hash para comprobar que no fue alterada.',img:`${ASSET}BLOCKCHAIN.png`,tag:'Criptografía'},
    {n:4,title:'Libro Mayor',short:'El bloque queda unido al anterior como una cadena de evidencias.',img:`${ASSET}MASCOTA BRAZOS CRUZADOS.png`,tag:'Bloque protegido'}
  ];
  const PRIVACY=[
    {label:'Sí se registra',items:['Retos completados','Canjes de tienda','Logros y recompensas','Fecha y bloque']},
    {label:'No se registra',items:['Emociones privadas','Comentarios personales','Mensajes de Wolf AI','Datos sensibles del estudiante']}
  ];
  function saveState(){if(typeof save==='function')save();}
  function notify(t){if(typeof toast==='function')toast(t);}
  function shortHash(hash){return hash?`${hash.slice(0,14)}...${hash.slice(-8)}`:'Pendiente';}
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
  function blockVisual(action=''){
    const text=action.toLowerCase();
    if(text.includes('canje'))return {img:`${ASSET}MATERIAL POP TAZA.jpeg`,label:'Canje validado',type:'store'};
    if(text.includes('logro'))return {img:`${ASSET}NFT LOBO CAPUCHA.jpeg`,label:'Logro validado',type:'achievement'};
    if(text.includes('recompensa'))return {img:`${ASSET}MASCOTA CORAZÓN.png`,label:'Recompensa validada',type:'reward'};
    return {img:`${ASSET}RESPIRA Y RELÁJATE.png`,label:'Reto validado',type:'challenge'};
  }
  function latestBlock(){
    const list=chainList();
    if(!list.length){
      return `<div class="bc-current-empty"><img src="${ASSET}BLOCKCHAIN.png" alt="Blockchain Wolves"><h3>Aún no hay bloques generados</h3><p>Usa el botón de demostración para ver cómo Wolves registra una constancia sin exponer información emocional.</p></div>`;
    }
    const block=list[0];
    const visual=blockVisual(block.action);
    return `<article class="bc-current-block">
      <div class="bc-current-media"><img src="${visual.img}" alt="${visual.label}"><span>${visual.label}</span></div>
      <div class="bc-current-info"><small>Último bloque generado</small><h3>Bloque #${block.number}</h3><p>${block.action}</p><dl><div><dt>Fecha</dt><dd>${block.date}</dd></div><div><dt>Hash SHA-256</dt><dd>${shortHash(block.hash)}</dd></div><div><dt>Bloque anterior</dt><dd>${shortHash(block.previous)}</dd></div></dl></div>
    </article>`;
  }
  function rows(){
    const list=chainList();
    if(!list.length){
      return `<div class="bc-empty-ledger"><span>Libro Mayor en espera</span><p>No hay bloques en la bitácora todavía.</p></div>`;
    }
    return list.map(block=>{const visual=blockVisual(block.action);return `<article class="bc-ledger-item">
      <div class="bc-ledger-img"><img src="${visual.img}" alt="${visual.label}"></div>
      <div class="bc-ledger-main"><div><b>#${block.number}</b><span>${visual.label}</span></div><h3>${block.action}</h3><p>${block.date}</p></div>
      <div class="bc-ledger-hash"><small>SHA-256</small><code>${shortHash(block.hash)}</code></div>
    </article>`}).join('');
  }
  window.chain=function blockchainExplorerUpgrade(){
    const count=chainList().length;
    return `<section class="bc-shell">
      <article class="bc-hero-card">
        <div class="bc-hero-copy"><span class="bc-kicker">Blockchain conceptual Wolves</span><h2>Un libro de constancias, no un archivo de emociones</h2><p>Wolves usa la blockchain como una bitácora educativa: registra acciones positivas verificables, protege la privacidad y ayuda a demostrar progreso sin exponer información sensible.</p><div class="bc-hero-actions"><button class="bc-demo-btn" id="bcDemoBlock">Generar bloque demo</button><span>${count} bloques creados</span></div></div>
        <div class="bc-hero-visual"><img src="${ASSET}BLOCKCHAIN.png" alt="Blockchain Wolves"><div><b>Privacidad primero</b><small>Sin emociones ni comentarios personales</small></div></div>
      </article>
      <article class="bc-flow-card">
        <div class="bc-section-head"><div><span>Explicación rápida</span><h2>Así funciona en 4 pasos</h2></div></div>
        <div class="bc-step-grid">${STEPS.map(step=>`<div class="bc-step-card"><div class="bc-step-number">${step.n}</div><div class="bc-img-placeholder"><img src="${step.img}" alt="${step.title}"><span>${step.tag}</span></div><h3>${step.title}</h3><p>${step.short}</p></div>`).join('')}</div>
      </article>
      <section class="bc-privacy-grid">${PRIVACY.map((box,i)=>`<article class="bc-privacy-card ${i?'danger':'safe'}"><h3>${box.label}</h3><ul>${box.items.map(item=>`<li>${item}</li>`).join('')}</ul></article>`).join('')}</section>
      <article class="bc-live-card">
        <div class="bc-explorer-head"><div><span class="bc-kicker">Explorer visual</span><h2>Última constancia del Libro Mayor</h2><p>Cada bloque muestra una acción meritoria, su fecha y una firma SHA-256 conceptual.</p></div><span class="bc-status">Libro Mayor Activo</span></div>
        ${latestBlock()}
      </article>
      <article class="bc-explorer-card">
        <div class="bc-explorer-head"><div><h2>Historial de bloques Wolves</h2><p>Solo se registran retos superados, logros, recompensas y canjes. La privacidad emocional permanece protegida.</p></div></div>
        <div class="bc-summary-grid"><div><b>${count}</b><span>Bloques</span></div><div><b>SHA-256</b><span>Firma conceptual</span></div><div><b>0</b><span>Datos sensibles</span></div></div>
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