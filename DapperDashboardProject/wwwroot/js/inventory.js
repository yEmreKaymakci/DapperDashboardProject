/* ═══════════════════════════════════════════════════
   Inventory.js — Inventory/Index sayfasına ait kod
   shared.js'ten: safeFetch, renderGenericPagination
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
    const locale = 'tr-TR';
    const currency = { style: 'currency', currency: 'TRY' };

    // Summary KPIs
    const summary = await safeFetch('/Dashboard/GetSummary');
    if(summary) {
        document.getElementById('inv-total-value').textContent = summary.totalStockValue.toLocaleString(locale, currency);
        document.getElementById('inv-max-price').textContent = summary.maxProductPrice.toLocaleString(locale, currency);
    }

    // ════════════════════════════════════
    // Paginated Low Stock Table
    // ════════════════════════════════════
    let lowStockState = { page: 1, pageSize: 15 };

    window.loadLowStockPage = async function(page) {
        if (page < 1) return;
        lowStockState.page = page;
        const lsTbody = document.getElementById('low-stock-tbody');
        lsTbody.innerHTML = '<tr><td colspan="6"><div class="loading-skeleton h-10 w-full m-4"></div></td></tr>';

        const data = await safeFetch(`/Dashboard/GetLowStockProductsPaged?page=${page}&pageSize=${lowStockState.pageSize}`, null);
        
        if (!data || !data.items || data.items.length === 0) {
            lsTbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">Kritik stok ürünü yok</div></td></tr>';
            document.getElementById('inv-low-stock-count').textContent = '0';
            return;
        }

        // Update KPI
        document.getElementById('inv-low-stock-count').textContent = data.totalCount + ' Ürün';

        lsTbody.innerHTML = data.items.map(p => `
            <tr class="border-b border-outline-variant hover:bg-surface-container-highest transition-colors">
                <td class="p-4 text-body-md font-semibold">${p.productName}</td>
                <td class="p-4 text-body-sm text-on-surface-variant">${p.categoryName}</td>
                <td class="p-4 text-body-md font-bold ${p.stock === 0 ? 'text-error' : 'text-warning'}">${p.stock}</td>
                <td class="p-4 text-body-md">${p.price.toLocaleString(locale, currency)}</td>
                <td class="p-4 text-body-md font-bold text-primary">${p.stockValue.toLocaleString(locale, currency)}</td>
                <td class="p-4">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold
                        ${p.stockLevel === 'Tükendi' ? 'bg-error/10 text-error' : p.stockLevel === 'Çok Kritik' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}">
                        ${p.stockLevel}
                    </span>
                </td>
            </tr>
        `).join('');

        // Render pagination with page numbers
        renderGenericPagination('low-stock-pagination', data.currentPage, data.totalPages, data.totalCount, data.pageSize, 'loadLowStockPage');
    };
    
    // Initial load
    await loadLowStockPage(1);

    // Top Inventory (unchanged — small dataset)
    const topInv = await safeFetch('/Dashboard/GetTopInventory');
    const tiTbody = document.getElementById('top-inv-tbody');
    if(topInv && topInv.length > 0) {
        tiTbody.innerHTML = topInv.map((item, i) => `
            <tr class="border-b border-outline-variant hover:bg-surface-container-highest transition-colors">
                <td class="p-4 text-body-sm font-mono text-on-surface-variant">#${i + 1}</td>
                <td class="p-4 text-body-md font-semibold">${item.productName}</td>
                <td class="p-4 text-body-md font-bold text-primary">${item.inventoryValue.toLocaleString(locale, currency)}</td>
            </tr>
        `).join('');
    } else {
        tiTbody.innerHTML = '<tr><td colspan="3"><div class="empty-state">Veri bulunamadı</div></td></tr>';
    }

    // Timestamp
    const tsEl = document.getElementById('live-timestamp');
    if (tsEl) setInterval(() => { tsEl.textContent = new Date().toLocaleTimeString(locale); }, 1000);
});
