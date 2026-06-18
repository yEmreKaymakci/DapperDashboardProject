using DapperDashboardProject.Dtos.DashboardDtos;

namespace DapperDashboardProject.Services.DashboardServices
{
    public interface IDashboardService
    {
        Task<ResultDashboardSummaryDto> GetDashboardSummaryAsync();
        Task<List<ResultTopCategoryDto>> GetTopCategoriesAsync(int topCount = 10);
        Task<List<ResultPriceRangeDistributionDto>> GetPriceRangeDistributionAsync();
        Task<List<ResultCategoryStockValueDto>> GetCategoryStockValuesAsync();
        Task<List<ResultMostExpensiveProductDto>> GetMostExpensivePerCategoryAsync(int topN = 10);
        Task<List<ResultLowStockProductDto>> GetLowStockProductsAsync(int threshold = 20);
        Task<DashboardViewModel> GetFullDashboardAsync();
    }
}
