namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultDashboardSummaryDto
    {
        public int TotalCategoryCount { get; set; }
        public int TotalProductCount { get; set; }
        public int TotalStockCount { get; set; }
        public decimal TotalStockValue { get; set; }
        public decimal AveragePrice { get; set; }
        public int ActiveProductCount { get; set; }
        public int PassiveProductCount { get; set; }
        public int ActiveCategoryCount { get; set; }
        public decimal MaxProductPrice { get; set; }
        public decimal MinProductPrice { get; set; }
    }
}
