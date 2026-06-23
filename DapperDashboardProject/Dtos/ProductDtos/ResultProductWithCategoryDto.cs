namespace DapperDashboardProject.Dtos.ProductDtos
{
    public class ResultProductWithCategoryDto
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public bool IsActive { get; set; } = true;
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
    }
}
