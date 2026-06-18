-- =================================================================================
-- SEED DATA GENERATION SCRIPT FOR DAPPER DASHBOARD PROJECT
-- Generates exactly 1,000 Realistic Categories and 100,000 Realistic Products.
-- Uses real-world brands, products, descriptions, prices, and stock counts.
-- =================================================================================

-- WARNING: To wipe existing data before seeding, uncomment the lines below:
/*
ALTER TABLE Products NOCHECK CONSTRAINT ALL;
ALTER TABLE Categories NOCHECK CONSTRAINT ALL;
TRUNCATE TABLE Products;
TRUNCATE TABLE Categories;
ALTER TABLE Products CHECK CONSTRAINT ALL;
ALTER TABLE Categories CHECK CONSTRAINT ALL;
*/

BEGIN TRANSACTION;

BEGIN TRY
    -- 1. Create Temporary Tables for Categories Data
    CREATE TABLE #MainCategories (
        MainId INT,
        MainName NVARCHAR(100)
    );

    CREATE TABLE #SubCategories (
        SubId INT,
        MainId INT,
        SubName NVARCHAR(100),
        BaseNoun NVARCHAR(100)
    );

    CREATE TABLE #Modifiers (
        ModId INT,
        ModName NVARCHAR(100)
    );

    -- 2. Populate Main Categories (10 Domains)
    INSERT INTO #MainCategories VALUES
    (1, N'Elektronik'),
    (2, N'Moda & Giyim'),
    (3, N'Ev, Yaşam & Mutfak'),
    (4, N'Kozmetik & Kişisel Bakım'),
    (5, N'Spor, Outdoor & Kamp'),
    (6, N'Yapı Market & Bahçe'),
    (7, N'Anne, Bebek & Oyuncak'),
    (8, N'Süpermarket & Organik Gıda'),
    (9, N'Kitap, Hobi & Ofis'),
    (10, N'Otomobil & Motosiklet');

    -- 3. Populate Subcategories and Base Nouns (100 Subcategories)
    INSERT INTO #SubCategories (SubId, MainId, SubName, BaseNoun) VALUES
    -- MainId = 1 (Elektronik)
    (1, 1, N'Akıllı Telefonlar', N'Akıllı Telefon'),
    (2, 1, N'Dizüstü & Masaüstü Bilgisayar', N'Dizüstü Bilgisayar'),
    (3, 1, N'Oyuncu Ekipmanları (Gaming)', N'Oyuncu Kulaklığı'),
    (4, 1, N'Giyilebilir Teknoloji & Saatler', N'Akıllı Saat'),
    (5, 1, N'Kulaklık & Ses Sistemleri', N'Kablosuz Kulaklık'),
    (6, 1, N'Akıllı Ev Teknolojileri', N'Akıllı Priz'),
    (7, 1, N'Fotoğraf Makinesi & Kamera', N'Aksiyon Kamerası'),
    (8, 1, N'TV, Ekran & Projeksiyon', N'Smart TV'),
    (9, 1, N'Şarj Cihazları & Kablolar', N'Hızlı Şarj Adaptörü'),
    (10, 1, N'Depolama & Ağ Donanımları', N'Taşınabilir SSD'),

    -- MainId = 2 (Moda & Giyim)
    (11, 2, N'Kadın Günlük Giyim', N'Elbise'),
    (12, 2, N'Erkek Klasik & Spor Giyim', N'Polo Yaka Tişört'),
    (13, 2, N'Ayakkabı & Spor Sneaker', N'Koşu Ayakkabısı'),
    (14, 2, N'Çanta & Cüzdan Modelleri', N'Deri Sırt Çantası'),
    (15, 2, N'Kol Saati & Akıllı Saatler', N'Analog Kol Saati'),
    (16, 2, N'Takı & Lüks Mücevher', N'Gümüş Kolye'),
    (17, 2, N'Spor & Aktif Giyim', N'Spor Tayt'),
    (18, 2, N'Dış Giyim, Mont & Kaban', N'Şişme Mont'),
    (19, 2, N'Güneş Gözlüğü & Gözlükler', N'Polarize Güneş Gözlüğü'),
    (20, 2, N'İç Giyim & Ev Giyim', N'Pijama Takımı'),

    -- MainId = 3 (Ev, Yaşam & Mutfak)
    (21, 3, N'Oturma Odası Mobilyaları', N'L Koltuk'),
    (22, 3, N'Yatak Odası & Gardıroplar', N'Gardırop'),
    (23, 3, N'Ev Tekstili & Nevresim Takımı', N'Çift Kişilik Nevresim'),
    (24, 3, N'Mutfak Gereçleri & Sofra', N'Yemek Takımı'),
    (25, 3, N'Aydınlatma & Lambader', N'Lambader'),
    (26, 3, N'Dekoratif Objeler & Aynalar', N'Duvar Aynası'),
    (27, 3, N'Duvar Kağıdı & Tablolar', N'Kanvas Tablo'),
    (28, 3, N'Temizlik & Ev Düzenleme', N'Çöp Kovası'),
    (29, 3, N'Banyo Aksesuarları', N'Banyo Paspası'),
    (30, 3, N'Yemek Odası Takımları', N'Yemek Masası'),

    -- MainId = 4 (Kozmetik & Kişisel Bakım)
    (31, 4, N'Parfüm & Deodorant (EDP/EDT)', N'Erkek Parfümü'),
    (32, 4, N'Yüz & Cilt Bakım Kremleri', N'Nemlendirici Krem'),
    (33, 4, N'Saç Bakım Şampuan & Maskeleri', N'Besleyici Şampuan'),
    (34, 4, N'Profesyonel Makyaj Malzemeleri', N'Mat Ruj'),
    (35, 4, N'Vücut & Duş Jeli Çeşitleri', N'Nemlendirici Duş Jeli'),
    (36, 4, N'Tıraş & Erkek Bakım Ürünleri', N'Tıraş Bıçağı'),
    (37, 4, N'Ağız & Diş Sağlığı', N'Şarjlı Diş Fırçası'),
    (38, 4, N'Güneş Koruyucu Krem & Yağlar', N'Güneş Kremi SPF 50+'),
    (39, 4, N'Doğal & Vegan Kozmetik', N'Organik Cilt Yağı'),
    (40, 4, N'Manikür & Pedikür Aletleri', N'Tırnak Törpüsü'),

    -- MainId = 5 (Spor, Outdoor & Kamp)
    (41, 5, N'Kondisyon Aletleri & Dambıllar', N'Ayarlanabilir Dambıl'),
    (42, 5, N'Kamp Çadırları & Ekipmanları', N'4 Kişilik Kamp Çadırı'),
    (43, 5, N'Trekking & Doğa Yürüyüşü Botu', N'Gore-Tex Trekking Botu'),
    (44, 5, N'Bisiklet & Paten Çeşitleri', N'Dağ Bisikleti'),
    (45, 5, N'Yüzme Ekipmanları & Mayo', N'Yüzücü Gözlüğü'),
    (46, 5, N'Termos & Dağcılık Matları', N'Çelik Termos'),
    (47, 5, N'Pilates, Yoga & Egzersiz', N'Pilates Matı'),
    (48, 5, N'Avcılık & Balıkçılık Malzemeleri', N'Olta Seti'),
    (49, 5, N'Rüzgarlık & Termal İçlik', N'Termal Üst'),
    (50, 5, N'Kış Sporları & Kayak Malzemeleri', N'Kayak Gözlüğü'),

    -- MainId = 6 (Yapı Market & Bahçe)
    (51, 6, N'Matkap & Kırıcı Akülü Aletler', N'Akülü Matkap'),
    (52, 6, N'El Aletleri & Tornavida Seti', N'Tornavida Seti'),
    (53, 6, N'Bahçe Mobilyaları & Salıncak', N'Bahçe Salıncağı'),
    (54, 6, N'Çim Biçme & Sulama Sistemleri', N'Çim Biçme Makinesi'),
    (55, 6, N'İç & Dış Cephe Boya Malzemeleri', N'Silikonlu İç Cephe Boyası'),
    (56, 6, N'Elektrik, Kablo & Priz Grupları', N'Grup Priz'),
    (57, 6, N'Ev Güvenlik & Kilit Sistemleri', N'Akıllı Kapı Kilidi'),
    (58, 6, N'Sıhhi Tesisat & Musluk Grupları', N'Banyo Bataryası'),
    (59, 6, N'Merdiven & Saklama Kutuları', N'Alüminyum Merdiven'),
    (60, 6, N'Jeneratör & Enerji Kaynakları', N'Portatif Jeneratör'),

    -- MainId = 7 (Anne, Bebek & Oyuncak)
    (61, 7, N'Bebek Arabaları & Oto Koltukları', N'Bebek Arabası'),
    (62, 7, N'Bebek Giyim & Tulum Modelleri', N'Pamuklu Bebek Tulumu'),
    (63, 7, N'Mama Sandalyeleri & Gereçleri', N'Mama Sandalyesi'),
    (64, 7, N'Bebek Bezleri & Islak Mendiller', N'Bebek Bezi Eko Paket'),
    (65, 7, N'Eğitici Ahşap Oyuncaklar', N'Ahşap Blok Seti'),
    (66, 7, N'Kutu Oyunları & Yapbozlar (Puzzle)', N'1000 Parça Puzzle'),
    (67, 7, N'Uzaktan Kumandalı Arabalar', N'Drift Arabası'),
    (68, 7, N'Bebek Cilt Bakım & Şampuanları', N'Göz Yakmayan Şampuan'),
    (69, 7, N'Emzik, Biberon & Sterilizatörler', N'Antikolik Biberon'),
    (70, 7, N'Peluş Oyuncak & Figürler', N'Peluş Ayıcık'),

    -- MainId = 8 (Süpermarket & Organik Gıda)
    (71, 8, N'Gurme Çay & Dünya Kahveleri', N'Filtre Kahve'),
    (72, 8, N'Sağlıklı Atıştırmalık & Kuruyemiş', N'Çiğ Badem'),
    (73, 8, N'Bitkisel Sıvı Yağ & Zeytinyağları', N'Sızma Zeytinyağı'),
    (74, 8, N'Organik Kahvaltılık & Bal-Pekmez', N'Süzme Çiçek Balı'),
    (75, 8, N'Çikolata & Premium Şekerlemeler', N'Bitter Çikolata'),
    (76, 8, N'Konserve & Hazır Gurme Soslar', N'Napolitan Makarna Sosu'),
    (77, 8, N'Glutensiz & Diyet Ürünleri', N'Glutensiz Yulaf Ezmesi'),
    (78, 8, N'Hijyenik Temizlik & Deterjanlar', N'Sıvı Çamaşır Deterjanı'),
    (79, 8, N'Baharatlar & Doğal Yemek Harçları', N'Tane Karabiber'),
    (80, 8, N'Bitki Çayları & Detoks Karışımları', N'Yeşil Çay'),

    -- MainId = 9 (Kitap, Hobi & Ofis)
    (81, 9, N'Edebiyat, Roman & Şiir Kitapları', N'Polisiye Roman'),
    (82, 9, N'Kişisel Gelişim & Psikoloji', N'Kişisel Gelişim Kitabı'),
    (83, 9, N'İş Dünyası, Finans & Ekonomi', N'Ekonomi Kitabı'),
    (84, 9, N'Defterler, Ajandalar & Planlayıcılar', N'Spiralli A5 Defter'),
    (85, 9, N'Prestij Dolma Kalem & Yazı Setleri', N'Dolma Kalem'),
    (86, 9, N'Resim Boyaları & Tuval Setleri', N'Akrilik Boya Seti'),
    (87, 9, N'Hobi Sanat & Maket Malzemeleri', N'Ahşap Maket Kitleri'),
    (88, 9, N'Ofis Masaüstü Organize Ürünleri', N'Masaüstü Düzenleyici'),
    (89, 9, N'Evrak Çantası & Dosyalama', N'Körüklü Klasör'),
    (90, 9, N'Müzik Aletleri & Aksesuarları', N'Klasik Gitar'),

    -- MainId = 10 (Otomobil & Motosiklet)
    (91, 10, N'Oto Paspas & Koltuk Kılıfları', N'Oto Paspas Seti'),
    (92, 10, N'Motor Yağları & Katkı Maddeleri', N'Sentetik Motor Yağı'),
    (93, 10, N'Oto Temizlik, Wax & Cilalar', N'Hızlı Cila Spreyi'),
    (94, 10, N'Kask & Motosiklet Koruma Ekipmanı', N'Kapalı Motosiklet Kaskı'),
    (95, 10, N'Araç İçi Multimedya & Kamera', N'Araç Kamerası'),
    (96, 10, N'Motosiklet Aksesuar & Çantaları', N'Arka Heybe Çanta'),
    (97, 10, N'Akü, Ampul & Elektrik Parçaları', N'12V Oto Akü'),
    (98, 10, N'Oto Lastikleri (Yaz/Kış)', N'Kış Lastiği'),
    (99, 10, N'Bagaj Taşıyıcı & Tavan Çıtaları', N'Tavan Port Bagajı'),
    (100, 10, N'Telefon Tutucu & Şarj Aletleri', N'Mıknatıslı Telefon Tutucu');

    -- 4. Populate Modifiers (10 Niches)
    INSERT INTO #Modifiers VALUES
    (1, N'Premium & Özel Seri'),
    (2, N'Profesyonel & Endüstriyel'),
    (3, N'Klasik Tasarım'),
    (4, N'Modern & Minimalist'),
    (5, N'Eko & Ekonomik Paket'),
    (6, N'Seyahat & Taşınabilir Boy'),
    (7, N'Çocuk & Genç Özel'),
    (8, N'İthal & Sınırlı Üretim'),
    (9, N'Başlangıç & Eğitim Seti'),
    (10, N'Çoklu Avantaj Paketi');

    -- 5. Generate 1,000 Unique Categories
    CREATE TABLE #GeneratedCategories (
        TempId INT IDENTITY(1,1),
        MainId INT,
        SubId INT,
        ModId INT,
        CategoryName NVARCHAR(150),
        BaseNoun NVARCHAR(100),
        Description NVARCHAR(250),
        IsActive BIT
    );

    INSERT INTO #GeneratedCategories (MainId, SubId, ModId, CategoryName, BaseNoun, Description, IsActive)
    SELECT 
        s.MainId,
        s.SubId,
        m.ModId,
        s.SubName + N' - ' + m.ModName,
        s.BaseNoun,
        s.SubName + N' - ' + m.ModName + N' kategorisinde en kaliteli ürünleri bulabilirsiniz.',
        CASE WHEN (s.SubId + m.ModId) % 20 = 0 THEN 0 ELSE 1 END -- 5% passive categories
    FROM #SubCategories s
    CROSS JOIN #Modifiers m;

    -- 6. Insert Categories and Capture generated Identity IDs
    CREATE TABLE #CategoryMapping (
        RealCategoryId INT,
        TempCategoryId INT
    );

    MERGE INTO Categories AS Target
    USING #GeneratedCategories AS Source
    ON 1 = 0
    WHEN NOT MATCHED THEN
        INSERT (CategoryName, Description, IsActive)
        VALUES (Source.CategoryName, Source.Description, Source.IsActive)
    OUTPUT inserted.CategoryId, Source.TempId INTO #CategoryMapping (RealCategoryId, TempCategoryId);

    -- 7. Create Temporary Tables for Product Data Generation
    CREATE TABLE #Brands (
        BrandId INT,
        MainId INT,
        BrandName NVARCHAR(50)
    );

    CREATE TABLE #Descriptors (
        DescId INT,
        MainId INT,
        DescName NVARCHAR(100)
    );

    CREATE TABLE #MainIdPrices (
        MainId INT,
        MinPrice DECIMAL(18,2),
        MaxPrice DECIMAL(18,2)
    );

    CREATE TABLE #ImageUrls (
        MainId INT,
        ImageUrl NVARCHAR(255)
    );

    -- 8. Populate Brands (10 Brands per Main Domain)
    INSERT INTO #Brands (BrandId, MainId, BrandName) VALUES
    -- MainId = 1 (Elektronik)
    (1, 1, N'Apple'), (2, 1, N'Samsung'), (3, 1, N'Xiaomi'), (4, 1, N'Philips'), (5, 1, N'Sony'),
    (6, 1, N'Huawei'), (7, 1, N'Asus'), (8, 1, N'Lenovo'), (9, 1, N'HP'), (10, 1, N'LG'),
    -- MainId = 2 (Moda & Giyim)
    (11, 2, N'Nike'), (12, 2, N'Adidas'), (13, 2, N'Puma'), (14, 2, N'Columbia'), (15, 2, N'Mavi'),
    (16, 2, N'Koton'), (17, 2, N'Zara'), (18, 2, N'Lacoste'), (19, 2, N'Levi''s'), (20, 2, N'Under Armour'),
    -- MainId = 3 (Ev, Yaşam & Mutfak)
    (21, 3, N'Karaca'), (22, 3, N'Tefal'), (23, 3, N'English Home'), (24, 3, N'Madame Coco'), (25, 3, N'Paşabahçe'),
    (26, 3, N'Korkmaz'), (27, 3, N'Bosch'), (28, 3, N'Beko'), (29, 3, N'Ikea'), (30, 3, N'Kütahya Porselen'),
    -- MainId = 4 (Kozmetik & Kişisel Bakım)
    (31, 4, N'L''Oreal Paris'), (32, 4, N'Nivea'), (33, 4, N'Vichy'), (34, 4, N'Clinique'), (35, 4, N'Gillette'),
    (36, 4, N'Colgate'), (37, 4, N'Estee Lauder'), (38, 4, N'Yves Rocher'), (39, 4, N'Bioderma'), (40, 4, N'Garnier'),
    -- MainId = 5 (Spor, Outdoor & Kamp)
    (41, 5, N'Decathlon'), (42, 5, N'Stanley'), (43, 5, N'The North Face'), (44, 5, N'Coleman'), (45, 5, N'Salomon'),
    (46, 5, N'Jack Wolfskin'), (47, 5, N'Shimano'), (48, 5, N'Voit'), (49, 5, N'Delta'), (50, 5, N'Arena'),
    -- MainId = 6 (Yapı Market & Bahçe)
    (51, 6, N'Bosch Professional'), (52, 6, N'Makita'), (53, 6, N'Dewalt'), (54, 6, N'Stanley'), (55, 6, N'Einhell'),
    (56, 6, N'Filli Boya'), (57, 6, N'Marshall'), (58, 6, N'Karbosan'), (59, 6, N'Knauf'), (60, 6, N'Dremel'),
    -- MainId = 7 (Anne, Bebek & Oyuncak)
    (61, 7, N'Chicco'), (62, 7, N'Prima'), (63, 7, N'Fisher-Price'), (64, 7, N'Lego'), (65, 7, N'Hasbro'),
    (66, 7, N'Babyjem'), (67, 7, N'Uni Baby'), (68, 7, N'Philips Avent'), (69, 7, N'Hot Wheels'), (70, 7, N'Barbie'),
    -- MainId = 8 (Süpermarket & Organik Gıda)
    (71, 8, N'Jacobs'), (72, 8, N'Kurukahveci Mehmet Efendi'), (73, 8, N'Tariş'), (74, 8, N'Komili'), (75, 8, N'Balparmak'),
    (76, 8, N'Godiva'), (77, 8, N'Nestle'), (78, 8, N'Barilla'), (79, 8, N'Wasa'), (80, 8, N'Frosch'),
    -- MainId = 9 (Kitap, Hobi & Ofis)
    (81, 9, N'Faber-Castell'), (82, 9, N'Moleskine'), (83, 9, N'Lamy'), (84, 9, N'Scrikss'), (85, 9, N'Rotring'),
    (86, 9, N'Yamaha'), (87, 9, N'Casio'), (88, 9, N'Hasbro Hobi'), (89, 9, N'Can Yayınları'), (90, 9, N'İthaki Yayınları'),
    -- MainId = 10 (Otomobil & Motosiklet)
    (91, 10, N'Castrol'), (92, 10, N'Pirelli'), (93, 10, N'Michelin'), (94, 10, N'Bosch Automotive'), (95, 10, N'Turtle Wax'),
    (96, 10, N'LS2'), (97, 10, N'Sony Car'), (98, 10, N'Xiaomi 70mai'), (99, 10, N'Motul'), (100, 10, N'Osram');

    -- 9. Populate Descriptors (10 Product Spec variations per Main Domain)
    INSERT INTO #Descriptors (DescId, MainId, DescName) VALUES
    -- MainId = 1 (Elektronik)
    (1, 1, N'Pro Max 512GB (Siyah)'), (2, 1, N'Ultra Slim V2 (Gümüş)'), (3, 1, N'Smart Sync Edition'),
    (4, 1, N'BassBoost Wireless'), (5, 1, N'Dual Band Gigabit'), (6, 1, N'Neo Quantum OLED'),
    (7, 1, N'Evo Plus Touch'), (8, 1, N'Premium Edition Gold'), (9, 1, N'Turbo Charge 65W'),
    (10, 1, N'Professional Series X'),
    -- MainId = 2 (Moda & Giyim)
    (11, 2, N'Air Max Comfort'), (12, 2, N'Slim Fit Dry'), (13, 2, N'Classic Leather'),
    (14, 2, N'Water Resistant'), (15, 2, N'Premium Cotton'), (16, 2, N'Streetwear Style'),
    (17, 2, N'Active Sport V1'), (18, 2, N'Urban Collection'), (19, 2, N'Retro Classic Gold'),
    (20, 2, N'Breathable Air'),
    -- MainId = 3 (Ev, Yaşam & Mutfak)
    (21, 3, N'Granit Kaplama Premium'), (22, 3, N'Çift Kişilik Ranforce'), (23, 3, N'Paslanmaz Çelik Gold'),
    (24, 3, N'Isıya Dayanıklı Borosilikat'), (25, 3, N'Ergonomik Modern Tasarım'), (26, 3, N'Antibakteriyel Mikrofiber'),
    (27, 3, N'Soft Touch Özel Tasarım'), (28, 3, N'Çelik Gövdeli Smart'), (29, 3, N'Sınırlı Üretim Ahşap'),
    (30, 3, N'12 Kişilik Lüks Seri'),
    -- MainId = 4 (Kozmetik & Kişisel Bakım)
    (31, 4, N'Hyaluronik Asit Yoğun Nem'), (32, 4, N'Aloe Vera Yatıştırıcı Etki'), (33, 4, N'Anti-Aging Yaşlanma Karşıtı'),
    (34, 4, N'Ultra Hassas Ciltler İçin'), (35, 4, N'3''lü Etki Beyazlatıcı'), (36, 4, N'Keratin Besleyici Kompleks'),
    (37, 4, N'Canlandırıcı & Ferahlatıcı'), (38, 4, N'Seyahat Boyu Özel Paket'), (39, 4, N'Yoğun Koruma SPF 50+'),
    (40, 4, N'Doğal Özlü Organik Formül'),
    -- MainId = 5 (Spor, Outdoor & Kamp)
    (41, 5, N'Çift Duvar Vakumlu Yalıtım'), (42, 5, N'Su Geçirmez Gore-Tex'), (43, 5, N'Rüzgar Geçirmez Termal'),
    (44, 5, N'Karbon Alaşımlı Profesyonel'), (45, 5, N'Kolay Kurulum Otomatik'), (46, 5, N'Katlanabilir Kompakt Tasarım'),
    (47, 5, N'Kaymaz Taban Profesyonel'), (48, 5, N'UV Korumalı Profesyonel'), (49, 5, N'Darbe Emici Esnek Yapı'),
    (50, 5, N'Ultra Hafif Alüminyum'),
    -- MainId = 6 (Yapı Market & Bahçe)
    (51, 6, N'Akülü Kömürsüz Motorlu'), (52, 6, N'120 Parça Profesyonel Set'), (53, 6, N'Darbeye Dayanıklı Çelik'),
    (54, 6, N'Sileline Silinebilir Mat'), (55, 6, N'Korumalı Akıllı Emniyet'), (56, 6, N'Teleskopik Ayarlanabilir'),
    (57, 6, N'Yüksek Basınçlı Turbo'), (58, 6, N'Su Sızdırmaz Silikonlu'), (59, 6, N'Portatif Taşınabilir Çantalı'),
    (60, 6, N'Sessiz Çalışma Teknolojisi'),
    -- MainId = 7 (Anne, Bebek & Oyuncak)
    (61, 7, N'Katlanabilir Süspansiyonlu'), (62, 7, N'%100 Organik Pamuk'), (63, 7, N'Eğitici Işıklı ve Sesli'),
    (64, 7, N'Yaratıcı Tasarım Kutusu'), (65, 7, N'Hassas Ciltler İçin Saf Su'), (66, 7, N'Antikolik Gaz Önleyici'),
    (67, 7, N'Metal Gövde Dayanıklı'), (68, 7, N'İnteraktif Konuşan Model'), (69, 7, N'Ahşap Doğal Boyasız'),
    (70, 7, N'Eko Tasarruflu Mega Paket'),
    -- MainId = 8 (Süpermarket & Organik Gıda)
    (71, 8, N'Soğuk Sıkım Erken Hasat'), (72, 8, N'Aromatik Orta Kavrum %100 Arabica'), (73, 8, N'Katkısız Doğal Süzme'),
    (74, 8, N'Çölyak Dostu Glutensiz'), (75, 8, N'Organik Ekolojik Sertifikalı'), (76, 8, N'Yoğun Kakao Premium Dolgulu'),
    (77, 8, N'Vegan Bitkisel Formüllü'), (78, 8, N'Deniz Tuzu Katkılı Gurme'), (79, 8, N'Özel Harman Çabuk Demleme'),
    (80, 8, N'Konsante Çevre Dostu'),
    -- MainId = 9 (Kitap, Hobi & Ofis)
    (81, 9, N'Sert Kapak Çizgisiz Koleksiyon'), (82, 9, N'0.7mm Mekanik Metal Gövde'), (83, 9, N'24 Renk Profesyonel Seri'),
    (84, 9, N'Karton Kapak Özel Basım'), (85, 9, N'Akort Edilebilir Gül Ağacı'), (86, 9, N'Dijital Ekranlı Programlanabilir'),
    (87, 9, N'Hakiki Deri El Yapımı'), (88, 9, N'Çok Bölmeli Organizerli'), (89, 9, N'Sınırlı Sayıda İmzalı Özel Seri'),
    (90, 9, N'Kolay Taşınabilir Kılıflı'),
    -- MainId = 10 (Otomobil & Motosiklet)
    (91, 10, N'Tam Sentetik 5W-30 Edge'), (92, 10, N'Yüksek Çözünürlüklü Gece Görüşlü'), (93, 10, N'4 Mevsim Yol Tutuşlu Premium'),
    (94, 10, N'UV Korumalı Parlaklık Wax'), (95, 10, N'Çene Açılır Güneş Vizörlü'), (96, 10, N'Led Xenon Beyaz Işık 12V'),
    (97, 10, N'Hızlı Sabitleme Vantuzlu'), (98, 10, N'Çift USB Çıkışlı Hızlı Şarj'), (99, 10, N'Su Geçirmez Çift Katmanlı'),
    (100, 10, N'Karbon Fiber Koruyucu Kaplama');

    -- 10. Populate Realistic Price Ranges per Main Category
    INSERT INTO #MainIdPrices VALUES
    (1, 1500.00, 75000.00),   -- Elektronik: 1,500 - 75,000 TRY
    (2, 150.00, 4500.00),     -- Moda: 150 - 4,500 TRY
    (3, 100.00, 12000.00),    -- Ev & Mutfak: 100 - 12,000 TRY
    (4, 50.00, 2500.00),      -- Kozmetik: 50 - 2,500 TRY
    (5, 150.00, 9000.00),     -- Spor & Outdoor: 150 - 9,000 TRY
    (6, 80.00, 7500.00),      -- Yapı Market: 80 - 7,500 TRY
    (7, 40.00, 3500.00),      -- Anne & Bebek: 40 - 3,500 TRY
    (8, 15.00, 900.00),       -- Süpermarket: 15 - 900 TRY
    (9, 30.00, 3000.00),      -- Kitap & Hobi: 30 - 3,000 TRY
    (10, 50.00, 10000.00);    -- Otomobil: 50 - 10,000 TRY

    -- 11. Populate Image URL bases
    INSERT INTO #ImageUrls VALUES
    (1, N'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500'), -- Elektronik
    (2, N'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500'), -- Moda
    (3, N'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500'), -- Ev
    (4, N'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'), -- Kozmetik
    (5, N'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'), -- Spor
    (6, N'https://images.unsplash.com/photo-1581781894508-846579368777?w=500'), -- Yapı Market
    (7, N'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500'), -- Bebek
    (8, N'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'), -- Süpermarket
    (9, N'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500'), -- Kitap
    (10, N'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500');-- Otomobil

    -- 12. Generate and Insert Exactly 100,000 Products (100 products per Category)
    INSERT INTO Products (ProductName, Description, Price, Stock, ImageUrl, CategoryId, IsActive)
    SELECT 
        b.BrandName + N' ' + gc.BaseNoun + N' ' + d.DescName AS ProductName,
        b.BrandName + N' ' + gc.BaseNoun + N' ' + d.DescName + N' ürünü, kendi sınıfında en yüksek kalite standartlarında üretilmiş olup, 2 yıl resmi distribütör garantilidir. Orijinal kutusunda, faturalı ve sıfır olarak gönderilir.' AS Description,
        CAST(FLOOR(pr.MinPrice + (CAST((b.BrandId * 7 + d.DescId * 13 + gc.TempId * 17) % 1000 AS DECIMAL(18,2)) / 1000.0) * (pr.MaxPrice - pr.MinPrice)) AS DECIMAL(18,2)) + 0.90 AS Price,
        CASE 
            WHEN (b.BrandId * 5 + d.DescId * 11 + gc.TempId * 17) % 40 = 0 THEN 0 -- 2.5% Out of Stock
            ELSE (b.BrandId * 3 + d.DescId * 7 + gc.TempId * 13) % 180           -- Stock distribution (approx 11% critical stock <= 20)
        END AS Stock,
        img.ImageUrl + N'&sig=' + CAST((b.BrandId * 3 + d.DescId * 7 + gc.TempId) AS NVARCHAR(20)) AS ImageUrl,
        map.RealCategoryId,
        CASE WHEN (b.BrandId * 3 + d.DescId * 7 + gc.TempId * 11) % 25 = 0 THEN 0 ELSE 1 END AS IsActive -- 4% Passive Products
    FROM #GeneratedCategories gc
    INNER JOIN #CategoryMapping map ON gc.TempId = map.TempCategoryId
    INNER JOIN #Brands b ON gc.MainId = b.MainId
    INNER JOIN #Descriptors d ON gc.MainId = d.MainId
    INNER JOIN #MainIdPrices pr ON gc.MainId = pr.MainId
    INNER JOIN #ImageUrls img ON gc.MainId = img.MainId;

    -- Clean up temporary tables
    DROP TABLE #MainCategories;
    DROP TABLE #SubCategories;
    DROP TABLE #Modifiers;
    DROP TABLE #GeneratedCategories;
    DROP TABLE #CategoryMapping;
    DROP TABLE #Brands;
    DROP TABLE #Descriptors;
    DROP TABLE #MainIdPrices;
    DROP TABLE #ImageUrls;

    COMMIT TRANSACTION;
    PRINT 'SEEDING COMPLETED SUCCESSFULLY! 1,000 Categories and 100,000 Products inserted.';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    
    -- Clean up temporary tables on error if they exist
    IF OBJECT_ID('tempdb..#MainCategories') IS NOT NULL DROP TABLE #MainCategories;
    IF OBJECT_ID('tempdb..#SubCategories') IS NOT NULL DROP TABLE #SubCategories;
    IF OBJECT_ID('tempdb..#Modifiers') IS NOT NULL DROP TABLE #Modifiers;
    IF OBJECT_ID('tempdb..#GeneratedCategories') IS NOT NULL DROP TABLE #GeneratedCategories;
    IF OBJECT_ID('tempdb..#CategoryMapping') IS NOT NULL DROP TABLE #CategoryMapping;
    IF OBJECT_ID('tempdb..#Brands') IS NOT NULL DROP TABLE #Brands;
    IF OBJECT_ID('tempdb..#Descriptors') IS NOT NULL DROP TABLE #Descriptors;
    IF OBJECT_ID('tempdb..#MainIdPrices') IS NOT NULL DROP TABLE #MainIdPrices;
    IF OBJECT_ID('tempdb..#ImageUrls') IS NOT NULL DROP TABLE #ImageUrls;

    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();

    RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH;
