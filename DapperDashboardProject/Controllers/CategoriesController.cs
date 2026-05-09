using DapperDashboardProject.Dtos.CategoryDtos;
using DapperDashboardProject.Services.CategoryServices;
using Microsoft.AspNetCore.Mvc;

namespace DapperDashboardProject.Controllers
{
    public class CategoriesController : Controller
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        public async Task<IActionResult> Index()
        {
            var values = await _categoryService.GetAllCategoriesAsync();

            return View(values);
        }
        [HttpGet]
        public IActionResult CreateCategory()
        {
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> CreateCategory(CreateCategoryDto dto)
        {
            await _categoryService.CreateCategoryAsync(dto);
            return RedirectToAction("Index");
        }
        [HttpGet]
        public async Task<IActionResult> UpdateCategoryAsync(int id)
        {
            var value = await _categoryService.GetCategoryByIdAsync(id);
            return View(value);
        }
        [HttpPost]
        public async Task<IActionResult> UpdateCategoryAsync(UpdateCategoryDto dto)
        {
            await _categoryService.UpdateCategoryAsync(dto);
            return RedirectToAction("Index");
        }
    }
}
