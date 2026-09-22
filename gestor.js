// Carga del encabezado reutilizable mediante fetch
document.addEventListener('DOMContentLoaded', () => {
  fetch('header.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('header-container').innerHTML = data;
    })
    .catch(() => console.log('header.html no encontrado localmente.'));
  
  renderAll();
});

// BASE DE DATOS INICIAL DE INVENTARIO
let inventory = [
  { id: 101, name: 'Piñata Combo Super Fiestas', category: 'Piñatas', price: 65000, stock: 12, minStock: 5, icon: '🪅' },
  { id: 102, name: 'Piñata Tambor Temática Vengadores', category: 'Piñatas', price: 48000, stock: 2, minStock: 5, icon: '🛡️' },
  { id: 103, name: 'Surtido Relleno Dulces x3 Kg', category: 'Rellenos & Dulces', price: 55000, stock: 25, minStock: 10, icon: '🍬' },
  { id: 104, name: 'Chupetón Relleno Sorpresa x50', category: 'Rellenos & Dulces', price: 22000, stock: 3, minStock: 8, icon: '🍭' },
  { id: 105, name: 'Arco Orgánico Globos Neón', category: 'Globos & Arreglos', price: 42000, stock: 18, minStock: 6, icon: '🎈' }
];

let movementsHistory = [
  { date: '2026-09-22 08:30', type: 'Entrada', productName: 'Piñata Combo Super Fiestas', qty: 10, user: 'Gestor Inventario', note: 'Compra Proveedor #402' },
  { date: '2026-09-22 09:15', type: 'Salida', productName: 'Chupetón Relleno Sorpresa x50', qty: 2, user: 'Ventas Mostrador', note: 'Venta #ORD-501' }
];

// RENDER GENERAL Y MÉTRICAS
function renderAll() {
  renderMetrics();
  renderStockTable();
  renderMovementsTable();
  renderAlertsTable();
}

function renderMetrics() {
  document.getElementById('metricTotalProducts').textContent = inventory.length;
  const lowStock = inventory.filter(p => p.stock <= p.minStock).length;
  document.getElementById('metricLowStock').textContent = lowStock;

  const inQty = movementsHistory.filter(m => m.type === 'Entrada').reduce((acc, curr) => acc + curr.qty, 0);
  const outQty = movementsHistory.filter(m => m.type === 'Salida').reduce((acc, curr) => acc + curr.qty, 0);

  document.getElementById('metricInMovements').textContent = inQty;
  document.getElementById('metricOutMovements').textContent = outQty;
}

// RENDER TABLA DE STOCK
function renderStockTable() {
  const tbody = document.getElementById('stockTableBody');
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;

  const filtered = inventory.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search) || p.id.toString().includes(search);
    const matchCat = category === 'Todas' || p.category === category;
    return matchSearch && matchCat;
  });

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td><strong>${p.icon} ${p.name}</strong></td>
      <td>${p.category}</td>
      <td>$ ${p.price.toLocaleString()} COP</td>
      <td>${p.minStock} u.</td>
      <td><strong>${p.stock} u.</strong></td>
      <td>
        ${p.stock <= p.minStock 
          ? '<span class="badge badge-low">Bajo Stock</span>' 
          : '<span class="badge badge-ok">Suficiente</span>'}
      </td>
      <td>
        <button class="btn-secondary" style="padding: 4px 8px;" onclick="editProduct(${p.id})">✏️</button>
      </td>
    </tr>
  `).join('');
}

// RENDER TABLA DE MOVIMIENTOS
function renderMovementsTable() {
  const tbody = document.getElementById('movementsTableBody');
  tbody.innerHTML = movementsHistory.map(m => `
    <tr>
      <td>${m.date}</td>
      <td>
        <span class="badge ${m.type === 'Entrada' ? 'badge-in' : 'badge-out'}">${m.type}</span>
      </td>
      <td>${m.productName}</td>
      <td><strong>${m.qty} u.</strong></td>
      <td>${m.user}</td>
      <td>${m.note}</td>
    </tr>
  `).join('');
}

// RENDER TABLA DE ALERTAS
function renderAlertsTable() {
  const tbody = document.getElementById('alertsTableBody');
  const critical = inventory.filter(p => p.stock <= p.minStock);

  tbody.innerHTML = critical.map(p => {
    const suggested = p.minStock * 3;
    const toOrder = suggested - p.stock;
    return `
      <tr>
        <td><strong>${p.icon} ${p.name}</strong></td>
        <td>${p.category}</td>
        <td><span class="badge badge-low">${p.stock} u.</span></td>
        <td>${suggested} u.</td>
        <td><strong>${toOrder} u.</strong></td>
        <td>
          <button class="btn-primary" style="padding: 4px 8px;" onclick="quickRestock(${p.id}, ${toOrder})">📦 Cargar Pedido</button>
        </td>
      </tr>
    `;
  }).join('');
}

// REABASTECIMIENTO RÁPIDO DESDE ALERTAS
function quickRestock(id, qty) {
  const prod = inventory.find(p => p.id === id);
  if (prod) {
    prod.stock += qty;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    movementsHistory.unshift({
      date: now,
      type: 'Entrada',
      productName: prod.name,
      qty: qty,
      user: 'Gestor Inventario',
      note: 'Reabastecimiento de emergencia'
    });
    renderAll();
  }
}

// CAMBIO DE PESTAÑAS INTERNAS
function switchSection(sectionId) {
  document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(sectionId).style.display = 'block';
  
  if(sectionId === 'stockSection') document.getElementById('tabStock').classList.add('active');
  if(sectionId === 'movementsSection') document.getElementById('tabMovements').classList.add('active');
  if(sectionId === 'alertsSection') document.getElementById('tabAlerts').classList.add('active');
}

// MANEJO DE MODALES
function openProductModal() {
  document.getElementById('prodId').value = '';
  document.getElementById('modalProductTitle').textContent = 'Nuevo Producto';
  document.getElementById('productModal').classList.add('open');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

function saveProduct(event) {
  event.preventDefault();
  const id = document.getElementById('prodId').value;
  const name = document.getElementById('prodName').value;
  const category = document.getElementById('prodCategory').value;
  const icon = document.getElementById('prodIcon').value;
  const price = parseFloat(document.getElementById('prodPrice').value);
  const minStock = parseInt(document.getElementById('prodMinStock').value);
  const stock = parseInt(document.getElementById('prodStock').value);

  if (id) {
    const idx = inventory.findIndex(p => p.id == id);
    inventory[idx] = { ...inventory[idx], name, category, icon, price, minStock, stock };
  } else {
    inventory.push({ id: Date.now(), name, category, price, stock, minStock, icon });
  }

  closeModal('productModal');
  renderAll();
}

function editProduct(id) {
  const p = inventory.find(item => item.id === id);
  if (!p) return;

  document.getElementById('prodId').value = p.id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodCategory').value = p.category;
  document.getElementById('prodIcon').value = p.icon;
  document.getElementById('prodPrice').value = p.price;
  document.getElementById('prodMinStock').value = p.minStock;
  document.getElementById('prodStock').value = p.stock;

  document.getElementById('modalProductTitle').textContent = 'Editar Producto';
  document.getElementById('productModal').classList.add('open');
}

// REGISTRAR MOVIMIENTO (ENTRADA / SALIDA)
function openMovementModal(type) {
  document.getElementById('movementType').value = type;
  document.getElementById('movementModalTitle').textContent = type === 'entrada' ? '➕ Registrar Entrada de Stock' : '➖ Registrar Salida / Despacho';
  
  const select = document.getElementById('movementProductSelect');
  select.innerHTML = inventory.map(p => `<option value="${p.id}">${p.icon} ${p.name} (Actual: ${p.stock})</option>`).join('');

  document.getElementById('movementModal').classList.add('open');
}

function saveMovement(event) {
  event.preventDefault();
  const type = document.getElementById('movementType').value === 'entrada' ? 'Entrada' : 'Salida';
  const prodId = parseInt(document.getElementById('movementProductSelect').value);
  const qty = parseInt(document.getElementById('movementQuantity').value);
  const note = document.getElementById('movementNote').value || 'Sin observaciones';

  const prod = inventory.find(p => p.id === prodId);

  if (prod) {
    if (type === 'Salida' && prod.stock < qty) {
      alert('Error: La cantidad a despachar supera el stock disponible.');
      return;
    }

    prod.stock = type === 'Entrada' ? prod.stock + qty : prod.stock - qty;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    movementsHistory.unshift({
      date: now,
      type: type,
      productName: prod.name,
      qty: qty,
      user: 'Gestor Inventario',
      note: note
    });

    closeModal('movementModal');
    renderAll();
  }
}