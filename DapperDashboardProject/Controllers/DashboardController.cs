using DapperDashboardProject.Services.DashboardServices;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DapperDashboardProject.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        public IActionResult Index() => View();

        public async Task<IActionResult> GetSummary() => Json(await _dashboardService.GetDashboardSummaryAsync());

        // Görev 2: topN parametresi ile özet/detay görünüm desteği
        public async Task<IActionResult> GetCategoryDistribution(int? top = null) => Json(await _dashboardService.GetCategoryDistributionAsync(top));
        public async Task<IActionResult> GetStatusDistribution() => Json(await _dashboardService.GetStatusDistributionAsync());
        public async Task<IActionResult> GetCategoryStatusSplit(int? top = null) => Json(await _dashboardService.GetCategoryStatusSplitAsync(top));

        public async Task<IActionResult> GetPriceDistribution() => Json(await _dashboardService.GetPriceRangeDistributionAsync());
        public async Task<IActionResult> GetAbcAnalysis() => Json(await _dashboardService.GetAbcAnalysisAsync());
        public async Task<IActionResult> GetRiskMatrix() => Json(await _dashboardService.GetRiskMatrixAsync());
        public async Task<IActionResult> GetCategoryHealth() => Json(await _dashboardService.GetCategoryHealthAsync());
        public async Task<IActionResult> GetTopInventory() => Json(await _dashboardService.GetTopInventoryAsync());
        public async Task<IActionResult> GetAnomalies() => Json(await _dashboardService.GetAnomaliesAsync());

        [HttpGet]
        public async Task<IActionResult> GetProductsTable(string search = "", string category = "", string status = "", decimal? minPrice = null, decimal? maxPrice = null, int page = 1, int pageSize = 10)
        {
            var data = await _dashboardService.GetProductsForTableAsync(search, category, status, minPrice, maxPrice, page, pageSize);
            return Json(data);
        }
        
        public async Task<IActionResult> GetCategoryNames() => Json(await _dashboardService.GetCategoryNamesAsync());
        
        public async Task<IActionResult> GetCategoryTrendAnalysis() => Json(await _dashboardService.GetCategoryTrendAnalysisAsync());
        public async Task<IActionResult> GetPriceStockHeatmap() => Json(await _dashboardService.GetPriceStockHeatmapAsync());
        public async Task<IActionResult> GetCategoryScorecard() => Json(await _dashboardService.GetCategoryScorecardAsync());
        public async Task<IActionResult> GetLowStockProducts() => Json(await _dashboardService.GetLowStockProductsAsync());
        public async Task<IActionResult> GetTopCategories() => Json(await _dashboardService.GetTopCategoriesAsync());
        public async Task<IActionResult> GetMostExpensivePerCategory() => Json(await _dashboardService.GetMostExpensivePerCategoryAsync());
        public async Task<IActionResult> GetCategoryStockValues() => Json(await _dashboardService.GetCategoryStockValuesAsync());

        // Görev 3: Sayfalı Trend & Scorecard
        [HttpGet]
        public async Task<IActionResult> GetCategoryTrendAnalysisPaged(int page = 1, int pageSize = 10)
            => Json(await _dashboardService.GetCategoryTrendAnalysisPagedAsync(page, pageSize));

        [HttpGet]
        public async Task<IActionResult> GetCategoryScorecardPaged(int page = 1, int pageSize = 10)
            => Json(await _dashboardService.GetCategoryScorecardPagedAsync(page, pageSize));

        // Görev 5: Sayfalı Düşük Stok
        [HttpGet]
        public async Task<IActionResult> GetLowStockProductsPaged(int page = 1, int pageSize = 15)
            => Json(await _dashboardService.GetLowStockProductsPagedAsync(20, page, pageSize));
    }
}

