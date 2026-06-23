using DapperDashboardProject.Dtos.DashboardDtos;

namespace DapperDashboardProject.Services.DashboardServices
{
    public interface IDashboardService
    {
        //KPI kartları
        Task<ResultDashboardSummaryDto> GetDashboardSummaryAsync();
        Task<List<ResultTopCategoryDto>> GetTopCategoriesAsync(int topCount = 10);

        Task<List<ResultCategoryDistributionDto>> GetCategoryDistributionAsync();
        Task<List<ResultStatusDistributionDto>> GetStatusDistributionAsync();
        Task<List<ResultCategoryStatusSplitDto>> GetCategoryStatusSplitAsync();




        Task<List<ResultPriceRangeDistributionDto>> GetPriceRangeDistributionAsync();

        Task<List<ResultCategoryStockValueDto>> GetCategoryStockValuesAsync();
        Task<List<ResultMostExpensiveProductDto>> GetMostExpensivePerCategoryAsync(int topN = 10);
        Task<List<ResultLowStockProductDto>> GetLowStockProductsAsync(int threshold = 20);


        Task<List<ResultAbcAnalysisDto>> GetAbcAnalysisAsync();
        Task<List<ResultRiskMatrixDto>> GetRiskMatrixAsync();
        Task<List<ResultCategoryHealthDto>> GetCategoryHealthAsync();
        Task<List<ResultTopInventoryDto>> GetTopInventoryAsync();
        Task<List<ResultAnomalyDto>> GetAnomaliesAsync();

        //TAblo metodu

        Task<List<ResultProductTableDto>> GetProductsForTableAsync(string search, string category, string status);

        //Task<DashboardViewModel> GetFullDashboardAsync();
    }
}
