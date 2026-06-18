namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultPriceRangeDistributionDto
    {
        public string PriceRange { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public decimal TotalValue { get; set; }
        public decimal AveragePrice { get; set; }
        public int SortOrder { get; set; }
    }
}
