namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultTopCategoryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public decimal AveragePrice { get; set; }
        public decimal TotalStockValue { get; set; }
        public int TotalStock { get; set; }
        public int CategoryRank { get; set; }
        public int PerformanceQuartile { get; set; }
    }
}
