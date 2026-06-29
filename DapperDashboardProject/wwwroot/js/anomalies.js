/* ═══════════════════════════════════════════════════
   Anomalies.js — Anomalies/Index sayfasına ait kod
   shared.js'ten: safeFetch, renderEmptyState, getChartBaseConfig
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
    const currency = { style: 'currency', currency: 'TRY' };
    const chartBaseConfig = getChartBaseConfig();

    // Stock Anomalies
    const anomalies = await safeFetch('/Dashboard/GetAnomalies', []);
    const anomalyList = document.getElementById('stock-anomalies-list');
    document.getElementById('anomaly-count').textContent = anomalies.length;
    if(anomalies.length > 0) {
        anomalyList.innerHTML = anomalies.map(a => `
            <div class="p-4 bg-error/5 border border-error/20 rounded-lg hover:bg-error/10 transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-bold text-error uppercase tracking-wider">REF: #${a.productId}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-error/10 text-error">
                        <span class="material-symbols-outlined text-[12px] mr-1">priority_high</span>
                        ${a.impact}
                    </span>
                </div>
                <div class="text-body-md font-bold text-on-surface">${a.anomalyMessage}</div>
                <div class="text-body-sm text-on-surface-variant mt-1">${a.productName}</div>
            </div>
        `).join('');
    } else {
        anomalyList.innerHTML = `
            <div class="p-6 text-center">
                <span class="material-symbols-outlined text-secondary text-4xl mb-2">verified</span>
                <div class="text-body-md font-bold text-secondary">Anomali Tespit Edilmedi</div>
                <div class="text-body-sm text-on-surface-variant">Tüm ürünler normal parametrelerde</div>
            </div>`;
    }

    // Risk Matrix Chart
    const riskData = await safeFetch('/Dashboard/GetRiskMatrix', []);
    if(riskData.length > 0 && document.querySelector('#anomaly-risk-chart')) {
        new ApexCharts(document.querySelector('#anomaly-risk-chart'), {
            ...chartBaseConfig,
            series: riskData.map(r => r.count),
            chart: { ...chartBaseConfig.chart, type: 'donut', height: 280 },
            labels: riskData.map(r => r.riskLevel),
            colors: ['#3fb950', '#d29922', '#f85149'],
            plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Toplam', color: '#8b949e' } } } } }
        }).render();
    }

    // ABC Analysis Cards
    const abcData = await safeFetch('/Dashboard/GetAbcAnalysis', []);
    const abcCards = document.getElementById('abc-cards');
    if(abcData.length > 0) {
        const colors = { 'Class A (High Value)': { bg: 'bg-tertiary/5', text: 'text-tertiary', border: 'border-tertiary' },
                        'Class B': { bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary' },
                        'Class C': { bg: 'bg-on-surface-variant/5', text: 'text-on-surface-variant', border: 'border-on-surface-variant' } };
        abcCards.innerHTML = abcData.map(abc => {
            const c = colors[abc.className] || colors['Class C'];
            return `
                <div class="p-6 ${c.bg}">
                    <div class="text-[10px] font-bold ${c.text} uppercase tracking-wider mb-3">${abc.className}</div>
                    <div class="text-3xl font-black text-on-surface mb-1">${abc.productCount.toLocaleString()}</div>
                    <div class="text-body-sm text-on-surface-variant">Ürün</div>
                    <div class="mt-3 pt-3 border-t border-outline-variant">
                        <div class="text-body-md font-bold ${c.text}">${abc.totalValue.toLocaleString(locale, currency)}</div>
                        <div class="text-[10px] text-on-surface-variant">Toplam Değer</div>
                    </div>
                </div>`;
        }).join('');
    }

    // ════════════════════════════════════
    // Category Health — İlk 10 satır sınırlı
    // ════════════════════════════════════
    const INITIAL_HEALTH_LIMIT = 10;
    const healthData = await safeFetch('/Dashboard/GetCategoryHealth', []);
    const healthBars = document.getElementById('anomaly-health-bars');
    const moreBtn = document.getElementById('anomaly-health-more-btn');
    
    // Store full data for lazy rendering
    window._anomalyHealthFullData = healthData;
    
    function renderHealthItems(items) {
        return items.map(d => `
            <div>
                <div class="flex justify-between text-[11px] font-bold mb-1 uppercase tracking-tight">
                    <span>${d.categoryName}</span><span>${d.score}%</span>
                </div>
                <div class="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-1000 ease-out rounded-full" style="width: ${d.score}%; background-color: ${d.color}"></div>
                </div>
            </div>
        `).join('');
    }

    if(healthData.length > 0) {
        const initialItems = healthData.slice(0, INITIAL_HEALTH_LIMIT);
        healthBars.innerHTML = renderHealthItems(initialItems);
        
        if (healthData.length > INITIAL_HEALTH_LIMIT) {
            moreBtn.style.display = 'flex';
            document.getElementById('anomaly-health-more-text').textContent = 
                `Tüm Kategorileri Göster (${healthData.length - INITIAL_HEALTH_LIMIT} daha)`;
        }
    } else {
        healthBars.innerHTML = '<div class="empty-state col-span-3">Veri bulunamadı</div>';
    }

    // Show all health bars on button click
    window.showAllAnomalyHealth = function() {
        const data = window._anomalyHealthFullData;
        if (!data) return;
        healthBars.innerHTML = renderHealthItems(data);
        moreBtn.style.display = 'none';
    };

    // Timestamp
    const tsEl = document.getElementById('live-timestamp');
    if (tsEl) setInterval(() => { tsEl.textContent = new Date().toLocaleTimeString(locale); }, 1000);
});
