# 📊 Analitik Merkezi — Ürün Analitiği ve Envanter Yönetimi Dashboard'u

[![.NET Version](https://img.shields.io/badge/.NET-9.0-blueviolet?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
![MicrosoftSQLServer](https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white)
[![ORM](https://img.shields.io/badge/Dapper-ORM-red?style=for-the-badge&logo=nuget)](https://github.com/DapperLib/Dapper)


**Analitik Merkezi**, yaklaşık **1.025.000 veri kaydını (1+ Milyon satır)** gerçek zamanlı ve yüksek performansla işleyen, kurumsal düzeyde bir Ürün Analitiği ve Envanter Yönetimi platformudur. ASP.NET Core 9 MVC mimarisi üzerine inşa edilmiş olup, veri erişiminde Dapper ORM ve Microsoft SQL Server (MSSQL) veri tabanı entegrasyonuyla milisaniyeler seviyesinde sorgu yanıt süreleri sunar.

---

## ⚡ Temel Özellikler

- **Milyonluk Veri Optimizasyonu:** Veri tabanı seviyesinde optimize edilmiş indeksler ve sunucu taraflı sayfalama (Server-side Pagination) ile 1 milyondan fazla veri üzerinde anlık sorgulama.
- **Performans Ölçümleme (Telemetry):** Sunucu yanıt süresi (Server-side response time) ile istemci çizim süresini (UI render time) ölçen canlı telemetry paneli.
- **Akıllı Grafik Çözümleri (Hybrid Charting):** ApexCharts ve Chart.js entegrasyonu ile veri yoğunluğuna göre dinamik ölçeklenen, yakınlaştırma (Zoom) ve kaydırma (Pan) destekli akıllı grafikler.
- **Anomali ve Risk Tespiti:** Stok durum sapmaları, aşırı fiyat dalgalanmaları ve kritik stok seviyelerini belirleyen yapay sinir ağı benzeri anomali tespit altyapısı.
- **ABC Analizi:** Stok envanter değerlerine göre ürünleri A, B ve C sınıflarına ayıran otomatik ciro bazlı segmentasyon.

---

## 🛠️ Kullanılan Teknolojiler

### Backend & Data Access
- **C# .NET 9.0 MVC:** Hızlı, modern ve güvenli sunucu tarafı uygulama mimarisi.
- **Dapper ORM:** Düşük bellek tüketimi ve maksimum SQL execution hızı için Micro-ORM çözümü.
- **Microsoft SQL Server (MSSQL):** Büyük veri kümelerini saklamak, T-SQL yeteneklerinden yararlanmak ve JSON/Window fonksiyonlarını çalıştırmak için güçlü RDBMS.
- **RequestTimingMiddleware:** Tüm HTTP isteklerinin veritabanı ve sunucu işlem sürelerini takip eden özel middleware.

### Frontend
- **Tailwind CSS:** Modern, responsive ve özelleştirilebilir CSS tasarım sistemi.
- **Chart.js & ApexCharts:** Veri görselleştirme ve analitik dashboard grafikleri.
- **chartjs-plugin-zoom & HammerJS:** İstemci tarafında grafik içi kaydırma ve zoom etkileşimleri.
- **Shared UI/UX Library:** Sayfa geçiş sürelerini azaltmak için modüler JavaScript ve CSS tasarımı.

---

## 📂 Modüller ve Ekran Görüntüleri

### 1. Genel Bakış Dashboard'u
Sistemin genel sağlığını, en kritik stokları, anlık anomali sayılarını ve ciro dağılımlarını gösteren ana kontrol merkezidir.

<div align="center">
  <img width="1917" height="906" alt="Dashboard1" src="https://github.com/user-attachments/assets/3f54f703-affe-451d-88e5-3ecaa2635c86" />
  <p><i><b>📌 Genel Bakış Modülü - KPI Kartları ve Hızlı Durum Analizleri</b></i></p>
</div>
<br>

<div align="center">
  <img width="1918" height="961" alt="Dashboard2" src="https://github.com/user-attachments/assets/f2462580-a11f-4d99-98b4-4bc8dbdbe26c" />
  <p><i><b>📌 Genel Bakış Modülü - Aktif/Pasif Kategori Dağılım Grafikleri</b></i></p>
</div>
<br>

<div align="center">
  <img width="1917" height="967" alt="Dashboard3" src="https://github.com/user-attachments/assets/fbc5ad75-4194-43b4-948a-aef11bc9130c" />
  <p><i><b>📌 Genel Bakış Modülü - Trend Grafikleri ve Envanter Değer Matrisi</b></i></p>
</div>
<br>

#### 🔍 İnteraktif Grafik Detay Görünümleri
Dashboard üzerinde yer alan grafiklere tıklandığında açılan, Chart.js tabanlı yüksek çözünürlüklü ve yakınlaştırma (zoom/pan) destekli detay modal ekranları:

<div align="center">
  <img width="1916" height="957" alt="DashboardAnaKategoriDağılımı-Detay" src="https://github.com/user-attachments/assets/cb91f270-48de-4936-933f-40625eed09d9" />
  <p><i><b>📌 Kategorilerin Ürün Adetlerine Göre Detaylı Dağılım Modalı</b></i></p>
</div>
<br>

<div align="center">
  <img width="1917" height="955" alt="DashboardFiyatİstatistikleriDağılımı_Detay" src="https://github.com/user-attachments/assets/a64eacd8-fd76-4300-8752-93acb18218f4" />
  <p><i><b>📌 Fiyat ve Standart Sapma Dağılım Modalı - Akıllı Limitli Etiket Gösterimi</b></i></p>
</div>
<br>

<div align="center">
  <img width="1918" height="967" alt="DashboardKategoriDurumKarşılaştırması_Detay" src="https://github.com/user-attachments/assets/3c731374-ca15-4912-88d9-73ea091d2688" />
  <p><i><b>📌 Kategorilerdeki Aktif ve Pasif Ürünlerin Oran Karşılaştırma Modalı</b></i></p>
</div>
<br>

<div align="center">
  <img width="1918" height="965" alt="DashboardKategoriKarşılaştırmaEndeksi_Detay" src="https://github.com/user-attachments/assets/d35c48da-59bf-4d83-9705-ea469d023cfd" />
  <p><i><b>📌 Dinamik Renk Kodlu Performans Karşılaştırma Endeksi Modalı</b></i></p>
</div>
<br>

---

### 2. Envanter Listesi Modülü
1 Milyondan fazla ürünün kritik stok durumunu (Stok $\le$ 20), toplam envanter değerini ve birim fiyat limitlerini takip eden sunucu taraflı paged veri tablosudur.

<div align="center">
  <img width="757" height="878" alt="EnvanterListesi" src="https://github.com/user-attachments/assets/6fa2d546-2e97-482a-b6ba-53872f408947" />
  <p><i><b>📌 Kritik Stok Raporu ve En Yüksek Envanter Değerine Sahip Ürünlerin Listesi</b></i></p>
</div>
<br>

---

### 3. İleri İstatistikler Modülü
Kategorilerin performans skorları (Değer Skoru, Aktiflik Skoru, Genel Skor), fiyat aralığı / stok seviyesi çapraz heatmap analizleri ve fiyat sapmalarını içerir.

<div align="center">
  <img width="767" height="822" alt="İleriİstatistikler" src="https://github.com/user-attachments/assets/48b9cdf4-9b5d-40eb-8fdc-7758f4db7e83" />
  <p><i><b>📌 Kategori Performans Tabloları, Fiyat-Stok Isı Haritası (Heatmap) ve Performans Detay Paneli</b></i></p>
</div>
<br>

---

### 4. Anomaliler ve Risk Analizi Modülü
Stok parametreleri dışında kalan ürünleri otomatik olarak tespit eden, risk seviyelerini gruplayan ve kategorilerin sağlık puanlarını listeyen izleme modülüdür.

<div align="center">
  <img width="786" height="717" alt="Anomaliler" src="https://github.com/user-attachments/assets/0f8db8dd-0863-4c83-b1c9-4158508646cb" />
  <p><i><b>📌 Anomali İzleme Paneli, Risk Matrisi ve Ciro Dağılımı (ABC Analizi)</b></i></p>
</div>
<br>

---

## ⚡ Veri Tabanı ve Performans Optimizasyonu

Proje, 1 milyon satır üzerinde veri araması, sayfalama ve gruplama işlemlerini **50ms**'nin altında gerçekleştirmektedir. Bunun için uygulanan veri tabanı optimizasyonları:

1. **Clustered / Non-Clustered İndeksleme:** Sık sorgulanan `Price`, `Stock`, `CategoryId` ve `Status` kolonları üzerinde SQL Server B-Tree mimarisine uygun çoklu indeksler (Non-Clustered Indexes) oluşturulmuştur.
2. **OFFSET / FETCH Kısıtlamaları:** Veri çekme süreçlerinde tüm tablolar T-SQL `OFFSET ROWS FETCH NEXT` yapısı kullanılarak sunucu taraflı (server-side) pagination mimarisine geçirilmiş ve bellek şişmeleri önlenmiştir.
3. **Milisaniyelik Telemetry Takibi:** Uygulama başlığında yer alan `Server: Xms | UI: Yms` göstergesi, `RequestTimingMiddleware` ve tarayıcı performans API'si yardımıyla her AJAX isteğinde gerçek zamanlı ölçüm yapar.

---

## 🚀 Kurulum ve Çalıştırma Adımları

### Gereksinimler
- .NET 9.0 SDK
- Microsoft SQL Server 2019 veya üzeri (LocalDB, Express veya Enterprise)
- Herhangi bir modern tarayıcı (Chrome, Edge, Firefox vb.)

### Adımlar

1. **Depoyu Klonlayın:**
   ```bash
   git clone [https://github.com/kullaniciadi/DapperDashboardProject.git](https://github.com/kullaniciadi/DapperDashboardProject.git)
   cd DapperDashboardProject
