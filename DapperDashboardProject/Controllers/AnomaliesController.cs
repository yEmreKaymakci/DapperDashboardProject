using Microsoft.AspNetCore.Mvc;

namespace DapperDashboardProject.Controllers
{
    public class AnomaliesController : Controller
    {
        public IActionResult Index() => View();
    }
}
