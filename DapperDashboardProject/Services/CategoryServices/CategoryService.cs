using Dapper;
using DapperDashboardProject.Context;
using DapperDashboardProject.Dtos.CategoryDtos;

namespace DapperDashboardProject.Services.CategoryServices
{
    public class CategoryService : ICategoryService
    {
        private readonly DapperContext _context;

        public CategoryService(DapperContext context)
        {
            _context = context;
        }

        public async Task CreateCategoryAsync(CreateCategoryDto dto)
        {
            string query = "INSERT INTO Categories (CategoryName, Description, IsActive) VALUES (@CategoryName, @Description, @IsActive)";

            var parameters = new DynamicParameters();

            parameters.Add("@CategoryName", dto.CategoryName);
            parameters.Add("@Description", dto.Description);
            parameters.Add("@IsActive", dto.IsActive);

            using var connection = _context.CreateConnection();

            await connection.ExecuteAsync(query, parameters);
        }

        public async Task DeleteCategoryAsync(int id)
        {
            string query = "DELETE FROM Categories  WHERE CategoryId = @CategoryId";
            var parameters = new DynamicParameters();
            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(query, parameters);
        }

        public async Task<List<ResultCategoryDto>> GetAllCategoriesAsync()
        {
            string query = "SELECT CategoryId, CategoryName, Description, IsActive FROM Categories ORDER BY CategoryName";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultCategoryDto>(query);

            return result.ToList();
        }

        public async Task<ResultCategoryByIdDto> GetCategoryByIdAsync(int id)
        {
            string query = "SELECT CategoryId, CategoryName, Description, IsActive FROM Categories Where CategoryId = @CategoryId";
            var parameters = new DynamicParameters();
            parameters.Add("@CategoryId", id);
            using var connection = _context.CreateConnection();
            
            return await connection.QueryFirstAsync<ResultCategoryByIdDto>(query, parameters);

        }

        public async Task<List<ResultCategoryStatisticDto>> GetCategoryStatisticAsync()
        {
            string procedureName = "sp_GetCategoryStatistic";

            using var connection = _context.CreateConnection();

            var values = await connection.QueryAsync<ResultCategoryStatisticDto>(procedureName, commandType: System.Data.CommandType.StoredProcedure);
        
            return values.ToList();
        }

        public async Task UpdateCategoryAsync(UpdateCategoryDto dto)
        {
            string query = "UPDATE Categories SET CategoryName = @CategoryName, Description = @Description, IsActive = @IsActive WHERE @CategoryId";
            var parameters = new DynamicParameters();
            using var connection = _context.CreateConnection();
            await connection.QueryAsync(query, parameters);
        }

    }
}
