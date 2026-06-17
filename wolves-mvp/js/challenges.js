(()=>{
  const IMG={
    breathe:'assets/RESPIRA Y RELÁJATE.png',
    anxiety:'assets/CONTROLALAANSIEDAD.png',
    sadness:'assets/GESTIONALATRISTEZA.png',
    listen:'assets/ESCUCHAACTIVA.png',
    heart:'assets/MASCOTA CORAZÓN.png'
  };
  const NFT_REWARDS=[
    {name:'NFT Lobo Capucha',img:'assets/NFT LOBO CAPUCHA.jpeg'},
    {name:'NFT Loba Capucha',img:'assets/NFT LOBA CAPUCHA.png'},
    {name:'NFT Lobo con Gafas',img:'assets/NFT LOBO CON GAFAS.png'},
    {name:'NFT Loba con Gafas',img:'assets/NFT LOBA CON GAFAS.png'}
  ];
  const CHALLENGES=[
    {id:'respiracion-478',name:'Respiración Controlada 4-7-8',points:25,img:IMG.breathe,description:'Fases para inhalar, retener y exhalar aire profundamente con una esfera que pulsa rítmicamente.',type:'breathing'},
    {id:'controla-ansiedad',name:'Controla la Ansiedad',points:30,img:IMG.anxiety,description:'Técnica visual para reconocer tensión corporal y recuperar sensación de control.',type:'grounding',fields:[['ves','5 cosas que ves'],['tocas','4 cosas que puedes tocar'],['escuchas','3 cosas que escuchas'],['hueles','2 cosas que hueles'],['saboreas','1 cosa que saboreas']]},
    {id:'gestiona-tristeza',name:'Gestiona la Tristeza',points:35,img:IMG.sadness,description:'Ejercicio guiado para validar emociones difíciles sin aislarte de la manada.',type:'journal',fields:[['origen','¿Qué te hizo sentir así?'],['aprendizaje','¿Qué aprendiste de esta emoción?'],['accion','¿Qué acción amable harás mañana?']]},
    {id:'escucha-activa',name:'Escucha Activa',points:40,img:IMG.listen,description:'Reto para mejorar comunicación, empatía y resolución de conflictos con compañeros.',type:'listening',guide:['Mira a la persona.','No interrumpas.','Repite con tus palabras lo que entendiste.','Haz una pregunta amable.'],fields:[['persona','¿A quién escuchaste hoy?'],['emocion','¿Qué emoción notaste en esa persona?'],['respuesta','¿Cómo respondiste con empatía?']]},
    {id:'diario-gratitud',name:'Diario de Gratitud Wolves',points:45,img:IMG.heart,description:'Cierra la biblioteca con un compromiso de autocuidado y gratitud diaria.',type:'gratitude',fields:[['agradece','3 cosas que agradeces hoy'],['accionBuena','1 acción buena que hiciste'],['compromiso','1 compromiso de autocuidado para mañana']]}
  ];
  const STORAGE_KEY='wolves_challenge_progress_v2';

  const state={progress:{},loading:false,firebase:false};
  function currentUser(){return typeof user==='function'?user():S.users.find(x=>x.email===S.currentUser)||S.users[0];}
  function uid(){return currentUser().id||currentUser().email||'demo-student';}
  function localKey(){return `${STORAGE_KEY}_${uid()}`;}
  function nowIso(){return new Date().toISOString();}
  function saveApp(){if(typeof save==='function')save();}
  function notify(msg){if(typeof toast==='function')toast(msg);}
  function baseProgress(ch){return {id:ch.id,nombre:ch.name,descripcion:ch.description,estado:'pending',puntos:ch.points,respuestas:{},completado:false};}
  function mergedProgress(){return CHALLENGES.reduce((acc,ch)=>{acc[ch.id]={...baseProgress(ch),...(state.progress[ch.id]||{})};return acc;},{});}
  function saveLocal(){localStorage.setItem(localKey(),JSON.stringify(state.progress));}
  function loadLocal(){try{state.progress=JSON.parse(localStorage.getItem(localKey())||'{}')||{};}catch{state.progress={};}}
  function completedCount(){return Object.values(mergedProgress()).filter(r=>r.estado==='completed'||r.completado).length;}
  function syncCoins(){const u=currentUser();u.eightCoins=u.coins||u.eightCoins||0;u.retosCompletados=completedCount();if(completedCount()>=5){u.nftUnlocked=true;S.nfts=(S.nfts||[]).map(n=>({...n,unlocked:true}));}saveApp();}

  async function fb(){return window.WolvesFirebase?await window.WolvesFirebase.ready():{enabled:false};}
  async function saveRemoteChallenge(challengeId){
    const ctx=await fb();
    if(!ctx.enabled) return;
    const {doc,setDoc,serverTimestamp}=ctx.dbMod;
    const u=currentUser();
    const userRef=doc(ctx.db,'users',ctx.auth.currentUser.uid);
    const retoRef=doc(ctx.db,'users',ctx.auth.currentUser.uid,'retos',challengeId);
    await setDoc(userRef,{uid:ctx.auth.currentUser.uid,nombre:u.name||u.profileName||'Estudiante Wolves',curso:u.grade||'Demo',eightCoins:u.coins||0,retosCompletados:completedCount(),racha:u.racha||0,updatedAt:serverTimestamp()},{merge:true});
    await setDoc(retoRef,{...state.progress[challengeId],updatedAt:serverTimestamp()},{merge:true});
  }
  async function loadRemote(){
    const ctx=await fb();
    state.firebase=!!ctx.enabled;
    if(!ctx.enabled) return;
    const {collection,getDocs,setDoc,doc,serverTimestamp}=ctx.dbMod;
    const retosRef=collection(ctx.db,'users',ctx.auth.currentUser.uid,'retos');
    const snap=await getDocs(retosRef);
    snap.forEach(item=>{state.progress[item.id]=item.data();});
    await Promise.all(CHALLENGES.map(ch=>{
      if(state.progress[ch.id]) return Promise.resolve();
      state.progress[ch.id]=baseProgress(ch);
      return setDoc(doc(ctx.db,'users',ctx.auth.currentUser.uid,'retos',ch.id),{...state.progress[ch.id],createdAt:serverTimestamp()},{merge:true});
    }));
    saveLocal();
  }
  async function initChallenges(){
    loadLocal();
    CHALLENGES.forEach(ch=>{if(!state.progress[ch.id])state.progress[ch.id]=baseProgress(ch);});
    syncCoins();
    saveLocal();
    loadRemote().then(()=>{syncCoins();saveLocal();if(typeof active!=='undefined'&&active==='Retos Mensuales'&&typeof render==='function')render();}).catch(error=>notify('No se pudo leer Firebase: '+error.message));
  }

  function badgeLabel(status){return status==='completed'?'Completado':status==='in_progress'?'En progreso':'Pendiente';}
  function challengeCard(ch,p){return `<article class="fc-card ${p.estado}"><span class="fc-badge ${p.estado}">${badgeLabel(p.estado)}</span><img src="${ch.img}" alt="${ch.name}"><h3>${ch.name}</h3><p>${ch.description}</p><button class="primary-btn fc-open-challenge" data-id="${ch.id}">${p.estado==='completed'?'Ver reto':'Ejecutar reto'}</button></article>`;}
  function rewardSection(done){
    const unlocked=done>=5;
    return `<article class="card full fc-reward fc-library-bonus"><span>Bono de temporada</span><h2>Recompensa por Completar la Biblioteca</h2><p>Para incentivar hábitos estables, completa los 5 retos de la temporada. Desbloquearás el Súper Bono de <strong>+200 Eight-Coins</strong> y podrás canjear accesorios NFT exclusivos en tu perfil.</p><div class="library-progress"><span style="width:${Math.min(100,done*20)}%"></span></div><small>Progreso: ${done} de 5 retos completados</small></article><article class="card full fc-nft-rewards"><div class="fc-nft-head"><div><h2>NFTs que puedes desbloquear</h2><p>Al completar los 5 retos, estos accesorios se liberan para probar y equipar en tu Perfil RPG.</p></div><span class="season-chip ${unlocked?'unlocked':''}">${unlocked?'Desbloqueados':'Bloqueados'}</span></div><div class="fc-nft-grid">${NFT_REWARDS.map(n=>`<article class="fc-nft-card ${unlocked?'unlocked':'locked'}"><img src="${n.img}" alt="${n.name}"><strong>${n.name}</strong><small>${unlocked?'Disponible para equipar':'Completa 5 retos para desbloquear'}</small><div class="fc-nft-actions"><button class="ghost-btn fc-preview-nft" data-nft="${n.name}" data-img="${n.img}">Probar</button><button class="primary-btn fc-equip-nft" data-nft="${n.name}" data-img="${n.img}" ${unlocked?'':'disabled'}>Equipar</button></div></article>`).join('')}</div></article>`;
  }
  function challengesView(){
    const progress=mergedProgress();
    const done=Object.values(progress).filter(p=>p.estado==='completed').length;
    const coins=CHALLENGES.reduce((sum,ch)=>sum+(progress[ch.id].estado==='completed'?ch.points:0),0)+(currentUser().challengeLibraryRewarded?200:0);
    return `<section class="fc-wrap"><div class="fc-header"><div><span>Bono de temporada</span><h2>Biblioteca de Retos Wolves</h2><p>Completa retos de autorregulación, empatía y gratitud. Cada reto entrega EightCoins solo una vez.</p></div><div class="fc-score"><strong>${done}/5</strong><small>Retos</small><strong>${coins} EC</strong><small>Ganados</small></div></div><div class="fc-grid">${CHALLENGES.map(ch=>challengeCard(ch,progress[ch.id])).join('')}</div>${rewardSection(done)}</section>`;
  }

  function openModal(id){
    const ch=CHALLENGES.find(c=>c.id===id); if(!ch)return;
    const p=mergedProgress()[id];
    if(p.estado==='pending'){p.estado='in_progress';p.fechaInicio=p.fechaInicio||nowIso();state.progress[id]=p;persistProgress(id);}
    const modal=document.getElementById('challengeModal')||createModal();
    modal.innerHTML=modalContent(ch,state.progress[id]);
    modal.showModal();
    bindModal(ch,state.progress[id]);
  }
  function createModal(){const d=document.createElement('dialog');d.id='challengeModal';d.className='fc-modal';document.body.appendChild(d);return d;}
  function completedView(ch,p){return `<div class="fc-completed"><img src="${ch.img}" alt="${ch.name}"><h3>Reto completado</h3><p>Fecha: ${p.fechaFin?new Date(p.fechaFin).toLocaleString():'Registrado'}</p><p>Puntos ganados: <strong>${p.puntos} EightCoins</strong></p><div class="fc-answer-list">${Object.entries(p.respuestas||{}).map(([k,v])=>`<p><b>${k}:</b> ${Array.isArray(v)?v.join(', '):v}</p>`).join('')||'<p>Sin respuestas registradas.</p>'}</div></div>`;}
  function modalContent(ch,p){return `<div class="modal-head fc-modal-head"><div><strong>${ch.name}</strong><span>${badgeLabel(p.estado)} · ${ch.points} EightCoins</span></div><button class="icon-btn fc-close">×</button></div>${p.estado==='completed'?completedView(ch,p):modalBody(ch,p)}`;}
  function modalBody(ch){
    if(ch.type==='breathing')return `<div class="fc-breath"><div class="breath-orb" id="breathOrb"><span id="breathPhase">Listo</span><strong id="breathTimer">3</strong></div><p id="breathHelp">Completa 3 ciclos: inhalar 4s, mantener 7s y exhalar 8s.</p><div class="fc-progress"><span id="breathProgress"></span></div><button class="primary-btn" id="startBreath">Iniciar ejercicio</button><button class="success-btn" id="finishBreath" disabled>Certificar reto completado</button></div>`;
    const guide=ch.guide?`<div class="fc-guide">${ch.guide.map(g=>`<p>✓ ${g}</p>`).join('')}</div>`:'';
    return `<form class="fc-form" id="challengeForm">${guide}${ch.fields.map(([id,label])=>`<label>${label}<textarea required data-field="${id}" placeholder="Escribe tu respuesta..."></textarea></label>`).join('')}<button class="success-btn" type="submit">Finalizar reto</button></form>`;
  }
  function bindModal(ch,p){
    document.querySelector('.fc-close').onclick=()=>document.getElementById('challengeModal').close();
    const form=document.getElementById('challengeForm');
    if(form)form.onsubmit=e=>{e.preventDefault();const answers={};let ok=true;form.querySelectorAll('textarea').forEach(t=>{if(!t.value.trim())ok=false;answers[t.dataset.field]=t.value.trim();});if(!ok)return notify('Completa todos los campos obligatorios');completeChallenge(ch,answers);};
    const start=document.getElementById('startBreath');
    if(start)start.onclick=()=>runBreathing();
    const finish=document.getElementById('finishBreath');
    if(finish)finish.onclick=()=>completeChallenge(ch,{ciclos:'3 ciclos 4-7-8 completados'});
  }
  function runBreathing(){
    const phases=[['Inhala',4],['Mantén',7],['Exhala',8]];let cycle=1,phase=0,remaining=phases[0][1],elapsed=0,total=57;
    document.getElementById('startBreath').disabled=true;
    const tick=()=>{const [label,duration]=phases[phase];document.getElementById('breathPhase').textContent=`${label} · Ciclo ${cycle}/3`;document.getElementById('breathTimer').textContent=remaining;document.getElementById('breathOrb').className='breath-orb '+label.toLowerCase().replace('é','e');document.getElementById('breathProgress').style.width=`${Math.min(100,elapsed/total*100)}%`;remaining--;elapsed++;if(remaining<0){phase++;if(phase>=phases.length){phase=0;cycle++;}if(cycle>3){clearInterval(timer);document.getElementById('breathPhase').textContent='Completado';document.getElementById('breathTimer').textContent='✓';document.getElementById('breathProgress').style.width='100%';document.getElementById('finishBreath').disabled=false;return;}remaining=phases[phase][1];}};
    tick();const timer=setInterval(tick,1000);
  }
  async function completeChallenge(ch,respuestas){
    const p=state.progress[ch.id]||baseProgress(ch);
    if(p.estado==='completed')return notify('Este reto ya fue completado. No se entregan monedas dos veces.');
    p.estado='completed';p.completado=true;p.respuestas=respuestas;p.fechaFin=nowIso();p.puntos=ch.points;state.progress[ch.id]=p;
    const usr=currentUser();usr.coins=(usr.coins||0)+ch.points;usr.eightCoins=usr.coins;usr.retosCompletados=completedCount();
    if(typeof block==='function')await block('Reto completado: '+ch.name);
    await persistProgress(ch.id);
    if(completedCount()>=5 && !usr.challengeLibraryRewarded){
      usr.challengeLibraryRewarded=true;usr.coins+=200;usr.eightCoins=usr.coins;usr.nftUnlocked=true;S.nfts=(S.nfts||[]).map(n=>({...n,unlocked:true}));
      S.wallet=S.wallet||[];S.wallet.unshift({date:new Date().toISOString().slice(0,10),type:'Súper Bono',amount:200,detail:'Biblioteca de retos completada'});
      if(typeof block==='function')await block('Súper bono y NFTs por biblioteca completa');
      showReward(200);notify('Biblioteca completa: +200 EightCoins y NFTs desbloqueados');
    }else{
      showReward(ch.points);notify(`✨ +${ch.points} EightCoins`);
    }
    document.getElementById('challengeModal').close();saveApp();render();
  }
  async function persistProgress(id){saveLocal();syncCoins();saveApp();try{await saveRemoteChallenge(id);}catch(e){console.warn(e);notify('Guardado local. Firebase no disponible: '+e.message);}}
  function showReward(points){const el=document.createElement('div');el.className='coin-burst';el.textContent=`✨ +${points} EightCoins`;document.body.appendChild(el);setTimeout(()=>el.remove(),1800);}
  function bindNfts(){
    document.querySelectorAll('.fc-preview-nft').forEach(b=>b.onclick=()=>{currentUser().previewNft=b.dataset.nft;currentUser().previewNftImage=b.dataset.img;notify('Vista previa NFT: '+b.dataset.nft);saveApp();});
    document.querySelectorAll('.fc-equip-nft').forEach(b=>b.onclick=()=>{currentUser().equippedNft=b.dataset.nft;currentUser().equippedNftImage=b.dataset.img;notify('NFT equipado: '+b.dataset.nft);saveApp();render();});
  }

  window.addEventListener('load',()=>{
    if(typeof S==='undefined')return;
    initChallenges();
    challenges=window.challenges=challengesView;
    const prev=typeof bindStudent==='function'?bindStudent:null;
    bindStudent=window.bindStudent=function(){if(prev)prev();document.querySelectorAll('.fc-open-challenge').forEach(b=>b.onclick=()=>openModal(b.dataset.id));bindNfts();};
    if(typeof render==='function')render();
  });
})();
