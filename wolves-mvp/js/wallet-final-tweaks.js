(()=>{
  const DEMO_BALANCE=25000;
  const fmt=new Intl.NumberFormat('es-EC');

  function currentUser(){
    if(typeof user==='function') return user();
    return S.users.find(x=>x.email===S.currentUser)||S.users[0];
  }
  function persist(){if(typeof save==='function') save();}
  function today(){return new Date().toISOString().slice(0,10);}
  function seedWalletBalance(){
    if(typeof S==='undefined') return;
    const me=currentUser();
    if(!me || me.role!=='student') return;
    if(me.walletDemoBalance25000) return;
    me.coins=DEMO_BALANCE;
    me.eightCoins=DEMO_BALANCE;
    me.usd=DEMO_BALANCE/100;
    me.totalGanado=Math.max(Number(me.totalGanado||0),DEMO_BALANCE);
    me.walletDemoBalance25000=true;
    S.wallet=Array.isArray(S.wallet)?S.wallet:[];
    S.wallet.unshift({date:today(),type:'Balance demo',amount:DEMO_BALANCE,detail:`Balance institucional inicial: ${fmt.format(DEMO_BALANCE)} EC = $250.00 USD simulados`});
    persist();
  }
  function removeRewards(html){
    return html
      .replace('<section class="wallet-grid-3">','<section class="wallet-grid-3 wallet-two">')
      .replace(/<article class="wallet-panel reward-card">[\s\S]*?<\/article><\/section>/,'</section>');
  }

  const previousWallet=window.wallet;
  window.wallet=function walletFinalTweaks(){
    seedWalletBalance();
    const html=typeof previousWallet==='function'?previousWallet():'';
    return removeRewards(html);
  };
})();
