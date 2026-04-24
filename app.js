// ===== MAESTRANZA R.S spa — Sistema de Gestión Profesional v3 =====
const STORAGE_WORKS = 'maestranza_rs_trabajos';
const STORAGE_PURCHASES = 'maestranza_rs_compras';
const STORAGE_CLIENTS = 'maestranza_rs_clientes';
const STORAGE_OT = 'maestranza_rs_ot_counter';
const IVA_RATE = 0.19;
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const ESTADO_LABELS = { pendiente: 'Pendiente', en_progreso: 'En Progreso', terminado: 'Terminado' };
const PAGO_LABELS = { pendiente: 'Pendiente', parcial: 'Parcial', pagado: 'Pagado' };
const METODO_LABELS = { efectivo: 'Efectivo', debito: 'T. Débito', credito: 'T. Crédito', transferencia: 'Transfer.', cheque: 'Cheque' };
const _U = atob('cmljaGk='), _P = atob('UmljaGFyZCQxOTg5');

// ===== HELPERS =====
const get = (k) => JSON.parse(localStorage.getItem(k) || '[]');
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const getWorks = () => get(STORAGE_WORKS);
const saveWorks = (w) => save(STORAGE_WORKS, w);
const getPurchases = () => get(STORAGE_PURCHASES);
const savePurchases = (p) => save(STORAGE_PURCHASES, p);
const getClients = () => get(STORAGE_CLIENTS);
const saveClients = (c) => save(STORAGE_CLIENTS, c);
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const $ = (id) => document.getElementById(id);
function formatMoney(n) { return '$' + Math.round(n).toLocaleString('es-CL'); }
function formatDate(s) { if (!s) return '--'; const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; }
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function showToast(msg) {
    const old = document.querySelector('.toast'); if (old) old.remove();
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = `<span class="toast-icon">✓</span> ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => { t.classList.add('toast-out'); setTimeout(() => t.remove(), 300); }, 2500);
}

function migrateWork(w) {
    if (!w.estado) w.estado = 'pendiente';
    if (!w.estadoPago) w.estadoPago = 'pendiente';
    if (w.montoAbonado === undefined) w.montoAbonado = 0;
    if (!w.ot) w.ot = '';
    if (!w.metodoPago) w.metodoPago = '';
    if (!w.notas) w.notas = '';
    return w;
}

function getNextOT() {
    let counter = parseInt(localStorage.getItem(STORAGE_OT) || '0');
    counter++;
    localStorage.setItem(STORAGE_OT, counter.toString());
    return 'OT-' + counter.toString().padStart(4, '0');
}

function peekNextOT() {
    const counter = parseInt(localStorage.getItem(STORAGE_OT) || '0');
    return 'OT-' + (counter + 1).toString().padStart(4, '0');
}

// ===== AUTH =====
function checkSession() { return localStorage.getItem('maestranza_auth') === 'true'; }
function doLogin(u, p) { if (u === _U && p === _P) { localStorage.setItem('maestranza_auth', 'true'); return true; } return false; }
function doLogout() { localStorage.removeItem('maestranza_auth'); location.reload(); }
function showApp() { $('login-screen').style.display = 'none'; $('app').style.display = 'flex'; initApp(); }

// ===== NAVIGATION =====
function switchTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelector(`.nav-tab[data-tab="${tabId}"]`).classList.add('active');
    $(`tab-${tabId}`).classList.add('active');
    if (tabId === 'inicio') renderDashboard();
    if (tabId === 'iva') renderIVA();
    if (tabId === 'stats') renderCharts();
    if (tabId === 'clientes') renderClients();
    if (tabId === 'trabajos') { renderWorks(); $('ot-preview').textContent = 'Se asignará: ' + peekNextOT(); }
}

// ===== DASHBOARD =====
function renderDashboard() {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Buenos días 👋' : hour < 19 ? 'Buenas tardes 👋' : 'Buenas noches 🌙';
    $('dash-greeting').textContent = greeting;
    $('dash-date').textContent = now.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const works = getWorks().map(migrateWork), purchases = getPurchases(), clients = getClients();
    const activos = works.filter(w => w.estado !== 'terminado');
    const porCobrar = works.filter(w => w.estadoPago !== 'pagado').reduce((s, w) => {
        const total = w.montoNeto + w.montoNeto * IVA_RATE;
        return s + total - (w.montoAbonado || 0);
    }, 0);
    const mesActual = works.filter(w => { const d = new Date(w.fechaEntrega); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const ingresosMes = mesActual.reduce((s, w) => s + w.montoNeto + w.montoNeto * IVA_RATE, 0);

    $('d-clientes').textContent = clients.length;
    $('d-activos').textContent = activos.length;
    $('d-cobrar').textContent = formatMoney(porCobrar);
    $('d-mes').textContent = formatMoney(ingresosMes);

    // Próximas entregas
    const upcoming = activos.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega)).slice(0, 6);
    $('dash-entregas').innerHTML = upcoming.length === 0 ? '<div class="dash-empty">✅ Sin entregas pendientes</div>' :
        upcoming.map(w => {
            const daysLeft = Math.ceil((new Date(w.fechaEntrega) - now) / 86400000);
            const overdue = daysLeft < 0;
            return `<div class="dash-item${overdue ? ' overdue' : ''}">
                <div class="dash-item-info"><span class="dash-item-name">${escapeHtml(w.cliente)}</span><span class="dash-item-sub">${w.ot ? w.ot + ' — ' : ''}${escapeHtml(w.servicio)}</span></div>
                <div class="dash-item-right"><span class="dash-item-date">${overdue ? '⚠️ Atrasado ' + Math.abs(daysLeft) + 'd' : daysLeft === 0 ? '🔴 HOY' : '📅 ' + daysLeft + ' días'}</span></div>
            </div>`;
        }).join('');

    // Pagos pendientes
    const unpaid = works.filter(w => w.estadoPago !== 'pagado').sort((a, b) => (b.montoNeto + b.montoNeto * IVA_RATE) - (a.montoNeto + a.montoNeto * IVA_RATE)).slice(0, 6);
    $('dash-pagos').innerHTML = unpaid.length === 0 ? '<div class="dash-empty">✅ Todos los pagos al día</div>' :
        unpaid.map(w => {
            const total = w.montoNeto + w.montoNeto * IVA_RATE;
            const deuda = total - (w.montoAbonado || 0);
            return `<div class="dash-item">
                <div class="dash-item-info"><span class="dash-item-name">${escapeHtml(w.cliente)}</span><span class="dash-item-sub">${escapeHtml(w.servicio)} — ${PAGO_LABELS[w.estadoPago]}</span></div>
                <div class="dash-item-right"><span class="dash-item-amount">${formatMoney(deuda)}</span></div>
            </div>`;
        }).join('');

    // Payment method chart
    renderPaymentMethodChart();

    // Month summary
    const gastosMes = purchases.filter(p => { const d = new Date(p.fecha); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, p) => s + p.montoNeto + p.montoNeto * IVA_RATE, 0);
    const ivaDebito = mesActual.reduce((s, w) => s + w.montoNeto * IVA_RATE, 0);
    const ivaCredito = purchases.filter(p => { const d = new Date(p.fecha); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, p) => s + p.montoNeto * IVA_RATE, 0);
    $('dash-month-summary').innerHTML = `
        <div class="dash-summary-row"><span>Ingresos brutos</span><span>${formatMoney(ingresosMes)}</span></div>
        <div class="dash-summary-row"><span>Gastos (compras)</span><span style="color:var(--red-400)">${formatMoney(gastosMes)}</span></div>
        <div class="dash-summary-row"><span>IVA Débito</span><span>${formatMoney(ivaDebito)}</span></div>
        <div class="dash-summary-row"><span>IVA Crédito</span><span>${formatMoney(ivaCredito)}</span></div>
        <div class="dash-summary-row"><span>Resultado del mes</span><span>${formatMoney(ingresosMes - gastosMes)}</span></div>
    `;
}

let chartMetodos;
function renderPaymentMethodChart() {
    const works = getWorks().map(migrateWork).filter(w => w.metodoPago);
    const counts = {};
    works.forEach(w => { const label = METODO_LABELS[w.metodoPago] || w.metodoPago; counts[label] = (counts[label] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const colors = ['#22c55e','#3b7dff','#f97316','#8b5cf6','#dc2626'];
    if (chartMetodos) chartMetodos.destroy();
    const ctx = $('chart-metodos');
    if (!ctx) return;
    chartMetodos = new Chart(ctx.getContext('2d'), {
        type: 'doughnut', data: { labels: entries.map(e => e[0]), datasets: [{ data: entries.map(e => e[1]), backgroundColor: colors.slice(0, entries.length), borderColor: '#0f1d48', borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#a8b8d8', font: { size: 11 }, padding: 10 } } } }
    });
}

// ===== WORKS =====
function renderWorks() {
    const works = getWorks().map(migrateWork);
    const search = $('w-search').value.toLowerCase();
    const fEstado = $('w-filter-estado').value;
    const fPago = $('w-filter-pago').value;
    let filtered = works;
    if (search) filtered = filtered.filter(w => w.cliente.toLowerCase().includes(search) || (w.ot && w.ot.toLowerCase().includes(search)));
    if (fEstado) filtered = filtered.filter(w => w.estado === fEstado);
    if (fPago) filtered = filtered.filter(w => w.estadoPago === fPago);

    const tbody = $('w-tbody'), wrap = $('w-table-wrap'), empty = $('w-empty');
    if (filtered.length === 0) { wrap.style.display = 'none'; empty.style.display = 'block'; }
    else {
        wrap.style.display = 'block'; empty.style.display = 'none';
        tbody.innerHTML = filtered.map(w => {
            const total = w.montoNeto + w.montoNeto * IVA_RATE;
            const metodoHtml = w.metodoPago ? `<span class="badge badge-metodo">${METODO_LABELS[w.metodoPago] || w.metodoPago}</span>` : '<span style="color:var(--text-muted);font-size:.72rem">—</span>';
            return `<tr>
                <td class="td-ot">${w.ot || '—'}</td>
                <td class="td-name">${escapeHtml(w.cliente)}${w.notas ? '<small title="' + escapeHtml(w.notas) + '">' + escapeHtml(w.notas) + '</small>' : ''}</td>
                <td>${escapeHtml(w.servicio)}</td>
                <td class="td-money td-total">${formatMoney(total)}</td>
                <td class="td-date">${formatDate(w.fechaEntrega)}</td>
                <td><span class="badge badge-${w.estado}" onclick="cycleEstado('${w.id}')" title="Clic para cambiar">${ESTADO_LABELS[w.estado]}</span></td>
                <td><span class="badge badge-pago-${w.estadoPago}" onclick="cyclePago('${w.id}')" title="Clic para cambiar">${PAGO_LABELS[w.estadoPago]}</span></td>
                <td>${metodoHtml}</td>
                <td class="td-actions"><button class="btn-print" onclick="generateDoc('${w.id}','factura')" title="Factura">🧾</button><button class="btn-print" onclick="generateDoc('${w.id}','cotizacion')" title="Cotización" style="color:var(--gold-400);border-color:rgba(212,168,22,.3)">📄</button><button class="btn-delete" onclick="deleteWork('${w.id}')">🗑️</button></td>
            </tr>`;
        }).join('');
    }
    updateWorkStats();
    updateClientsDatalist();
}

function addWork(cliente, servicio, montoNeto, fechaEntrega, estado, estadoPago, montoAbonado, metodoPago, notas) {
    const works = getWorks();
    works.push({ id: genId(), ot: getNextOT(), cliente, servicio, montoNeto: parseFloat(montoNeto), fechaEntrega, estado, estadoPago, montoAbonado: parseFloat(montoAbonado) || 0, metodoPago, notas, createdAt: new Date().toISOString() });
    saveWorks(works);
}

function deleteWork(id) { if (!confirm('¿Eliminar?')) return; saveWorks(getWorks().filter(w => w.id !== id)); renderWorks(); showToast('Trabajo eliminado'); }

function cycleEstado(id) {
    const works = getWorks().map(migrateWork), order = ['pendiente', 'en_progreso', 'terminado'];
    const w = works.find(x => x.id === id);
    if (w) { w.estado = order[(order.indexOf(w.estado) + 1) % 3]; saveWorks(works); renderWorks(); }
}

function cyclePago(id) {
    const works = getWorks().map(migrateWork), order = ['pendiente', 'parcial', 'pagado'];
    const w = works.find(x => x.id === id);
    if (w) {
        const next = order[(order.indexOf(w.estadoPago) + 1) % 3];
        if (next === 'parcial') { const total = w.montoNeto + w.montoNeto * IVA_RATE; const abono = prompt(`Monto abonado (Total: ${formatMoney(total)}):`); if (abono === null) return; w.montoAbonado = parseFloat(abono) || 0; }
        else if (next === 'pagado') { w.montoAbonado = w.montoNeto + w.montoNeto * IVA_RATE; }
        else { w.montoAbonado = 0; }
        w.estadoPago = next; saveWorks(works); renderWorks();
    }
}

function updateWorkStats() {
    const works = getWorks().map(migrateWork);
    const pending = works.filter(w => w.estado !== 'terminado').length;
    const totalRevenue = works.reduce((s, w) => s + w.montoNeto + w.montoNeto * IVA_RATE, 0);
    const totalDebt = works.filter(w => w.estadoPago !== 'pagado').reduce((s, w) => s + (w.montoNeto + w.montoNeto * IVA_RATE) - (w.montoAbonado || 0), 0);
    $('w-stat-total').textContent = works.length; $('w-stat-pending').textContent = pending;
    $('w-stat-revenue').textContent = formatMoney(totalRevenue); $('w-stat-debt').textContent = formatMoney(totalDebt);
}

function updateWorkPreview() {
    const neto = parseFloat($('w-monto').value) || 0;
    $('w-prev-neto').textContent = formatMoney(neto);
    $('w-prev-iva').textContent = formatMoney(neto * IVA_RATE);
    $('w-prev-total').textContent = formatMoney(neto + neto * IVA_RATE);
}

// ===== PURCHASES =====
function renderPurchases() {
    const purchases = getPurchases(), search = $('c-search').value.toLowerCase();
    let filtered = search ? purchases.filter(p => p.proveedor.toLowerCase().includes(search)) : purchases;
    const tbody = $('c-tbody'), wrap = $('c-table-wrap'), empty = $('c-empty');
    if (filtered.length === 0) { wrap.style.display = 'none'; empty.style.display = 'block'; }
    else {
        wrap.style.display = 'block'; empty.style.display = 'none';
        tbody.innerHTML = filtered.map((p, i) => {
            const iva = p.montoNeto * IVA_RATE;
            return `<tr><td class="td-ot">${i + 1}</td><td class="td-name">${escapeHtml(p.proveedor)}</td><td>${escapeHtml(p.factura)}</td><td>${escapeHtml(p.descripcion)}</td><td class="td-money">${formatMoney(p.montoNeto)}</td><td class="td-money">${formatMoney(iva)}</td><td class="td-money td-total">${formatMoney(p.montoNeto + iva)}</td><td class="td-date">${formatDate(p.fecha)}</td><td><button class="btn-delete" onclick="deletePurchase('${p.id}')">🗑️</button></td></tr>`;
        }).join('');
    }
    updatePurchaseStats();
}

function addPurchase(prov, fac, desc, monto, fecha) {
    const p = getPurchases();
    p.push({ id: genId(), proveedor: prov, factura: fac, descripcion: desc, montoNeto: parseFloat(monto), fecha, createdAt: new Date().toISOString() });
    savePurchases(p);
}
function deletePurchase(id) { if (!confirm('¿Eliminar?')) return; savePurchases(getPurchases().filter(p => p.id !== id)); renderPurchases(); showToast('Compra eliminada'); }

function updatePurchaseStats() {
    const p = getPurchases(), now = new Date();
    const month = p.filter(x => { const d = new Date(x.fecha); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    $('c-stat-total').textContent = p.length; $('c-stat-month').textContent = month.length;
    $('c-stat-spent').textContent = formatMoney(p.reduce((s, x) => s + x.montoNeto + x.montoNeto * IVA_RATE, 0));
}
function updatePurchasePreview() {
    const neto = parseFloat($('c-monto').value) || 0;
    $('c-prev-neto').textContent = formatMoney(neto);
    $('c-prev-iva').textContent = formatMoney(neto * IVA_RATE);
    $('c-prev-total').textContent = formatMoney(neto + neto * IVA_RATE);
}

// ===== CLIENTS =====
function renderClients() {
    const clients = getClients(), works = getWorks(), search = $('cl-search').value.toLowerCase();
    let filtered = search ? clients.filter(c => c.nombre.toLowerCase().includes(search)) : clients;
    const tbody = $('cl-tbody'), wrap = $('cl-table-wrap'), empty = $('cl-empty');
    if (filtered.length === 0) { wrap.style.display = 'none'; empty.style.display = 'block'; }
    else {
        wrap.style.display = 'block'; empty.style.display = 'none';
        tbody.innerHTML = filtered.map(c => {
            const cw = works.filter(w => w.cliente.toLowerCase() === c.nombre.toLowerCase());
            const totalFact = cw.reduce((s, w) => s + w.montoNeto + w.montoNeto * IVA_RATE, 0);
            return `<tr><td class="td-name">${escapeHtml(c.nombre)}</td><td>${escapeHtml(c.rut || '-')}</td><td>${escapeHtml(c.telefono || '-')}</td><td>${escapeHtml(c.email || '-')}</td><td class="td-ot">${cw.length}</td><td class="td-money td-total">${formatMoney(totalFact)}</td><td class="td-actions"><button class="btn-history" onclick="showClientHistory('${c.id}')">📋</button><button class="btn-delete" onclick="deleteClient('${c.id}')">🗑️</button></td></tr>`;
        }).join('');
    }
    updateClientStats();
}
function addClient(nombre, rut, tel, email, dir) { const c = getClients(); c.push({ id: genId(), nombre, rut, telefono: tel, email, direccion: dir, createdAt: new Date().toISOString() }); saveClients(c); }
function deleteClient(id) { if (!confirm('¿Eliminar?')) return; saveClients(getClients().filter(c => c.id !== id)); renderClients(); showToast('Cliente eliminado'); }
function updateClientStats() {
    const clients = getClients(), works = getWorks(), counts = {};
    works.forEach(w => { counts[w.cliente] = (counts[w.cliente] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    $('cl-stat-total').textContent = clients.length; $('cl-stat-top').textContent = top ? top[0] : '-';
}
function showClientHistory(id) {
    const client = getClients().find(c => c.id === id); if (!client) return;
    const works = getWorks().map(migrateWork).filter(w => w.cliente.toLowerCase() === client.nombre.toLowerCase());
    $('cl-history-title').textContent = `Historial: ${client.nombre}`;
    $('cl-history-card').style.display = 'block';
    $('cl-history-tbody').innerHTML = works.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:1rem;">Sin trabajos</td></tr>' :
        works.map(w => `<tr><td class="td-ot">${w.ot || '—'}</td><td>${escapeHtml(w.servicio)}</td><td class="td-money td-total">${formatMoney(w.montoNeto + w.montoNeto * IVA_RATE)}</td><td class="td-date">${formatDate(w.fechaEntrega)}</td><td><span class="badge badge-${w.estado}">${ESTADO_LABELS[w.estado]}</span></td><td><span class="badge badge-pago-${w.estadoPago}">${PAGO_LABELS[w.estadoPago]}</span></td></tr>`).join('');
}
function updateClientsDatalist() { $('clientes-list').innerHTML = getClients().map(c => `<option value="${escapeHtml(c.nombre)}">`).join(''); }

// ===== IVA =====
let ivaMonth, ivaYear;
function initIVADate() { const n = new Date(); ivaMonth = n.getMonth(); ivaYear = n.getFullYear(); }
function renderIVA() {
    $('iva-month-label').textContent = `${MESES[ivaMonth]} ${ivaYear}`;
    const works = getWorks().filter(w => { const d = new Date(w.fechaEntrega); return d.getMonth() === ivaMonth && d.getFullYear() === ivaYear; });
    const purchases = getPurchases().filter(p => { const d = new Date(p.fecha); return d.getMonth() === ivaMonth && d.getFullYear() === ivaYear; });
    const vN = works.reduce((s, w) => s + w.montoNeto, 0), cN = purchases.reduce((s, p) => s + p.montoNeto, 0);
    const deb = vN * IVA_RATE, cred = cN * IVA_RATE, res = deb - cred;
    $('iva-debito').textContent = formatMoney(deb); $('iva-ventas-neto').textContent = `Ventas netas: ${formatMoney(vN)}`;
    $('iva-credito').textContent = formatMoney(cred); $('iva-compras-neto').textContent = `Compras netas: ${formatMoney(cN)}`;
    $('iva-resultado').textContent = formatMoney(Math.abs(res));
    const card = $('iva-resultado-card'), label = $('iva-resultado-label');
    if (res >= 0) { card.classList.remove('favorable'); label.textContent = 'IVA a Pagar'; } else { card.classList.add('favorable'); label.textContent = 'Remanente a Favor'; }
    const renderD = (items, tid, wid, eid, fn) => { const tb = $(tid), wr = $(wid), em = $(eid); if (!items.length) { wr.style.display = 'none'; em.style.display = 'block'; } else { wr.style.display = 'block'; em.style.display = 'none'; tb.innerHTML = items.map(fn).join(''); } };
    renderD(works, 'iva-ventas-tbody', 'iva-ventas-wrap', 'iva-ventas-empty', w => { const iv = w.montoNeto * IVA_RATE; return `<tr><td class="td-name">${escapeHtml(w.cliente)}</td><td>${escapeHtml(w.servicio)}</td><td class="td-money">${formatMoney(w.montoNeto)}</td><td class="td-money">${formatMoney(iv)}</td><td class="td-money td-total">${formatMoney(w.montoNeto + iv)}</td><td class="td-date">${formatDate(w.fechaEntrega)}</td></tr>`; });
    renderD(purchases, 'iva-compras-tbody', 'iva-compras-wrap', 'iva-compras-empty', p => { const iv = p.montoNeto * IVA_RATE; return `<tr><td class="td-name">${escapeHtml(p.proveedor)}</td><td>${escapeHtml(p.factura)}</td><td class="td-money">${formatMoney(p.montoNeto)}</td><td class="td-money">${formatMoney(iv)}</td><td class="td-money td-total">${formatMoney(p.montoNeto + iv)}</td><td class="td-date">${formatDate(p.fecha)}</td></tr>`; });
}

// ===== CHARTS =====
let chartClients, chartServices, chartIncome;
function renderCharts() { renderClientChart(); renderServiceChart(); renderIncomeChart(); }
function renderClientChart() {
    const counts = {}; getWorks().forEach(w => { counts[w.cliente] = (counts[w.cliente] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (chartClients) chartClients.destroy();
    chartClients = new Chart($('chart-clients').getContext('2d'), { type: 'bar', data: { labels: sorted.map(e => e[0]), datasets: [{ label: 'Trabajos', data: sorted.map(e => e[1]), backgroundColor: 'rgba(37,87,196,.7)', borderColor: '#3b7dff', borderWidth: 1, borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#5d7099', font: { size: 11 } }, grid: { color: 'rgba(30,52,112,.3)' } }, y: { beginAtZero: true, ticks: { color: '#5d7099', stepSize: 1 }, grid: { color: 'rgba(30,52,112,.3)' } } } } });
}
function renderServiceChart() {
    const counts = {}; getWorks().forEach(w => { counts[w.servicio] = (counts[w.servicio] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const colors = ['#dc2626','#3b7dff','#d4a816','#22c55e','#f97316','#8b5cf6','#ec4899','#06b6d4'];
    if (chartServices) chartServices.destroy();
    chartServices = new Chart($('chart-services').getContext('2d'), { type: 'doughnut', data: { labels: entries.map(e => e[0]), datasets: [{ data: entries.map(e => e[1]), backgroundColor: colors.slice(0, entries.length), borderColor: '#0f1d48', borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#a8b8d8', font: { size: 12 }, padding: 12 } } } } });
}
function renderIncomeChart() {
    const works = getWorks(), purchases = getPurchases(), now = new Date();
    const labels = [], incD = [], expD = [];
    for (let i = 5; i >= 0; i--) {
        let m = now.getMonth() - i, y = now.getFullYear(); if (m < 0) { m += 12; y--; }
        labels.push(`${MESES[m].slice(0, 3)} ${y}`);
        incD.push(works.filter(w => { const d = new Date(w.fechaEntrega); return d.getMonth() === m && d.getFullYear() === y; }).reduce((s, w) => s + w.montoNeto + w.montoNeto * IVA_RATE, 0));
        expD.push(purchases.filter(p => { const d = new Date(p.fecha); return d.getMonth() === m && d.getFullYear() === y; }).reduce((s, p) => s + p.montoNeto + p.montoNeto * IVA_RATE, 0));
    }
    if (chartIncome) chartIncome.destroy();
    chartIncome = new Chart($('chart-income').getContext('2d'), { type: 'line', data: { labels, datasets: [
        { label: 'Ingresos', data: incD, borderColor: '#3b7dff', backgroundColor: 'rgba(59,125,255,.1)', fill: true, tension: .35, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#3b7dff' },
        { label: 'Gastos', data: expD, borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,.1)', fill: true, tension: .35, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#dc2626' }
    ] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#a8b8d8', font: { size: 12 }, padding: 16 } } }, scales: { x: { ticks: { color: '#5d7099' }, grid: { color: 'rgba(30,52,112,.3)' } }, y: { beginAtZero: true, ticks: { color: '#5d7099', callback: v => '$' + (v / 1000).toLocaleString('es-CL') + 'k' }, grid: { color: 'rgba(30,52,112,.3)' } } } } });
}

// ===== CSV EXPORT =====
function downloadCSV(filename, rows) {
    const BOM = '\uFEFF';
    const csv = BOM + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}
function exportWorksCSV() {
    const works = getWorks().map(migrateWork);
    const h = ['OT', 'Cliente', 'Servicio', 'Neto', 'IVA', 'Total', 'Fecha', 'Estado', 'Pago', 'Método Pago', 'Abonado', 'Notas'];
    const rows = [h, ...works.map(w => { const iv = w.montoNeto * IVA_RATE; return [w.ot, w.cliente, w.servicio, Math.round(w.montoNeto), Math.round(iv), Math.round(w.montoNeto + iv), w.fechaEntrega, ESTADO_LABELS[w.estado], PAGO_LABELS[w.estadoPago], METODO_LABELS[w.metodoPago] || '', Math.round(w.montoAbonado || 0), w.notas || '']; })];
    downloadCSV('trabajos_maestranza.csv', rows); showToast('Exportado a CSV');
}
function exportPurchasesCSV() {
    const purchases = getPurchases();
    const h = ['N°', 'Proveedor', 'Factura', 'Descripción', 'Neto', 'IVA', 'Total', 'Fecha'];
    const rows = [h, ...purchases.map((p, i) => { const iv = p.montoNeto * IVA_RATE; return [i + 1, p.proveedor, p.factura, p.descripcion, Math.round(p.montoNeto), Math.round(iv), Math.round(p.montoNeto + iv), p.fecha]; })];
    downloadCSV('compras_maestranza.csv', rows); showToast('Exportado a CSV');
}

// ===== BACKUP / RESTORE =====
function exportBackup() {
    const data = { version: 3, date: new Date().toISOString(), works: getWorks(), purchases: getPurchases(), clients: getClients(), otCounter: localStorage.getItem(STORAGE_OT) || '0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `respaldo_maestranza_${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
    showToast('Respaldo exportado');
}
function importBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.works && !data.purchases) throw new Error('Formato inválido');
            if (!confirm(`¿Restaurar respaldo del ${data.date ? new Date(data.date).toLocaleDateString('es-CL') : 'archivo'}? Esto REEMPLAZARÁ los datos actuales.`)) return;
            if (data.works) saveWorks(data.works);
            if (data.purchases) savePurchases(data.purchases);
            if (data.clients) saveClients(data.clients);
            if (data.otCounter) localStorage.setItem(STORAGE_OT, data.otCounter);
            renderWorks(); renderPurchases(); renderClients(); renderDashboard();
            showToast('Respaldo restaurado');
        } catch (err) { alert('Error: archivo inválido.'); }
    };
    reader.readAsText(file);
}

// ===== GENERAR DOCUMENTOS (FACTURA / COTIZACIÓN) =====
function generateDoc(workId, tipo) {
    const w = getWorks().map(migrateWork).find(x => x.id === workId);
    if (!w) return;
    const iva = w.montoNeto * IVA_RATE, total = w.montoNeto + iva;
    const client = getClients().find(c => c.nombre.toLowerCase() === w.cliente.toLowerCase());
    const esCotizacion = tipo === 'cotizacion';
    const docTitulo = esCotizacion ? 'COTIZACIÓN' : 'FACTURA DE SERVICIO';
    const docColor = esCotizacion ? '#1a3a8f' : '#c41e1e';
    const docNum = w.ot || 'S/N';
    const fechaEmision = new Date().toLocaleDateString('es-CL');
    const fechaEntrega = formatDate(w.fechaEntrega);

    const html = `<!DOCTYPE html><html lang="es-CL"><head><meta charset="UTF-8"><title>${docTitulo} ${docNum}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',Arial,sans-serif;color:#1a1a1a;background:#fff;padding:0;font-size:11pt;line-height:1.5}
.page{max-width:800px;margin:0 auto;padding:40px 50px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #1a3a8f}
.header-left{display:flex;align-items:center;gap:14px}
.header-left img{width:72px;height:72px;object-fit:contain;border-radius:6px}
.company-name{font-size:17pt;font-weight:800;color:#1a3a8f;line-height:1.1}
.company-sub{font-size:8pt;color:#555;margin-top:2px}
.doc-box{border:2.5px solid ${docColor};border-radius:6px;padding:10px 18px;text-align:center;min-width:200px}
.doc-type{font-size:13pt;font-weight:800;color:${docColor};letter-spacing:1px}
.doc-num{font-size:10pt;font-weight:600;color:#333;margin-top:2px}
.doc-date{font-size:8pt;color:#777;margin-top:4px}
.client-box{background:#f5f7fb;border:1px solid #dde2ee;border-radius:6px;padding:14px 18px;margin-bottom:20px}
.client-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px}
.client-row{font-size:9pt;color:#444}
.client-row strong{color:#1a3a8f;font-weight:600;min-width:80px;display:inline-block}
table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:9.5pt}
thead th{background:#1a3a8f;color:#fff;padding:9px 12px;text-align:left;font-weight:600;font-size:8pt;text-transform:uppercase;letter-spacing:.5px}
tbody td{padding:9px 12px;border-bottom:1px solid #e5e9f0}
tbody tr:nth-child(even){background:#fafbfd}
.totals-box{display:flex;justify-content:flex-end;margin-bottom:20px}
.totals-table{width:280px}
.totals-table .row{display:flex;justify-content:space-between;padding:5px 0;font-size:10pt;color:#444;border-bottom:1px solid #eee}
.totals-table .row:last-child{border-bottom:none}
.totals-table .total-row{background:#1a3a8f;color:#fff;font-weight:800;font-size:13pt;padding:10px 14px;border-radius:6px;margin-top:6px}
.totals-table .saldo-row{background:#fef2f2;color:#c41e1e;font-weight:700;font-size:10pt;padding:8px 14px;border-radius:6px;margin-top:4px}
.notes-box{background:#fffbf0;border:1px solid #f0e6c0;border-radius:6px;padding:12px 16px;margin-bottom:20px;font-size:9pt;color:#7a6a2a}
.notes-box strong{color:#8b6914}
.payment-info{display:flex;gap:20px;margin-bottom:20px;font-size:9pt;color:#555}
.payment-info .tag{background:#e8f5e9;color:#2e7d32;padding:3px 10px;border-radius:12px;font-weight:600;font-size:8pt}
.payment-info .tag.pending{background:#fff3e0;color:#e65100}
.footer{text-align:center;padding-top:16px;border-top:2px solid #1a3a8f;margin-top:30px}
.footer p{font-size:8pt;color:#888;margin-bottom:2px}
.footer .thanks{font-size:10pt;font-weight:600;color:#1a3a8f;margin-bottom:6px}
.seal{display:flex;justify-content:space-between;margin-top:30px;padding-top:20px}
.seal-box{width:200px;text-align:center;font-size:8pt;color:#999;border-top:1px solid #ccc;padding-top:6px}
${esCotizacion ? '.validity{background:#e3f2fd;border:1px solid #90caf9;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:9pt;color:#1565c0;font-weight:500;text-align:center}' : ''}
@media print{body{padding:0}.page{padding:30px 40px}}
</style></head><body>
<div class="page">
    <div class="header">
        <div class="header-left">
            <img src="logo.png" alt="Logo">
            <div>
                <div class="company-name">MAESTRANZA R.S SPA</div>
                <div class="company-sub">Torno / Fresa / Soldaduras Especiales y Cilindros Hidráulicos</div>
                <div class="company-sub">Los Ángeles, Región del Biobío, Chile</div>
            </div>
        </div>
        <div class="doc-box">
            <div class="doc-type">${docTitulo}</div>
            <div class="doc-num">N° ${docNum}</div>
            <div class="doc-date">Emisión: ${fechaEmision}</div>
        </div>
    </div>

    <div class="client-box">
        <div class="client-grid">
            <div class="client-row"><strong>Señor(es):</strong> ${escapeHtml(w.cliente)}</div>
            <div class="client-row"><strong>RUT:</strong> ${client && client.rut ? escapeHtml(client.rut) : '—'}</div>
            <div class="client-row"><strong>Dirección:</strong> ${client && client.direccion ? escapeHtml(client.direccion) : '—'}</div>
            <div class="client-row"><strong>Teléfono:</strong> ${client && client.telefono ? escapeHtml(client.telefono) : '—'}</div>
            <div class="client-row"><strong>Email:</strong> ${client && client.email ? escapeHtml(client.email) : '—'}</div>
            <div class="client-row"><strong>Fecha entrega:</strong> ${fechaEntrega}</div>
        </div>
    </div>

    ${esCotizacion ? '<div class="validity">⏰ Esta cotización tiene una validez de 15 días desde la fecha de emisión.</div>' : ''}

    <table>
        <thead><tr><th>Cant.</th><th>Descripción</th><th>Servicio</th><th>Precio Unit.</th><th>Total</th></tr></thead>
        <tbody>
            <tr>
                <td style="text-align:center">1</td>
                <td>Servicio de mecánica industrial${w.notas ? '<br><small style="color:#888">' + escapeHtml(w.notas) + '</small>' : ''}</td>
                <td>${escapeHtml(w.servicio)}</td>
                <td style="text-align:right">${formatMoney(w.montoNeto)}</td>
                <td style="text-align:right">${formatMoney(w.montoNeto)}</td>
            </tr>
        </tbody>
    </table>

    <div class="totals-box">
        <div class="totals-table">
            <div class="row"><span>Sub Total Neto</span><span>${formatMoney(w.montoNeto)}</span></div>
            <div class="row"><span>IVA 19%</span><span>${formatMoney(iva)}</span></div>
            <div class="row total-row"><span>TOTAL</span><span>${formatMoney(total)}</span></div>
            ${w.montoAbonado > 0 && !esCotizacion ? `<div class="row" style="margin-top:6px"><span>Abonado</span><span>${formatMoney(w.montoAbonado)}</span></div><div class="row saldo-row"><span>SALDO PENDIENTE</span><span>${formatMoney(total - w.montoAbonado)}</span></div>` : ''}
        </div>
    </div>

    ${!esCotizacion ? `<div class="payment-info">
        <span><strong>Estado:</strong> <span class="tag${w.estadoPago === 'pendiente' ? ' pending' : ''}">${PAGO_LABELS[w.estadoPago]}</span></span>
        ${w.metodoPago ? '<span><strong>Método:</strong> ' + (METODO_LABELS[w.metodoPago] || w.metodoPago) + '</span>' : ''}
    </div>` : ''}

    ${w.notas ? `<div class="notes-box"><strong>Observaciones:</strong> ${escapeHtml(w.notas)}</div>` : ''}

    <div class="seal">
        <div class="seal-box">Firma Empresa</div>
        <div class="seal-box">Recibido por Cliente</div>
    </div>

    <div class="footer">
        <p class="thanks">Gracias por su preferencia</p>
        <p>Maestranza R.S spa — Torno, Fresa, Soldaduras Especiales y Cilindros Hidráulicos</p>
        <p>Los Ángeles, Región del Biobío, Chile</p>
    </div>
</div>
<script>window.onload=function(){window.print();}<\/script>
</body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
    else { alert('Permite ventanas emergentes para generar el documento.'); }
}

// ===== NOTIFICATIONS =====
function renderNotifications() {
    const works = getWorks().map(migrateWork), now = new Date(), alerts = [];
    works.forEach(w => {
        const daysLeft = Math.ceil((new Date(w.fechaEntrega) - now) / 86400000);
        if (w.estado !== 'terminado' && daysLeft < 0) alerts.push({ type: 'urgent', title: `⚠️ ATRASADO: ${w.cliente}`, text: `${w.ot ? w.ot + ' — ' : ''}${w.servicio} — venció hace ${Math.abs(daysLeft)} día(s)` });
        else if (w.estado !== 'terminado' && daysLeft >= 0 && daysLeft <= 7) alerts.push({ type: 'warning', title: `⏰ Próximo: ${w.cliente}`, text: `${w.ot ? w.ot + ' — ' : ''}${w.servicio} — entrega en ${daysLeft} día(s)` });
        if (w.estadoPago === 'pendiente' && w.estado === 'terminado') alerts.push({ type: 'info', title: `💰 Pago: ${w.cliente}`, text: `${formatMoney(w.montoNeto + w.montoNeto * IVA_RATE)} — trabajo terminado sin pago` });
    });
    const badge = $('notif-badge');
    if (alerts.length) { badge.style.display = 'inline'; badge.textContent = alerts.length; } else { badge.style.display = 'none'; }
    $('notif-body').innerHTML = alerts.length === 0 ? '<div class="notif-empty">✅ Sin alertas</div>' : alerts.map(a => `<div class="notif-item ${a.type}"><strong>${a.title}</strong>${a.text}</div>`).join('');
}

// ===== INIT =====
function initApp() {
    initIVADate();
    renderDashboard(); renderWorks(); renderPurchases(); renderClients(); renderNotifications();
    $('ot-preview').textContent = 'Se asignará: ' + peekNextOT();

    document.querySelectorAll('.nav-tab').forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
    $('btn-logout').addEventListener('click', doLogout);

    // Work form
    const wForm = $('work-form'), wServ = $('w-servicio'), wOtroG = $('w-otro-group'), wOtro = $('w-otro'), wPago = $('w-pago'), wAbonoG = $('w-abono-group');
    $('w-monto').addEventListener('input', updateWorkPreview);
    wServ.addEventListener('change', () => { const isO = wServ.value === 'Otro'; wOtroG.style.display = isO ? 'flex' : 'none'; wOtro.required = isO; if (!isO) wOtro.value = ''; });
    wPago.addEventListener('change', () => { wAbonoG.style.display = wPago.value === 'parcial' ? 'flex' : 'none'; });
    wForm.addEventListener('submit', e => {
        e.preventDefault();
        const cliente = $('w-cliente').value.trim();
        let servicio = wServ.value; if (servicio === 'Otro') servicio = wOtro.value.trim();
        const monto = $('w-monto').value, fecha = $('w-fecha').value, estado = $('w-estado').value, pago = wPago.value, abono = $('w-abono').value, metodo = $('w-metodo').value, notas = $('w-notas').value.trim();
        if (!cliente || !servicio || !monto || !fecha) return;
        addWork(cliente, servicio, monto, fecha, estado, pago, abono, metodo, notas);
        wForm.reset(); wOtroG.style.display = 'none'; wAbonoG.style.display = 'none'; updateWorkPreview();
        renderWorks(); renderDashboard(); renderNotifications();
        $('ot-preview').textContent = 'Se asignará: ' + peekNextOT();
        showToast('Trabajo registrado');
    });
    $('w-search').addEventListener('input', renderWorks);
    $('w-filter-estado').addEventListener('change', renderWorks);
    $('w-filter-pago').addEventListener('change', renderWorks);
    $('btn-export-works').addEventListener('click', exportWorksCSV);

    // Purchase form
    const cForm = $('purchase-form');
    $('c-monto').addEventListener('input', updatePurchasePreview);
    cForm.addEventListener('submit', e => {
        e.preventDefault();
        addPurchase($('c-proveedor').value.trim(), $('c-factura').value.trim(), $('c-descripcion').value.trim(), $('c-monto').value, $('c-fecha').value);
        cForm.reset(); updatePurchasePreview(); renderPurchases(); renderDashboard(); renderNotifications(); showToast('Compra registrada');
    });
    $('c-search').addEventListener('input', renderPurchases);
    $('btn-export-purchases').addEventListener('click', exportPurchasesCSV);

    // Client form
    const clForm = $('client-form');
    clForm.addEventListener('submit', e => {
        e.preventDefault();
        addClient($('cl-nombre').value.trim(), $('cl-rut').value.trim(), $('cl-telefono').value.trim(), $('cl-email').value.trim(), $('cl-direccion').value.trim());
        clForm.reset(); renderClients(); updateClientsDatalist(); renderDashboard(); showToast('Cliente registrado');
    });
    $('cl-search').addEventListener('input', renderClients);
    $('cl-history-close').addEventListener('click', () => { $('cl-history-card').style.display = 'none'; });

    // IVA
    $('iva-prev').addEventListener('click', () => { ivaMonth--; if (ivaMonth < 0) { ivaMonth = 11; ivaYear--; } renderIVA(); });
    $('iva-next').addEventListener('click', () => { ivaMonth++; if (ivaMonth > 11) { ivaMonth = 0; ivaYear++; } renderIVA(); });

    // Notifications
    $('btn-notif').addEventListener('click', () => { const p = $('notif-panel'); p.style.display = p.style.display === 'none' ? 'flex' : 'none'; });
    $('notif-close').addEventListener('click', () => { $('notif-panel').style.display = 'none'; });

    // Backup
    $('btn-backup').addEventListener('click', (e) => { e.stopPropagation(); $('backup-menu').classList.toggle('open'); });
    document.addEventListener('click', () => { $('backup-menu').classList.remove('open'); });
    $('btn-export-backup').addEventListener('click', exportBackup);
    $('btn-import-backup').addEventListener('click', () => { $('backup-file-input').click(); });
    $('backup-file-input').addEventListener('change', (e) => { if (e.target.files[0]) { importBackup(e.target.files[0]); e.target.value = ''; } });
}

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
    $('login-form').addEventListener('submit', e => {
        e.preventDefault();
        if (doLogin($('login-user').value.trim(), $('login-pass').value)) showApp();
        else { $('login-error').classList.add('visible'); setTimeout(() => $('login-error').classList.remove('visible'), 3000); }
    });
    if (checkSession()) showApp();
});
