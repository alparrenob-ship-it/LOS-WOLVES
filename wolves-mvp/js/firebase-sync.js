(()=>{
  const COLLECTION='wolvesMvpState';
  const SETTINGS_KEY='wolves_firebase_config';
  let online=false;
  let syncing=false;
  let lastSave=0;
  let lastError='';

  function currentEmail(){return (window.S&&S.currentUser)||'demo@wolves.local';}
  function docId(){return currentEmail().replace(/[^a-zA-Z0-9_-]/g,'_');}
  function notify(text){if(typeof toast==='function')toast(text);}
  function cloneState(){return JSON.parse(JSON.stringify(window.S||{}));}
  function field(id){return document.getElementById(id)?.value?.trim()||'';}
  function hasConfig(){const c=getExistingConfig();return !!(c.apiKey&&c.projectId&&c.appId);}
  function disconnectedLabel(){return hasConfig()?`Firebase error`: 'Configurar Firebase';}
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
    if(title) lastError=title;
    badge.textContent=text;
    badge.title=title||lastError||text;
    badge.classList.toggle('online',!!enabled);
    badge.classList.toggle('error',text.includes('error'));
  }
  function getExistingConfig(){return window.WOLVES_FIREBASE_CONFIG||window.WolvesFirebase?.getConfig?.()||{};}
  function diagnosticText(){
    if(online) return 'Conectado correctamente con Firestore.';
    if(lastError) return lastError;
    return hasConfig()?'Hay configuración guardada, pero Firebase no confirmó conexión todavía.':'Aún falta configuración Firebase.';
  }
  function firebaseForm(){
    const existing=getExistingConfig();
    return `<dialog id="firebaseConfigModal" class="auth-modal firebase-modal"><div class="modal-head"><div><strong>Conectar Firebase</strong><span>Configura Firestore para guardar datos reales del MVP.</span></div><button class="icon-btn" id="closeFirebaseConfig">×</button></div><form id="firebaseConfigForm" class="auth-form active"><label>apiKey<input id="fbApiKey" required value="${existing.apiKey||''}"></label><label>authDomain<input id="fbAuthDomain" required value="${existing.authDomain||''}" placeholder="tu-proyecto.firebaseapp.com"></label><label>projectId<input id="fbProjectId" required value="${existing.projectId||''}"></label><label>storageBucket<input id="fbStorageBucket" value="${existing.storageBucket||''}"></label><label>messagingSenderId<input id="fbMessagingSenderId" value="${existing.messagingSenderId||''}"></label><label>appId<input id="fbAppId" required value="${existing.appId||''}"></label><div class="firebase-diagnostic full"><strong>Estado:</strong><span id="firebaseDiagnosticText">${diagnosticText()}</span></div><button class="primary-btn" type="submit">Guardar configuración Firebase</button><button class="ghost-btn" type="button" id="testFirebaseConnection">Probar conexión</button><p class="form-help">Si ves error, revisa Authentication anónimo, dominios autorizados y reglas de Firestore.</p></form></dialog>`;
  }
  function refreshDiagnostic(){const el=document.getElementById('firebaseDiagnosticText');if(el)el.textContent=diagnosticText();}
  function bindModal(modal){
    document.getElementById('closeFirebaseConfig').onclick=()=>modal.close();
    document.getElementById('testFirebaseConnection').onclick=()=>{notify('Probando conexión Firebase...');pullRemote().then(()=>{refreshDiagnostic();notify(online?'Firebase conectado':'Firebase todavía no conecta');});};
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
  function showFirebasePanel(){
    let modal=document.getElementById('firebaseConfigModal');
    if(!modal){document.body.insertAdjacentHTML('beforeend',firebaseForm());modal=document.getElementById('firebaseConfigModal');bindModal(modal);}else{refreshDiagnostic();}
    modal.showModal();
  }
  async function ctx(){if(!window.WolvesFirebase)return{enabled:false,reason:'Firebase SDK no cargado'};return window.WolvesFirebase.ready();}
  async function pullRemote(){
    try{
      const c=await ctx();
      online=!!c.enabled;
      if(!c.enabled){setBadge(disconnectedLabel(),false,c.reason||'Firebase no habilitado');return;}
      const {doc,getDoc,setDoc,serverTimestamp}=c.dbMod;
      const ref=doc(c.db,COLLECTION,docId());
      const snap=await getDoc(ref);
      if(snap.exists()){
        const data=snap.data();
        if(data.state&&window.S){window.S={...window.S,...data.state};if(data.state.currentUser)S.currentUser=data.state.currentUser;if(typeof saveLocalOnly==='function')saveLocalOnly();if(typeof render==='function')render();}
      }else if(window.S){await setDoc(ref,{email:currentEmail(),state:cloneState(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});}
      setBadge('Firebase conectado',true,'Conectado correctamente');
    }catch(error){lastError=error.code?`${error.code}: ${error.message}`:error.message;console.warn('WOLVES Firebase pull:',error);setBadge('Firebase error',false,lastError);}
  }
  async function pushRemote(reason='auto'){
    if(syncing||!window.S)return;
    const now=Date.now();
    if(reason==='auto'&&now-lastSave<900)return;
    lastSave=now;syncing=true;
    try{
      const c=await ctx();
      online=!!c.enabled;
      if(!c.enabled){setBadge(disconnectedLabel(),false,c.reason||'Firebase no habilitado');return;}
      const {doc,setDoc,serverTimestamp}=c.dbMod;
      await setDoc(doc(c.db,COLLECTION,docId()),{email:currentEmail(),state:cloneState(),updatedAt:serverTimestamp()},{merge:true});
      setBadge('Firebase conectado',true,'Conectado correctamente');
    }catch(error){lastError=error.code?`${error.code}: ${error.message}`:error.message;console.warn('WOLVES Firestore sync fallback:',error);setBadge('Firebase error',false,lastError);}
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
  window.addEventListener('load',()=>{wrapSave();pullRemote();setInterval(()=>pushRemote('auto'),10000);});
  window.addEventListener('beforeunload',()=>{pushRemote('final');});
})();
