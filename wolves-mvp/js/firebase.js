(()=>{
  const FIREBASE_VERSION='11.10.0';
  let cache=null;

  function getConfig(){
    if(window.WOLVES_FIREBASE_CONFIG) return window.WOLVES_FIREBASE_CONFIG;
    try { return JSON.parse(localStorage.getItem('wolves_firebase_config')||'null'); }
    catch { return null; }
  }

  async function ready(){
    if(cache) return cache;
    const config=getConfig();
    if(!config || !config.apiKey || !config.projectId){
      cache={enabled:false,reason:'Firebase no configurado; usando almacenamiento local demo.'};
      return cache;
    }
    try{
      const appMod=await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`);
      const authMod=await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`);
      const dbMod=await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`);
      const app=appMod.initializeApp(config);
      const auth=authMod.getAuth(app);
      if(!auth.currentUser) await authMod.signInAnonymously(auth);
      const db=dbMod.getFirestore(app);
      cache={enabled:true,app,auth,db,authMod,dbMod};
      return cache;
    }catch(error){
      console.warn('WOLVES Firebase fallback:',error);
      cache={enabled:false,reason:error.message};
      return cache;
    }
  }

  window.WolvesFirebase={ready,getConfig};
})();
