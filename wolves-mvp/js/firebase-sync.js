(()=>{
  const COLLECTION='wolvesMvpState';
  const SETTINGS_KEY='wolves_firebase_config';
  let online=false;
  let syncing=false;
  let lastSave=0;

  function currentEmail(){return (window.S&&S.currentUser)||'demo@wolves.local';}
  function docId(){return currentEmail().replace(/[^a-zA-Z0-9_-]/g,'_');}
  function notify(text){if(typeof toast==='function')toast(text);}
  function cloneState(){return JSON.parse(JSON.stringify(window.S||{}));}
  function setBadge(text,enabled){
    let badge=document.getElementById('firebaseStatusBadge');
    if(!badge){
      badge=document.createElement('button');
      badge.id='firebaseStatusBadge';
      badge.type='button';
      badge.className='firebase-status-badge';
      badge.onclick=showFirebasePanel;
      document.body.appendChild(badge);
    }
    badge.textContent=text;
    badge.classList.toggle('online',!!enabled);
  }
  function firebaseForm(){
    const existing=window.WolvesFirebase?.getConfig?.()||{};
    return `<dialog id="firebaseConfigModal" class="auth-modal firebase-modal"><div class="modal-head"><div><strong>Conectar Firebase</strong><span>Configura Firestore para guardar datos reales del MVP.</span></div><button class="icon-btn" id="closeFirebaseConfig">×</button></div><form id="firebaseConfigForm" class="auth-form active"><label>apiKey<input id="fbApiKey" required value="${existing.apiKey||''}"></label><label>authDomain<input id="fbAuthDomain" required value="${existing.authDomain||''}" placeholder="tu-proyecto.firebaseapp.com"></label><label>projectId<input id="fbProjectId" required value="${existing.projectId||''}"></label><label>storageBucket<input id="fbStorageBucket" value="${existing.storageBucket||''}"></label><label>messagingSenderId<input id="fbMessagingSenderId" value="${existing.messagingSenderId||''}"></label><label>appId<input id="fbAppId" required value="${existing.appId||''}"></label><button class="primary-btn" type="submit">Guardar configuración Firebase</button><p class="form-help">Después de guardar, recarga la página. El MVP usará Firestore cuando la configuración sea válida.</p></form></dialog>`;
  }
  function showFirebasePanel(){
    let modal=document.getElementById('firebaseConfigModal');
    if(!modal){
      document.body.insertAdjacentHTML('beforeend',firebaseForm());
      modal=document.getElementById('firebaseConfigModal');
      document.getElementById('closeFirebaseConfig').onclick=()=>modal.close();
      document.getElementById('firebaseConfigForm').onsubmit=ev=>{
        ev.preventDefault();
        const config={
          apiKey:fbApiKey.value.trim(),
          authDomain:fbAuthDomain.value.trim(),
          projectId:fbProjectId.value.trim(),
          storageBucket:fbStorageBucket.value.trim(),
          messagingSenderId:fbMessagingSenderId.value.trim(),
          appId:fbAppId.value.trim()
        };
        localStorage.setItem(SETTINGS_KEY,JSON.stringify(config));
        notify('Configuración Firebase guardada. Recarga la página para conectar.');
        modal.close();
      };
    }
    modal.showModal();
  }
  async function ctx(){
    if(!window.WolvesFirebase) return {enabled:false,reason:'Firebase SDK no cargado'};
    return window.WolvesFirebase.ready();
  }
  async function pullRemote(){
    const c=await ctx();
    online=!!c.enabled;
    setBadge(online?'Firebase conectado':'Configurar Firebase',online);
    if(!c.enabled) return;
    const {doc,getDoc,setDoc,serverTimestamp}=c.dbMod;
    const ref=doc(c.db,COLLECTION,docId());
    const snap=await getDoc(ref);
    if(snap.exists()){
      const data=snap.data();
      if(data.state&&window.S){
        window.S={...window.S,...data.state};
        if(data.state.currentUser) S.currentUser=data.state.currentUser;
        if(typeof saveLocalOnly==='function') saveLocalOnly();
        if(typeof render==='function') render();
      }
    }else if(window.S){
      await setDoc(ref,{email:currentEmail(),state:cloneState(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});
    }
  }
  async function pushRemote(reason='auto'){
    if(syncing||!window.S) return;
    const now=Date.now();
    if(reason==='auto'&&now-lastSave<900) return;
    lastSave=now;
    syncing=true;
    try{
      const c=await ctx();
      online=!!c.enabled;
      setBadge(online?'Firebase conectado':'Configurar Firebase',online);
      if(!c.enabled) return;
      const {doc,setDoc,serverTimestamp}=c.dbMod;
      await setDoc(doc(c.db,COLLECTION,docId()),{email:currentEmail(),state:cloneState(),updatedAt:serverTimestamp()},{merge:true});
    }catch(error){
      console.warn('WOLVES Firestore sync fallback:',error);
      setBadge('Firebase error',false);
    }finally{
      syncing=false;
    }
  }
  function wrapSave(){
    if(typeof save!=='function'||window.__wolvesSaveWrapped) return;
    window.saveLocalOnly=save;
    const original=save;
    window.save=function wolvesSyncedSave(){
      original();
      pushRemote('auto');
    };
    window.__wolvesSaveWrapped=true;
  }
  window.WolvesData={pullRemote,pushRemote,showFirebasePanel};
  window.addEventListener('load',()=>{
    wrapSave();
    pullRemote().catch(error=>console.warn('WOLVES Firebase pull:',error));
    setInterval(()=>pushRemote('auto'),10000);
  });
  window.addEventListener('beforeunload',()=>{pushRemote('final');});
})();
