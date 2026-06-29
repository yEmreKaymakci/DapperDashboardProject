namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultCategoryScorecardDto
    {
        public string? CategoryName { get; set; }
        public decimal TotalValueScore { get; set; }
        public decimal ActiveRatioScore { get; set; }
        public decimal OverallScore { get; set; }
        public int PerformanceRank { get; set; }
    }
}
