using DapperDashboardProject.Services.CategoryServices;
using DapperDashboardProject.Services.ProductServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Threading.Tasks;

namespace DapperDashboardProject.Controllers
{
    public class ProductController : Controller
    {
        private readonly IProductService _productService;
        private readonly ICategoryService _categoryService;

        public ProductController(IProductService productService, ICategoryService categoryService)
        {
            _productService = productService;
            _categoryService = categoryService;
        }

        public async Task<IActionResult> Index()
        {
            var values = await _productService.GetAllProductAsync();
            return View(values);
        }
        private async Task LoadCategoryDropDownAsync()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();

            ViewBag.Categories = categories.Select(x => new SelectListItem
            {
                Text = x.CategoryName,
                Value = x.CategoryId.ToString()
            }).ToList();
        }
        public async Task<IActionResult> CreateProduct()
        {
            await LoadCategoryDropDownAsync();
            return View();
        }

        public async Task<IActionResult> ProductWithCategoryDetail(int minStock = 0)
        {
            var products = await _productService.GetProductWithCategoryDetailAsync(minStock);
            return View(products);

        }

        public async Task<IActionResult> TotalStockValue()
        {
            var totalStockValue = await _productService.GetTotalProductStockValueAsync();
            ViewBag.TotalStockValue = totalStockValue;
            return View();
        }
    }
}
