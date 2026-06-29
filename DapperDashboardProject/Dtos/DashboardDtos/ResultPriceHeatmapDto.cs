namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultPriceHeatmapDto
    {
        public string? PriceRange { get; set; }
        public string? StockLevel { get; set; }
        public int ProductCount { get; set; }
        public decimal TotalStockValue { get; set; }
    }
}
