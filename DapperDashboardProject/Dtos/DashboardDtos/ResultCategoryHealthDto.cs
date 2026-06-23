namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultCategoryHealthDto
    {
        public string? CategoryName { get; set; }
        public int Score { get; set; } // Performans yüzdesi
        public string? Color { get; set; } // Grafik rengi 
    }
}
