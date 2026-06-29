using Dapper;
using DapperDashboardProject.Context;
using DapperDashboardProject.Dtos.DashboardDtos;
using Microsoft.Extensions.Caching.Memory;
using System.Data;

namespace DapperDashboardProject.Services.DashboardServices
{
    public class DashboardService : IDashboardService
    {
        private readonly DapperContext _context;
        private readonly IMemoryCache _cache;

        public DashboardService(DapperContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        private async Task<T> GetCachedAsync<T>(string cacheKey, Func<Task<T>> fetchFunction)
        {
            if (!_cache.TryGetValue(cacheKey, out T? cacheEntry))
            {
                cacheEntry = await fetchFunction();
                if (cacheEntry != null)
                {
                    _cache.Set(cacheKey, cacheEntry, TimeSpan.FromMinutes(5));
                }
            }
            return cacheEntry!;
        }

        public Task<ResultDashboardSummaryDto> GetDashboardSummaryAsync() => GetCachedAsync("DashboardSummary", async () =>
        {
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

            return new ResultDashboardSummaryDto
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
        });

        public Task<List<ResultTopCategoryDto>> GetTopCategoriesAsync(int topCount = 10) => GetCachedAsync($"TopCategories_{topCount}", async () =>
        {
            string query = @"
                WITH CategoryStats AS (
                    SELECT 
                        c.CategoryId, c.CategoryName,
                        COUNT(p.ProductId) as ProductCount,
                        ISNULL(AVG(p.Price), 0) as AveragePrice,
                        ISNULL(SUM(p.Price * p.Stock), 0) as TotalStockValue,
                        ISNULL(SUM(p.Stock), 0) as TotalStock
                    FROM Categories c
                    LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                    GROUP BY c.CategoryId, c.CategoryName
                ),
                RankedCategories AS (
                    SELECT *,
                        DENSE_RANK() OVER (ORDER BY ProductCount DESC, TotalStockValue DESC) as CategoryRank,
                        NTILE(4) OVER (ORDER BY TotalStockValue DESC) as PerformanceQuartile
                    FROM CategoryStats
                )
                SELECT TOP (@TopCount) * FROM RankedCategories ORDER BY CategoryRank;
            ";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultTopCategoryDto>(query, new { TopCount = topCount });
            return result.ToList();
        });

        public Task<List<ResultPriceRangeDistributionDto>> GetPriceRangeDistributionAsync() => GetCachedAsync("PriceRangeDist", async () =>
        {
            string query = @"
                SELECT 
                    PriceRange, COUNT(ProductId) as ProductCount, ISNULL(SUM(Price * Stock), 0) as TotalValue,
                    ISNULL(AVG(Price), 0) as AveragePrice, SortOrder
                FROM (
                    SELECT ProductId, Price, Stock,
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
        });

        public Task<List<ResultCategoryStockValueDto>> GetCategoryStockValuesAsync() => GetCachedAsync("CatStockValues", async () =>
        {
            string query = @"
                DECLARE @TotalValue DECIMAL = (SELECT ISNULL(SUM(Price * Stock), 1) FROM Products);
                SELECT 
                    c.CategoryId, c.CategoryName, COUNT(p.ProductId) as ProductCount,
                    ISNULL(SUM(p.Stock), 0) as TotalStock, ISNULL(SUM(p.Price * p.Stock), 0) as TotalStockValue,
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
        });

        public Task<List<ResultMostExpensiveProductDto>> GetMostExpensivePerCategoryAsync(int topN = 10) => GetCachedAsync($"MostExpensive_{topN}", async () =>
        {
            string query = @"
                WITH RankedProducts AS (
                    SELECT 
                        p.ProductId, p.ProductName, p.Price, p.Stock, c.CategoryName,
                        ROW_NUMBER() OVER (PARTITION BY p.CategoryId ORDER BY p.Price DESC) as rn,
                        AVG(p.Price) OVER (PARTITION BY p.CategoryId) as CategoryAveragePrice
                    FROM Products p
                    INNER JOIN Categories c ON p.CategoryId = c.CategoryId
                )
                SELECT TOP (@TopN)
                    ProductId, ProductName, Price, Stock, CategoryName, CategoryAveragePrice,
                    CASE WHEN CategoryAveragePrice = 0 THEN 0 ELSE ((Price - CategoryAveragePrice) / CategoryAveragePrice) * 100 END as PriceVsAveragePercent
                FROM RankedProducts
                WHERE rn = 1
                ORDER BY Price DESC;
            ";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultMostExpensiveProductDto>(query, new { TopN = topN });
            return result.ToList();
        });

        public Task<List<ResultLowStockProductDto>> GetLowStockProductsAsync(int threshold = 20) => GetCachedAsync($"LowStock_{threshold}", async () =>
        {
            string query = @"
                SELECT 
                    p.ProductId, p.ProductName, p.Stock, p.Price, (p.Price * p.Stock) as StockValue,
                    c.CategoryName,
                    CASE WHEN p.Stock = 0 THEN 'Tükendi' WHEN p.Stock <= (@Threshold / 2) THEN 'Çok Kritik' ELSE 'Kritik' END as StockLevel
                FROM Products p
                INNER JOIN Categories c ON p.CategoryId = c.CategoryId
                WHERE p.Stock <= @Threshold
                ORDER BY p.Stock ASC, p.Price DESC;
            ";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultLowStockProductDto>(query, new { Threshold = threshold });
            return result.ToList();
        });

        public Task<List<ResultCategoryDistributionDto>> GetCategoryDistributionAsync(int? topN = null) => GetCachedAsync($"CatDistribution_{topN}", async () =>
        {
            string query = topN.HasValue
                ? @"SELECT TOP (@TopN) c.CategoryName, COUNT(p.ProductId) as Count 
                     FROM Categories c LEFT JOIN Products p ON c.CategoryId = p.CategoryId 
                     GROUP BY c.CategoryName ORDER BY Count DESC"
                : @"SELECT c.CategoryName, COUNT(p.ProductId) as Count 
                     FROM Categories c LEFT JOIN Products p ON c.CategoryId = p.CategoryId 
                     GROUP BY c.CategoryName";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultCategoryDistributionDto>(query, new { TopN = topN ?? 0 });
            return result.ToList();
        });

        public Task<List<ResultStatusDistributionDto>> GetStatusDistributionAsync() => GetCachedAsync("StatusDist", async () =>
        {
            string query = "SELECT CASE WHEN IsActive = 1 THEN 'Aktif' ELSE 'Pasif' END as Status, COUNT(*) as Count FROM Products GROUP BY IsActive";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultStatusDistributionDto>(query);
            return result.ToList();
        });

        public Task<List<ResultCategoryStatusSplitDto>> GetCategoryStatusSplitAsync(int? topN = null) => GetCachedAsync($"CatStatusSplit_{topN}", async () =>
        {
            string query = topN.HasValue
                ? @"SELECT TOP (@TopN) c.CategoryName,
                    SUM(CASE WHEN p.IsActive = 1 THEN 1 ELSE 0 END) as ActiveCount,
                    SUM(CASE WHEN p.IsActive = 0 THEN 1 ELSE 0 END) as PassiveCount
                    FROM Categories c LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                    GROUP BY c.CategoryName
                    ORDER BY (SUM(CASE WHEN p.IsActive = 1 THEN 1 ELSE 0 END) + SUM(CASE WHEN p.IsActive = 0 THEN 1 ELSE 0 END)) DESC"
                : @"SELECT c.CategoryName,
                    SUM(CASE WHEN p.IsActive = 1 THEN 1 ELSE 0 END) as ActiveCount,
                    SUM(CASE WHEN p.IsActive = 0 THEN 1 ELSE 0 END) as PassiveCount
                    FROM Categories c LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                    GROUP BY c.CategoryName";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultCategoryStatusSplitDto>(query, new { TopN = topN ?? 0 });
            return result.ToList();
        });

        public Task<List<ResultAbcAnalysisDto>> GetAbcAnalysisAsync() => GetCachedAsync("AbcAnalysis", async () =>
        {
            string query = @"
                WITH ProductValue AS (
                    SELECT ProductId,(Price * Stock) as Value FROM Products
                ), TotalVal AS (
                    SELECT SUM(Value) as Total FROM ProductValue
                ), Ranked AS(
                    SELECT Value, SUM(Value) OVER(ORDER BY Value DESC) / NULLIF((SELECT TOTAL FROM TotalVal), 0) as CumulativePct
                    FROM ProductValue
                )
                SELECT 
                    CASE WHEN CumulativePct <= 0.70 THEN 'Class A (High Value)' WHEN CumulativePct <= 0.90 THEN 'Class B' ELSE 'Class C' END as ClassName,
                    COUNT(*) as ProductCount, SUM(Value) as TotalValue
                FROM Ranked
                GROUP BY CASE WHEN CumulativePct <= 0.70 THEN 'Class A (High Value)' WHEN CumulativePct <= 0.90 THEN 'Class B' ELSE 'Class C' END";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultAbcAnalysisDto>(query);
            return result.ToList();
        });

        public Task<List<ResultRiskMatrixDto>> GetRiskMatrixAsync() => GetCachedAsync("RiskMatrix", async () =>
        {
            string query = @"
                SELECT CASE WHEN Stock > 100 THEN 'Overstocked' WHEN Stock <= 20 THEN 'Risky' ELSE 'Healthy' END as RiskLevel, COUNT(*) as Count
                FROM Products
                GROUP BY CASE WHEN Stock > 100 THEN 'Overstocked' WHEN Stock <= 20 THEN 'Risky' ELSE 'Healthy' END";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultRiskMatrixDto>(query);
            return result.ToList();
        });

        public Task<List<ResultCategoryHealthDto>> GetCategoryHealthAsync() => GetCachedAsync("CatHealth", async () =>
        {
            string query = @"
                SELECT c.CategoryName,
                    ISNULL(CAST((SUM(CASE WHEN p.IsActive = 1 AND p.Stock > 0 THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(p.ProductId), 0) AS INT), 0) as Score,
                    CASE 
                        WHEN (SUM(CASE WHEN p.IsActive = 1 AND p.Stock > 0 THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(p.ProductId), 0) >= 80 THEN '#3fb950'
                        WHEN (SUM(CASE WHEN p.IsActive = 1 AND p.Stock > 0 THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(p.ProductId), 0) >= 50 THEN '#d29922'
                        ELSE '#f85149'
                    END as Color
                FROM Categories c
                LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                GROUP BY c.CategoryName";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultCategoryHealthDto>(query);
            return result.ToList();
        });

        public async Task<List<ResultTopInventoryDto>> GetTopInventoryAsync()
        {
            string query = "SELECT TOP 10 ProductName, (Price * Stock) as InventoryValue, '' as Change FROM Products ORDER BY (Price * Stock) DESC";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultTopInventoryDto>(query);
            return result.ToList();
        }

        public async Task<List<ResultAnomalyDto>> GetAnomaliesAsync()
        {
            string query = @"
                SELECT TOP 5
                    CAST(ProductId AS VARCHAR) as ProductId, 'Stoksuz ama Aktif' as AnomalyMessage, ProductName, 'Hemen Kapatılmalı' as Impact
                FROM Products WHERE Stock = 0 AND IsActive = 1";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultAnomalyDto>(query);
            return result.ToList();
        }

        public async Task<ResultProductTablePagedDto> GetProductsForTableAsync(string search, string category, string status, decimal? minPrice, decimal? maxPrice, int page = 1, int pageSize = 10)
        {
            string countQuery = @"
                SELECT COUNT(*) FROM Products p
                INNER JOIN Categories c ON p.CategoryId = c.CategoryId
                WHERE (@Search IS NULL OR p.ProductName LIKE '%' + @Search + '%')
                  AND (@Category IS NULL OR @Category = '' OR c.CategoryName = @Category)
                  AND (@Status IS NULL OR @Status = '' OR 
                       (@Status = 'active' AND p.IsActive = 1) OR 
                       (@Status = 'inactive' AND p.IsActive = 0))
                  AND (@MinPrice IS NULL OR p.Price >= @MinPrice)
                  AND (@MaxPrice IS NULL OR p.Price <= @MaxPrice)";

            string query = @"
                SELECT p.ProductId, p.ProductName, c.CategoryName, p.Price, p.Stock, p.IsActive, 
                    CASE WHEN p.Stock = 0 THEN 'oos' WHEN p.Stock <= 20 THEN 'critical' ELSE 'normal' END as RiskStatus
                FROM Products p
                INNER JOIN Categories c ON p.CategoryId = c.CategoryId
                WHERE (@Search IS NULL OR p.ProductName LIKE '%' + @Search + '%')
                  AND (@Category IS NULL OR @Category = '' OR c.CategoryName = @Category)
                  AND (@Status IS NULL OR @Status = '' OR 
                       (@Status = 'active' AND p.IsActive = 1) OR 
                       (@Status = 'inactive' AND p.IsActive = 0))
                  AND (@MinPrice IS NULL OR p.Price >= @MinPrice)
                  AND (@MaxPrice IS NULL OR p.Price <= @MaxPrice)
                ORDER BY p.ProductId DESC
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

            var parameters = new DynamicParameters();
            parameters.Add("@Search", string.IsNullOrWhiteSpace(search) ? null : search);
            parameters.Add("@Category", string.IsNullOrWhiteSpace(category) ? null : category);
            parameters.Add("@Status", string.IsNullOrWhiteSpace(status) ? null : status);
            parameters.Add("@MinPrice", minPrice);
            parameters.Add("@MaxPrice", maxPrice);
            parameters.Add("@Offset", (page - 1) * pageSize);
            parameters.Add("@PageSize", pageSize);

            using var connection = _context.CreateConnection();
            var totalCount = await connection.ExecuteScalarAsync<int>(countQuery, parameters);
            var items = await connection.QueryAsync<ResultProductTableDto>(query, parameters);

            return new ResultProductTablePagedDto
            {
                Items = items.ToList(),
                TotalCount = totalCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<List<string>> GetCategoryNamesAsync()
        {
            return await GetCachedAsync("CatNames", async () =>
            {
                using var connection = _context.CreateConnection();
                var result = await connection.QueryAsync<string>("SELECT CategoryName FROM Categories ORDER BY CategoryName");
                return result.ToList();
            });
        }

        public async Task<List<ResultCategoryTrendDto>> GetCategoryTrendAnalysisAsync()
        {
            string query = @"
                WITH RankedProducts AS (
                    SELECT 
                        p.CategoryId, c.CategoryName, p.ProductName, p.Price,
                        ROW_NUMBER() OVER(PARTITION BY p.CategoryId ORDER BY p.Price DESC) as RankNum,
                        AVG(p.Price) OVER(PARTITION BY p.CategoryId) as CategoryAvgPrice
                    FROM Products p
                    INNER JOIN Categories c ON p.CategoryId = c.CategoryId
                )
                SELECT 
                    CategoryId, CategoryName, ProductName as MostExpensiveProductName,
                    Price as MaxPrice, CategoryAvgPrice as CategoryAveragePrice,
                    CASE WHEN CategoryAvgPrice = 0 THEN 0 ELSE ((Price - CategoryAvgPrice) / CategoryAvgPrice) * 100 END as DeviationPercentage
                FROM RankedProducts
                WHERE RankNum = 1
                ORDER BY DeviationPercentage DESC";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultCategoryTrendDto>(query);
            return result.ToList();
        }

        public async Task<List<ResultPriceHeatmapDto>> GetPriceStockHeatmapAsync()
        {
            string query = @"
                WITH PriceBands AS (
                    SELECT 
                        CASE 
                            WHEN Price < 100 THEN '0-100'
                            WHEN Price < 1000 THEN '100-1000'
                            ELSE '1000+' 
                        END as PriceRange,
                        CASE
                            WHEN Stock = 0 THEN 'Out of Stock'
                            WHEN Stock < 20 THEN 'Low Stock'
                            ELSE 'Healthy'
                        END as StockLevel,
                        Stock, Price
                    FROM Products
                )
                SELECT 
                    PriceRange, StockLevel,
                    COUNT(*) as ProductCount, ISNULL(SUM(Stock * Price), 0) as TotalStockValue
                FROM PriceBands
                GROUP BY PriceRange, StockLevel
                ORDER BY PriceRange, StockLevel";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultPriceHeatmapDto>(query);
            return result.ToList();
        }

        public async Task<List<ResultCategoryScorecardDto>> GetCategoryScorecardAsync()
        {
            string query = @"
                WITH CategoryMetrics AS (
                    SELECT 
                        c.CategoryId, c.CategoryName,
                        ISNULL(SUM(p.Price * p.Stock), 0) as TotalValue,
                        CAST(SUM(CASE WHEN p.IsActive = 1 THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(p.ProductId), 0) as ActiveRatio
                    FROM Categories c
                    LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                    GROUP BY c.CategoryId, c.CategoryName
                ),
                ScoredMetrics AS (
                    SELECT 
                        CategoryName,
                        ISNULL(PERCENT_RANK() OVER(ORDER BY TotalValue) * 100, 0) as TotalValueScore,
                        ISNULL(PERCENT_RANK() OVER(ORDER BY ActiveRatio) * 100, 0) as ActiveRatioScore
                    FROM CategoryMetrics
                )
                SELECT 
                    CategoryName, TotalValueScore, ActiveRatioScore,
                    (TotalValueScore * 0.7 + ActiveRatioScore * 0.3) as OverallScore,
                    RANK() OVER(ORDER BY (TotalValueScore * 0.7 + ActiveRatioScore * 0.3) DESC) as PerformanceRank
                FROM ScoredMetrics
                ORDER BY PerformanceRank";
            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<ResultCategoryScorecardDto>(query);
            return result.ToList();
        }

        // ── Görev 5: Sayfalı Düşük Stok Sorgusu ──
        public async Task<PagedResult<ResultLowStockProductDto>> GetLowStockProductsPagedAsync(int threshold = 20, int page = 1, int pageSize = 15)
        {
            string sql = @"
                SELECT COUNT(*) FROM Products WHERE Stock <= @Threshold;

                SELECT 
                    p.ProductId, p.ProductName, p.Stock, p.Price, (p.Price * p.Stock) as StockValue,
                    c.CategoryName,
                    CASE WHEN p.Stock = 0 THEN 'Tükendi' WHEN p.Stock <= (@Threshold / 2) THEN 'Çok Kritik' ELSE 'Kritik' END as StockLevel
                FROM Products p
                INNER JOIN Categories c ON p.CategoryId = c.CategoryId
                WHERE p.Stock <= @Threshold
                ORDER BY p.Stock ASC, p.Price DESC
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
            ";
            using var connection = _context.CreateConnection();
            using var multi = await connection.QueryMultipleAsync(sql, new
            {
                Threshold = threshold,
                Offset = (page - 1) * pageSize,
                PageSize = pageSize
            });
            var totalCount = await multi.ReadFirstAsync<int>();
            var items = (await multi.ReadAsync<ResultLowStockProductDto>()).ToList();

            return new PagedResult<ResultLowStockProductDto>
            {
                Items = items,
                TotalCount = totalCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        // ── Görev 3: Sayfalı Trend Analizi ──
        public async Task<PagedResult<ResultCategoryTrendDto>> GetCategoryTrendAnalysisPagedAsync(int page = 1, int pageSize = 10)
        {
            string sql = @"
                WITH RankedProducts AS (
                    SELECT 
                        p.CategoryId, c.CategoryName, p.ProductName, p.Price,
                        ROW_NUMBER() OVER(PARTITION BY p.CategoryId ORDER BY p.Price DESC) as RankNum,
                        AVG(p.Price) OVER(PARTITION BY p.CategoryId) as CategoryAvgPrice
                    FROM Products p
                    INNER JOIN Categories c ON p.CategoryId = c.CategoryId
                ),
                TrendData AS (
                    SELECT 
                        CategoryId, CategoryName, ProductName as MostExpensiveProductName,
                        Price as MaxPrice, CategoryAvgPrice as CategoryAveragePrice,
                        CASE WHEN CategoryAvgPrice = 0 THEN 0 ELSE ((Price - CategoryAvgPrice) / CategoryAvgPrice) * 100 END as DeviationPercentage
                    FROM RankedProducts
                    WHERE RankNum = 1
                )
                SELECT COUNT(*) OVER() as _TotalCount, * FROM TrendData
                ORDER BY DeviationPercentage DESC
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
            ";
            using var connection = _context.CreateConnection();
            var rows = (await connection.QueryAsync(sql, new { Offset = (page - 1) * pageSize, PageSize = pageSize })).ToList();
            int totalCount = rows.Count > 0 ? (int)rows[0]._TotalCount : 0;

            var items = rows.Select(r => new ResultCategoryTrendDto
            {
                CategoryId = (int)r.CategoryId,
                CategoryName = (string)r.CategoryName,
                MostExpensiveProductName = (string)r.MostExpensiveProductName,
                MaxPrice = (decimal)r.MaxPrice,
                CategoryAveragePrice = (decimal)r.CategoryAveragePrice,
                DeviationPercentage = (decimal)r.DeviationPercentage
            }).ToList();

            return new PagedResult<ResultCategoryTrendDto>
            {
                Items = items,
                TotalCount = totalCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        // ── Görev 3: Sayfalı Scorecard ──
        public async Task<PagedResult<ResultCategoryScorecardDto>> GetCategoryScorecardPagedAsync(int page = 1, int pageSize = 10)
        {
            string sql = @"
                WITH CategoryMetrics AS (
                    SELECT 
                        c.CategoryId, c.CategoryName,
                        ISNULL(SUM(p.Price * p.Stock), 0) as TotalValue,
                        CAST(SUM(CASE WHEN p.IsActive = 1 THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(p.ProductId), 0) as ActiveRatio
                    FROM Categories c
                    LEFT JOIN Products p ON c.CategoryId = p.CategoryId
                    GROUP BY c.CategoryId, c.CategoryName
                ),
                ScoredMetrics AS (
                    SELECT 
                        CategoryName,
                        ISNULL(PERCENT_RANK() OVER(ORDER BY TotalValue) * 100, 0) as TotalValueScore,
                        ISNULL(PERCENT_RANK() OVER(ORDER BY ActiveRatio) * 100, 0) as ActiveRatioScore
                    FROM CategoryMetrics
                ),
                FinalScored AS (
                    SELECT 
                        CategoryName, TotalValueScore, ActiveRatioScore,
                        (TotalValueScore * 0.7 + ActiveRatioScore * 0.3) as OverallScore,
                        RANK() OVER(ORDER BY (TotalValueScore * 0.7 + ActiveRatioScore * 0.3) DESC) as PerformanceRank
                    FROM ScoredMetrics
                )
                SELECT COUNT(*) OVER() as _TotalCount, * FROM FinalScored
                ORDER BY PerformanceRank
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
            ";
            using var connection = _context.CreateConnection();
            var rows = (await connection.QueryAsync(sql, new { Offset = (page - 1) * pageSize, PageSize = pageSize })).ToList();
            int totalCount = rows.Count > 0 ? (int)rows[0]._TotalCount : 0;

            var items = rows.Select(r => new ResultCategoryScorecardDto
            {
                CategoryName = (string)r.CategoryName,
                TotalValueScore = (decimal)(double)r.TotalValueScore,
                ActiveRatioScore = (decimal)(double)r.ActiveRatioScore,
                OverallScore = (decimal)(double)r.OverallScore,
                PerformanceRank = (int)(long)r.PerformanceRank
            }).ToList();

            return new PagedResult<ResultCategoryScorecardDto>
            {
                Items = items,
                TotalCount = totalCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }
    }
}
