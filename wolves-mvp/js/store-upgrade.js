(() => {
  const popSvg = (title, accent, icon) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 340"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#0477d9"/><stop offset="1" stop-color="#4d2a83"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#00152f" flood-opacity=".55"/></filter></defs><rect width="640" height="340" rx="22" fill="url(#g)"/><text x="24" y="36" fill="#9eeeff" font-family="Arial" font-weight="900" font-size="24">WOLVES</text><circle cx="320" cy="164" r="92" fill="#061024" opacity=".32"/><text x="320" y="184" text-anchor="middle" font-family="Arial" font-size="94" filter="url(#s)">${icon}</text><path d="M440 132 L566 96" stroke="#fff" stroke-width="2" opacity=".8"/><circle cx="566" cy="96" r="4" fill="#fff"/><text x="462" y="128" fill="#fff" font-family="Arial" font-size="25">${accent}</text><text x="320" y="305" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="900" font-size="32">${title}</text></svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const WOLVES_POP = [
    { name: 'Gorra Wolves Edición Limitada', coins: 800, stock: 25, description: 'Gorra oficial de la manada con logo bordado.', image: popSvg('GORRA WOLVES', 'Gorra', '🧢') },
    { name: 'Hoodie Wolves Premium', coins: 2000, stock: 12, description: 'Sudadera oficial de alta calidad con diseño exclusivo.', image: popSvg('HOODIE WOLVES', 'Hoodie', '👕') },
    { name: 'Llavero Lobo Mascota', coins: 300, stock: 40, description: 'Llavero metálico con la mascota oficial de Wolves.', image: popSvg('LLAVERO WOLVES', 'Llavero', '🐺') },
    { name: 'Peluche Lobo Wolves', coins: 1200, stock: 18, description: 'Peluche suave de la mascota de la manada.', image: popSvg('PELUCHE WOLVES', 'Peluche', '🧸') },
    { name: 'Taza Wolves Manada', coins: 500, stock: 30, description: 'Taza cerámica con frases motivacionales de la manada.', image: popSvg('TAZA WOLVES', 'Taza', '☕') },
    { name: 'Agenda Wolves 2025', coins: 600, stock: 22, description: 'Agenda personalizada con tips de bienestar emocional.', image: popSvg('AGENDA WOLVES', 'Agenda', '📘') }
  ];

  window.addEventListener('load', () => {
    if (typeof S === 'undefined') return;
    const old = new Map((S.products || []).map(product => [product.name, product]));
    S.products = WOLVES_POP.map(product => ({ id: old.get(product.name)?.id || Math.random().toString(36).slice(2, 9), usd: 0, ...product, stock: old.get(product.name)?.stock ?? product.stock }));
    const demo = S.users?.find(person => person.email === 'estudiante@colegio.edu.ec');
    if (demo && demo.coins < 1260) demo.coins = 1260;

    window.store = function storeUpgrade() {
      const cartItems = S.cart.map(id => S.products.find(product => product.id === id)).filter(Boolean);
      const total = cartItems.reduce((sum, product) => sum + product.coins, 0);
      return `<section class="dashboard-grid"><article class="card wide"><div class="store-head"><div><h3>Tienda Wolves</h3><p>Canjea tus Eight-Coins por merchandise exclusivo de la manada.</p></div><span class="coin">${user().coins.toLocaleString('es-EC')} EC disponibles</span></div><div class="product-grid">${S.products.map(product => `<div class="module product-card"><img class="product-image" src="${product.image}" alt="${product.name}"><div class="product-body"><h3>${product.name}</h3><p>${product.description}</p><p class="coin price">${product.coins.toLocaleString('es-EC')} EC</p><p>Stock: ${product.stock}</p><div class="product-actions"><button class="ghost-btn cart" data-id="${product.id}">Agregar al carrito</button><button class="primary-btn buy" data-id="${product.id}">Canjear</button></div></div></div>`).join('')}</div></article><article class="card"><h3>Carrito</h3>${cartItems.map(product => `<p class="pill">${product.name} · ${product.coins.toLocaleString('es-EC')} EC</p>`).join('') || '<p>Carrito vacío.</p>'}<p>Total: ${total.toLocaleString('es-EC')} EC</p><button class="primary-btn checkout-pop">Confirmar carrito</button><button class="ghost-btn clear-pop">Vaciar carrito</button></article></section>`;
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
