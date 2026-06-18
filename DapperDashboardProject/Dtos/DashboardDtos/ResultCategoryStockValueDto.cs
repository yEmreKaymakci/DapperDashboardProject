namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultCategoryStockValueDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public int TotalStock { get; set; }
        public decimal TotalStockValue { get; set; }
        public decimal StockValuePercentage { get; set; }
        public int StockValueRank { get; set; }
    }
}
