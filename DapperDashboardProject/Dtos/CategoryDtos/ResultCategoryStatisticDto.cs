namespace DapperDashboardProject.Dtos.CategoryDtos
{
    public class ResultCategoryStatisticDto
    {
        public int CategoryId { get; set; }
        public int TotalProductCount { get; set; }
        public decimal AvaragePrice { get; set; }
        public decimal MaxPrice { get; set; }
        public string? CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
