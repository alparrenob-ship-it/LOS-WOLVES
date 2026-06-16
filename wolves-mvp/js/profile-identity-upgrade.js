(()=>{
  const AVATARS={
    lobo:{label:'Lobo',image:'assets/AVATARLOBO.png'},
    loba:{label:'Loba',image:'assets/AVATARLOBA.png'}
  };
  const NFTS=[
    {id:'nft-lobo',label:'NFT Lobo',image:'assets/NFTLOBO.png'},
    {id:'nft-loba',label:'NFT Loba',image:'assets/NFTLOBA.png'},
    {id:'nft-lobo-gafas',label:'NFT Lobo Gafas',image:'assets/NFTLOBOGAFAS.png'},
    {id:'nft-loba-gafas',label:'NFT Loba Gafas',image:'assets/NFTLOBAGAFAS.png'}
  ];
  const GRADES=['Quinto EGB','Sexto EGB','Séptimo EGB','Octavo EGB','Noveno EGB','Décimo EGB','Primero de Bachillerato','Segundo de Bachillerato','Tercero de Bachillerato'];

  function currentUser(){return typeof user==='function'?user():S.users.find(x=>x.email===S.currentUser)||S.users[0];}
  function persist(){if(typeof save==='function')save();}
  function notify(msg){if(typeof toast==='function')toast(msg);}
  function unlocked(){return (S.challenges||[]).length>=5;}
  function normalize(){
    const u=currentUser();
    u.profileName=u.profileName||u.name||'Luna Estudiante';
    u.name=u.profileName;
    u.grade=u.grade||'Quinto EGB';
    u.motto=u.motto||'Superando cada reto de la manada un día a la vez.';
    u.avatarType=u.avatarType||'lobo';
    u.previewNftImage=u.previewNftImage||'';
    u.equippedNftAvatar=u.equippedNftAvatar||'';
    persist();
    return u;
  }
  function mainImage(u){
    if(u.previewNftImage)return u.previewNftImage;
    if(u.equippedNftAvatar)return u.equippedNftAvatar;
    return AVATARS[u.avatarType]?.image||AVATARS.lobo.image;
  }
  function profileIdentity(){
    const u=normalize();
    const isUnlocked=unlocked();
    return `<section class="identity-profile-grid">
      <article class="rpg-card identity-avatar-card">
        <span class="status-chip"><i></i> Online</span>
        <div class="identity-avatar-orbit"><img class="identity-avatar-img" src="${mainImage(u)}" alt="Avatar Wolves"></div>
        <h2>${u.profileName}</h2>
        <p class="student-rank">${AVATARS[u.avatarType]?.label||'Lobo'} Wolves</p>
        <p class="student-motto">“${u.motto}”</p>
      </article>

      <article class="rpg-card identity-editor-card">
        <div class="section-title-row"><div><h2>Personalización de la manada</h2><p>Adapta tu identidad escolar, avatar y frase motivacional.</p></div><span class="secure-chip">Datos seguros</span></div>
        <div class="identity-form-grid">
          <label>Nombre completo<input id="identityName" value="${u.profileName}"></label>
          <label>Correo institucional bloqueado 🔒<input class="locked-email" value="${u.email}" disabled></label>
          <label>Grado / curso<select id="identityGrade">${GRADES.map(g=>`<option ${g===u.grade?'selected':''}>${g}</option>`).join('')}</select></label>
          <label>Tipo de avatar<div class="avatar-toggle"><button class="avatar-kind ${u.avatarType==='lobo'?'active':''}" data-avatar="lobo">Lobo</button><button class="avatar-kind ${u.avatarType==='loba'?'active':''}" data-avatar="loba">Loba</button></div></label>
          <label class="full">Frase motivacional / lema<input id="identityMotto" value="${u.motto}"></label>
        </div>
        <button class="primary-btn identity-save" id="identitySave">Guardar datos de perfil</button>
      </article>

      <article class="rpg-card full-width identity-nft-card">
        <div class="section-title-row"><div><h3>Accesorios NFT desbloqueables</h3><p>Estos NFTs aparecen pequeños en la barra de accesorios. Puedes probarlos; equipar se desbloquea al completar 5 retos.</p></div><span class="season-chip">${(S.challenges||[]).length}/5 retos</span></div>
        <div class="identity-nft-grid compact-nft-grid">${NFTS.map(nft=>`<article class="identity-nft avatar-mini-nft ${isUnlocked?'':'locked'} ${u.equippedNftAvatar===nft.image?'active':''}"><span class="lock-label">${isUnlocked?'NFT':'Locked'}</span><img class="mini-avatar-img" src="${nft.image}" alt="${nft.label}"><h3>${nft.label}</h3><p>${isUnlocked?'Disponible para equipar':'Bloqueado hasta completar 5 retos'}</p><div class="nft-actions"><button class="ghost-btn preview-nft-avatar" data-image="${nft.image}">Probar</button><button class="primary-btn equip-nft-avatar" data-image="${nft.image}" ${isUnlocked?'':'disabled'}>Equipar</button></div></article>`).join('')}</div>
      </article>
    </section>`;
  }
  function bindIdentity(){
    const saveBtn=document.getElementById('identitySave');
    if(saveBtn)saveBtn.onclick=()=>{
      const u=currentUser();
      u.profileName=document.getElementById('identityName').value.trim()||u.profileName;
      u.name=u.profileName;
      u.grade=document.getElementById('identityGrade').value;
      u.motto=document.getElementById('identityMotto').value.trim()||u.motto;
      persist();
      notify('Datos de perfil guardados');
      render();
    };
    document.querySelectorAll('.avatar-kind').forEach(btn=>btn.onclick=()=>{
      const u=currentUser();
      u.avatarType=btn.dataset.avatar;
      u.previewNftImage='';
      u.equippedNftAvatar='';
      persist();
      render();
    });
    document.querySelectorAll('.preview-nft-avatar').forEach(btn=>btn.onclick=()=>{
      currentUser().previewNftImage=btn.dataset.image;
      persist();
      render();
    });
    document.querySelectorAll('.equip-nft-avatar').forEach(btn=>btn.onclick=()=>{
      currentUser().equippedNftAvatar=btn.dataset.image;
      currentUser().previewNftImage='';
      persist();
      notify('NFT equipado en el perfil');
      render();
    });
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
