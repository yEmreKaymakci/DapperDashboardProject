using DapperDashboardProject.Services.DashboardServices;
using Microsoft.AspNetCore.Mvc;

using System.Diagnostics;

namespace DapperDashboardProject.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        public IActionResult Index() => View();   // sadece shell döner

        public async Task<IActionResult> GetSummary() => Json(await _dashboardService.GetDashboardSummaryAsync());
        public async Task<IActionResult> GetCategoryDistribution() => Json(await _dashboardService.GetCategoryDistributionAsync());

        public async Task<IActionResult> GetStatusDistribution() => Json(await _dashboardService.GetStatusDistributionAsync());

        public async Task<IActionResult> GetCategoryStatusSplit() => Json(await _dashboardService.GetCategoryStatusSplitAsync());
        public async Task<IActionResult> GetPriceDistribution() => Json(await _dashboardService.GetPriceRangeDistributionAsync());

        public async Task<IActionResult> GetAbcAnalysis() => Json(await _dashboardService.GetAbcAnalysisAsync());
        public async Task<IActionResult> GetRiskMatrix() => Json(await _dashboardService.GetRiskMatrixAsync());
        public async Task<IActionResult> GetCategoryHealth() => Json(await _dashboardService.GetCategoryHealthAsync());

        public async Task<IActionResult> GetTopInventory() => Json(await _dashboardService.GetTopInventoryAsync());
        public async Task<IActionResult> GetAnomalies() => Json(await _dashboardService.GetAnomaliesAsync());


        [HttpGet]
        public async Task<IActionResult> GetProductsTable(string search = "", string category = "", string status = "")
        {
            var data = await _dashboardService.GetProductsForTableAsync(search, category, status);
            return Json(data);
        }

        //public async Task<IActionResult> Index()
        //{
        //    var sw = Stopwatch.StartNew();
        //    var viewModel = await _dashboardService.GetFullDashboardAsync();
        //    sw.Stop();
        //    ViewBag.ExecutionTime = sw.ElapsedMilliseconds;
        //    return View(viewModel);
        //}
    }
}
