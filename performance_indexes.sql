-- ═══════════════════════════════════════════════════
-- Görev 6: SQL Performance Indexes
-- 1M+ satır için kritik sorgu optimizasyonları
-- ═══════════════════════════════════════════════════

-- 1. Products tablosu üzerinde en sık kullanılan filtreleme alanları
-- Dashboard: GetLowStockProductsAsync, GetProductsForTableAsync
CREATE NONCLUSTERED INDEX IX_Products_Stock_IsActive 
ON Products (Stock, IsActive) 
INCLUDE (ProductId, ProductName, Price, CategoryId);

-- 2. CategoryId bazlı JOIN optimizasyonu (tüm kategori aggregate sorguları)
CREATE NONCLUSTERED INDEX IX_Products_CategoryId_Cover
ON Products (CategoryId)
INCLUDE (ProductId, Price, Stock, IsActive);

-- 3. Fiyat aralığı filtreleme (GetPriceRangeDistribution, tablo filtreleme)
CREATE NONCLUSTERED INDEX IX_Products_Price
ON Products (Price)
INCLUDE (ProductId, Stock, CategoryId);

-- 4. Ürün arama (LIKE '%search%' optimizasyonu - full-text index önerisi)
-- Not: LIKE '%text%' full table scan yapar, bu nedenle Full-Text Index önerilir
-- Alternatif: ProductName üzerinde Full-Text Catalog oluşturun
-- CREATE FULLTEXT CATALOG ProductSearchCatalog AS DEFAULT;
-- CREATE FULLTEXT INDEX ON Products(ProductName) KEY INDEX PK_Products;

-- 5. Composite index for table pagination (ORDER BY ProductId DESC)
CREATE NONCLUSTERED INDEX IX_Products_ProductId_DESC
ON Products (ProductId DESC)
INCLUDE (ProductName, Price, Stock, IsActive, CategoryId);

-- ═══════════════════════════════════════════════════
-- Opsiyonel: Kategori Özet View (sık tekrarlanan aggregation)
-- Bu view ile 6+ farklı sorguda tekrarlanan JOIN+GROUP BY önlenir
-- ═══════════════════════════════════════════════════
-- CREATE VIEW vw_CategorySummary AS
-- SELECT 
--     c.CategoryId, c.CategoryName,
--     COUNT(p.ProductId) AS ProductCount,
--     ISNULL(SUM(p.Stock), 0) AS TotalStock,
--     ISNULL(AVG(p.Price), 0) AS AveragePrice,
--     ISNULL(SUM(p.Price * p.Stock), 0) AS TotalStockValue,
--     SUM(CASE WHEN p.IsActive = 1 THEN 1 ELSE 0 END) AS ActiveCount,
--     SUM(CASE WHEN p.IsActive = 0 THEN 1 ELSE 0 END) AS PassiveCount,
--     SUM(CASE WHEN p.IsActive = 1 AND p.Stock > 0 THEN 1 ELSE 0 END) AS HealthyActiveCount
-- FROM Categories c
-- LEFT JOIN Products p ON c.CategoryId = p.CategoryId
-- GROUP BY c.CategoryId, c.CategoryName;
-- GO
