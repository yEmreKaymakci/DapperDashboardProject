namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultAnomalyDto
    {
        public string ProductId { get; set; }
        public string AnomalyMessage { get; set; }
        public string ProductName { get; set; }
        public string Impact { get; set; } // Etki miktarı/açıklaması
    }
}
