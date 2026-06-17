using Dapper;
using DapperDashboardProject.Context;
using DapperDashboardProject.Dtos.ProductDtos;

namespace DapperDashboardProject.Services.ProductServices
{
    public class ProductService : IProductService
    {
        private readonly DapperContext _context;

        public ProductService(DapperContext context)
        {
            _context = context;
        }

        public async Task CreateProductAsync(CreateProductDto dto)
        {
            string query = @"
                INSER INTO Products (ProductName, Description, Price, Stock, ImageUrl, CategoryId, IsActive)
                Values (@ProductName, @Description, @Price, @Stock, @ImageUrl, @CategoryId, @IsActive)

            ";

            var parameters = new DynamicParameters();

            using var connection = _context.CreateConnection();

            await connection.ExecuteAsync(query, parameters);
        }

        public async Task<List<ResultProductDto>> GetAllProductAsync()
        {
            string query = @"
                    SELECT p.ProductId, p.ProductName, p.Description, p.Price, p.Stock, p.ImageUrl, p.IsActive, c.CategoryName
                    FROM Products p
                    INNER JOIN Categories c ON c.CategoryId = p.CategoryId
                    ORDER BY p.ProductName;
                            ";

            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultProductDto>(query);
            return result.ToList();
        }

        public async Task<List<ResultProductWithCategoryDto>> GetProductWithCategoryDetailAsync(int minStock = 0)
        {
            string procedureName = "sp_GetProductsWithCategoryDetails";

            var parameters = new DynamicParameters();

            parameters.Add("@MinStock", minStock);

            using var connection = _context.CreateConnection();

            var values = await connection.QueryAsync<ResultProductWithCategoryDto>
                (procedureName, parameters, commandType: System.Data.CommandType.StoredProcedure);

            return values.ToList();
        }

        public async Task<decimal> GetTotalProductStockValueAsync()
        {
            string query = "SELECT SUM(price * stock) FROM PRODUCTS";

            using var connection = _context.CreateConnection();

            var totalValue = await connection.ExecuteScalarAsync<decimal>(query);

            return totalValue;

        }
    }
}
