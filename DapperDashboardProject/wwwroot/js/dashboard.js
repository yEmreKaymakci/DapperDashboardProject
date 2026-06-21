// App State
const state = {
    isLoading: false,
    filters: {
        search: '',
        category: '',
        status: '',
        isActive: '',
        minPrice: null,
        maxPrice: null
    }
};

const locale = 'tr-TR';
const currencyOptions = { style: 'currency', currency: 'TRY' };

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});

function initTimestamp() {
    const el = document.getElementById('live-timestamp');
    setInterval(() => {
        const now = new Date();
        el.textContent = now.toLocaleTimeString(locale);
    }, 1000);
}

function initSearchDebounce() {
    const input = document.getElementById('search-input');
    let timeout;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            state.filters.search = e.target.value;
            applyFilters();
        }, 400);
    });
}

// --- Data Loading Mockups ---

async function loadKpis() {
    const res = await fetch('Dashboard/GetSummary');
    const data = await res.json();

    animateValue("kpi-total",    0, data.totalProductCount,  1200);
    animateValue("kpi-active",   0, data.activeProductCount, 1200);
    animateValue("kpi-inactive", 0, data.passiveProductCount,1200);
    animateValue("kpi-oos",      0, data.totalStockCount,    1200); // ileride ayrı metod
    animateValue("kpi-critical", 0, data.activeCategoryCount,1200);
    animateValue("kpi-cats",     0, data.totalCategoryCount, 1200);

    const avgEl = document.getElementById('kpi-avg-price');
    const avgFmt = data.averagePrice.toLocaleString(locale, currencyOptions);
    avgEl.textContent = avgFmt;
    avgEl.title = avgFmt;

    const invEl = document.getElementById('kpi-inv-value');
    invEl.textContent = formatMillions(data.totalStockValue);
    invEl.title = data.totalStockValue.toLocaleString(locale, currencyOptions);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function loadProducts() {
    const tbody = document.getElementById('product-tbody');
    const mockData = [
        { id: 101, name: 'Precision Tech Wireless Mouse', cat: 'Elektronik', price: 1240, stock: 42, status: 'Active', risk: false },
        { id: 102, name: 'Ergo-Flex Office Chair', cat: 'Mobilya', price: 4850, stock: 4, status: 'Active', risk: 'critical' },
        { id: 103, name: 'Quantum Display 27"', cat: 'Elektronik', price: 8900, stock: 0, status: 'Active', risk: 'oos' },
        { id: 104, name: 'Oak Study Desk', cat: 'Mobilya', price: 3200, stock: 15, status: 'Inactive', risk: false },
        { id: 105, name: 'Ultra-HD Webcam 4K', cat: 'Elektronik', price: 2150, stock: 2, status: 'Active', risk: 'critical' },
        { id: 106, name: 'Mechanical Gaming Keyboard', cat: 'Elektronik', price: 1750, stock: 88, status: 'Active', risk: false },
    ];

    tbody.innerHTML = mockData.map(p => `
        <tr class="border-b border-outline-variant hover:bg-surface-container-highest transition-colors cursor-pointer group" onclick="openSideDrawer(${JSON.stringify(p).replace(/"/g, '&quot;')})">
            <td class="p-4 text-body-sm font-mono text-on-surface-variant">#${p.id}</td>
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-surface-container-highest border border-outline-variant"></div>
                    <div class="text-body-md font-semibold text-on-surface group-hover:text-primary">${p.name}</div>
                </div>
            </td>
            <td class="p-4 text-body-sm">${p.cat}</td>
            <td class="p-4 text-body-md font-bold">${p.price.toLocaleString(locale, currencyOptions)}</td>
            <td class="p-4">
                <div class="flex items-center gap-2">
                    <span class="text-body-md ${p.stock < 10 ? 'text-error font-bold' : ''}">${p.stock}</span>
                    ${p.risk === 'oos' ? '<span class="text-[10px] bg-error/20 text-error px-1 rounded">STOKSUZ</span>' : ''}
                    ${p.risk === 'critical' ? '<span class="text-[10px] bg-warning/20 text-warning px-1 rounded">KRITIK</span>' : ''}
                </div>
            </td>
            <td class="p-4">
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${p.status === 'Active' ? 'bg-secondary/10 text-secondary' : 'bg-on-surface-variant/10 text-on-surface-variant'}">
                    <span class="w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-secondary' : 'bg-on-surface-variant'}"></span>
                    ${p.status}
                </span>
            </td>
            <td class="p-4 text-right">
                <button class="text-on-surface-variant hover:text-primary transition-colors">
                    <span class="material-symbols-outlined text-sm">more_vert</span>
                </button>
            </td>
        </tr>
    `).join('');
}

// --- UI Interactions ---

function openSideDrawer(product) {
    const drawer = document.getElementById('side-drawer');
    const panel = document.getElementById('drawer-panel');
    const backdrop = document.getElementById('drawer-backdrop');

    // Set content
    if (product) {
        document.getElementById('drawer-title').textContent = product.name;
        document.getElementById('drawer-price').textContent = product.price.toLocaleString(locale, currencyOptions);
        document.getElementById('drawer-stock').textContent = `${product.stock} Units`;
        document.getElementById('drawer-value').textContent = (product.price * product.stock).toLocaleString(locale, currencyOptions);
    }

    drawer.classList.remove('pointer-events-none');
    panel.classList.remove('translate-x-full');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100');
}

function closeSideDrawer() {
    const drawer = document.getElementById('side-drawer');
    const panel = document.getElementById('drawer-panel');
    const backdrop = document.getElementById('drawer-backdrop');

    panel.classList.add('translate-x-full');
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');

    setTimeout(() => {
        drawer.classList.add('pointer-events-none');
        backdrop.classList.add('pointer-events-none');
    }, 300);
}

function refreshData() {
    loadKpis();
    loadProducts();
    // In a real app, this would re-fetch endpoints
    console.log("Tüm veri akışları yenileniyor...");
}

function applyFilters() {
    console.log("Applying filters:", state.filters);
    // logic to re-fetch table data based on filters
}

// --- ApexCharts Initialization ---

function initCharts() {
    const chartBaseConfig = {
        chart: { toolbar: { show: false }, background: 'transparent', foreColor: '#8b949e', fontFamily: 'Inter' },
        grid: { borderColor: '#30363d', strokeDashArray: 4 },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        theme: { mode: 'dark' }
    };

    // Main Category Count (Horizontal Bar)
    new ApexCharts(document.querySelector("#chart-main-cat"), {
        ...chartBaseConfig,
        series: [{ data: [450, 320, 280, 190] }],
        chart: { ...chartBaseConfig.chart, type: 'bar' },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
        colors: ['#58a6ff'],
        xaxis: { categories: ['Elektronik', 'Mobilya', 'Giyim', 'Mutfak'] }
    }).render();

    // Status Donut
    new ApexCharts(document.querySelector("#chart-status-donut"), {
        ...chartBaseConfig,
        series: [92, 8],
        chart: { ...chartBaseConfig.chart, type: 'donut' },
        labels: ['Aktif', 'Pasif'],
        colors: ['#3fb950', '#30363d'],
        stroke: { show: false },
        legend: { position: 'bottom' },
        plotOptions: { pie: { donut: { size: '75%' } } }
    }).render();

    // Category Split (Stacked Bar)
    new ApexCharts(document.querySelector("#chart-cat-split"), {
        ...chartBaseConfig,
        series: [
            { name: 'Aktif', data: [44, 55, 41, 67] },
            { name: 'Pasif', data: [13, 23, 20, 8] }
        ],
        chart: { ...chartBaseConfig.chart, type: 'bar', stacked: true },
        colors: ['#58a6ff', '#30363d'],
        xaxis: { categories: ['E-1', 'M-2', 'G-3', 'A-4'] }
    }).render();

    // Price Distribution (Column)
    new ApexCharts(document.querySelector("#chart-price-dist"), {
        ...chartBaseConfig,
        series: [{ name: 'Adet', data: [120, 250, 480, 300, 150, 80] }],
        chart: { ...chartBaseConfig.chart, type: 'bar' },
        colors: ['#79c0ff'],
        xaxis: { categories: ['<500', '1k', '2k', '5k', '10k', '20k+'] }
    }).render();

    // ABC Analysis (Radial)
    new ApexCharts(document.querySelector("#chart-abc"), {
        ...chartBaseConfig,
        series: [70, 20, 10],
        chart: { ...chartBaseConfig.chart, type: 'pie' },
        labels: ['Class A (High Value)', 'Class B', 'Class C'],
        colors: ['#bc8cff', '#58a6ff', '#30363d'],
        legend: { position: 'bottom' }
    }).render();

    // Risk Matrix (Radial Bar)
    new ApexCharts(document.querySelector("#chart-risk"), {
        ...chartBaseConfig,
        series: [76, 67, 12],
        chart: { ...chartBaseConfig.chart, type: 'radialBar' },
        plotOptions: {
            radialBar: {
                dataLabels: { name: { fontSize: '14px' }, value: { fontSize: '16px' }, total: { show: true, label: 'Risk' } }
            }
        },
        labels: ['Healthy', 'Overstocked', 'Risky'],
        colors: ['#3fb950', '#d29922', '#f85149']
    }).render();

    // Radar Chart
    new ApexCharts(document.querySelector("#chart-radar"), {
        ...chartBaseConfig,
        series: [{ name: 'Performance', data: [80, 50, 30, 40, 100, 20] }],
        chart: { ...chartBaseConfig.chart, type: 'radar' },
        xaxis: { categories: ['Profit', 'Growth', 'Stability', 'Volume', 'Price', 'Speed'] },
        colors: ['#ffa657']
    }).render();

    // Percentile (BoxPlot Style Sparkline)
    new ApexCharts(document.querySelector("#chart-percentile"), {
        ...chartBaseConfig,
        series: [{
            type: 'boxPlot',
            data: [
                { x: 'Price Range', y: [450, 1200, 1450, 2800, 12900] }
            ]
        }],
        chart: { ...chartBaseConfig.chart, type: 'boxPlot', sparkline: { enabled: true } },
        colors: ['#58a6ff', '#3fb950'],
        plotOptions: { boxPlot: { colors: { upper: '#58a6ff', lower: '#161b22' } } }
    }).render();
}

function initHealthBars() {
    const container = document.getElementById('category-health-bars');
    const data = [
        { name: 'Electronic Cluster', score: 85, color: '#3fb950' },
        { name: 'Office Furniture', score: 62, color: '#d29922' },
        { name: 'Storage Solutions', score: 91, color: '#3fb950' },
        { name: 'Computer Accessories', score: 45, color: '#f85149' }
    ];

    container.innerHTML = data.map(d => `
        <div>
            <div class="flex justify-between text-[11px] font-bold mb-1 uppercase tracking-tight">
                <span>${d.name}</span>
                <span>${d.score}%</span>
            </div>
            <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div class="h-full transition-all duration-1000 ease-out" style="width: ${d.score}%; background-color: ${d.color}"></div>
            </div>
        </div>
    `).join('');
}

function initTopInventory() {
    const container = document.getElementById('top-inventory-list');
    const items = [
        { name: 'Industrial Server Rack', value: '₺240.000', change: '+5%' },
        { name: 'High-End Gaming PC', value: '₺185.200', change: '+2%' },
        { name: 'Professional Camera Kit', value: '₺142.500', change: '-1%' },
        { name: 'Ergo Workstation Set', value: '₺98.000', change: '+12%' }
    ];

    container.innerHTML = items.map(item => `
        <div class="flex items-center justify-between group cursor-pointer">
            <div class="flex flex-col">
                <span class="text-body-sm font-bold text-on-surface truncate w-32">${item.name}</span>
                <span class="text-[10px] text-on-surface-variant">Inventory Cap</span>
            </div>
            <div class="text-right">
                <div class="text-body-md font-bold text-primary">${item.value}</div>
                <div class="text-[10px] ${item.change.startsWith('+') ? 'text-secondary' : 'text-error'} font-mono">${item.change}</div>
            </div>
        </div>
    `).join('');
}

function initAnomalies() {
    const container = document.getElementById('anomalies-list');
    const items = [
        { id: '1029', msg: 'Sudden Price Drop', product: 'Wireless Mouse', impact: '-40%' },
        { id: '4491', msg: 'Margin Inconsistency', product: 'Office Chair', impact: 'Check SKU' }
    ];

    container.innerHTML = items.map(a => `
        <div class="p-3 bg-error/5 border border-error/20 rounded-lg">
            <div class="flex justify-between items-start mb-1">
                <span class="text-[10px] font-bold text-error uppercase">Ref: #${a.id}</span>
                <span class="material-symbols-outlined text-error text-[14px]">warning</span>
            </div>
            <div class="text-body-sm font-bold text-on-surface">${a.msg}</div>
            <div class="text-[11px] text-on-surface-variant">${a.product} • Impact: ${a.impact}</div>
        </div>
    `).join('');
}

function exportReport() {
    alert("Rapor hazırlanıyor... (CSV/XLSX)");
}

function formatMillions(value) {
    if (value >= 1_000_000_000) return '₺' + (value / 1_000_000_000).toFixed(1) + 'Mrd';
    if (value >= 1_000_000)     return '₺' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000)         return '₺' + (value / 1_000).toFixed(1) + 'B';
    return value.toLocaleString(locale, currencyOptions);
}

async function loadAllData() {
    const t0 = performance.now();
    await Promise.all([
        loadKpis(),
        initTimestamp(),
        initSearchDebounce(),
        loadProducts()
    ]);
    initCharts();
    initHealthBars();
    initTopInventory();
    initAnomalies();

    const ms = Math.round(performance.now() - t0);
    const perfEl = document.getElementById('perf-timer');
    if (perfEl) {
        perfEl.textContent = `Yükleme: ${ms}ms`;
    }
}
