(()=>{
  const A={
    anxiety:'assets/CONTROLALAANSIEDAD.png',
    listen:'assets/ESCUCHAACTIVA.png',
    sadness:'assets/GESTIONALATRISTEZA.png',
    breathe:'assets/RESPIRA Y RELÁJATE.png',
    heart:'assets/MASCOTA CORAZÓN.png'
  };
  const riskWords=['suicidio','hacerme daño','morir','lastimarme','nadie me quiere'];
  const nfts=['Corona Imperial','Gafas Alpha','Headset Cyber','Halo Zen'];
  const challengesData=[
    {id:'respira',title:'Respiración Controlada 4-7-8',img:A.breathe,tag:'Respira y relájate',text:'Fases para inhalar, retener y exhalar aire profundamente con una esfera que pulsa rítmicamente.',steps:['Inhala durante 4 segundos','Retén el aire durante 7 segundos','Exhala lentamente durante 8 segundos']},
    {id:'ansiedad',title:'Controla la Ansiedad',img:A.anxiety,tag:'Regulación emocional',text:'Técnica visual para reconocer tensión corporal y recuperar sensación de control.',steps:['Nombra lo que sientes','Ubica la emoción en el cuerpo','Elige una acción pequeña y segura']},
    {id:'tristeza',title:'Gestiona la Tristeza',img:A.sadness,tag:'Autocompasión',text:'Ejercicio guiado para validar emociones difíciles sin aislarte de la manada.',steps:['Acepta la emoción sin juzgarla','Escribe una necesidad real','Elige una persona de apoyo']},
    {id:'escucha',title:'Escucha Activa',img:A.listen,tag:'Convivencia escolar',text:'Reto para mejorar comunicación, empatía y resolución de conflictos con compañeros.',steps:['Escucha sin interrumpir','Repite lo que entendiste','Propón un acuerdo respetuoso']},
    {id:'corazon',title:'Diario de Gratitud Wolves',img:A.heart,tag:'Mascota corazón',text:'Cierra la biblioteca con un compromiso de autocuidado y gratitud diaria.',steps:['Escribe 3 cosas que agradeces','Reconoce un logro pequeño','Define tu compromiso de mañana']}
  ];

  function u(){return typeof user==='function'?user():S.users.find(x=>x.email===S.currentUser)||S.users[0];}
  function persist(){if(typeof save==='function')save();}
  function notify(t){if(typeof toast==='function')toast(t);}
  function stamp(){return new Date().toLocaleString();}
  function unlockNfts(){S.nfts=nfts.map(name=>({name,unlocked:true}));u().nftUnlocked=true;}
  function ensureStudentState(){
    S.challenges=S.challenges||[];
    S.chat=S.chat||[];
    S.alerts=S.alerts||[];
    S.appointments=S.appointments||[];
    S.followups=S.followups||[];
    if(!S.chat.length)S.chat.push({from:'ai',text:'Hola, soy Wolf AI. Estoy aquí para acompañarte con calma y respeto.'});
    const usr=u();
    usr.previewNft=usr.previewNft||'';
    usr.equippedNft=usr.equippedNft||'';
    if(!S.nfts)S.nfts=nfts.map(name=>({name,unlocked:false}));
    if(S.challenges.length>=5)unlockNfts();
    persist();
  }
  function wolfAccessory(name){
    if(name==='Corona Imperial')return '<path d="M68 40l10-19 15 17 15-17 15 19v14H68z" fill="#ffd15c"/><circle cx="78" cy="22" r="4" fill="#fff2a8"/><circle cx="108" cy="22" r="4" fill="#fff2a8"/>';
    if(name==='Gafas Alpha')return '<circle cx="82" cy="91" r="13" fill="#020816" stroke="#d7e3ff" stroke-width="4"/><circle cx="119" cy="91" r="13" fill="#020816" stroke="#d7e3ff" stroke-width="4"/><path d="M95 91h11" stroke="#d7e3ff" stroke-width="4"/>';
    if(name==='Headset Cyber')return '<path d="M61 88a39 39 0 0 1 78 0" fill="none" stroke="#dce8ff" stroke-width="7"/><rect x="52" y="88" width="17" height="34" rx="7" fill="#dce8ff"/><rect x="131" y="88" width="17" height="34" rx="7" fill="#dce8ff"/>';
    if(name==='Halo Zen')return '<ellipse cx="100" cy="32" rx="39" ry="10" fill="none" stroke="#f3f5ff" stroke-width="6"/>';
    return '';
  }
  function wolf(color, accessory){return `<svg class="rpg-wolf" viewBox="0 0 200 200"><circle cx="100" cy="100" r="78" fill="none" stroke="${color}" stroke-width="7"/><path d="M56 70 39 27l43 27 18-19 18 19 43-27-17 43 15 50-59 40-59-40z" fill="${color}"/><path d="M66 72 52 43l28 17zM134 72l14-29-28 17z" fill="#eaf7ff" opacity=".92"/><circle cx="82" cy="95" r="6" fill="#fff"/><circle cx="118" cy="95" r="6" fill="#fff"/><path d="M92 118h16l-8 11z" fill="#041123"/><path d="M78 137q22 18 44 0" fill="none" stroke="#041123" stroke-width="6" stroke-linecap="round"/>${wolfAccessory(accessory)}</svg>`;}
  function nftIcon(name){return name.includes('Corona')?'♛':name.includes('Gafas')?'●●':name.includes('Headset')?'🎧':'☻';}

  function profileUpgrade(){
    ensureStudentState();
    const usr=u();
    const aura={teal:'#27dcff',crimson:'#ff4b4b',violet:'#8a5cff',jade:'#18c790'}[usr.aura||'teal']||'#27dcff';
    const current=usr.equippedNft||usr.previewNft||'';
    const unlocked=S.challenges.length>=5;
    return `<section class="rpg-profile-panel nft-showcase-mode">
      <article class="rpg-card avatar-showcase">
        <span class="status-chip"><i></i> Online</span>
        <div class="wolf-orbit big-preview">${wolf(aura,current)}</div>
        <h2>${usr.profileName||usr.name}</h2><p class="student-rank">NFT activo: ${current||'Ninguno'}</p>
        <p class="student-motto">${unlocked?'Accesorios desbloqueados por completar la biblioteca.':'Puedes probar accesorios; se desbloquean permanentemente al completar los 5 retos.'}</p>
      </article>
      <article class="rpg-card nft-lab">
        <div class="section-title-row"><div><h2>Laboratorio de Accesorios NFT</h2><p>Prueba visualmente cada accesorio y equípalo cuando esté desbloqueado.</p></div><span class="season-chip">${S.challenges.length}/5 retos</span></div>
        <div class="nft-lab-grid">${nfts.map(name=>`<article class="nft-lab-card ${current===name?'active':''}"><span class="nft-lab-icon">${nftIcon(name)}</span><h3>${name}</h3><p>${unlocked?'Desbloqueado y equipable':'Bloqueado, disponible como prueba visual'}</p><div class="nft-actions"><button class="ghost-btn preview-nft" data-nft="${name}">Probar</button><button class="primary-btn equip-nft" data-nft="${name}" ${unlocked?'':'disabled'}>Equipar</button></div></article>`).join('')}</div>
      </article>
      <article class="rpg-card full-width nft-reward-banner"><h3>Recompensa por completar la biblioteca</h3><p>Completa los 5 retos mensuales para recibir +200 Eight-Coins y desbloquear Corona Imperial, Gafas Alpha, Headset Cyber y Halo Zen.</p><div class="library-progress"><span style="width:${Math.min(100,S.challenges.length*20)}%"></span></div><small>Progreso: ${S.challenges.length} de 5 retos completados</small></article>
    </section>`;
  }

  function wolfAiResponse(message){
    const lower=message.toLowerCase();
    if(lower.includes('gratitud'))return 'Te propongo escribir tres cosas pequeñas que sí estuvieron a tu favor hoy. La gratitud no borra lo difícil, pero le da espacio a lo que sostiene.';
    if(lower.includes('estrés')||lower.includes('examen'))return 'Cuando el estrés académico sube, divide la tarea en una acción de 10 minutos, respira 4-7-8 y pide apoyo si el cuerpo sigue en alerta.';
    if(lower.includes('ansiedad')||lower.includes('desborde'))return 'Pausa. Mira cinco objetos, toca cuatro superficies, escucha tres sonidos, respira dos veces y nombra una acción segura que puedas hacer ahora.';
    return 'Gracias por contarlo. Estoy contigo. Puedes registrar tu emoción, hacer un reto de respiración o solicitar una cita DECE si necesitas acompañamiento humano.';
  }
  function aiUpgrade(){
    ensureStudentState();
    const templates=[
      ['Estrés académico','Me siento con estrés académico y necesito organizarme para estudiar sin bloquearme.'],
      ['Desborde mental','Siento desborde mental y necesito una técnica breve para volver a calmarme.'],
      ['Diario de gratitud','Quiero hacer un diario de gratitud para cerrar mejor mi día.'],
      ['Ansiedad escolar','Tengo ansiedad escolar y necesito apoyo para respirar y pensar con claridad.'],
      ['Conflicto con compañeros','Tuve un conflicto con compañeros y quiero resolverlo de forma respetuosa.']
    ];
    return `<section class="wolf-ai-upgrade">
      <article class="card ai-chat-card"><div class="ai-head"><div><h2>Wolf AI</h2><p>Chat de apoyo emocional con plantillas rápidas y protocolo de riesgo crítico.</p></div><span class="api-chip">API-ready</span></div><div id="riskBanner" class="risk-banner" hidden><strong>Emergencia: pide ayuda inmediata.</strong><span>Si estás en peligro o podrías hacerte daño, llama al 911 y busca ahora a un adulto de confianza o al DECE.</span></div><div class="quick-row template-row">${templates.map(t=>`<button class="ghost-btn ai-template" data-text="${t[1]}">${t[0]}</button>`).join('')}</div><div class="chat-box ai-stream">${S.chat.map(m=>`<div class="message ${m.from}">${m.text}</div>`).join('')}</div><div class="ai-compose"><input id="wolfMessage" placeholder="Escribe tu mensaje o usa una plantilla rápida"><button class="primary-btn" id="wolfSend">Enviar</button></div></article>
      <article class="card appointment-card"><h3>Solicitar cita con DECE</h3><label>Motivo<textarea id="appointmentReason" placeholder="Describe brevemente por qué necesitas acompañamiento..."></textarea></label><label>Fecha<input id="appointmentDate" type="date"></label><label>Hora<input id="appointmentTime" type="time"></label><button class="success-btn" id="sendAppointment">Enviar solicitud</button><p>La solicitud aparecerá en el calendario y bandeja del Panel DECE.</p></article>
    </section>`;
  }

  function challengesUpgrade(){
    ensureStudentState();
    const activeId=S.activeChallenge||challengesData[0].id;
    const activeChallenge=challengesData.find(c=>c.id===activeId)||challengesData[0];
    const done=S.challenges||[];
    return `<section class="challenge-upgrade"><div class="challenge-grid-pro">${challengesData.map(c=>`<article class="challenge-card-pro ${done.includes(c.title)?'done':''}"><span class="challenge-status">${done.includes(c.title)?'Completado':'Pendiente'}</span><img src="${c.img}" alt="${c.title}"><h3>${c.title}</h3><p>${c.text}</p><button class="primary-btn run-challenge" data-id="${c.id}">${done.includes(c.title)?'Ver reto':'Ejecutar reto'}</button></article>`).join('')}</div><article class="card challenge-runner"><div class="runner-visual"><img src="${activeChallenge.img}" alt="${activeChallenge.title}"><div class="breath-circle"><span>${activeChallenge.id==='respira'?'Inhala':'Wolves'}</span><strong>${activeChallenge.id==='respira'?'4-7-8':'✓'}</strong></div></div><div><span class="landing-kicker">${activeChallenge.tag}</span><h2>${activeChallenge.title}</h2><p>${activeChallenge.text}</p><ol>${activeChallenge.steps.map(s=>`<li>${s}</li>`).join('')}</ol><button class="primary-btn certify-challenge" data-id="${activeChallenge.id}">Certificar reto completado</button></div></article><article class="card full challenge-reward"><span>Bono de temporada</span><h2>Recompensa por Completar la Biblioteca</h2><p>Completa los 5 retos de la temporada para desbloquear accesorios NFT y recibir el Súper Bono de <strong>+200 Eight-Coins</strong>.</p><div class="library-progress"><span style="width:${Math.min(100,done.length*20)}%"></span></div><small>Progreso: ${done.length} de 5 retos completados</small></article></section>`;
  }

  async function completeChallenge(id){
    const c=challengesData.find(x=>x.id===id);
    if(!c)return;
    S.challenges=S.challenges||[];
    if(!S.challenges.includes(c.title)){
      S.challenges.push(c.title);
      if(typeof block==='function')await block('Reto completado: '+c.title);
      notify('Reto completado: '+c.title);
    }
    if(S.challenges.length>=5 && !S.challengeSeasonRewarded){
      S.challengeSeasonRewarded=true;
      unlockNfts();
      if(typeof reward==='function')reward(200,'Biblioteca de retos completada');
      notify('Biblioteca completa: NFTs desbloqueados');
    }
    persist();render();
  }
  function triggerCriticalRisk(message){
    const student=u();
    const alert={level:'Roja',reason:'Riesgo crítico detectado por Wolf AI',student:student.email,date:stamp(),status:'Atención inmediata',source:'Wolf AI',message};
    S.alerts.unshift(alert);
    S.followups.unshift({student:student.email,date:new Date().toISOString().slice(0,10),observations:'Ficha automática por protocolo de riesgo crítico en Wolf AI.',agreements:'Contactar al estudiante, activar red de apoyo y orientar llamada al 911 si existe peligro inmediato.',file:'Ficha automática WOLVES'});
    persist();
  }
  function sendWolfMessage(){
    const input=document.getElementById('wolfMessage');
    if(!input||!input.value.trim())return;
    const text=input.value.trim();
    S.chat.push({from:'user',text});
    const critical=riskWords.some(w=>text.toLowerCase().includes(w));
    if(critical){
      triggerCriticalRisk(text);
      S.chat.push({from:'ai',text:'Protocolo rojo activado. Si estás en peligro, llama al 911 ahora. También se envió una alerta crítica al equipo DECE para atención inmediata.'});
    }else{
      S.chat.push({from:'ai',text:wolfAiResponse(text)});
    }
    input.value='';persist();render();
    if(critical){setTimeout(()=>{const banner=document.getElementById('riskBanner');if(banner)banner.hidden=false;},30);}
  }
  function sendAppointment(){
    const reason=document.getElementById('appointmentReason')?.value.trim();
    const date=document.getElementById('appointmentDate')?.value;
    const time=document.getElementById('appointmentTime')?.value;
    if(!reason||!date||!time)return notify('Completa motivo, fecha y hora');
    S.appointments.unshift({student:u().email,reason,date,time,status:'Solicitada',createdAt:stamp()});
    S.alerts.unshift({level:'Verde',reason:'Solicitud de cita DECE',student:u().email,date:stamp(),status:'Pendiente',source:'Agenda estudiante'});
    persist();notify('Cita solicitada al DECE');render();
  }
  function bindUpgrades(){
    document.querySelectorAll('.preview-nft').forEach(b=>b.onclick=()=>{u().previewNft=b.dataset.nft;persist();render();});
    document.querySelectorAll('.equip-nft').forEach(b=>b.onclick=()=>{u().equippedNft=b.dataset.nft;u().previewNft='';persist();notify('Accesorio equipado: '+b.dataset.nft);render();});
    document.querySelectorAll('.ai-template').forEach(b=>b.onclick=()=>{const input=document.getElementById('wolfMessage');if(input){input.value=b.dataset.text;input.focus();}});
    const send=document.getElementById('wolfSend'); if(send)send.onclick=sendWolfMessage;
    const input=document.getElementById('wolfMessage'); if(input)input.onkeydown=e=>{if(e.key==='Enter')sendWolfMessage();};
    const appointment=document.getElementById('sendAppointment'); if(appointment)appointment.onclick=sendAppointment;
    document.querySelectorAll('.run-challenge').forEach(b=>b.onclick=()=>{S.activeChallenge=b.dataset.id;persist();render();});
    document.querySelectorAll('.certify-challenge').forEach(b=>b.onclick=()=>completeChallenge(b.dataset.id));
  }

  window.addEventListener('load',()=>{
    if(typeof S==='undefined')return;
    profile=window.profile=profileUpgrade;
    ai=window.ai=aiUpgrade;
    challenges=window.challenges=challengesUpgrade;
    const prev=typeof bindStudent==='function'?bindStudent:null;
    bindStudent=window.bindStudent=function(){if(prev)prev();bindUpgrades();};
    ensureStudentState();
    if(typeof render==='function')render();
  });
})();
