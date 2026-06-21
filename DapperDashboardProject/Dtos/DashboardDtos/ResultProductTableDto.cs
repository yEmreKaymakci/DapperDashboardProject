namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultProductTableDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string CategoryName { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public bool IsActive { get; set; }
        public string RiskStatus { get; set; } // "oos", "critical", "normal"
    }
}
