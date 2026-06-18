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

        public async Task<IActionResult> Index()
        {
            var sw = Stopwatch.StartNew();
            
            var viewModel = await _dashboardService.GetFullDashboardAsync();
            
            sw.Stop();
            ViewBag.ExecutionTime = sw.ElapsedMilliseconds;
            
            return View(viewModel);
        }
    }
}
