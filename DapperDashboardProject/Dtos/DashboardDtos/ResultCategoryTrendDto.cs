namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultCategoryTrendDto
    {
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? MostExpensiveProductName { get; set; }
        public decimal MaxPrice { get; set; }
        public decimal CategoryAveragePrice { get; set; }
        public decimal DeviationPercentage { get; set; }
    }
}
