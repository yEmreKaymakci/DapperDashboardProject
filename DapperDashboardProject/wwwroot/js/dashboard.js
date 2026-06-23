const state = {
    isLoading: false,
    filters: { search: '', category: '', status: '', isActive: '', minPrice: null, maxPrice: null }
};

const locale = 'tr-TR';
const currencyOptions = { style: 'currency', currency: 'TRY' };

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});

function initTimestamp() {
    const el = document.getElementById('live-timestamp');
    setInterval(() => { el.textContent = new Date().toLocaleTimeString(locale); }, 1000);
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

async function loadKpis() {
    const res = await fetch('/Dashboard/GetSummary');
    const data = await res.json();

    animateValue("kpi-total", 0, data.totalProductCount, 1200);
    animateValue("kpi-active", 0, data.activeProductCount, 1200);
    animateValue("kpi-inactive", 0, data.passiveProductCount, 1200);
    animateValue("kpi-oos", 0, data.totalStockCount, 1200);
    animateValue("kpi-critical", 0, data.activeCategoryCount, 1200);
    animateValue("kpi-cats", 0, data.totalCategoryCount, 1200);

    const avgEl = document.getElementById('kpi-avg-price');
    const avgFmt = data.averagePrice.toLocaleString(locale, currencyOptions);
    avgEl.textContent = avgFmt; avgEl.title = avgFmt;

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
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

async function loadProducts() {
    const res = await fetch(`/Dashboard/GetProductsTable?search=${state.filters.search}`);
    const data = await res.json();
    const tbody = document.getElementById('product-tbody');

    tbody.innerHTML = data.map(p => `
        <tr class="border-b border-outline-variant hover:bg-surface-container-highest transition-colors cursor-pointer group" onclick="openSideDrawer(${JSON.stringify(p).replace(/"/g, '&quot;')})">
            <td class="p-4 text-body-sm font-mono text-on-surface-variant">#${p.productId}</td>
            <td class="p-4"><div class="text-body-md font-semibold text-on-surface group-hover:text-primary">${p.productName}</div></td>
            <td class="p-4 text-body-sm">${p.categoryName}</td>
            <td class="p-4 text-body-md font-bold">${p.price.toLocaleString(locale, currencyOptions)}</td>
            <td class="p-4"><span class="text-body-md ${p.stock < 10 ? 'text-error font-bold' : ''}">${p.stock}</span></td>
            <td class="p-4">
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${p.isActive ? 'bg-secondary/10 text-secondary' : 'bg-on-surface-variant/10 text-on-surface-variant'}">
                    ${p.isActive ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td class="p-4 text-right">
                <button class="text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-sm">more_vert</span></button>
            </td>
        </tr>
    `).join('');
}

async function initCharts() {
    const chartBaseConfig = {
        chart: { toolbar: { show: false }, background: 'transparent', foreColor: '#8b949e', fontFamily: 'Inter' },
        grid: { borderColor: '#30363d', strokeDashArray: 4 },
        dataLabels: { enabled: false }, stroke: { curve: 'smooth', width: 2 }, theme: { mode: 'dark' }
    };

    // Main Category Distribution
    const catRes = await fetch('/Dashboard/GetCategoryDistribution');
    const catData = await catRes.json();
    new ApexCharts(document.querySelector("#chart-main-cat"), {
        ...chartBaseConfig,
        series: [{ data: catData.map(c => c.count) }],
        chart: { ...chartBaseConfig.chart, type: 'bar' },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
        colors: ['#58a6ff'],
        xaxis: { categories: catData.map(c => c.categoryName) }
    }).render();

    // Status Donut
    const statRes = await fetch('/Dashboard/GetStatusDistribution');
    const statData = await statRes.json();
    new ApexCharts(document.querySelector("#chart-status-donut"), {
        ...chartBaseConfig,
        series: statData.map(s => s.count),
        chart: { ...chartBaseConfig.chart, type: 'donut' },
        labels: statData.map(s => s.status),
        colors: ['#3fb950', '#30363d'],
        plotOptions: { pie: { donut: { size: '75%' } } }
    }).render();

    // Category Status Split
    const splitRes = await fetch('/Dashboard/GetCategoryStatusSplit');
    const splitData = await splitRes.json();
    new ApexCharts(document.querySelector("#chart-cat-split"), {
        ...chartBaseConfig,
        series: [
            { name: 'Aktif', data: splitData.map(c => c.activeCount) },
            { name: 'Pasif', data: splitData.map(c => c.passiveCount) }
        ],
        chart: { ...chartBaseConfig.chart, type: 'bar', stacked: true },
        colors: ['#58a6ff', '#30363d'],
        xaxis: { categories: splitData.map(c => c.categoryName) }
    }).render();

    // Price Distribution
    const priceRes = await fetch('/Dashboard/GetPriceDistribution');
    const priceData = await priceRes.json();
    new ApexCharts(document.querySelector("#chart-price-dist"), {
        ...chartBaseConfig,
        series: [{ name: 'Adet', data: priceData.map(p => p.productCount) }],
        chart: { ...chartBaseConfig.chart, type: 'bar' },
        colors: ['#79c0ff'],
        xaxis: { categories: priceData.map(p => p.priceRange) }
    }).render();

    // ABC Analysis
    const abcRes = await fetch('/Dashboard/GetAbcAnalysis');
    const abcData = await abcRes.json();
    new ApexCharts(document.querySelector("#chart-abc"), {
        ...chartBaseConfig,
        series: abcData.map(a => a.productCount),
        chart: { ...chartBaseConfig.chart, type: 'pie' },
        labels: abcData.map(a => a.className),
        colors: ['#bc8cff', '#58a6ff', '#30363d']
    }).render();

    // Risk Matrix
    const riskRes = await fetch('/Dashboard/GetRiskMatrix');
    const riskData = await riskRes.json();
    new ApexCharts(document.querySelector("#chart-risk"), {
        ...chartBaseConfig,
        series: riskData.map(r => r.count),
        chart: { ...chartBaseConfig.chart, type: 'radialBar' },
        labels: riskData.map(r => r.riskLevel),
        colors: ['#3fb950', '#d29922', '#f85149']
    }).render();
}

async function initHealthBars() {
    const res = await fetch('/Dashboard/GetCategoryHealth');
    const data = await res.json();
    const container = document.getElementById('category-health-bars');
    container.innerHTML = data.map(d => `
        <div>
            <div class="flex justify-between text-[11px] font-bold mb-1 uppercase tracking-tight">
                <span>${d.categoryName}</span><span>${d.score}%</span>
            </div>
            <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div class="h-full transition-all duration-1000 ease-out" style="width: ${d.score}%; background-color: ${d.color}"></div>
            </div>
        </div>
    `).join('');
}

async function initTopInventory() {
    const res = await fetch('/Dashboard/GetTopInventory');
    const data = await res.json();
    const container = document.getElementById('top-inventory-list');
    container.innerHTML = data.map(item => `
        <div class="flex items-center justify-between group cursor-pointer">
            <div class="flex flex-col">
                <span class="text-body-sm font-bold text-on-surface truncate w-32">${item.name}</span>
            </div>
            <div class="text-right">
                <div class="text-body-md font-bold text-primary">₺${item.value.toLocaleString(locale)}</div>
            </div>
        </div>
    `).join('');
}

async function initAnomalies() {
    const res = await fetch('/Dashboard/GetAnomalies');
    const data = await res.json();
    const container = document.getElementById('anomalies-list');
    container.innerHTML = data.map(a => `
        <div class="p-3 bg-error/5 border border-error/20 rounded-lg">
            <div class="flex justify-between items-start mb-1">
                <span class="text-[10px] font-bold text-error uppercase">Ref: #${a.id}</span>
            </div>
            <div class="text-body-sm font-bold text-on-surface">${a.msg}</div>
            <div class="text-[11px] text-on-surface-variant">${a.product} • Impact: ${a.impact}</div>
        </div>
    `).join('');
}

function formatMillions(value) {
    if (value >= 1_000_000_000) return '₺' + (value / 1_000_000_000).toFixed(1) + 'Mrd';
    if (value >= 1_000_000) return '₺' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return '₺' + (value / 1_000).toFixed(1) + 'B';
    return value.toLocaleString(locale, currencyOptions);
}

function applyFilters() { loadProducts(); }

async function loadAllData() {
    await Promise.all([
        loadKpis(),
        initTimestamp(),
        initSearchDebounce(),
        loadProducts(),
        initCharts(),
        initHealthBars(),
        initTopInventory(),
        initAnomalies()
    ]);
}
