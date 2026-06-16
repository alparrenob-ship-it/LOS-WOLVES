(()=>{
  const AURAS={
    teal:{label:'Cyber Teal',color:'#27dcff'},
    crimson:{label:'Fuego Carmesí',color:'#ff4b4b'},
    violet:{label:'Amatista Violeta',color:'#8a5cff'},
    jade:{label:'Jade Místico',color:'#18c790'}
  };
  const AVATAR_NFTS={
    lobo:{label:'NFT Lobo Alpha',image:'assets/NFTLOBO.png'},
    loba:{label:'NFT Loba Alpha',image:'assets/NFTLOBA.png'}
  };
  const GRADES=['Quinto EGB','Sexto EGB','Séptimo EGB','Octavo EGB','Noveno EGB','Décimo EGB','Primero de Bachillerato','Segundo de Bachillerato','Tercero de Bachillerato'];
  const NFTS=['Corona Imperial','Gafas Alpha','Headset Cyber','Halo Zen'];

  function currentUser(){return typeof user==='function'?user():S.users.find(x=>x.email===S.currentUser)||S.users[0];}
  function persist(){if(typeof save==='function')save();}
  function notify(msg){if(typeof toast==='function')toast(msg);}
  function normalize(){
    const u=currentUser();
    u.profileName=u.profileName||u.name||'Matías Rodríguez';
    u.name=u.profileName;
    u.grade=u.grade||'Noveno EGB';
    u.motto=u.motto||'Superando cada reto de la manada un día a la vez.';
    u.aura=u.aura||'teal';
    u.avatarType=u.avatarType||'lobo';
    u.previewAvatarType=u.previewAvatarType||'';
    u.previewNft=u.previewNft||'';
    u.equippedNft=u.equippedNft||'';
    S.nfts=NFTS.map(name=>({name,unlocked:Boolean((S.nfts||[]).find(n=>n.name===name)?.unlocked)||(S.challenges||[]).length>=5}));
    persist();
    return u;
  }
  function accessory(name){
    if(name==='Corona Imperial')return '<path d="M67 42l10-20 15 18 16-18 15 20v14H67z" fill="#ffd15c"/><circle cx="77" cy="22" r="4" fill="#fff1a6"/><circle cx="108" cy="22" r="4" fill="#fff1a6"/>';
    if(name==='Gafas Alpha')return '<circle cx="82" cy="92" r="13" fill="#020816" stroke="#d7e3ff" stroke-width="4"/><circle cx="119" cy="92" r="13" fill="#020816" stroke="#d7e3ff" stroke-width="4"/><path d="M95 92h11" stroke="#d7e3ff" stroke-width="4"/>';
    if(name==='Headset Cyber')return '<path d="M61 88a39 39 0 0 1 78 0" fill="none" stroke="#dce8ff" stroke-width="7"/><rect x="52" y="88" width="17" height="34" rx="7" fill="#dce8ff"/><rect x="131" y="88" width="17" height="34" rx="7" fill="#dce8ff"/>';
    if(name==='Halo Zen')return '<ellipse cx="100" cy="32" rx="39" ry="10" fill="none" stroke="#f3f5ff" stroke-width="6"/>';
    return '';
  }
  function svgAvatar(color,type,nft){
    const loba=type==='loba';
    const face=loba
      ? '<path d="M55 72 43 30l40 24 17-17 17 17 40-24-12 42 14 48-59 40-59-40z" fill="'+color+'"/><path d="M63 72 52 46l27 16zM137 72l11-26-27 16z" fill="#f3fbff" opacity=".94"/><path d="M71 128q29 26 58 0" fill="none" stroke="#041123" stroke-width="5" stroke-linecap="round"/><circle cx="82" cy="94" r="6" fill="#fff"/><circle cx="118" cy="94" r="6" fill="#fff"/><path d="M91 116h18l-9 12z" fill="#041123"/><path d="M68 147q32 22 64 0" fill="none" stroke="#ffb7d5" stroke-width="5" stroke-linecap="round" opacity=".55"/>'
      : '<path d="M56 70 39 27l43 27 18-19 18 19 43-27-17 43 15 50-59 40-59-40z" fill="'+color+'"/><path d="M66 72 52 43l28 17zM134 72l14-29-28 17z" fill="#eaf7ff" opacity=".92"/><circle cx="82" cy="95" r="6" fill="#fff"/><circle cx="118" cy="95" r="6" fill="#fff"/><path d="M92 118h16l-8 11z" fill="#041123"/><path d="M78 137q22 18 44 0" fill="none" stroke="#041123" stroke-width="6" stroke-linecap="round"/>';
    return `<svg class="identity-wolf" viewBox="0 0 200 200" aria-label="Avatar ${type} Wolves"><defs><filter id="identityGlow"><feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="${color}" flood-opacity=".55"/></filter></defs><circle cx="100" cy="100" r="80" fill="none" stroke="${color}" stroke-width="7" filter="url(#identityGlow)"/>${face}${accessory(nft)}</svg>`;
  }
  function avatarPreview(color,type,nft){
    const data=AVATAR_NFTS[type];
    if(data)return `<img class="identity-avatar-img" src="${data.image}" alt="${data.label}">`;
    return svgAvatar(color,type,nft);
  }
  function nftIcon(name){return name.includes('Corona')?'♛':name.includes('Gafas')?'●●':name.includes('Headset')?'🎧':'☻';}
  function profileIdentity(){
    const u=normalize();
    const aura=AURAS[u.aura]||AURAS.teal;
    const chosenNft=u.equippedNft||u.previewNft||'';
    const unlocked=(S.challenges||[]).length>=5;
    const visualType=u.previewAvatarType||u.avatarType;
    return `<section class="identity-profile-grid">
      <article class="rpg-card identity-avatar-card">
        <span class="status-chip"><i></i> Online</span>
        <div class="identity-avatar-orbit">${avatarPreview(aura.color,visualType,chosenNft)}</div>
        <h2>${u.profileName}</h2>
        <p class="student-rank">${AVATAR_NFTS[u.avatarType]?.label||'Avatar Wolves'} · ${aura.label}</p>
        <p class="student-motto">“${u.motto}”</p>
      </article>
      <article class="rpg-card identity-editor-card">
        <div class="section-title-row"><div><h2>Personalización de la manada</h2><p>Adapta tu identidad escolar, color de avatar y frase motivacional.</p></div><span class="secure-chip">Datos seguros</span></div>
        <div class="identity-form-grid">
          <label>Nombre completo<input id="identityName" value="${u.profileName}"></label>
          <label>Correo institucional bloqueado 🔒<input class="locked-email" value="${u.email}" disabled></label>
          <label>Grado / curso<select id="identityGrade">${GRADES.map(g=>`<option ${g===u.grade?'selected':''}>${g}</option>`).join('')}</select></label>
          <label>Tipo de avatar NFT<div class="avatar-toggle"><button class="avatar-kind ${u.avatarType==='lobo'?'active':''}" data-avatar="lobo" ${unlocked?'':'disabled'}>NFT Lobo</button><button class="avatar-kind ${u.avatarType==='loba'?'active':''}" data-avatar="loba" ${unlocked?'':'disabled'}>NFT Loba</button></div><small class="avatar-lock-note">${unlocked?'Avatares NFT desbloqueados.':'Bloqueados hasta completar los 5 retos mensuales.'}</small></label>
          <label class="full">Color del aura / avatar<div class="aura-control-row">${Object.entries(AURAS).map(([key,val])=>`<button class="identity-aura ${u.aura===key?'active':''}" data-aura="${key}"><span style="background:${val.color}"></span>${val.label}</button>`).join('')}</div></label>
          <label class="full">Frase motivacional / lema<input id="identityMotto" value="${u.motto}"></label>
        </div>
        <button class="primary-btn identity-save" id="identitySave">Guardar datos de perfil</button>
      </article>
      <article class="rpg-card full-width identity-avatar-nft-card">
        <div class="section-title-row"><div><h3>Avatares NFT bloqueados</h3><p>Estas dos identidades premium se desbloquean al completar la biblioteca de 5 retos.</p></div><span class="season-chip">${(S.challenges||[]).length}/5 retos</span></div>
        <div class="avatar-nft-grid">${Object.entries(AVATAR_NFTS).map(([type,data])=>`<article class="avatar-nft ${visualType===type?'active':''} ${unlocked?'':'locked'}"><span class="lock-label">${unlocked?'Disponible':'Locked'}</span><img src="${data.image}" alt="${data.label}"><h3>${data.label}</h3><p>${unlocked?'Seleccionable como avatar principal.':'NFT bloqueado por progreso de retos.'}</p><div class="nft-actions"><button class="ghost-btn preview-avatar" data-avatar="${type}">Vista previa</button><button class="primary-btn select-avatar" data-avatar="${type}" ${unlocked?'':'disabled'}>Seleccionar</button></div></article>`).join('')}</div>
      </article>
      <article class="rpg-card full-width identity-nft-card">
        <div class="section-title-row"><div><h3>Accesorios NFT desbloqueables</h3><p>Prueba cada accesorio en tu avatar y equípalo cuando completes los 5 retos.</p></div><span class="season-chip">Bono estacional</span></div>
        <div class="identity-nft-grid">${NFTS.map(name=>`<article class="identity-nft ${chosenNft===name?'active':''}"><span class="nft-lab-icon">${nftIcon(name)}</span><h3>${name}</h3><p>${unlocked?'Desbloqueado y equipable':'Bloqueado · prueba visual permitida'}</p><div class="nft-actions"><button class="ghost-btn preview-nft" data-nft="${name}">Probar</button><button class="primary-btn equip-nft" data-nft="${name}" ${unlocked?'':'disabled'}>Equipar</button></div></article>`).join('')}</div>
      </article>
    </section>`;
  }
  function bindIdentity(){
    const saveBtn=document.getElementById('identitySave');
    if(saveBtn)saveBtn.onclick=()=>{const usr=currentUser();usr.profileName=document.getElementById('identityName').value.trim()||usr.profileName;usr.name=usr.profileName;usr.grade=document.getElementById('identityGrade').value;usr.motto=document.getElementById('identityMotto').value.trim()||usr.motto;persist();notify('Datos de perfil guardados');render();};
    document.querySelectorAll('.identity-aura').forEach(btn=>btn.onclick=()=>{currentUser().aura=btn.dataset.aura;persist();render();});
    document.querySelectorAll('.preview-avatar').forEach(btn=>btn.onclick=()=>{currentUser().previewAvatarType=btn.dataset.avatar;persist();render();});
    document.querySelectorAll('.select-avatar').forEach(btn=>btn.onclick=()=>{currentUser().avatarType=btn.dataset.avatar;currentUser().previewAvatarType='';persist();notify('Avatar NFT seleccionado: '+AVATAR_NFTS[btn.dataset.avatar].label);render();});
    document.querySelectorAll('.avatar-kind:not(:disabled)').forEach(btn=>btn.onclick=()=>{currentUser().avatarType=btn.dataset.avatar;currentUser().previewAvatarType='';persist();render();});
    document.querySelectorAll('.preview-nft').forEach(btn=>btn.onclick=()=>{currentUser().previewNft=btn.dataset.nft;persist();render();});
    document.querySelectorAll('.equip-nft').forEach(btn=>btn.onclick=()=>{currentUser().equippedNft=btn.dataset.nft;currentUser().previewNft='';persist();notify('Accesorio equipado: '+btn.dataset.nft);render();});
  }
  window.addEventListener('load',()=>{
    if(typeof S==='undefined')return;
    profile=window.profile=profileIdentity;
    const previous=typeof bindStudent==='function'?bindStudent:null;
    bindStudent=window.bindStudent=function(){if(previous)previous();if(typeof active!=='undefined'&&active==='Perfil RPG')bindIdentity();};
    normalize();
    if(typeof render==='function')render();
  });
})();
