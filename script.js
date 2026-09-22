// --- BASE DE DATOS LOCAL DE PRODUCTOS ---
const products = [
  { id: 1, name: 'Piñata Unicornio Gigante', category: 'Piñatas', price: 15000, icon: '🦄', tag: 'Más Vendido' },
  { id: 2, name: 'Piñata Castillo de Princesa', category: 'Piñatas', price: 20000, icon: '🏰', tag: 'Nuevo' },
  { id: 3, name: 'Set Globos Metalizados x10', category: 'Globos', price: 10000, icon: '🎈', tag: null },
  { id: 4, name: 'Arco de Globos Pastel (100 pzs)', category: 'Globos', price: 45000, icon: '🎨', tag: 'Oferta' },
  { id: 5, name: 'Surtido de Dulces x2 Kg', category: 'Dulcería', price: 10000, icon: '🍬', tag: 'Popular' },
  { id: 6, name: 'Chocolates & Chupetas Party', category: 'Dulcería', price: 28000, icon: '🍫', tag: null },
  { id: 7, name: 'Platos y Vasos Temáticos x24', category: 'Desechables', price: 25000, icon: '🍽️', tag: null },
  { id: 8, name: 'Gemas & Confeti Metalizado', category: 'Desechables', price: 12000, icon: '✨', tag: null }
];

let cart = [];
let activeCategory = 'Todas';

// --- CONTROL DE PESTAÑAS Y AUTENTICACIÓN ---
function switchAuthTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('formLogin').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('formRegister').style.display = tab === 'register' ? 'block' : 'none';
}

function handleAuth(event, type) {
  event.preventDefault();
  const username = type === 'login' ? 'Cliente' : (document.getElementById('regName').value || 'Usuario');
  enterApp(username);
}

function loginDemo() {
  enterApp('Invitado Mágico');
}

function enterApp(name) {
  document.getElementById('userNameDisplay').textContent = name;
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appScreen').style.display = 'flex';
  renderProducts();
}

function logout() {
  document.getElementById('appScreen').style.display = 'none';
  document.getElementById('authContainer').style.display = 'flex';
  cart = [];
  updateCartUI();
}

// --- CATALOGO Y FILTROS ---
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  
  const filtered = products.filter(p => {
    const matchesCategory = activeCategory === 'Todas' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">No se encontraron productos.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-img-wrapper">
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
        <span>${p.icon}</span>
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h4 class="product-name">${p.name}</h4>
        <div class="product-footer">
          <span class="product-price">$${p.price.toLocaleString()} COP</span>
          <button class="add-btn" onclick="addToCart(${p.id})">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCategory(cat, btn = null) {
  activeCategory = cat;
  if (btn) {
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
  }
  renderProducts();
}

function filterProducts() {
  renderProducts();
}

// --- CARRITO DE COMPRAS ---
function addToCart(productId) {
  const item = products.find(p => p.id === productId);
  cart.push(item);
  updateCartUI();
}

function updateCartUI() {
  document.getElementById('cartBadge').textContent = cart.length;
  
  const cartItemsContainer = document.getElementById('cartItems');
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px 0;">El carrito está vacío 🪹</p>`;
  } else {
    cartItemsContainer.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <span class="cart-item-icon">${item.icon}</span>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toLocaleString()} COP</div>
        </div>
        <button class="btn-logout" onclick="removeFromCart(${index})">Eliminar</button>
      </div>
    `).join('');
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById('cartTotalAmount').textContent = `$${total.toLocaleString()} COP`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

function checkout() {
  if (cart.length === 0) {
    alert('Agrega al menos un producto al carrito para finalizar la compra.');
    return;
  }
  alert('¡Gracias por tu pedido en Piñatería Mágica! 🎉 Te contactaremos pronto.');
  cart = [];
  updateCartUI();
  toggleCart();
}