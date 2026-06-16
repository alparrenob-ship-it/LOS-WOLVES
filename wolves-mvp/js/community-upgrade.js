(()=>{
  const REACTIONS=[
    {key:'like',emoji:'💙',label:'Apoyo'},
    {key:'hug',emoji:'🤝',label:'Acompaño'},
    {key:'spark',emoji:'✨',label:'Inspira'},
    {key:'howl',emoji:'🐺',label:'Manada'}
  ];
  const BLOCKED_WORDS=['idiota','estupido','estúpido','tonto','basura','odio','callate','cállate','muere','morir','pegar','golpear','ridiculo','ridículo','nadie te quiere','vete','perdedor','inutil','inútil','burlarse','bullying'];
  const STARTERS=[
    'Hoy quiero reconocer a alguien de la manada por...',
    'Una cosa que me ayudó a sentirme mejor fue...',
    'Le mando apoyo a quien hoy esté pasando por...',
    'Mi pequeño logro emocional de hoy fue...'
  ];

  function currentUser(){return typeof user==='function'?user():S.users.find(x=>x.email===S.currentUser)||S.users[0];}
  function persist(){if(typeof save==='function')save();}
  function notify(t){if(typeof toast==='function')toast(t);}
  function safeId(){return Math.random().toString(36).slice(2,9);}
  function now(){return new Date().toLocaleString('es-EC',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});}
  function ensureCommunity(){
    S.community=Array.isArray(S.community)?S.community:[];
    S.community.forEach(post=>{
      post.reactions=post.reactions||{};
      REACTIONS.forEach(r=>{post.reactions[r.key]=Number(post.reactions[r.key]||0);});
      post.xp=Number(post.xp||post.likes||0);
      post.createdAt=post.createdAt||'Hoy';
    });
    if(!S.community.length){
      S.community.push({id:safeId(),author:'Hazel',text:'Hoy la manada acompaña: respirar también es avanzar.',likes:8,xp:25,createdAt:'Hoy',reactions:{like:4,hug:2,spark:1,howl:1}});
    }
    persist();
  }
  function isHarmful(text){
    const clean=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return BLOCKED_WORDS.some(word=>clean.includes(word.normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
  }
  function postsHtml(){
    ensureCommunity();
    return S.community.map(post=>{
      const total=REACTIONS.reduce((sum,r)=>sum+Number(post.reactions?.[r.key]||0),0);
      return `<article class="community-post-card">
        <div class="post-avatar">${String(post.author||'W').slice(0,1).toUpperCase()}</div>
        <div class="post-body">
          <div class="post-head"><strong>${post.author||'Manada Wolves'}</strong><span>${post.createdAt||'Hoy'} · ${post.xp||0} XP</span></div>
          <p>${post.text}</p>
          <div class="reaction-row">${REACTIONS.map(r=>`<button class="emoji-react" data-post="${post.id}" data-reaction="${r.key}" title="${r.label}"><span>${r.emoji}</span><b>${post.reactions?.[r.key]||0}</b></button>`).join('')}<em>${total} reacciones</em></div>
        </div>
      </article>`;
    }).join('');
  }
  function rankingHtml(){
    ensureCommunity();
    const totals={};
    S.community.forEach(post=>{
      const base=Number(post.xp||0);
      const reactions=REACTIONS.reduce((sum,r)=>sum+Number(post.reactions?.[r.key]||0),0);
      totals[post.author]=(totals[post.author]||0)+base+(reactions*2);
    });
    const rows=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5);
    if(!rows.length) rows.push([currentUser().name||'Estudiante Wolves',0]);
    return rows.map(([name,xp],i)=>`<div class="rank-row"><span>${i+1}</span><b>${name}</b><em>${xp} XP</em></div>`).join('');
  }

  window.community=function communityUpgrade(){
    ensureCommunity();
    return `<section class="community-upgrade-shell">
      <article class="community-wall-card">
        <div class="community-title-row"><div><span class="community-kicker">Muro de aliento</span><h2>Comunidad Wolves</h2><p>Publica mensajes que cuiden, inspiren y fortalezcan a la manada.</p></div><div class="community-glow-badge">Convivencia segura</div></div>
        <div class="composer-card">
          <textarea id="post" maxlength="220" placeholder="Escribe un mensaje de apoyo para la manada..."></textarea>
          <div class="starter-row">${STARTERS.map(s=>`<button class="starter-btn" data-starter="${s}">${s}</button>`).join('')}</div>
          <div class="composer-actions"><span id="communityCounter">0/220</span><button class="primary-btn" id="pubpost">Publicar apoyo</button></div>
          <p class="moderation-note">Los comentarios ofensivos, amenazas o mensajes que afecten a la manada se bloquean automáticamente.</p>
        </div>
        <div class="posts-feed">${postsHtml()}</div>
      </article>
      <aside class="community-ranking-card">
        <div class="ranking-mascot-frame"><img src="assets/MASCOTA BRAZOS CRUZADOS.png" alt="Mascota Wolves brazos cruzados"></div>
        <h2>Ranking</h2>
        <p>XP por apoyo, reacciones positivas y participación sana.</p>
        <div class="ranking-list">${rankingHtml()}</div>
      </aside>
    </section>`;
  };

  const previousBind=window.bindStudent;
  window.bindStudent=function bindCommunityUpgrade(){
    if(typeof previousBind==='function') previousBind();
    if(active!=='Comunidad Wolves') return;
    const box=document.getElementById('post');
    const counter=document.getElementById('communityCounter');
    if(box&&counter) box.oninput=()=>{counter.textContent=`${box.value.length}/220`;};
    document.querySelectorAll('.starter-btn').forEach(btn=>btn.onclick=()=>{if(box){box.value=btn.dataset.starter;box.focus();if(counter)counter.textContent=`${box.value.length}/220`;}});
    const publish=document.getElementById('pubpost');
    if(publish) publish.onclick=()=>{
      const text=(box?.value||'').trim();
      if(text.length<8){notify('Escribe un mensaje de apoyo más completo.');return;}
      if(isHarmful(text)){notify('Mensaje bloqueado: reformúlalo para cuidar a la manada.');return;}
      const me=currentUser();
      S.community.unshift({id:safeId(),author:me.profileName||me.name||'Estudiante Wolves',text,likes:0,xp:12,createdAt:now(),reactions:{like:0,hug:0,spark:0,howl:0}});
      me.xp=Number(me.xp||0)+12;
      persist();
      notify('+12 XP por aportar a la comunidad');
      render();
    };
    document.querySelectorAll('.emoji-react').forEach(btn=>btn.onclick=()=>{
      const post=S.community.find(x=>x.id===btn.dataset.post);
      if(!post)return;
      post.reactions=post.reactions||{};
      post.reactions[btn.dataset.reaction]=Number(post.reactions[btn.dataset.reaction]||0)+1;
      post.xp=Number(post.xp||0)+2;
      persist();
      render();
    });
  };
})();
