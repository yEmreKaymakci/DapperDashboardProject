namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultTopInventoryDto
    {
        public string ProductName { get; set; }
        public decimal InventoryValue { get; set; } // Fiyat * Stok
        public string Change { get; set; } // Haftalık değişim oranı (Örn: "+5%")
    }
}
