(() => {
  const ASSET = 'assets/';
  const realImage = file => ASSET + file;

  const WOLVES_POP = [
    { name: 'Gorra Wolves Edición Limitada', usd: 18, coins: 800, stock: 25, description: 'Gorra oficial de la manada con logo bordado.', image: realImage('MATERIAL POP GORRA.jpeg') },
    { name: 'Hoodie Wolves Premium', usd: 38, coins: 2000, stock: 12, description: 'Sudadera oficial de alta calidad con diseño exclusivo Wolves.', image: realImage('MATERIAL POP HOODIE.jpeg') },
    { name: 'Llavero Lobo Mascota', usd: 6, coins: 300, stock: 40, description: 'Llavero metálico con la mascota oficial de Wolves.', image: realImage('MATERIAL POP LLAVERO.jpeg') },
    { name: 'Peluche Lobo Wolves', usd: 28, coins: 1200, stock: 18, description: 'Peluche suave de la mascota oficial de la manada.', image: realImage('MATERIAL POP PELUCHE.jpeg') },
    { name: 'Taza Wolves Manada', usd: 12, coins: 500, stock: 30, description: 'Taza cerámica con identidad Wolves y frases motivacionales.', image: realImage('MATERIAL POP TAZA.jpeg') },
    { name: 'Agenda Emocional Wolves', usd: 15, coins: 600, stock: 22, description: 'Agenda de bienestar para seguimiento emocional escolar.', image: realImage('MATERIAL POP LLAVERO.jpeg') }
  ];

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
      return `<section class="dashboard-grid"><article class="card wide"><div class="store-head"><div><h3>Tienda Wolves</h3><p>Canjea tus Eight-Coins por merchandise oficial de la manada.</p></div><span class="coin">${user().coins.toLocaleString('es-EC')} EC disponibles</span></div><div class="product-grid">${S.products.map(product => `<div class="module product-card"><img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy"><div class="product-body"><h3>${product.name}</h3><p>${product.description}</p><div class="product-meta"><span>$${product.usd} USD</span><span>Stock: ${product.stock}</span></div><p class="coin price">${product.coins.toLocaleString('es-EC')} EC</p><div class="product-actions"><button class="ghost-btn cart" data-id="${product.id}">Agregar al carrito</button><button class="primary-btn buy" data-id="${product.id}">Canjear</button></div></div></div>`).join('')}</div></article><article class="card cart-panel"><h3>Carrito Wolves</h3>${cartItems.map(product => `<p class="pill">${product.name}<br>$${product.usd} USD · ${product.coins.toLocaleString('es-EC')} EC</p>`).join('') || '<p>Carrito vacío.</p>'}<p>Total USD: $${totalUsd}</p><p>Total EC: ${totalCoins.toLocaleString('es-EC')} EC</p><button class="primary-btn checkout-pop">Confirmar carrito</button><button class="ghost-btn clear-pop">Vaciar carrito</button></article></section>`;
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
        if (user().coins < product.coins) return toast('Eight-Coins insuficientes');
        user().coins -= product.coins;
        product.stock -= 1;
        S.wallet.unshift({ date: new Date().toISOString().slice(0, 10), type: 'Canje', amount: -product.coins, detail: product.name });
        await block('Canje Tienda Wolves: ' + product.name);
        toast('Canje realizado: ' + product.name);
        save();
        render();
      });
      const checkout = document.querySelector('.checkout-pop');
      if (checkout) checkout.onclick = async () => {
        const items = S.cart.map(id => S.products.find(product => product.id === id)).filter(Boolean);
        const total = items.reduce((sum, product) => sum + product.coins, 0);
        if (!items.length) return toast('Agrega productos al carrito');
        if (user().coins < total) return toast('Eight-Coins insuficientes');
        if (items.some(product => product.stock <= 0)) return toast('Hay productos sin stock');
        user().coins -= total;
        items.forEach(product => product.stock -= 1);
        S.wallet.unshift({ date: new Date().toISOString().slice(0, 10), type: 'Canje carrito', amount: -total, detail: items.length + ' productos Wolves' });
        await block('Canje carrito Tienda Wolves');
        S.cart = [];
        toast('Carrito canjeado correctamente');
        save();
        render();
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
