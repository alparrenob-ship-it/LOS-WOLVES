(()=>{
function notify(text){if(typeof toast==='function')toast(text);}
function persist(){if(typeof save==='function')save();}
function today(){return new Date().toISOString().slice(0,10);}
function stamp(){return new Date().toLocaleString('es-EC');}
function currentUser(){return typeof user==='function'?user():S.users.find(u=>u.email===S.currentUser)||S.users[0];}
function cartItems(){return (S.cart||[]).map(id=>S.products.find(p=>p.id===id)).filter(Boolean);}
function totalCoins(items){return items.reduce((sum,p)=>sum+p.coins,0);}
function totalUsd(items){return items.reduce((sum,p)=>sum+p.usd,0);}
function verificationCode(){return 'WLV-'+Math.random().toString(36).slice(2,8).toUpperCase();}
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
function validateItems(items){
  const usr=currentUser();
  if(!items.length){notify('Agrega productos al carrito');return false;}
  if((usr.coins||0)<totalCoins(items)){notify('Eight-Coins insuficientes para confirmar el canje');return false;}
  if(!canFulfill(items)){notify('Uno o mas productos ya no tienen stock suficiente');return false;}
  return true;
}
function openPickupModal(items){
  if(!validateItems(items))return;
  const modal=document.getElementById('pickupModal')||document.body.appendChild(Object.assign(document.createElement('dialog'),{id:'pickupModal',className:'pickup-modal'}));
  const usr=currentUser();
  modal.innerHTML=`<div class="modal-head"><div><strong>Registro de retiro en recepción</strong><span>Canje con EightCoins · Presenta tu código al retirar</span></div><button class="icon-btn pickup-close">×</button></div>
    <section class="pickup-summary">
      <div><b>Total a canjear</b><strong>${totalCoins(items).toLocaleString('es-EC')} EC</strong><span>Equivalente demo: $${totalUsd(items)} USD</span></div>
      <div><b>Productos</b><span>${items.map(p=>p.name).join(' + ')}</span></div>
    </section>
    <form id="pickupForm" class="pickup-form">
      <label>Nombre de quien retira<input id="pickupName" required value="${usr.name||''}" placeholder="Nombre completo"></label>
      <label>Curso / grado<input id="pickupGrade" required value="${usr.grade||''}" placeholder="Séptimo EGB"></label>
      <label>Correo institucional<input id="pickupEmail" type="email" required value="${usr.email||''}" placeholder="estudiante@colegio.edu.ec"></label>
      <label>Representante autorizado<input id="pickupGuardian" required placeholder="Nombre del representante o tutor"></label>
      <label>Cédula / ID de retiro<input id="pickupId" required placeholder="Documento para validar en recepción"></label>
      <label>Fecha estimada de retiro<input id="pickupDate" type="date" required value="${today()}"></label>
      <label class="full">Observación para recepción<textarea id="pickupNote" placeholder="Ej: Retira después de clases, llevar autorización del representante."></textarea></label>
      <div class="pickup-info full"><strong>Importante:</strong> al confirmar, se descuentan tus EightCoins, baja el stock y se genera un código único de verificación para recepción del colegio.</div>
      <button class="primary-btn full" type="submit">Confirmar canje y generar código</button>
    </form>`;
  modal.showModal();
  modal.querySelector('.pickup-close').onclick=()=>modal.close();
  modal.querySelector('#pickupForm').onsubmit=ev=>{ev.preventDefault();finalizeExchange(items,modal);};
}
async function finalizeExchange(items,modal){
  if(!validateItems(items))return;
  const usr=currentUser();
  const code=verificationCode();
  const coins=totalCoins(items);
  usr.coins-=coins;usr.eightCoins=usr.coins;
  items.forEach(item=>{const product=S.products.find(p=>p.id===item.id);if(product)product.stock-=1;});
  S.wallet=S.wallet||[];
  S.pickupOrders=S.pickupOrders||[];
  const order={
    code,status:'Pendiente de retiro',date:stamp(),studentName:pickupName.value,grade:pickupGrade.value,email:pickupEmail.value,
    guardian:pickupGuardian.value,documentId:pickupId.value,pickupDate:pickupDate.value,note:pickupNote.value,
    products:items.map(p=>({id:p.id,name:p.name,coins:p.coins,usd:p.usd})),totalCoins:coins,totalUsd:totalUsd(items)
  };
  S.pickupOrders.unshift(order);
  S.wallet.unshift({date:today(),type:'Canje con retiro',amount:-coins,detail:`${items.length} producto(s) · Código ${code}`});
  await registerBlock('Canje Tienda Wolves con retiro: '+code);
  S.cart=[];persist();
  modal.innerHTML=`<div class="pickup-success"><span>✓</span><h2>Canje confirmado</h2><p>Presenta este código en recepción del colegio para retirar tus productos Wolves.</p><strong>${code}</strong><div class="pickup-ticket"><p><b>Retira:</b> ${order.studentName}</p><p><b>Curso:</b> ${order.grade}</p><p><b>Productos:</b> ${items.map(p=>p.name).join(' + ')}</p><p><b>Total descontado:</b> ${coins.toLocaleString('es-EC')} EC</p><p><b>Fecha estimada:</b> ${order.pickupDate}</p></div><button class="primary-btn pickup-done">Entendido</button></div>`;
  modal.querySelector('.pickup-done').onclick=()=>{modal.close();notify('Código de retiro generado: '+code);render();};
}
function redeemProduct(id){
  const product=S.products.find(p=>p.id===id);
  if(!product)return notify('Producto no encontrado');
  openPickupModal([product]);
}
function checkoutCart(){openPickupModal(cartItems());}
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
