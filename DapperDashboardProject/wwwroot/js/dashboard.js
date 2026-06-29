/* ═══════════════════════════════════════════════════
   Dashboard.js — Yalnızca Dashboard/Index'e ait kod
   Paylaşılan fonksiyonlar shared.js'e taşındı
   ═══════════════════════════════════════════════════ */

const state = {
    isLoading: false,
    filters: { search: '', category: '', status: '', minPrice: null, maxPrice: null },
    pagination: { page: 1, pageSize: 10, totalPages: 1, totalCount: 0 },
    // Full data cache for detail modals
    fullDataCache: {}
};

const SUMMARY_TOP_N = 8;

document.addEventListener('DOMContentLoaded', () => {
    loadCategoryDropdown();
    loadAllData();
});

function initTimestamp() {
    const el = document.getElementById('live-timestamp');
    if (el) setInterval(() => { el.textContent = new Date().toLocaleTimeString(locale); }, 1000);
}

function initSearchDebounce() {
    const input = document.getElementById('search-input');
    if (!input) return;
    let timeout;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            state.filters.search = e.target.value;
            state.pagination.page = 1;
            applyFilters();
        }, 400);
    });
}



async function loadCategoryDropdown() {
    const data = await safeFetch('/Dashboard/GetCategoryNames', []);
    const select = document.getElementById('main-cat');
    if (!select) return;
    select.innerHTML = '<option value="">Tüm Kategoriler</option>' + 
        data.map(c => `<option value="${c}">${c}</option>`).join('');
}

async function loadKpis() {
    const data = await safeFetch('/Dashboard/GetSummary');
    if(!data) return;

    animateValue("kpi-total", 0, data.totalProductCount, 1200);
    animateValue("kpi-active", 0, data.activeProductCount, 1200);
    animateValue("kpi-inactive", 0, data.passiveProductCount, 1200);
    animateValue("kpi-oos", 0, data.totalStockCount, 1200);
    animateValue("kpi-critical", 0, data.activeCategoryCount, 1200);
    animateValue("kpi-cats", 0, data.totalCategoryCount, 1200);

    const avgEl = document.getElementById('kpi-avg-price');
    if (avgEl) {
        const avgFmt = data.averagePrice.toLocaleString(locale, currencyOptions);
        avgEl.textContent = avgFmt; avgEl.title = avgFmt;
    }

    const invEl = document.getElementById('kpi-inv-value');
    if (invEl) {
        invEl.textContent = formatMillions(data.totalStockValue);
        invEl.title = data.totalStockValue.toLocaleString(locale, currencyOptions);
    }
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString(locale);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

async function loadProducts() {
    const tbody = document.getElementById('product-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7"><div class="loading-skeleton h-16 w-full"></div></td></tr>`;
    
    let url = `/Dashboard/GetProductsTable?search=${encodeURIComponent(state.filters.search)}&category=${encodeURIComponent(state.filters.category)}&status=${encodeURIComponent(state.filters.status)}&page=${state.pagination.page}&pageSize=${state.pagination.pageSize}`;
    if (state.filters.minPrice) url += `&minPrice=${state.filters.minPrice}`;
    if (state.filters.maxPrice) url += `&maxPrice=${state.filters.maxPrice}`;

    const pagedData = await safeFetch(url);
    if (!pagedData || !pagedData.items || pagedData.items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">Ürün Bulunamadı</div></td></tr>`;
        return;
    }

    state.pagination.totalPages = pagedData.totalPages;
    state.pagination.totalCount = pagedData.totalCount;

    tbody.innerHTML = pagedData.items.map(p => `
        <tr class="border-b border-outline-variant hover:bg-surface-container-highest transition-colors cursor-pointer group">
            <td class="p-4 text-body-sm font-mono text-on-surface-variant">#${p.productId}</td>
            <td class="p-4"><div class="cell-truncate text-body-md font-semibold text-on-surface group-hover:text-primary" title="${p.productName}">${p.productName}</div></td>
            <td class="p-4"><div class="cell-truncate text-body-sm" title="${p.categoryName}">${p.categoryName}</div></td>
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

    renderPagination();
}

function renderPagination() {
    const footer = document.getElementById('pagination-footer');
    if(!footer) return;
    let startItem = (state.pagination.page - 1) * state.pagination.pageSize + 1;
    let endItem = Math.min(state.pagination.page * state.pagination.pageSize, state.pagination.totalCount);
    
    if (state.pagination.totalCount === 0) {
        startItem = 0; endItem = 0;
    }

    footer.innerHTML = `
        <span class="text-body-sm text-on-surface-variant">Toplam ${state.pagination.totalCount.toLocaleString()} kayıttan ${startItem}-${endItem} arası gösteriliyor</span>
        <div class="flex gap-2">
            <button onclick="changePage(${state.pagination.page - 1})" class="p-2 border border-outline-variant rounded hover:bg-surface-container-highest disabled:opacity-30" ${state.pagination.page <= 1 ? 'disabled' : ''}><span class="material-symbols-outlined">chevron_left</span></button>
            <button class="px-3 py-1 bg-primary text-surface rounded text-label-md font-bold">${state.pagination.page}</button>
            <span class="px-2 py-1 text-on-surface-variant">/ ${state.pagination.totalPages}</span>
            <button onclick="changePage(${state.pagination.page + 1})" class="p-2 border border-outline-variant rounded hover:bg-surface-container-highest disabled:opacity-30" ${state.pagination.page >= state.pagination.totalPages ? 'disabled' : ''}><span class="material-symbols-outlined">chevron_right</span></button>
        </div>
    `;
}

window.changePage = function(newPage) {
    if (newPage < 1 || newPage > state.pagination.totalPages) return;
    state.pagination.page = newPage;
    loadProducts();
};

/* ═══════════════════════════════════════════════════
   Charts — Summary/Detail with Label Truncation
   ═══════════════════════════════════════════════════ */

async function initCharts() {
    const base = getChartBaseConfig();

    function render(selector, config, data) {
        if (!document.querySelector(selector)) return;
        if (!data || data.length === 0) {
            renderEmptyState(selector);
            return;
        }
        new ApexCharts(document.querySelector(selector), config).render();
    }

    // ── Main Category Distribution (horizontal bar, summary top N) ──
    const catData = await safeFetch(`/Dashboard/GetCategoryDistribution?top=${SUMMARY_TOP_N}`, []);
    state.fullDataCache.catDistribution = null;
    const catFullNames = catData.map(c => c.categoryName);
    render("#chart-main-cat", {
        ...base,
        series: [{ data: catData.map(c => c.count) }],
        chart: { ...base.chart, type: 'bar' },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
        colors: ['#58a6ff'],
        xaxis: safeYaxisCat(catFullNames, LABEL_MAX_LEN),
        tooltip: fullLabelTooltip(catFullNames)
    }, catData);

    // ── Status Donut ──
    const statData = await safeFetch('/Dashboard/GetStatusDistribution', []);
    render("#chart-status-donut", {
        ...base,
        series: statData.map(s => s.count),
        chart: { ...base.chart, type: 'donut' },
        labels: statData.map(s => s.status),
        colors: ['#3fb950', '#30363d'],
        plotOptions: { pie: { donut: { size: '75%' } } },
        legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#8b949e' }, markers: { width: 10, height: 10 } }
    }, statData);

    // ── Category Status Split (stacked bar, summary) ──
    const splitData = await safeFetch(`/Dashboard/GetCategoryStatusSplit?top=${SUMMARY_TOP_N}`, []);
    state.fullDataCache.catStatusSplit = null;
    const splitFullNames = splitData.map(c => c.categoryName);
    render("#chart-cat-split", {
        ...base,
        series: [
            { name: 'Aktif', data: splitData.map(c => c.activeCount) },
            { name: 'Pasif', data: splitData.map(c => c.passiveCount) }
        ],
        chart: { ...base.chart, type: 'bar', stacked: true },
        colors: ['#58a6ff', '#30363d'],
        xaxis: { ...safeXaxis(splitFullNames, splitFullNames, LABEL_MAX_LEN) },
        tooltip: fullLabelTooltip(splitFullNames)
    }, splitData);

    // ── Price Distribution (bar) ──
    const priceData = await safeFetch('/Dashboard/GetPriceDistribution', []);
    render("#chart-price-dist", {
        ...base,
        series: [{ name: 'Adet', data: priceData.map(p => p.productCount) }],
        chart: { ...base.chart, type: 'bar' },
        colors: ['#79c0ff'],
        xaxis: safeXaxis(priceData.map(p => p.priceRange), priceData.map(p => p.priceRange), 14)
    }, priceData);

    // ── ABC Analysis (pie) ──
    const abcData = await safeFetch('/Dashboard/GetAbcAnalysis', []);
    render("#chart-abc", {
        ...base,
        series: abcData.map(a => a.productCount),
        chart: { ...base.chart, type: 'pie' },
        labels: abcData.map(a => a.className),
        colors: ['#bc8cff', '#58a6ff', '#30363d'],
        legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#8b949e' }, markers: { width: 10, height: 10 } }
    }, abcData);

    // ── Risk Matrix (radialBar) ──
    const riskData = await safeFetch('/Dashboard/GetRiskMatrix', []);
    render("#chart-risk", {
        ...base,
        series: riskData.map(r => r.count),
        chart: { ...base.chart, type: 'radialBar' },
        labels: riskData.map(r => r.riskLevel),
        colors: ['#3fb950', '#d29922', '#f85149']
    }, riskData);

    // ── Radar — summary view (top 8, with truncated pointLabels) ──
    const scorecardData = await safeFetch('/Dashboard/GetCategoryScorecard', []);
    const summaryScorecard = scorecardData.slice(0, SUMMARY_TOP_N);
    state.fullDataCache.scorecard = scorecardData;
    const radarFullNames = summaryScorecard.map(s => s.categoryName);
    render("#chart-radar", {
        ...base,
        series: [{ name: 'Performans Skoru', data: summaryScorecard.map(s => s.overallScore) }],
        chart: { ...base.chart, type: 'radar' },
        labels: truncateLabels(radarFullNames, LABEL_MAX_LEN),
        colors: ['#bc8cff'],
        legend: { show: false },
        plotOptions: { radar: { polygons: { strokeColors: '#30363d', connectorColors: '#30363d' } } },
        xaxis: { labels: { style: { fontSize: '10px', colors: Array(radarFullNames.length).fill('#8b949e') } } },
        tooltip: fullLabelTooltip(radarFullNames)
    }, summaryScorecard);

    // ── Trend chart — summary view (price stats, mixed column+line) ──
    const trendData = await safeFetch('/Dashboard/GetCategoryTrendAnalysis', []);
    const summaryTrend = trendData.slice(0, SUMMARY_TOP_N);
    state.fullDataCache.trend = trendData;
    const trendFullNames = summaryTrend.map(t => t.categoryName);
    render("#chart-percentile", {
        ...base,
        series: [
            { name: 'Ortalama Fiyat', type: 'column', data: summaryTrend.map(t => t.categoryAveragePrice) },
            { name: 'En Yüksek Sapma %', type: 'line', data: summaryTrend.map(t => t.deviationPercentage) }
        ],
        chart: { ...base.chart, type: 'line' },
        xaxis: safeXaxis(trendFullNames, trendFullNames, LABEL_MAX_LEN),
        yaxis: [
            { labels: { formatter: (val) => formatCurrencyShort(val), style: { fontSize: '10px' } }, title: { text: 'Fiyat', style: { fontSize: '10px', color: '#8b949e' } } },
            { opposite: true, labels: { formatter: (val) => val.toFixed(0) + '%', style: { fontSize: '10px' } }, title: { text: 'Sapma', style: { fontSize: '10px', color: '#8b949e' } } }
        ],
        colors: ['#30363d', '#f85149'],
        stroke: { width: [0, 3] },
        tooltip: fullLabelTooltip(trendFullNames)
    }, summaryTrend);
}

/* ═══════════════════════════════════════════════════
   Category Health Accordion
   ═══════════════════════════════════════════════════ */
async function initHealthBars() {
    const data = await safeFetch('/Dashboard/GetCategoryHealth', []);
    const container = document.getElementById('category-health-bars');
    if (!container) return;
    if (data.length === 0) { renderEmptyState('#category-health-bars'); return; }
    
    container.innerHTML = data.map(d => `
        <div>
            <div class="flex justify-between text-[11px] font-bold mb-1 uppercase tracking-tight">
                <span class="cell-truncate" style="max-width:160px" title="${d.categoryName}">${d.categoryName}</span><span>${d.score}%</span>
            </div>
            <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div class="h-full transition-all duration-1000 ease-out" style="width: ${d.score}%; background-color: ${d.color}"></div>
            </div>
        </div>
    `).join('');
}

// Accordion toggle function
window.toggleCategoryHealth = function() {
    const wrapper = document.getElementById('health-accordion-wrapper');
    const btn = document.getElementById('health-toggle-btn');
    const section = document.getElementById('category-health-section');
    if (!wrapper || !btn) return;

    const isCollapsed = wrapper.classList.contains('collapsed');
    
    if (isCollapsed) {
        wrapper.classList.remove('collapsed');
        wrapper.classList.add('expanded');
        wrapper.parentElement.classList.remove('collapsed');
        wrapper.parentElement.classList.add('expanded');
        btn.classList.add('expanded');
        btn.innerHTML = `<span class="material-symbols-outlined">expand_less</span> Daralt`;
        
        setTimeout(() => {
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    } else {
        wrapper.classList.remove('expanded');
        wrapper.classList.add('collapsed');
        wrapper.parentElement.classList.remove('expanded');
        wrapper.parentElement.classList.add('collapsed');
        btn.classList.remove('expanded');
        btn.innerHTML = `<span class="material-symbols-outlined">expand_more</span> Daha Fazla Göster`;
    }
};

/* ═══════════════════════════════════════════════════
   Detail Modal — Open/Close (with label truncation)
   ═══════════════════════════════════════════════════ */
window.openDetailModal = async function(chartType) {
    const overlay = document.getElementById('detail-modal-overlay');
    const title = document.getElementById('detail-modal-title');
    const body = document.getElementById('detail-modal-body');
    if (!overlay || !body) return;

    const base = getChartBaseConfig();
    const modalBase = {
        ...base,
        dataLabels: { enabled: true, style: { fontSize: '10px' } }
    };

    body.innerHTML = '<div class="loading-skeleton h-64 w-full rounded-xl"></div>';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    let modalTitle = '';
    let chartHtml = '<div id="detail-chart" class="modal-chart-wrapper"></div>';

    // Track current modal Chart.js instance for destroy
    let _modalChartInstance = null;
    function destroyModalChart() {
        if (_modalChartInstance) {
            _modalChartInstance.destroy();
            _modalChartInstance = null;
        }
    }

    // Helper: inject reset button into modal body
    function addResetButton(container, chartInstance) {
        const btn = document.createElement('button');
        btn.innerHTML = '↺ Sıfırla';
        btn.style.cssText = 'position:absolute;top:12px;right:12px;z-index:10;background:rgba(88,166,255,0.15);color:#58a6ff;border:1px solid #58a6ff;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s;';
        btn.onmouseenter = () => { btn.style.background = 'rgba(88,166,255,0.3)'; };
        btn.onmouseleave = () => { btn.style.background = 'rgba(88,166,255,0.15)'; };
        btn.onclick = () => { chartInstance.resetZoom(); };
        container.style.position = 'relative';
        container.appendChild(btn);
    }

    try {
        switch (chartType) {
            case 'catDistribution': {
                modalTitle = 'Ana Kategori Dağılımı — Tüm Veriler';
                const data = await safeFetch('/Dashboard/GetCategoryDistribution', []);
                const fullNames = data.map(c => c.categoryName);
                // Dynamic height: min 450px, scale with item count
                const chartHeight = Math.max(450, data.length * 28);
                body.innerHTML = chartHtml;
                new ApexCharts(document.querySelector('#detail-chart'), {
                    ...modalBase,
                    series: [{ data: data.map(c => c.count) }],
                    chart: { ...modalBase.chart, type: 'bar', height: chartHeight },
                    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '50%' } },
                    colors: ['#58a6ff'],
                    xaxis: safeYaxisCat(fullNames, 18),
                    tooltip: fullLabelTooltip(fullNames),
                    legend: { show: false }
                }).render();
                break;
            }
            case 'catStatusSplit': {
                modalTitle = 'Kategori Durum Karşılaştırması — Tüm Veriler';
                const data = await safeFetch('/Dashboard/GetCategoryStatusSplit', []);
                const fullNames = data.map(c => c.categoryName);
                const truncatedNames = fullNames.map(n => truncateLabel(n, 14));
                body.innerHTML = '<div id="detail-chart-wrapper" style="position:relative;width:100%;min-height:500px;"><canvas id="detail-canvas"></canvas></div>';
                destroyModalChart();
                const ctx1 = document.getElementById('detail-canvas').getContext('2d');
                _modalChartInstance = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: truncatedNames,
                        datasets: [
                            { label: 'Aktif', data: data.map(c => c.activeCount), backgroundColor: '#58a6ff', borderRadius: 3 },
                            { label: 'Pasif', data: data.map(c => c.passiveCount), backgroundColor: '#f85149', borderRadius: 3 }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                stacked: true,
                                min: 0,
                                max: Math.min(20, fullNames.length - 1),
                                ticks: { color: '#8b949e', font: { size: 11 }, maxRotation: 45 },
                                grid: { color: '#30363d', drawTicks: false }
                            },
                            y: {
                                stacked: true,
                                ticks: { color: '#8b949e', font: { size: 11 } },
                                grid: { color: '#30363d' }
                            }
                        },
                        plugins: {
                            legend: { labels: { color: '#dae3ee', font: { size: 12 } } },
                            tooltip: {
                                backgroundColor: '#161b22',
                                borderColor: '#30363d',
                                borderWidth: 1,
                                titleColor: '#dae3ee',
                                bodyColor: '#8b949e',
                                callbacks: {
                                    title: (items) => fullNames[items[0].dataIndex] || items[0].label
                                }
                            },
                            zoom: {
                                pan: { enabled: true, mode: 'x' },
                                zoom: {
                                    wheel: { enabled: true },
                                    pinch: { enabled: true },
                                    mode: 'x'
                                },
                                limits: {
                                    x: { min: 0, max: fullNames.length - 1, minRange: 10 }
                                }
                            }
                        }
                    }
                });
                addResetButton(document.getElementById('detail-chart-wrapper'), _modalChartInstance);
                break;
            }
            case 'radar': {
                modalTitle = 'Kategori Karşılaştırma Endeksi — Detay';
                const data = state.fullDataCache.scorecard || await safeFetch('/Dashboard/GetCategoryScorecard', []);
                const fullNames = data.map(s => s.categoryName);
                const scores = data.map(s => s.overallScore);
                const truncatedNames = fullNames.map(n => truncateLabel(n, 16));
                const barColors = scores.map(v => v >= 60 ? '#3fb950' : v >= 30 ? '#d29922' : '#f85149');
                body.innerHTML = '<div id="detail-chart-wrapper" style="position:relative;width:100%;min-height:500px;"><canvas id="detail-canvas"></canvas></div>';
                destroyModalChart();
                const ctx2 = document.getElementById('detail-canvas').getContext('2d');
                _modalChartInstance = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: truncatedNames,
                        datasets: [{
                            label: 'Performans Skoru',
                            data: scores,
                            backgroundColor: barColors,
                            borderRadius: 4,
                            barThickness: 18
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                min: 0,
                                max: Math.min(15, fullNames.length - 1),
                                ticks: { color: '#8b949e', font: { size: 11 } },
                                grid: { display: false }
                            },
                            x: {
                                ticks: { color: '#8b949e', font: { size: 11 } },
                                grid: { color: '#30363d' },
                                title: { display: true, text: 'Performans Skoru', color: '#8b949e', font: { size: 11 } }
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: '#161b22',
                                borderColor: '#30363d',
                                borderWidth: 1,
                                titleColor: '#dae3ee',
                                bodyColor: '#8b949e',
                                callbacks: {
                                    title: (items) => fullNames[items[0].dataIndex],
                                    label: (item) => `Endeks: ${item.raw.toFixed(1)}`
                                }
                            },
                            zoom: {
                                pan: { enabled: true, mode: 'y' },
                                zoom: {
                                    wheel: { enabled: true },
                                    pinch: { enabled: true },
                                    mode: 'y'
                                },
                                limits: {
                                    y: { min: 0, max: fullNames.length - 1, minRange: 5 }
                                }
                            }
                        }
                    }
                });
                addResetButton(document.getElementById('detail-chart-wrapper'), _modalChartInstance);
                break;
            }
            case 'priceStats': {
                modalTitle = 'Fiyat İstatistikleri & Dağılımı — Detay';
                const data = state.fullDataCache.trend || await safeFetch('/Dashboard/GetCategoryTrendAnalysis', []);
                const fullNames = data.map(t => t.categoryName);
                const prices = data.map(t => t.categoryAveragePrice);
                const deviations = data.map(t => t.deviationPercentage);
                const totalCount = fullNames.length;
                const midIndex = Math.floor(totalCount / 2);

                body.innerHTML = '<div id="detail-chart-wrapper" style="position:relative;width:100%;min-height:500px;"><canvas id="detail-canvas"></canvas></div>';
                destroyModalChart();
                const ctx3 = document.getElementById('detail-canvas').getContext('2d');

                // Smart label visibility state
                let showAllLabels = false;

                _modalChartInstance = new Chart(ctx3, {
                    type: 'bar',
                    data: {
                        labels: fullNames.map(n => truncateLabel(n, 10)),
                        datasets: [
                            {
                                label: 'Ortalama Fiyat',
                                data: prices,
                                backgroundColor: 'rgba(48, 54, 61, 0.8)',
                                borderRadius: 3,
                                yAxisID: 'y',
                                order: 2
                            },
                            {
                                label: 'En Yüksek Sapma %',
                                data: deviations,
                                type: 'line',
                                borderColor: '#f85149',
                                backgroundColor: 'rgba(248, 81, 73, 0.1)',
                                pointRadius: 2,
                                pointHoverRadius: 5,
                                borderWidth: 2,
                                tension: 0.3,
                                yAxisID: 'y1',
                                order: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                ticks: {
                                    color: '#8b949e',
                                    font: { size: 10 },
                                    maxRotation: 45,
                                    callback: function(value, index) {
                                        if (showAllLabels) return this.getLabelForValue(value);
                                        // Show only first, middle, last
                                        if (index === 0 || index === midIndex || index === totalCount - 1) {
                                            return this.getLabelForValue(value);
                                        }
                                        return '';
                                    }
                                },
                                grid: { color: '#30363d', drawTicks: false }
                            },
                            y: {
                                position: 'left',
                                ticks: {
                                    color: '#8b949e',
                                    font: { size: 10 },
                                    callback: (val) => formatCurrencyShort(val)
                                },
                                grid: { color: '#30363d' },
                                title: { display: true, text: 'Fiyat', color: '#8b949e', font: { size: 10 } }
                            },
                            y1: {
                                position: 'right',
                                ticks: {
                                    color: '#8b949e',
                                    font: { size: 10 },
                                    callback: (val) => val.toFixed(0) + '%'
                                },
                                grid: { drawOnChartArea: false },
                                title: { display: true, text: 'Sapma', color: '#8b949e', font: { size: 10 } }
                            }
                        },
                        plugins: {
                            legend: { labels: { color: '#dae3ee', font: { size: 12 } } },
                            tooltip: {
                                backgroundColor: '#161b22',
                                borderColor: '#30363d',
                                borderWidth: 1,
                                titleColor: '#dae3ee',
                                bodyColor: '#8b949e',
                                callbacks: {
                                    title: (items) => fullNames[items[0].dataIndex]
                                }
                            },
                            zoom: {
                                pan: { enabled: true, mode: 'x' },
                                zoom: {
                                    wheel: { enabled: true },
                                    pinch: { enabled: true },
                                    mode: 'x',
                                    onZoom: ({ chart }) => {
                                        const xScale = chart.scales.x;
                                        const visibleCount = xScale.max - xScale.min + 1;
                                        const shouldShowAll = visibleCount <= 30;
                                        if (shouldShowAll !== showAllLabels) {
                                            showAllLabels = shouldShowAll;
                                            chart.update('none');
                                        }
                                    },
                                    onZoomComplete: ({ chart }) => {
                                        const xScale = chart.scales.x;
                                        const visibleCount = xScale.max - xScale.min + 1;
                                        const shouldShowAll = visibleCount <= 30;
                                        if (shouldShowAll !== showAllLabels) {
                                            showAllLabels = shouldShowAll;
                                            chart.update('none');
                                        }
                                    }
                                },
                                limits: {
                                    x: { min: 0, max: totalCount - 1, minRange: 5 }
                                }
                            }
                        }
                    }
                });
                addResetButton(document.getElementById('detail-chart-wrapper'), _modalChartInstance);
                break;
            }
        }
    } catch (e) {
        body.innerHTML = '<div class="empty-state">Veri yüklenemedi</div>';
    }

    if (title) title.textContent = modalTitle;
};

window.closeDetailModal = function() {
    const overlay = document.getElementById('detail-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        const body = document.getElementById('detail-modal-body');
        // Destroy any Chart.js instance inside the modal
        const canvas = body ? body.querySelector('canvas') : null;
        if (canvas && canvas._chartjs_instance) {
            canvas._chartjs_instance.destroy();
        }
        if (body) body.innerHTML = '';
    }, 350);
};

// Close modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetailModal();
});

/* ═══════════════════════════════════════════════════
   Other Widgets
   ═══════════════════════════════════════════════════ */
async function initTopInventory() {
    const data = await safeFetch('/Dashboard/GetTopInventory', []);
    const container = document.getElementById('top-inventory-list');
    if (!container) return;
    if (data.length === 0) { renderEmptyState('#top-inventory-list'); return; }

    container.innerHTML = data.map(item => `
        <div class="flex items-center justify-between group cursor-pointer border-b border-outline-variant pb-2">
            <div class="flex flex-col">
                <span class="cell-truncate text-body-sm font-bold text-on-surface" style="max-width:140px" title="${item.productName}">${item.productName}</span>
            </div>
            <div class="text-right">
                <div class="text-body-md font-bold text-primary">₺${formatMillions(item.inventoryValue)}</div>
            </div>
        </div>
    `).join('');
}

async function initAnomalies() {
    const data = await safeFetch('/Dashboard/GetAnomalies', []);
    const container = document.getElementById('anomalies-list');
    if (!container) return;
    if (data.length === 0) {
        container.innerHTML = `<div class="p-3 text-secondary font-bold flex items-center gap-2"><span class="material-symbols-outlined">check_circle</span> Anomali Bulunmadı</div>`;
        return;
    }

    container.innerHTML = data.map(a => `
        <div class="p-3 bg-error/5 border border-error/20 rounded-lg">
            <div class="flex justify-between items-start mb-1">
                <span class="text-[10px] font-bold text-error uppercase">Ref: #${a.productId}</span>
            </div>
            <div class="text-body-sm font-bold text-on-surface">${a.anomalyMessage}</div>
            <div class="cell-truncate text-[11px] text-on-surface-variant" style="max-width:260px" title="${a.productName} • Impact: ${a.impact}">${a.productName} • Impact: ${a.impact}</div>
        </div>
    `).join('');
}

function formatMillions(value) {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + ' Mrd';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + ' M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + ' B';
    return value.toLocaleString(locale);
}

window.applyFilters = function() {
    const cat = document.getElementById('main-cat')?.value || '';
    const statusVal = document.getElementById('active-status')?.value || '';
    const min = document.getElementById('price-min')?.value || null;
    const max = document.getElementById('price-max')?.value || null;
    
    state.filters.category = cat;
    state.filters.status = statusVal;
    state.filters.minPrice = min;
    state.filters.maxPrice = max;
    state.pagination.page = 1;
    
    loadProducts();
}

/* ═══════════════════════════════════════════════════
   Lazy Chart Render with IntersectionObserver
   ═══════════════════════════════════════════════════ */
async function loadAllData() {
    await Promise.all([
        loadKpis(),
        initTimestamp(),
        initSearchDebounce(),
        loadProducts()
    ]);
    
    if ('IntersectionObserver' in window) {
        const chartSections = document.querySelectorAll('.chart-container, #category-health-bars');
        let chartsLoaded = false;
        
        const observer = new IntersectionObserver((entries) => {
            if (chartsLoaded) return;
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    chartsLoaded = true;
                    initCharts();
                    initHealthBars();
                    initTopInventory();
                    initAnomalies();
                    observer.disconnect();
                    break;
                }
            }
        }, { rootMargin: '200px' });

        chartSections.forEach(el => observer.observe(el));
        
        setTimeout(() => {
            if (!chartsLoaded) {
                chartsLoaded = true;
                initCharts();
                initHealthBars();
                initTopInventory();
                initAnomalies();
                observer.disconnect();
            }
        }, 2000);
    } else {
        await Promise.all([
            initCharts(),
            initHealthBars(),
            initTopInventory(),
            initAnomalies()
        ]);
    }
}


