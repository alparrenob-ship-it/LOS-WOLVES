(()=>{
function notify(text){if(typeof toast==='function')toast(text);}
function persist(){if(typeof save==='function')save();}
function today(){return new Date().toISOString().slice(0,10);}
function currentUser(){return typeof user==='function'?user():S.users.find(u=>u.email===S.currentUser)||S.users[0];}
function cartItems(){return (S.cart||[]).map(id=>S.products.find(p=>p.id===id)).filter(Boolean);}
function canFulfill(items){
  const requested={};
  items.forEach(p=>requested[p.id]=(requested[p.id]||0)+1);
  return Object.entries(requested).every(([id,count])=>{const p=S.products.find(x=>x.id===id);return p&&p.stock>=count;});
}
async function registerBlock(text){if(typeof block==='function')await block(text);}
function addToCart(id){
  S.cart=S.cart||[];
  const product=S.products.find(p=>p.id===id);
  if(!product)return notify('Producto no encontrado');
  const already=S.cart.filter(x=>x===id).length;
  if(product.stock<=already)return notify('No hay mas stock disponible para '+product.name);
  S.cart.push(id);persist();notify('Agregado al carrito: '+product.name);render();
}
async function redeemProduct(id){
  const product=S.products.find(p=>p.id===id);
  const usr=currentUser();
  if(!product)return notify('Producto no encontrado');
  if(product.stock<=0)return notify('Producto sin stock');
  if((usr.coins||0)<product.coins)return notify('Eight-Coins insuficientes');
  usr.coins-=product.coins;usr.eightCoins=usr.coins;product.stock-=1;
  S.wallet=S.wallet||[];S.wallet.unshift({date:today(),type:'Canje tienda',amount:-product.coins,detail:product.name});
  await registerBlock('Canje Tienda Wolves: '+product.name);
  persist();notify('Canje realizado: '+product.name);render();
}
async function checkoutCart(){
  const items=cartItems();
  const usr=currentUser();
  if(!items.length)return notify('Agrega productos al carrito');
  const total=items.reduce((sum,p)=>sum+p.coins,0);
  if((usr.coins||0)<total)return notify('Eight-Coins insuficientes para confirmar el carrito');
  if(!canFulfill(items))return notify('Uno o mas productos ya no tienen stock suficiente');
  usr.coins-=total;usr.eightCoins=usr.coins;
  items.forEach(item=>{const product=S.products.find(p=>p.id===item.id);if(product)product.stock-=1;});
  S.wallet=S.wallet||[];S.wallet.unshift({date:today(),type:'Canje carrito Wolves',amount:-total,detail:items.map(p=>p.name).join(' + ')});
  await registerBlock('Canje carrito Tienda Wolves: '+items.length+' productos');
  S.cart=[];persist();notify('Carrito confirmado correctamente');render();
}
function clearCart(){S.cart=[];persist();notify('Carrito Wolves vaciado');render();}
function bindCartFinal(){
  document.querySelectorAll('.cart').forEach(btn=>btn.onclick=()=>addToCart(btn.dataset.id));
  document.querySelectorAll('.buy').forEach(btn=>btn.onclick=()=>redeemProduct(btn.dataset.id));
  document.querySelectorAll('.checkout-pop').forEach(btn=>btn.onclick=checkoutCart);
  document.querySelectorAll('.clear-pop').forEach(btn=>btn.onclick=clearCart);
}
window.addEventListener('load',()=>{
  if(typeof S==='undefined')return;
  const prev=typeof bindStudent==='function'?bindStudent:null;
  window.bindStudent=bindStudent=function(){if(prev)prev();bindCartFinal();};
  if(S.role==='student'&&active==='Tienda Wolves')render();
});
})();
