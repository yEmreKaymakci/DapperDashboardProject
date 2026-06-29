/* ═══════════════════════════════════════════════════
   Shared.js — Paylaşılan Utility Fonksiyonları
   Tüm sayfalar tarafından kullanılır
   ═══════════════════════════════════════════════════ */

const locale = 'tr-TR';
const currencyOptions = { style: 'currency', currency: 'TRY' };

/* ═══════════════════════════════════════════════════
   Label Truncation & Formatting Utilities
   ═══════════════════════════════════════════════════ */
const LABEL_MAX_LEN = 12;

function truncateLabel(label, maxLen) {
    maxLen = maxLen || LABEL_MAX_LEN;
    if (!label || label.length <= maxLen) return label;
    return label.substring(0, maxLen) + '…';
}

function truncateLabels(labels, maxLen) {
    return labels.map(l => truncateLabel(l, maxLen));
}

function formatCurrencyShort(value) {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + ' Mrd ₺';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M ₺';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'B ₺';
    return value.toLocaleString(locale) + ' ₺';
}

function formatMillions(value) {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + ' Mrd';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + ' M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + ' B';
    return value.toLocaleString(locale);
}

/* ═══════════════════════════════════════════════════
   Shared Chart Configs (base + label-safe axis)
   ═══════════════════════════════════════════════════ */
function getChartBaseConfig() {
    return {
        chart: { toolbar: { show: false }, background: 'transparent', foreColor: '#8b949e', fontFamily: 'Inter' },
        grid: { borderColor: '#30363d', strokeDashArray: 4 },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        theme: { mode: 'dark' }
    };
}

// Axis labels with autoSkip, rotation, and truncation
function safeXaxis(categories, fullLabels, maxLen) {
    const truncated = truncateLabels(categories, maxLen);
    return {
        categories: truncated,
        labels: {
            rotate: -45,
            rotateAlways: false,
            maxHeight: 80,
            style: { fontSize: '11px', cssClass: 'apexcharts-xaxis-label' },
            trim: true
        },
        tooltip: { enabled: true }
    };
}

// For bar charts with horizontal orientation — y-axis is category
function safeYaxisCat(categories, maxLen) {
    const truncated = truncateLabels(categories, maxLen);
    return {
        categories: truncated,
        labels: {
            maxWidth: 120,
            style: { fontSize: '11px' },
            trim: true
        }
    };
}

// Tooltip that shows full (non-truncated) label
function fullLabelTooltip(fullLabels) {
    return {
        theme: 'dark',
        y: {
            formatter: (val) => val != null ? val.toLocaleString(locale) : ''
        },
        x: {
            formatter: (val, opts) => {
                if (fullLabels && opts && opts.dataPointIndex !== undefined) {
                    return fullLabels[opts.dataPointIndex] || val;
                }
                return val;
            }
        }
    };
}

/* ═══════════════════════════════════════════════════
   Shared API & UI Utilities
   ═══════════════════════════════════════════════════ */
function renderEmptyState(elementId, message = "Veri Bulunamadı") {
    const container = document.querySelector(elementId);
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <span class="material-symbols-outlined">data_alert</span>
            <span class="text-body-md">${message}</span>
        </div>`;
}

async function safeFetch(url, defaultValue = null) {
    try {
        const t0 = performance.now();
        const res = await fetch(url);
        const t1 = performance.now();
        
        const serverMs = res.headers.get("X-Response-Time-Ms");
        if(serverMs) {
            const perfEl = document.getElementById('perf-timer');
            if (perfEl) perfEl.textContent = `Server: ${serverMs}ms | UI: ${Math.round(t1 - t0)}ms`;
        }

        if (!res.ok) throw new Error("Sunucu hatası: " + res.status);
        const data = await res.json();
        if(data && data.error) throw new Error(data.message);
        return data;
    } catch (err) {
        console.error("API Hatası:", url, err);
        return defaultValue;
    }
}

/* ═══════════════════════════════════════════════════
   Generic Pagination Renderer (used by sub-pages)
   ═══════════════════════════════════════════════════ */
window.renderGenericPagination = function(containerId, currentPage, totalPages, totalCount, pageSize, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    let pageButtons = '';
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    for (let i = startPage; i <= endPage; i++) {
        pageButtons += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
    }

    container.innerHTML = `
        <div class="pagination-bar">
            <span class="page-info">Toplam ${totalCount.toLocaleString()} kayıttan ${startItem}-${endItem} arası</span>
            <div class="page-controls">
                <button class="page-btn" onclick="${onPageChange}(1)" ${currentPage <= 1 ? 'disabled' : ''}>
                    <span class="material-symbols-outlined">first_page</span>
                </button>
                <button class="page-btn" onclick="${onPageChange}(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                ${pageButtons}
                <button class="page-btn" onclick="${onPageChange}(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
                <button class="page-btn" onclick="${onPageChange}(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''}>
                    <span class="material-symbols-outlined">last_page</span>
                </button>
            </div>
        </div>
    `;
};
