/* ═══════════════════════════════════════════════════
   Statistics.js — Statistics/Index sayfasına ait kod
   shared.js'ten: safeFetch, renderEmptyState, renderGenericPagination,
                  truncateLabel, truncateLabels, fullLabelTooltip,
                  getChartBaseConfig, formatCurrencyShort
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
    const currency = { style: 'currency', currency: 'TRY' };
    const chartBaseConfig = getChartBaseConfig();

    // Local aliases for brevity
    const trunc = truncateLabel;
    const truncAll = truncateLabels;
    function fullTooltip(fullLabels) { return fullLabelTooltip(fullLabels); }

    // ════════════════════════════════════
    // Paginated Trend Table
    // ════════════════════════════════════
    let trendState = { page: 1, pageSize: 10 };
    
    window.loadTrendPage = async function(page) {
        if (page < 1) return;
        trendState.page = page;
        const data = await safeFetch(`/Dashboard/GetCategoryTrendAnalysisPaged?page=${page}&pageSize=${trendState.pageSize}`, null);
        const trendTbody = document.getElementById('trend-tbody');
        if (!data || !data.items || data.items.length === 0) {
            trendTbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">Veri yok</div></td></tr>';
            return;
        }
        trendTbody.innerHTML = data.items.map(t => `
            <tr class="border-b border-outline-variant hover:bg-surface-container-highest transition-colors">
                <td class="p-3"><div class="cell-truncate text-body-md font-semibold" title="${t.categoryName}">${t.categoryName}</div></td>
                <td class="p-3"><div class="cell-truncate text-body-sm text-on-surface-variant" title="${t.mostExpensiveProductName}">${t.mostExpensiveProductName}</div></td>
                <td class="p-3 text-body-md font-bold text-right">${t.maxPrice.toLocaleString(locale, currency)}</td>
                <td class="p-3 text-body-sm text-on-surface-variant text-right">${t.categoryAveragePrice.toLocaleString(locale, currency)}</td>
                <td class="p-3 text-right">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold
                        ${t.deviationPercentage > 200 ? 'bg-error/10 text-error' : t.deviationPercentage > 50 ? 'bg-warning/10 text-warning' : 'bg-secondary/10 text-secondary'}">
                        ${t.deviationPercentage > 0 ? '+' : ''}${t.deviationPercentage.toFixed(1)}%
                    </span>
                </td>
            </tr>
        `).join('');
        
        renderGenericPagination('trend-pagination', data.currentPage, data.totalPages, data.totalCount, data.pageSize, 'loadTrendPage');
    };
    await loadTrendPage(1);

    // ════════════════════════════════════
    // Paginated Scorecard Table
    // ════════════════════════════════════
    let scorecardState = { page: 1, pageSize: 10 };

    window.loadScorecardPage = async function(page) {
        if (page < 1) return;
        scorecardState.page = page;
        const data = await safeFetch(`/Dashboard/GetCategoryScorecardPaged?page=${page}&pageSize=${scorecardState.pageSize}`, null);
        const scTbody = document.getElementById('scorecard-tbody');
        if (!data || !data.items || data.items.length === 0) {
            scTbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">Veri yok</div></td></tr>';
            return;
        }
        scTbody.innerHTML = data.items.map(s => `
            <tr class="border-b border-outline-variant hover:bg-surface-container-highest transition-colors">
                <td class="p-3 text-body-md font-mono text-on-surface-variant">#${s.performanceRank}</td>
                <td class="p-3"><div class="cell-truncate text-body-md font-semibold" title="${s.categoryName}">${s.categoryName}</div></td>
                <td class="p-3 text-body-md text-right">${s.totalValueScore.toFixed(0)}</td>
                <td class="p-3 text-body-md text-right">${s.activeRatioScore.toFixed(0)}</td>
                <td class="p-3 text-right">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-black
                        ${s.overallScore >= 70 ? 'bg-secondary/10 text-secondary' : s.overallScore >= 40 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}">
                        ${s.overallScore.toFixed(1)}
                    </span>
                </td>
            </tr>
        `).join('');

        renderGenericPagination('scorecard-pagination', data.currentPage, data.totalPages, data.totalCount, data.pageSize, 'loadScorecardPage');
    };
    await loadScorecardPage(1);

    // ════════════════════════════════════
    // Heatmap
    // ════════════════════════════════════
    const heatmapData = await safeFetch('/Dashboard/GetPriceStockHeatmap', []);
    const heatmapGrid = document.getElementById('heatmap-grid');
    if(heatmapData.length > 0) {
        const maxCount = Math.max(...heatmapData.map(h => h.productCount));
        heatmapGrid.innerHTML = heatmapData.map(h => {
            const intensity = Math.max(0.15, h.productCount / maxCount);
            const color = h.stockLevel === 'Out of Stock' ? `rgba(248,81,73,${intensity})` : 
                          h.stockLevel === 'Low Stock' ? `rgba(210,153,34,${intensity})` : 
                          `rgba(63,185,80,${intensity})`;
            return `
                <div class="p-4 rounded-xl border border-outline-variant" style="background: ${color}">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] font-bold uppercase text-on-surface-variant">${h.priceRange}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded font-bold
                            ${h.stockLevel === 'Out of Stock' ? 'bg-error/20 text-error' : h.stockLevel === 'Low Stock' ? 'bg-warning/20 text-warning' : 'bg-secondary/20 text-secondary'}">
                            ${h.stockLevel}
                        </span>
                    </div>
                    <div class="text-xl font-black text-on-surface">${h.productCount.toLocaleString()}</div>
                    <div class="text-[10px] text-on-surface-variant mt-1">Değer: ${h.totalStockValue.toLocaleString(locale, currency)}</div>
                </div>`;
        }).join('');
    } else {
        heatmapGrid.innerHTML = '<div class="empty-state col-span-3">Veri yok</div>';
    }

    // ════════════════════════════════════
    // Radar & Deviation — Summary View (Top 5)
    // ════════════════════════════════════
    const STAT_SUMMARY = 5;
    
    // Cache full data for detail modal
    const fullScorecard = await safeFetch('/Dashboard/GetCategoryScorecard', []);
    const fullTrend = await safeFetch('/Dashboard/GetCategoryTrendAnalysis', []);
    window._statFullData = { scorecard: fullScorecard, trend: fullTrend };

    // Radar Chart — summary (Top 5, truncated labels)
    const summaryRadar = fullScorecard.slice(0, STAT_SUMMARY);
    const radarFullNames = summaryRadar.map(s => s.categoryName);
    if(summaryRadar.length > 0 && document.querySelector('#stat-chart-radar')) {
        new ApexCharts(document.querySelector('#stat-chart-radar'), {
            ...chartBaseConfig,
            series: [{ name: 'Genel Skor', data: summaryRadar.map(s => Math.round(s.overallScore)) }],
            chart: { ...chartBaseConfig.chart, type: 'radar', height: 320 },
            labels: truncAll(radarFullNames, LABEL_MAX_LEN),
            colors: ['#bc8cff'],
            legend: { show: false },
            yaxis: { show: false },
            xaxis: { labels: { style: { fontSize: '10px', colors: Array(radarFullNames.length).fill('#8b949e') } } },
            plotOptions: { radar: { polygons: { strokeColors: '#30363d', connectorColors: '#30363d' } } },
            tooltip: fullTooltip(radarFullNames)
        }).render();
    } else { renderEmptyState('#stat-chart-radar'); }

    // Deviation Chart — summary (Top 5, truncated y-labels)
    const summaryDev = fullTrend.slice(0, STAT_SUMMARY);
    const devFullNames = summaryDev.map(t => t.categoryName);
    if(summaryDev.length > 0 && document.querySelector('#stat-chart-deviation')) {
        new ApexCharts(document.querySelector('#stat-chart-deviation'), {
            ...chartBaseConfig,
            series: [{ name: 'Sapma %', data: summaryDev.map(t => t.deviationPercentage.toFixed(1)) }],
            chart: { ...chartBaseConfig.chart, type: 'bar', height: 320 },
            plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
            xaxis: { categories: truncAll(devFullNames, LABEL_MAX_LEN), labels: { maxWidth: 120, style: { fontSize: '11px' }, trim: true } },
            colors: ['#f85149'],
            tooltip: fullTooltip(devFullNames)
        }).render();
    } else { renderEmptyState('#stat-chart-deviation'); }

    // ════════════════════════════════════
    // Statistics Detail Modal
    // ════════════════════════════════════
    let _statModalChart = null;

    window.openStatDetailModal = function(type) {
        const overlay = document.getElementById('stat-detail-modal');
        const title = document.getElementById('stat-modal-title');
        const body = document.getElementById('stat-modal-body');
        if (!overlay || !body) return;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Destroy previous Chart.js instance
        if (_statModalChart) { _statModalChart.destroy(); _statModalChart = null; }

        if (type === 'radar') {
            title.textContent = 'Kategori Performans Radarı — Tüm Veriler';
            const data = window._statFullData.scorecard;
            const fullNames = data.map(s => s.categoryName);
            const scores = data.map(s => Math.round(s.overallScore));
            const truncatedNames = fullNames.map(n => trunc(n, 16));
            const barColors = scores.map(v => v >= 60 ? '#3fb950' : v >= 30 ? '#d29922' : '#f85149');

            body.innerHTML = '<div id="stat-detail-chart" style="position:relative;width:100%;min-height:500px;"><canvas id="stat-detail-canvas"></canvas></div>';

            const ctx = document.getElementById('stat-detail-canvas').getContext('2d');
            _statModalChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: truncatedNames,
                    datasets: [
                        {
                            label: 'Değer Skoru',
                            data: data.map(s => Math.round(s.totalValueScore)),
                            backgroundColor: 'rgba(88, 166, 255, 0.7)',
                            borderRadius: 3,
                            barThickness: 14
                        },
                        {
                            label: 'Aktiflik Skoru',
                            data: data.map(s => Math.round(s.activeRatioScore)),
                            backgroundColor: 'rgba(188, 140, 255, 0.7)',
                            borderRadius: 3,
                            barThickness: 14
                        },
                        {
                            label: 'Genel Skor',
                            data: scores,
                            backgroundColor: barColors,
                            borderRadius: 4,
                            barThickness: 14
                        }
                    ]
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
                            title: { display: true, text: 'Skor', color: '#8b949e', font: { size: 11 } }
                        }
                    },
                    plugins: {
                        legend: { labels: { color: '#dae3ee', font: { size: 11 } } },
                        tooltip: {
                            backgroundColor: '#161b22',
                            borderColor: '#30363d',
                            borderWidth: 1,
                            titleColor: '#dae3ee',
                            bodyColor: '#8b949e',
                            callbacks: {
                                title: (items) => fullNames[items[0].dataIndex],
                                afterBody: (items) => {
                                    const idx = items[0].dataIndex;
                                    const s = data[idx];
                                    return [
                                        `Değer Skoru: ${s.totalValueScore.toFixed(0)}`,
                                        `Aktiflik Skoru: ${s.activeRatioScore.toFixed(0)}`,
                                        `Genel Skor: ${s.overallScore.toFixed(1)}`
                                    ];
                                }
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

            // Add reset button
            const wrapper = document.getElementById('stat-detail-chart');
            const btn = document.createElement('button');
            btn.innerHTML = '↺ Sıfırla';
            btn.style.cssText = 'position:absolute;top:12px;right:12px;z-index:10;background:rgba(88,166,255,0.15);color:#58a6ff;border:1px solid #58a6ff;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s;';
            btn.onmouseenter = () => { btn.style.background = 'rgba(88,166,255,0.3)'; };
            btn.onmouseleave = () => { btn.style.background = 'rgba(88,166,255,0.15)'; };
            btn.onclick = () => { _statModalChart.resetZoom(); };
            wrapper.appendChild(btn);

        } else if (type === 'deviation') {
            title.textContent = 'Fiyat Sapması Karşılaştırması — Tüm Veriler';
            const data = window._statFullData.trend;
            const fullNames = data.map(t => t.categoryName);
            const chartHeight = Math.max(500, data.length * 26);
            body.innerHTML = '<div id="stat-detail-chart" style="min-height: ' + chartHeight + 'px;"></div>';
            new ApexCharts(document.querySelector('#stat-detail-chart'), {
                ...chartBaseConfig,
                series: [{ name: 'Sapma %', data: data.map(t => t.deviationPercentage.toFixed(1)) }],
                chart: { ...chartBaseConfig.chart, type: 'bar', height: chartHeight },
                plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
                xaxis: {
                    categories: truncAll(fullNames, 16),
                    labels: { maxWidth: 140, style: { fontSize: '11px' }, trim: true }
                },
                colors: ['#f85149'],
                dataLabels: { enabled: true, style: { fontSize: '11px' } },
                tooltip: fullTooltip(fullNames)
            }).render();
        }
    };

    window.closeStatDetailModal = function() {
        const overlay = document.getElementById('stat-detail-modal');
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (_statModalChart) { _statModalChart.destroy(); _statModalChart = null; }
        setTimeout(() => {
            const body = document.getElementById('stat-modal-body');
            if (body) body.innerHTML = '';
        }, 350);
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeStatDetailModal();
    });

    // Timestamp
    const tsEl = document.getElementById('live-timestamp');
    if (tsEl) setInterval(() => { tsEl.textContent = new Date().toLocaleTimeString(locale); }, 1000);
});
