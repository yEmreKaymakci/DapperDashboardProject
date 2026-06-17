using DapperDashboardProject.Dtos.CategoryDtos;

namespace DapperDashboardProject.Services.CategoryServices
{
    public interface ICategoryService
    {
        Task<List<ResultCategoryDto>> GetAllCategoriesAsync();
        Task<ResultCategoryByIdDto> GetCategoryByIdAsync(int id);
        Task CreateCategoryAsync(CreateCategoryDto dto);
        Task UpdateCategoryAsync(UpdateCategoryDto dto);
        Task DeleteCategoryAsync(int id);
        Task<List<ResultCategoryStatisticDto>> GetCategoryStatisticAsync();
    }
}
