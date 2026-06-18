namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class DashboardViewModel
    {
        public ResultDashboardSummaryDto Summary { get; set; } = new();
        public List<ResultTopCategoryDto> TopCategories { get; set; } = new();
        public List<ResultPriceRangeDistributionDto> PriceRangeDistribution { get; set; } = new();
        public List<ResultCategoryStockValueDto> CategoryStockValues { get; set; } = new();
        public List<ResultMostExpensiveProductDto> MostExpensiveProducts { get; set; } = new();
        public List<ResultLowStockProductDto> LowStockProducts { get; set; } = new();
    }
}
