using Microsoft.AspNetCore.Mvc;

namespace DapperDashboardProject.Controllers
{
    public class StatisticsController : Controller
    {
        public IActionResult Index() => View();
    }
}
