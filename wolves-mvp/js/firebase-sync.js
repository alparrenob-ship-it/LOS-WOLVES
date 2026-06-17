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
  function field(id){return document.getElementById(id)?.value?.trim()||'';}
  function hasConfig(){const c=getExistingConfig();return !!(c.apiKey&&c.projectId&&c.appId);}
  function disconnectedLabel(ctx){return hasConfig()?`Firebase error`: 'Configurar Firebase';}
  function setBadge(text,enabled,title=''){
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
    badge.title=title||text;
    badge.classList.toggle('online',!!enabled);
    badge.classList.toggle('error',text.includes('error'));
  }
  function getExistingConfig(){
    return window.WOLVES_FIREBASE_CONFIG||window.WolvesFirebase?.getConfig?.()||{};
  }
  function firebaseForm(){
    const existing=getExistingConfig();
    return `<dialog id="firebaseConfigModal" class="auth-modal firebase-modal"><div class="modal-head"><div><strong>Conectar Firebase</strong><span>Configura Firestore para guardar datos reales del MVP.</span></div><button class="icon-btn" id="closeFirebaseConfig">×</button></div><form id="firebaseConfigForm" class="auth-form active"><label>apiKey<input id="fbApiKey" required value="${existing.apiKey||''}"></label><label>authDomain<input id="fbAuthDomain" required value="${existing.authDomain||''}" placeholder="tu-proyecto.firebaseapp.com"></label><label>projectId<input id="fbProjectId" required value="${existing.projectId||''}"></label><label>storageBucket<input id="fbStorageBucket" value="${existing.storageBucket||''}"></label><label>messagingSenderId<input id="fbMessagingSenderId" value="${existing.messagingSenderId||''}"></label><label>appId<input id="fbAppId" required value="${existing.appId||''}"></label><button class="primary-btn" type="submit">Guardar configuración Firebase</button><p class="form-help">Después de guardar, la página se recargará automáticamente para conectar con Firestore.</p></form></dialog>`;
  }
  function showFirebasePanel(){
    let modal=document.getElementById('firebaseConfigModal');
    if(!modal){
      document.body.insertAdjacentHTML('beforeend',firebaseForm());
      modal=document.getElementById('firebaseConfigModal');
      document.getElementById('closeFirebaseConfig').onclick=()=>modal.close();
      document.getElementById('firebaseConfigForm').onsubmit=ev=>{
        ev.preventDefault();
        const config={apiKey:field('fbApiKey'),authDomain:field('fbAuthDomain'),projectId:field('fbProjectId'),storageBucket:field('fbStorageBucket'),messagingSenderId:field('fbMessagingSenderId'),appId:field('fbAppId')};
        if(!config.apiKey||!config.authDomain||!config.projectId||!config.appId){notify('Faltan campos obligatorios de Firebase.');return;}
        localStorage.setItem(SETTINGS_KEY,JSON.stringify(config));
        window.WOLVES_FIREBASE_CONFIG=config;
        notify('Configuración Firebase guardada. Recargando para conectar...');
        modal.close();
        setTimeout(()=>window.location.reload(),900);
      };
    }
    modal.showModal();
  }
  async function ctx(){if(!window.WolvesFirebase)return{enabled:false,reason:'Firebase SDK no cargado'};return window.WolvesFirebase.ready();}
  async function pullRemote(){
    const c=await ctx();
    online=!!c.enabled;
    setBadge(online?'Firebase conectado':disconnectedLabel(c),online,c.reason||'');
    if(!c.enabled) return;
    const {doc,getDoc,setDoc,serverTimestamp}=c.dbMod;
    const ref=doc(c.db,COLLECTION,docId());
    const snap=await getDoc(ref);
    if(snap.exists()){
      const data=snap.data();
      if(data.state&&window.S){window.S={...window.S,...data.state};if(data.state.currentUser)S.currentUser=data.state.currentUser;if(typeof saveLocalOnly==='function')saveLocalOnly();if(typeof render==='function')render();}
    }else if(window.S){await setDoc(ref,{email:currentEmail(),state:cloneState(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});}
  }
  async function pushRemote(reason='auto'){
    if(syncing||!window.S)return;
    const now=Date.now();
    if(reason==='auto'&&now-lastSave<900)return;
    lastSave=now;syncing=true;
    try{
      const c=await ctx();
      online=!!c.enabled;
      setBadge(online?'Firebase conectado':disconnectedLabel(c),online,c.reason||'');
      if(!c.enabled)return;
      const {doc,setDoc,serverTimestamp}=c.dbMod;
      await setDoc(doc(c.db,COLLECTION,docId()),{email:currentEmail(),state:cloneState(),updatedAt:serverTimestamp()},{merge:true});
    }catch(error){console.warn('WOLVES Firestore sync fallback:',error);setBadge('Firebase error',false,error.message);}
    finally{syncing=false;}
  }
  function wrapSave(){
    if(typeof save!=='function'||window.__wolvesSaveWrapped)return;
    window.saveLocalOnly=save;
    const original=save;
    window.save=function wolvesSyncedSave(){original();pushRemote('auto');};
    window.__wolvesSaveWrapped=true;
  }
  window.WolvesData={pullRemote,pushRemote,showFirebasePanel};
  window.addEventListener('load',()=>{wrapSave();pullRemote().catch(error=>{console.warn('WOLVES Firebase pull:',error);setBadge('Firebase error',false,error.message);});setInterval(()=>pushRemote('auto'),10000);});
  window.addEventListener('beforeunload',()=>{pushRemote('final');});
})();
