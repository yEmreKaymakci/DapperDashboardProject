using DapperDashboardProject.Dtos.DashboardDtos;

namespace DapperDashboardProject.Services.DashboardServices
{
    public interface IDashboardService
    {
        //KPI kartları
        Task<ResultDashboardSummaryDto> GetDashboardSummaryAsync();
        Task<List<ResultTopCategoryDto>> GetTopCategoriesAsync(int topCount = 10);

        // Görev 2: topN parametresi ile özet/detay görünüm desteği
        Task<List<ResultCategoryDistributionDto>> GetCategoryDistributionAsync(int? topN = null);
        Task<List<ResultStatusDistributionDto>> GetStatusDistributionAsync();
        Task<List<ResultCategoryStatusSplitDto>> GetCategoryStatusSplitAsync(int? topN = null);

        Task<List<ResultPriceRangeDistributionDto>> GetPriceRangeDistributionAsync();

        Task<List<ResultCategoryStockValueDto>> GetCategoryStockValuesAsync();
        Task<List<ResultMostExpensiveProductDto>> GetMostExpensivePerCategoryAsync(int topN = 10);
        Task<List<ResultLowStockProductDto>> GetLowStockProductsAsync(int threshold = 20);

        // Görev 5: Sayfalı düşük stok sorgusu
        Task<PagedResult<ResultLowStockProductDto>> GetLowStockProductsPagedAsync(int threshold = 20, int page = 1, int pageSize = 15);

        Task<List<ResultAbcAnalysisDto>> GetAbcAnalysisAsync();
        Task<List<ResultRiskMatrixDto>> GetRiskMatrixAsync();
        Task<List<ResultCategoryHealthDto>> GetCategoryHealthAsync();
        Task<List<ResultTopInventoryDto>> GetTopInventoryAsync();
        Task<List<ResultAnomalyDto>> GetAnomaliesAsync();

        // Table Method (Paginated)
        Task<ResultProductTablePagedDto> GetProductsForTableAsync(string search, string category, string status, decimal? minPrice, decimal? maxPrice, int page = 1, int pageSize = 10);

        // Filter Helpers
        Task<List<string>> GetCategoryNamesAsync();

        // Advanced Analytics
        Task<List<ResultCategoryTrendDto>> GetCategoryTrendAnalysisAsync();
        Task<List<ResultPriceHeatmapDto>> GetPriceStockHeatmapAsync();
        Task<List<ResultCategoryScorecardDto>> GetCategoryScorecardAsync();

        // Görev 3: Sayfalı trend ve scorecard
        Task<PagedResult<ResultCategoryTrendDto>> GetCategoryTrendAnalysisPagedAsync(int page = 1, int pageSize = 10);
        Task<PagedResult<ResultCategoryScorecardDto>> GetCategoryScorecardPagedAsync(int page = 1, int pageSize = 10);
    }
}

