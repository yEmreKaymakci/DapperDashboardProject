using Dapper;
using DapperDashboardProject.Context;
using DapperDashboardProject.Dtos.DashboardDtos;
using System.Data;

namespace DapperDashboardProject.Services.DashboardServices
{
    public class DashboardService : IDashboardService
    {
        private readonly DapperContext _context;

        public DashboardService(DapperContext context)
        {
            _context = context;
        }

        public async Task<ResultDashboardSummaryDto> GetDashboardSummaryAsync()
        {
            // QueryMultipleAsync: Execute multiple SELECT statements in a single database roundtrip
            string query = @"
                SELECT COUNT(*) FROM Categories;
                SELECT COUNT(*) FROM Products;
                SELECT ISNULL(SUM(Stock), 0) FROM Products;
                SELECT ISNULL(SUM(Price * Stock), 0) FROM Products;
                SELECT ISNULL(AVG(Price), 0) FROM Products;
                SELECT COUNT(*) FROM Products WHERE IsActive = 1;
                SELECT COUNT(*) FROM Products WHERE IsActive = 0;
                SELECT COUNT(*) FROM Categories WHERE IsActive = 1;
                SELECT ISNULL(MAX(Price), 0) FROM Products;
                SELECT ISNULL(MIN(Price), 0) FROM Products;
            ";

            using var connection = _context.CreateConnection();
            using var multi = await connection.QueryMultipleAsync(query);

            var summary = new ResultDashboardSummaryDto
            {
                TotalCategoryCount = await multi.ReadFirstAsync<int>(),
                TotalProductCount = await multi.ReadFirstAsync<int>(),
                TotalStockCount = await multi.ReadFirstAsync<int>(),
                TotalStockValue = await multi.ReadFirstAsync<decimal>(),
                AveragePrice = await multi.ReadFirstAsync<decimal>(),
                ActiveProductCount = await multi.ReadFirstAsync<int>(),
                PassiveProductCount = await multi.ReadFirstAsync<int>(),
                ActiveCategoryCount = await multi.ReadFirstAsync<int>(),
                MaxProductPrice = await multi.ReadFirstAsync<decimal>(),
                MinProductPrice = await multi.ReadFirstAsync<decimal>()
            };

            return summary;
        }

        public async Task<List<ResultTopCategoryDto>> GetTopCategoriesAsync(int topCount = 10)
        {
            // CTE + Window Functions (NTILE, DENSE_RANK)
            string query = @"
                WITH CategoryStats AS (
                    SELECT 
                        c.CategoryId,
                        c.CategoryName,
                        COUNT(p.ProductId) as ProductCount,
                        ISNULL(AVG(p.Price), 0) as AveragePrice,
                        ISNULL(SUM(p.Price * p.Stock), 0) as TotalStockValue,
                        ISNULL(SUM(p.Stock), 0) as TotalStock
                    FROM Categories c
                    LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                    GROUP BY c.CategoryId, c.CategoryName
                ),
                RankedCategories AS (
                    SELECT 
                        *,
                        DENSE_RANK() OVER (ORDER BY ProductCount DESC, TotalStockValue DESC) as CategoryRank,
                        NTILE(4) OVER (ORDER BY TotalStockValue DESC) as PerformanceQuartile
                    FROM CategoryStats
                )
                SELECT TOP (@TopCount) * 
                FROM RankedCategories
                ORDER BY CategoryRank;
            ";

            using var connection = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@TopCount", topCount);

            var result = await connection.QueryAsync<ResultTopCategoryDto>(query, parameters);
            return result.ToList();
        }

        public async Task<List<ResultPriceRangeDistributionDto>> GetPriceRangeDistributionAsync()
        {
            // CASE WHEN aggregation for distribution analysis
            string query = @"
                SELECT 
                    PriceRange,
                    COUNT(ProductId) as ProductCount,
                    ISNULL(SUM(Price * Stock), 0) as TotalValue,
                    ISNULL(AVG(Price), 0) as AveragePrice,
                    SortOrder
                FROM (
                    SELECT 
                        ProductId,
                        Price,
                        Stock,
                        CASE 
                            WHEN Price BETWEEN 0 AND 100 THEN '0 - 100₺'
                            WHEN Price BETWEEN 101 AND 500 THEN '101 - 500₺'
                            WHEN Price BETWEEN 501 AND 1000 THEN '501 - 1000₺'
                            WHEN Price BETWEEN 1001 AND 5000 THEN '1001 - 5000₺'
                            WHEN Price BETWEEN 5001 AND 25000 THEN '5001 - 25000₺'
                            ELSE '25000₺+' 
                        END AS PriceRange,
                        CASE 
                            WHEN Price BETWEEN 0 AND 100 THEN 1
                            WHEN Price BETWEEN 101 AND 500 THEN 2
                            WHEN Price BETWEEN 501 AND 1000 THEN 3
                            WHEN Price BETWEEN 1001 AND 5000 THEN 4
                            WHEN Price BETWEEN 5001 AND 25000 THEN 5
                            ELSE 6 
                        END AS SortOrder
                    FROM Products
                ) as PriceData
                GROUP BY PriceRange, SortOrder
                ORDER BY SortOrder;
            ";

            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultPriceRangeDistributionDto>(query);
            return result.ToList();
        }

        public async Task<List<ResultCategoryStockValueDto>> GetCategoryStockValuesAsync()
        {
            // Correlated subquery for percentages and DENSE_RANK
            string query = @"
                DECLARE @TotalValue DECIMAL = (SELECT ISNULL(SUM(Price * Stock), 1) FROM Products);

                SELECT 
                    c.CategoryId,
                    c.CategoryName,
                    COUNT(p.ProductId) as ProductCount,
                    ISNULL(SUM(p.Stock), 0) as TotalStock,
                    ISNULL(SUM(p.Price * p.Stock), 0) as TotalStockValue,
                    (ISNULL(SUM(p.Price * p.Stock), 0) / NULLIF(@TotalValue, 0)) * 100 as StockValuePercentage,
                    DENSE_RANK() OVER (ORDER BY ISNULL(SUM(p.Price * p.Stock), 0) DESC) as StockValueRank
                FROM Categories c
                LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                GROUP BY c.CategoryId, c.CategoryName
                ORDER BY StockValueRank;
            ";

            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultCategoryStockValueDto>(query);
            return result.ToList();
        }

        public async Task<List<ResultMostExpensiveProductDto>> GetMostExpensivePerCategoryAsync(int topN = 10)
        {
            // ROW_NUMBER partitioning to get max price product per category, joined with category average
            string query = @"
                WITH RankedProducts AS (
                    SELECT 
                        p.ProductId,
                        p.ProductName,
                        p.Price,
                        p.Stock,
                        c.CategoryName,
                        ROW_NUMBER() OVER (PARTITION BY p.CategoryId ORDER BY p.Price DESC) as rn,
                        AVG(p.Price) OVER (PARTITION BY p.CategoryId) as CategoryAveragePrice
                    FROM Products p
                    INNER JOIN Categories c ON p.CategoryId = c.CategoryId
                )
                SELECT TOP (@TopN)
                    ProductId,
                    ProductName,
                    Price,
                    Stock,
                    CategoryName,
                    CategoryAveragePrice,
                    CASE WHEN CategoryAveragePrice = 0 THEN 0 ELSE ((Price - CategoryAveragePrice) / CategoryAveragePrice) * 100 END as PriceVsAveragePercent
                FROM RankedProducts
                WHERE rn = 1
                ORDER BY Price DESC;
            ";

            using var connection = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@TopN", topN);

            var result = await connection.QueryAsync<ResultMostExpensiveProductDto>(query, parameters);
            return result.ToList();
        }

        public async Task<List<ResultLowStockProductDto>> GetLowStockProductsAsync(int threshold = 20)
        {
            string query = @"
                SELECT 
                    p.ProductId,
                    p.ProductName,
                    p.Stock,
                    p.Price,
                    (p.Price * p.Stock) as StockValue,
                    c.CategoryName,
                    CASE 
                        WHEN p.Stock = 0 THEN 'Tükendi'
                        WHEN p.Stock <= (@Threshold / 2) THEN 'Çok Kritik'
                        ELSE 'Kritik'
                    END as StockLevel
                FROM Products p
                INNER JOIN Categories c ON p.CategoryId = c.CategoryId
                WHERE p.Stock <= @Threshold
                ORDER BY p.Stock ASC, p.Price DESC;
            ";

            using var connection = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@Threshold", threshold);

            var result = await connection.QueryAsync<ResultLowStockProductDto>(query, parameters);
            return result.ToList();
        }

        //public async Task<DashboardViewModel> GetFullDashboardAsync()
        //{
        //    var summaryTask = GetDashboardSummaryAsync();
        //    var topCategoriesTask = GetTopCategoriesAsync();
        //    var priceRangeTask = GetPriceRangeDistributionAsync();
        //    var stockValuesTask = GetCategoryStockValuesAsync();
        //    var mostExpensiveTask = GetMostExpensivePerCategoryAsync();
        //    var lowStockTask = GetLowStockProductsAsync();

        //    await Task.WhenAll(
        //        summaryTask, 
        //        topCategoriesTask, 
        //        priceRangeTask, 
        //        stockValuesTask, 
        //        mostExpensiveTask, 
        //        lowStockTask
        //    );

        //    return new DashboardViewModel
        //    {
        //        Summary = await summaryTask,
        //        TopCategories = await topCategoriesTask,
        //        PriceRangeDistribution = await priceRangeTask,
        //        CategoryStockValues = await stockValuesTask,
        //        MostExpensiveProducts = await mostExpensiveTask,
        //        LowStockProducts = await lowStockTask
        //    };
        //}

        public async Task<List<ResultCategoryDistributionDto>> GetCategoryDistributionAsync()
        {
            string query = @"
                SELECT c.CategoryName, COUNT(p.ProductId) as Count
                FROM Categories c 
                LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                GROUP BY c.CategoryName";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultCategoryDistributionDto>(query);
            return result.ToList();
        }

        public async Task<List<ResultStatusDistributionDto>> GetStatusDistributionAsync()
        {
            string query = @"
                SELECT
                    CASE WHEN IsActive = 1 THEN 'Aktif' ELSE 'Pasif' END as Status,
                    COUNT(*) as Count
                FROM Products
                GROUP BY IsActive";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultStatusDistributionDto>(query);
            return result.ToList();

        }

        public async Task<List<ResultCategoryStatusSplitDto>> GetCategoryStatusSplitAsync()
        {
            string query = @"
                SELECT
                    c.CategoryName,
                    SUM(CASE WHEN p.IsActive = 1 THEN 1 ELSE 0 END) as ActiveCount,
                    SUM(CASE WHEN p.IsActive = 0 THEN 0 ELSE 1 END) as PassiveCount
                FROM Categories c
                LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                GROUP BY c.CategoryName";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultCategoryStatusSplitDto>(query);
            return result.ToList();
        }

        public Task<List<ResultAbcAnalysisDto>> GetAbcAnalysisAsync()
        {
            throw new NotImplementedException();
        }

        public Task<List<ResultRiskMatrixDto>> GetRiskMatrixAsync()
        {
            throw new NotImplementedException();
        }

        public Task<List<ResultCategoryHealthDto>> GetCategoryHealthAsync()
        {
            throw new NotImplementedException();
        }

        public Task<List<ResultTopInventoryDto>> GetTopInventoryAsync()
        {
            throw new NotImplementedException();
        }

        public Task<List<ResultAnomalyDto>> GetAnomaliesAsync()
        {
            throw new NotImplementedException();
        }

        public Task<List<ResultProductTableDto>> GetProductsForTableAsync(string search, string category, string status)
        {
            throw new NotImplementedException();
        }
    }
}
