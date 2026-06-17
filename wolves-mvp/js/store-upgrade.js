(() => {
  const ASSET = 'assets/';
  const realImage = file => ASSET + file;

  const WOLVES_POP = [
    { name: 'Hoodie Oficial Wolves', usd: 28, coins: 2800, stock: 12, description: 'Hoodie oficial premium de la manada Wolves.', image: realImage('MATERIAL POP HOODIE.jpeg') },
    { name: 'Gorra Wolves', usd: 8, coins: 800, stock: 25, description: 'Gorra oficial de la manada con logo bordado.', image: realImage('MATERIAL POP GORRA.jpeg') },
    { name: 'Taza Wolves', usd: 8, coins: 800, stock: 30, description: 'Taza cerámica con identidad Wolves y frases motivacionales.', image: realImage('MATERIAL POP TAZA.jpeg') },
    { name: 'Agenda Emocional', usd: 8, coins: 800, stock: 22, description: 'Agenda de bienestar para seguimiento emocional escolar.', image: realImage('MATERIAL POP AGENDA.jpeg') },
    { name: 'Llavero Wolves', usd: 3, coins: 300, stock: 40, description: 'Llavero metálico con la mascota oficial de Wolves.', image: realImage('MATERIAL POP LLAVERO.jpeg') },
    { name: 'Peluche de la Manada', usd: 18, coins: 1800, stock: 18, description: 'Peluche suave de la mascota oficial de la manada.', image: realImage('MATERIAL POP PELUCHE.jpeg') }
  ];

  function pickupInline(cartItems,totalCoins,totalUsd){
    if(!cartItems.length){
      return `<section class="pickup-inline muted"><h3>Proceso de canje y retiro</h3><p>Agrega productos al carrito para activar el registro de retiro en recepción del colegio.</p><div class="pickup-steps"><span>1. Elige producto</span><span>2. Confirma con EightCoins</span><span>3. Genera código WLV</span><span>4. Retira en recepción</span></div></section>`;
    }
    const me=user();
    return `<section class="pickup-inline active"><div class="pickup-inline-head"><div><h3>Registro de retiro en recepción</h3><p>Completa estos datos antes de confirmar. Al generar el código se descuentan tus EightCoins y podrás retirar en recepción.</p></div><span>${totalCoins.toLocaleString('es-EC')} EC · $${totalUsd} USD</span></div><div class="pickup-steps"><span>1. Carrito listo</span><span>2. Datos de retiro</span><span>3. Código de verificación</span><span>4. Recepción del colegio</span></div><form class="pickup-inline-form" id="pickupInlineForm"><label>Nombre de quien retira<input id="inlinePickupName" required value="${me.name||''}" placeholder="Nombre completo"></label><label>Curso / grado<input id="inlinePickupGrade" required value="${me.grade||''}" placeholder="Séptimo EGB"></label><label>Correo institucional<input id="inlinePickupEmail" type="email" required value="${me.email||''}" placeholder="estudiante@colegio.edu.ec"></label><label>Representante autorizado<input id="inlinePickupGuardian" required placeholder="Nombre del representante o tutor"></label><label>Cédula / ID de retiro<input id="inlinePickupId" required placeholder="Documento para validar en recepción"></label><label>Fecha estimada de retiro<input id="inlinePickupDate" type="date" required value="${new Date().toISOString().slice(0,10)}"></label><label class="full">Observación para recepción<textarea id="inlinePickupNote" placeholder="Ej: Retira después de clases, llevar autorización del representante."></textarea></label><div class="pickup-info full"><strong>Importante:</strong> al confirmar, se descuenta el total en EightCoins, baja el stock, se registra en Wallet y Blockchain, y se genera un código tipo WLV-ABC123.</div><button class="primary-btn full pickup-inline-submit" type="submit">Confirmar canje y generar código</button></form></section>`;
  }

  window.addEventListener('load', () => {
    if (typeof S === 'undefined') return;
    const old = new Map((S.products || []).map(product => [product.name, product]));
    S.products = WOLVES_POP.map(product => ({
      id: old.get(product.name)?.id || Math.random().toString(36).slice(2, 9),
      ...product,
      stock: old.get(product.name)?.stock ?? product.stock
    }));
    const demo = S.users?.find(person => person.email === 'estudiante@colegio.edu.ec');
    if (demo && demo.coins < 1260) demo.coins = 1260;

    window.store = function storeUpgrade() {
      const cartItems = S.cart.map(id => S.products.find(product => product.id === id)).filter(Boolean);
      const totalCoins = cartItems.reduce((sum, product) => sum + product.coins, 0);
      const totalUsd = cartItems.reduce((sum, product) => sum + product.usd, 0);
      const cartList = cartItems.length
        ? `<div class="cart-items-grid">${cartItems.map(product => `<div class="cart-item"><img src="${product.image}" alt="${product.name}"><div><strong>${product.name}</strong><span>$${product.usd} USD · ${product.coins.toLocaleString('es-EC')} EC</span></div></div>`).join('')}</div>`
        : '<p class="empty-cart">Carrito vacío. Agrega productos Wolves para simular el canje.</p>';
      return `<section class="store-layout-upgrade">
        <article class="card store-products-card">
          <div class="store-head"><div><h3>Tienda Wolves</h3><p>Canjea tus Eight-Coins por merchandise oficial de la manada.</p></div><span class="coin">${user().coins.toLocaleString('es-EC')} EC disponibles</span></div>
          <div class="product-grid store-expanded-grid">${S.products.map(product => `<div class="module product-card"><img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy"><div class="product-body"><h3>${product.name}</h3><p>${product.description}</p><div class="product-meta"><span>$${product.usd} USD</span><span>${product.coins.toLocaleString('es-EC')} EC</span><span>Stock: ${product.stock}</span></div><div class="product-actions"><button class="ghost-btn cart" data-id="${product.id}">Agregar al carrito</button><button class="primary-btn buy" data-id="${product.id}">Canjear ahora</button></div></div></div>`).join('')}</div>
        </article>
        <article class="card cart-panel cart-panel-bottom">
          <div class="cart-head"><div><h3>Carrito Wolves</h3><p>Revisa tu selección, completa el registro y genera tu código para recepción.</p></div><div class="cart-totals"><span>Total USD: $${totalUsd}</span><span>Total EC: ${totalCoins.toLocaleString('es-EC')} EC</span></div></div>
          ${cartList}
          <div class="cart-actions"><button class="primary-btn checkout-pop">Abrir registro de retiro</button><button class="ghost-btn clear-pop">Vaciar carrito</button></div>
          ${pickupInline(cartItems,totalCoins,totalUsd)}
        </article>
      </section>`;
    };

    const originalBindStudent = window.bindStudent;
    window.bindStudent = function bindStudentUpgrade() {
      originalBindStudent();
      document.querySelectorAll('.cart').forEach(button => button.onclick = () => {
        S.cart.push(button.dataset.id);
        toast('Producto agregado al carrito');
        save();
        render();
      });
      document.querySelectorAll('.buy').forEach(button => button.onclick = async () => {
        const product = S.products.find(item => item.id === button.dataset.id);
        if (!product || product.stock <= 0) return toast('Producto sin stock');
        S.cart = [product.id];
        toast('Producto listo para registro de retiro');
        save();
        render();
      });
      const checkout = document.querySelector('.checkout-pop');
      if (checkout) checkout.onclick = () => {
        const form = document.getElementById('pickupInlineForm');
        if(form) form.scrollIntoView({behavior:'smooth',block:'center'});
        else toast('Agrega productos al carrito');
      };
      const clear = document.querySelector('.clear-pop');
      if (clear) clear.onclick = () => {
        S.cart = [];
        toast('Carrito vacío');
        save();
        render();
      };
    };

    save();
    render();
  });
})();
