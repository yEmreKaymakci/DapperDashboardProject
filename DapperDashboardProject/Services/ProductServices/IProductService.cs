using DapperDashboardProject.Dtos.ProductDtos;

namespace DapperDashboardProject.Services.ProductServices
{
    public interface IProductService
    {
        Task<List<ResultProductDto>> GetAllProductAsync();
        Task CreateProductAsync(CreateProductDto dto);
        Task<List<ResultProductWithCategoryDto>> GetProductWithCategoryDetailAsync(int minStock = 0);
        Task<decimal> GetTotalProductStockValueAsync();
    }
}
