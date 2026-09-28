// --- DATOS INICIALES DE PIÑATERÍA SUPER FIESTAS ---
let products = [
  { id: 101, name: 'Piñata Combo Super Fiestas (Personalizada)', category: 'Piñatas', price: 65000, stock: 12, icon: '🪅' },
  { id: 102, name: 'Piñata Tambor Temática Vengadores', category: 'Piñatas', price: 48000, stock: 3, icon: '🛡️' },
  { id: 103, name: 'Surtido Relleno Dulces & Juguetes x3 Kg', category: 'Rellenos & Dulces', price: 55000, stock: 25, icon: '🍬' },
  { id: 104, name: 'Chupetón Relleno Sorpresa Party x50', category: 'Rellenos & Dulces', price: 22000, stock: 2, icon: '🍭' },
  { id: 105, name: 'Arco Orgánico Globos Neón (120 pzs)', category: 'Globos & Arreglos', price: 42000, stock: 18, icon: '🎈' },
  { id: 106, name: 'Set Globos Número Metalizados 80cm', category: 'Globos & Arreglos', price: 15000, stock: 40, icon: '✨' },
  { id: 107, name: 'Combo Vajilla Biodegradable x24 pers.', category: 'Vajilla & Desechables', price: 28000, stock: 15, icon: '🍽️' },
  { id: 108, name: 'Mantel Plástico Temático Super Fiestas', category: 'Vajilla & Desechables', price: 12000, stock: 30, icon: '🎪' }
];

let orders = [
  { id: 'ORD-501', customer: 'María Camila Rojas', items: 'Piñata Combo Super Fiestas + Surtido Dulces', total: 120000, status: 'Pendiente' },
  { id: 'ORD-502', customer: 'Carlos Andrés Perez', items: 'Arco Orgánico Globos Neón', total: 42000, status: 'En Preparación' },
  { id: 'ORD-503', customer: 'Distribuidora Eventos Tolima', items: '5x Combo Vajilla Biodegradable', total: 140000, status: 'Entregado' }
];

let customers = [
  { name: 'María Camila Rojas', contact: '+57 315 234 5678', ordersCount: 4, totalSpent: 380000, level: 'VIP 🎉' },
  { name: 'Carlos Andrés Perez', contact: '+57 310 987 6543', ordersCount: 1, totalSpent: 42000, level: 'Nuevo' },
  { name: 'Distribuidora Eventos Tolima', contact: 'eventos@tolima.com', ordersCount: 12, totalSpent: 1850000, level: 'Mayorista 🌟' }
];

let categoryChartObj = null;
let stockChartObj = null;

// --- INICIALIZACIÓN Y AUTENTICACIÓN ---
function handleAdminAuth(event) {
  event.preventDefault();
  const role = document.getElementById('adminRole').value;
  const email = document.getElementById('adminEmail').value;
  const name = email.split('@')[0];

  document.getElementById('adminUserName').textContent = name.toUpperCase();
  document.getElementById('adminRoleName').textContent = role;
  document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();

  document.getElementById('adminAuthContainer').style.display = 'none';
  document.getElementById('adminApp').style.display = 'flex';

  initDashboardCharts();
  renderAllData();
  showToast('¡Bienvenido al sistema Super Fiestas!');
}

function adminLogout() {
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('adminAuthContainer').style.display = 'flex';
}

// --- NAVEGACIÓN ---
function switchSection(sectionId, element) {
  document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

  document.getElementById(sectionId).style.display = 'block';
  element.classList.add('active');

  const titles = {
    'dashboardSection': 'Panel Principal',
    'inventorySection': 'Gestión de Inventario',
    'ordersSection': 'Control de Pedidos',
    'customersSection': 'Directorio de Clientes'
  };
  document.getElementById('sectionTitle').textContent = titles[sectionId];
}

// --- RENDERIZADO GENERAL ---
function renderAllData() {
  renderMetrics();
  renderInventoryTable();
  renderOrdersTable();
  renderCustomersTable();
  updateCharts();
}

function renderMetrics() {
  document.getElementById('metricProducts').textContent = products.length;
  
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  document.getElementById('metricAlerts').textContent = lowStockCount;
  document.getElementById('stockAlertBadge').textContent = `⚠️ ${lowStockCount} Bajo Stock`;
}

// --- TABLA DE INVENTARIO (CRUD) ---
function renderInventoryTable() {
  const tbody = document.getElementById('inventoryTableBody');
  const search = document.getElementById('invSearch')?.value.toLowerCase() || '';
  const category = document.getElementById('invCatFilter')?.value || 'Todas';

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search);
    const matchCat = category === 'Todas' || p.category === category;
    return matchSearch && matchCat;
  });

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <div class="table-product">
          <span class="table-product-icon">${p.icon}</span>
          <span>${p.name}</span>
        </div>
      </td>
      <td>${p.category}</td>
      <td><strong>$ ${p.price.toLocaleString()} COP</strong></td>
      <td>${p.stock} unidades</td>
      <td>
        ${p.stock <= 5 
          ? '<span class="status-badge status-low">Bajo Stock</span>' 
          : '<span class="status-badge status-normal">Disponible</span>'}
      </td>
      <td>
        <button class="action-btn" title="Editar" onclick="editProduct(${p.id})">✏️</button>
        <button class="action-btn" title="Eliminar" onclick="deleteProduct(${p.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// --- ACCIONES CRUD ---
function openProductModal() {
  document.getElementById('productForm').reset();
  document.getElementById('prodId').value = '';
  document.getElementById('modalTitle').textContent = 'Nuevo Producto';
  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

function saveProduct(event) {
  event.preventDefault();
  const id = document.getElementById('prodId').value;
  const name = document.getElementById('prodName').value;
  const category = document.getElementById('prodCategory').value;
  const icon = document.getElementById('prodIcon').value;
  const price = parseFloat(document.getElementById('prodPrice').value);
  const stock = parseInt(document.getElementById('prodStock').value);

  if (id) {
    // Editar
    const index = products.findIndex(p => p.id == id);
    products[index] = { id: parseInt(id), name, category, icon, price, stock };
    showToast('Producto actualizado correctamente');
  } else {
    // Crear
    const newId = Date.now();
    products.push({ id: newId, name, category, icon, price, stock });
    showToast('Nuevo producto agregado a la piñatería');
  }

  closeProductModal();
  renderAllData();
}

function editProduct(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  document.getElementById('prodId').value = p.id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodCategory').value = p.category;
  document.getElementById('prodIcon').value = p.icon;
  document.getElementById('prodPrice').value = p.price;
  document.getElementById('prodStock').value = p.stock;

  document.getElementById('modalTitle').textContent = 'Editar Producto';
  document.getElementById('productModal').classList.add('open');
}

function deleteProduct(id) {
  if (confirm('¿Estás seguro de eliminar este producto del inventario?')) {
    products = products.filter(p => p.id !== id);
    renderAllData();
    showToast('Producto eliminado');
  }
}

// --- TABLA DE PEDIDOS ---
function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}</td>
      <td>${o.items}</td>
      <td>$ ${o.total.toLocaleString()} COP</td>
      <td>
        <span class="status-badge ${o.status === 'Entregado' ? 'status-completed' : 'status-pending'}">
          ${o.status}
        </span>
      </td>
      <td>
        <select onchange="changeOrderStatus('${o.id}', this.value)" class="form-control" style="padding:2px 6px; font-size:0.8rem;">
          <option value="Pendiente" ${o.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En Preparación" ${o.status === 'En Preparación' ? 'selected' : ''}>En Preparación</option>
          <option value="Entregado" ${o.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function changeOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    renderOrdersTable();
    showToast(`Pedido ${orderId} actualizado a: ${newStatus}`);
  }
}

// --- TABLA DE CLIENTES ---
function renderCustomersTable() {
  const tbody = document.getElementById('customersTableBody');
  tbody.innerHTML = customers.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.contact}</td>
      <td>${c.ordersCount} pedidos</td>
      <td>$ ${c.totalSpent.toLocaleString()} COP</td>
      <td><span class="status-badge status-normal">${c.level}</span></td>
    </tr>
  `).join('');
}

// --- GRÁFICAS DE CHART.JS ---
function initDashboardCharts() {
  const ctx1 = document.getElementById('categoryChart').getContext('2d');
  categoryChartObj = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Piñatas', 'Rellenos', 'Globos', 'Vajilla'],
      datasets: [{
        label: 'Ventas (COP)',
        data: [420000, 280000, 310000, 190000],
        backgroundColor: '#E60067'
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  const ctx2 = document.getElementById('stockChart').getContext('2d');
  stockChartObj = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Stock Normal', 'Bajo Stock'],
      datasets: [{
        data: [6, 2],
        backgroundColor: ['#10B981', '#EF4444']
      }]
    },
    options: { responsive: true }
  });
}

function updateCharts() {
  if (!categoryChartObj || !stockChartObj) return;

  const normalStock = products.filter(p => p.stock > 5).length;
  const lowStock = products.filter(p => p.stock <= 5).length;

  stockChartObj.data.datasets[0].data = [normalStock, lowStock];
  stockChartObj.update();
}

// --- TOASTS DE NOTIFICACIÓN ---
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}