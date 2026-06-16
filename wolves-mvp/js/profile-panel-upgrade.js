(()=>{
  const LOGO='assets/LOGO.png';
  const AURAS={teal:'#27dcff',crimson:'#ff4b4b',violet:'#8a5cff',jade:'#18c790'};
  const GRADES=['Quinto EGB','Sexto EGB','Séptimo EGB','Octavo EGB','Noveno EGB','Décimo EGB','Primero de Bachillerato','Segundo de Bachillerato','Tercero de Bachillerato'];
  const NFTS=['Corona Imperial','Gafas Alpha','Headset Cyber','Halo Zen'];

  function currentUser(){return typeof user==='function'?user():S.users.find(u=>u.email===S.currentUser)||S.users[0];}
  function persist(){if(typeof save==='function')save();}
  function notify(msg){if(typeof toast==='function')toast(msg);}
  function todayISO(){return new Date().toISOString().slice(0,10);}

  function normalizeProfile(){
    if(typeof S==='undefined')return null;
    const u=currentUser();
    u.profileName=u.profileName||u.name||'Matías Rodríguez';
    u.name=u.profileName;
    u.grade=u.grade||'Noveno EGB';
    u.motto=u.motto||'Superando cada reto de la manada un día a la vez.';
    u.aura=u.aura||'teal';
    u.equippedNft=u.equippedNft||'';
    S.nfts=NFTS.map(name=>{
      const old=(S.nfts||[]).find(n=>n.name===name);
      return {name,unlocked:Boolean(old?.unlocked)||(S.challenges||[]).length>=5};
    });
    persist();
    return u;
  }

  function installLogo(){
    const brand=document.querySelector('.brand');
    if(!brand)return;
    brand.innerHTML=`<img class="official-logo" src="${LOGO}" alt="Logo oficial Los Wolves"><div><strong>WOLVES</strong><span>Eight Academy</span></div>`;
  }

  function wolfSvg(color, accessory){
    const crown=accessory==='Corona Imperial'?'<path d="M70 44l9-18 14 16 14-16 14 18v13H70z" fill="#ffd15c"/><circle cx="79" cy="27" r="4" fill="#fff4a6"/><circle cx="107" cy="27" r="4" fill="#fff4a6"/>':'';
    const glasses=accessory==='Gafas Alpha'?'<circle cx="82" cy="90" r="12" fill="#061024" stroke="#b7c7e6" stroke-width="4"/><circle cx="118" cy="90" r="12" fill="#061024" stroke="#b7c7e6" stroke-width="4"/><path d="M94 90h12" stroke="#b7c7e6" stroke-width="4"/>':'';
    const headset=accessory==='Headset Cyber'?'<path d="M62 88a38 38 0 0 1 76 0" fill="none" stroke="#dce9ff" stroke-width="7"/><rect x="53" y="88" width="16" height="34" rx="7" fill="#dce9ff"/><rect x="131" y="88" width="16" height="34" rx="7" fill="#dce9ff"/><path d="M132 124q-12 14-30 15" stroke="#dce9ff" stroke-width="5" fill="none"/>':'';
    const halo=accessory==='Halo Zen'?'<ellipse cx="100" cy="34" rx="38" ry="10" fill="none" stroke="#eef3ff" stroke-width="6" opacity=".9"/>':'';
    return `<svg class="rpg-wolf" viewBox="0 0 200 200" aria-label="Avatar de lobo Wolves">
      <defs><filter id="glow"><feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="${color}" flood-opacity=".55"/></filter></defs>
      <circle cx="100" cy="100" r="78" fill="none" stroke="${color}" stroke-width="7" filter="url(#glow)"/>
      <path d="M56 70 39 27l43 27 18-19 18 19 43-27-17 43 15 50-59 40-59-40z" fill="${color}"/>
      <path d="M66 72 52 43l28 17zM134 72l14-29-28 17z" fill="#eaf7ff" opacity=".92"/>
      <circle cx="82" cy="95" r="6" fill="#fff"/><circle cx="118" cy="95" r="6" fill="#fff"/>
      <path d="M92 118h16l-8 11z" fill="#041123"/><path d="M78 137q22 18 44 0" fill="none" stroke="#041123" stroke-width="6" stroke-linecap="round"/>
      ${crown}${glasses}${headset}${halo}
    </svg>`;
  }

  function nftIcon(name){
    if(name.includes('Corona'))return '♛';
    if(name.includes('Gafas'))return '●●';
    if(name.includes('Headset'))return '🎧';
    return '☻';
  }

  function monday(date){const d=new Date(date);const day=d.getDay()||7;d.setDate(d.getDate()-day+1);d.setHours(0,0,0,0);return d;}
  function iso(date){return date.toISOString().slice(0,10);}
  function weekProgress(){
    const u=currentUser();
    const start=monday(new Date());
    let count=0;
    for(let i=0;i<5;i++){
      const d=new Date(start);d.setDate(start.getDate()+i);
      if((S.moods||[]).some(m=>m.student===u.email&&m.date===iso(d)))count++;
    }
    return count;
  }

  function profileView(){
    const u=normalizeProfile();
    const unlocked=(S.challenges||[]).length>=5;
    const aura=AURAS[u.aura]||AURAS.teal;
    const appointment=(S.appointments||[]).find(a=>a.student===u.email&&(a.status==='Agendada'||a.status==='Solicitada'));
    return `<section class="rpg-profile-panel">
      <article class="rpg-card avatar-showcase">
        <span class="status-chip"><i></i> Online</span>
        <div class="wolf-orbit">${wolfSvg(aura,unlocked?u.equippedNft:'')}</div>
        <h2>${u.profileName}</h2>
        <p class="student-rank">Estudiante - ${u.grade}</p>
        <p class="student-motto">“${u.motto}”</p>
      </article>

      <article class="rpg-card profile-editor">
        <div class="section-title-row"><div><h2>Personalización de la manada</h2><p>Adapta tu identidad escolar, color de avatar y frase motivacional.</p></div><span class="secure-chip">Datos seguros</span></div>
        <div class="profile-form-grid">
          <label>Nombre completo<input id="profileName" value="${u.profileName}"></label>
          <label>Correo institucional bloqueado 🔒<input value="${u.email}" disabled></label>
          <label>Grado / curso<select id="profileGrade">${GRADES.map(g=>`<option ${g===u.grade?'selected':''}>${g}</option>`).join('')}</select></label>
          <label>Color del aura / avatar<div class="aura-picker">${Object.entries(AURAS).map(([key,color])=>`<button class="aura-dot ${u.aura===key?'active':''}" data-aura="${key}" style="background:${color}" aria-label="${key}"></button>`).join('')}</div></label>
          <label class="full">Frase motivacional / lema<input id="profileMotto" value="${u.motto}"></label>
        </div>
        <button class="primary-btn save-profile-btn" id="saveProfile">Guardar datos de perfil</button>
      </article>

      <article class="rpg-card nft-zone">
        <div class="section-title-row"><div><h3>Accesorios NFT desbloqueables</h3><p>Completa la totalidad de los 5 retos mensuales para ganártelos en tu perfil.</p></div><span class="season-chip">Bono estacional</span></div>
        <div class="nft-grid-upgrade">${S.nfts.map(n=>`<button class="nft-tile ${unlocked?'':'locked'} ${u.equippedNft===n.name?'active':''}" data-nft="${n.name}" ${unlocked?'':'disabled'}><span class="lock-label">${unlocked?'Equipar':'Locked'}</span><span class="nft-icon">${nftIcon(n.name)}</span><strong>${n.name}</strong><small>${unlocked?'Disponible':'Requiere 5 retos'}</small></button>`).join('')}</div>
      </article>

      <article class="rpg-card ecosystem-settings">
        <h3>Ajustes del ecosistema</h3>
        <div class="setting-row"><strong>Visualización clara</strong><button class="ghost-btn theme-toggle">Alternar</button></div>
        <div class="setting-row"><strong>Alertas Pop-Up</strong><span class="active-pill">Activo</span></div>
        <p>Toda personalización inmutable se guarda en la base de datos demo de tu colegio.</p>
      </article>

      ${appointment?`<article class="rpg-card appointment-alert full-width"><h3>Sesión DECE programada</h3><p>${appointment.date||todayISO()} ${appointment.time||''} · ${appointment.reason||'Acompañamiento emocional escolar'}</p></article>`:''}

      <article class="rpg-card ecosystem-summary full-width">
        <h3>Resumen de estadísticas del ecosistema</h3>
        <div class="summary-grid"><span><strong>${(S.challenges||[]).length} / 5</strong><small>Retos completados</small></span><span><strong>${(S.moods||[]).length}</strong><small>Total de registros</small></span><span><strong>${u.coins} EC</strong><small>Balance de coins</small></span><span><strong>${weekProgress()} d</strong><small>Racha de uso</small></span></div>
      </article>
    </section>`;
  }

  function bindProfilePanel(){
    const saveBtn=document.getElementById('saveProfile');
    if(saveBtn)saveBtn.onclick=()=>{
      const u=currentUser();
      u.profileName=document.getElementById('profileName').value.trim()||u.profileName;
      u.name=u.profileName;
      u.grade=document.getElementById('profileGrade').value;
      u.motto=document.getElementById('profileMotto').value.trim()||u.motto;
      persist();
      notify('Perfil RPG guardado');
      render();
    };
    document.querySelectorAll('.aura-dot').forEach(btn=>btn.onclick=()=>{currentUser().aura=btn.dataset.aura;persist();render();});
    document.querySelectorAll('.nft-tile:not(.locked)').forEach(btn=>btn.onclick=()=>{currentUser().equippedNft=btn.dataset.nft;persist();notify('NFT equipado: '+btn.dataset.nft);render();});
    const theme=document.querySelector('.theme-toggle');
    if(theme)theme.onclick=()=>notify('Visualización clara alternada en modo demo');
  }

  window.addEventListener('load',()=>{
    if(typeof S==='undefined')return;
    installLogo();
    normalizeProfile();
    profile=window.profile=profileView;
    const previousBind=typeof bindStudent==='function'?bindStudent:null;
    bindStudent=window.bindStudent=function(){
      if(previousBind)previousBind();
      if(typeof active!=='undefined' && active==='Perfil RPG')bindProfilePanel();
    };
    if(typeof render==='function')render();
  });
})();
