namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultMostExpensiveProductDto
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? CategoryName { get; set; } = string.Empty;
        public decimal CategoryAveragePrice { get; set; }
        public decimal PriceVsAveragePercent { get; set; }
    }
}
