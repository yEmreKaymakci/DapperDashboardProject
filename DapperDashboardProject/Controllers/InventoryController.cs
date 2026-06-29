using Microsoft.AspNetCore.Mvc;

namespace DapperDashboardProject.Controllers
{
    public class InventoryController : Controller
    {
        public IActionResult Index() => View();
    }
}
