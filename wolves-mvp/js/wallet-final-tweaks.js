(()=>{
  const DEMO_BALANCE=3000;
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
    if(me.walletDemoBalance3000) return;
    me.coins=DEMO_BALANCE;
    me.eightCoins=DEMO_BALANCE;
    me.usd=DEMO_BALANCE/100;
    me.totalGanado=Math.max(Number(me.totalGanado||0),DEMO_BALANCE);
    me.walletDemoBalance25000=false;
    me.walletDemoBalance3000=true;
    S.wallet=Array.isArray(S.wallet)?S.wallet:[];
    S.wallet.unshift({date:today(),type:'Balance demo',amount:DEMO_BALANCE,detail:`Balance institucional inicial: ${fmt.format(DEMO_BALANCE)} EC = $30.00 USD simulados`});
    persist();
  }
  function addRedeemButton(html){
    return html.replace(
      '<div class="wallet-card-chip"></div><small>Equivalencia real demo: 1 EC = $0.01 USD</small>',
      '<div class="wallet-card-chip"></div><button class="wallet-redeem-now" type="button">Canjear ahora</button><small>Equivalencia real demo: 1 EC = $0.01 USD</small>'
    );
  }
  function applyWalletText(html){
    return addRedeemButton(html)
      .replace(/<article class="wallet-level-card tilt-card">[\s\S]*?<\/article>\s*/,'')
      .replace('<section class="wallet-main-grid">','<section class="wallet-main-grid wallet-balance-only">')
      .replace('<section class="wallet-grid-3">','<section class="wallet-grid-3 wallet-two">')
      .replace(/<div class="today-row"><span>Wolf AI<\/span><b>\+15<\/b><\/div>/,'')
      .replace('<div class="today-total"><span>Total del día</span><b>+65 EC</b></div>','<div class="today-total"><span>Total del día</span><b>+50 EC</b></div>')
      .replace(/<article class="wallet-panel reward-card">[\s\S]*?<\/article><\/section>/,'</section>');
  }

  const previousWallet=window.wallet;
  window.wallet=function walletFinalTweaks(){
    seedWalletBalance();
    const html=typeof previousWallet==='function'?previousWallet():'';
    return applyWalletText(html);
  };

  const previousBind=window.bindStudent;
  window.bindStudent=function walletRedeemBind(){
    if(typeof previousBind==='function') previousBind();
    if(active!=='Wallet') return;
    document.querySelectorAll('.wallet-redeem-now').forEach(btn=>btn.onclick=()=>{active='Tienda Wolves';render();});
  };
})();
