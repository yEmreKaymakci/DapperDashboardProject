namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultLowStockProductDto
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; } = string.Empty;
        public int Stock { get; set; }
        public decimal Price { get; set; }
        public decimal StockValue { get; set; }
        public string? CategoryName { get; set; } = string.Empty;
        public string? StockLevel { get; set; } = string.Empty;
    }
}
