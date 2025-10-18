# Netflix Clone - Test Rehberi

## 🚀 Hızlı Başlangıç

### 1. Projeyi Çalıştırma

#### Yöntem 1: Basit HTTP Server (Önerilen)
```bash
# Proje klasörüne gidin
cd Netflix-Clone-main

# Python ile basit server (Python 3)
python -m http.server 8000

# Veya Python 2
python -m SimpleHTTPServer 8000

# Tarayıcıda açın
# http://localhost:8000
```

#### Yöntem 2: Node.js ile (eğer Node.js yüklüyse)
```bash
# Global olarak http-server yükleyin
npm install -g http-server

# Proje klasöründe çalıştırın
http-server -p 8000

# Tarayıcıda açın
# http://localhost:8000
```

#### Yöntem 3: Live Server (VS Code)
- VS Code'da "Live Server" extension'ını yükleyin
- `index.html` dosyasına sağ tıklayın
- "Open with Live Server" seçin

## 🧪 Test Senaryoları

### 1. Temel Sayfa Testleri

#### ✅ Landing Page Testi
1. `http://localhost:8000` adresini açın
2. **Beklenen Sonuçlar:**
   - Sayfa yüklenir
   - Logo ve "filmalisa" yazısı görünür
   - "Sign In" butonu çalışır
   - Email formu çalışır
   - "Get Started" butonu çalışır
   - Responsive tasarım mobilde çalışır

#### ✅ Login Sayfası Testi
1. "Sign In" butonuna tıklayın
2. **Test Adımları:**
   - Geçersiz email ile test edin
   - Geçersiz şifre ile test edin
   - Boş alanlarla test edin
   - Validasyon mesajları görünür mü?

#### ✅ Home Sayfası Testi
1. Login olduktan sonra home sayfasına gidin
2. **Test Adımları:**
   - Film listesi yüklenir mi?
   - Hero banner çalışır mı?
   - Film kartlarına tıklanabilir mi?
   - Arama butonu çalışır mı?
   - Profil menüsü açılır mı?

### 2. Yeni Eklenen Sayfalar Testleri

#### ✅ Film Detay Sayfası Testi
1. Herhangi bir filme tıklayın
2. **Beklenen Sonuçlar:**
   - Film detayları yüklenir
   - Hero banner görünür
   - Film bilgileri (IMDB, süre, kategori) görünür
   - "Play Now" butonu çalışır
   - "Add to List" butonu çalışır
   - "More like this" bölümü görünür
   - Trailer modal açılır

#### ✅ Favoriler Sayfası Testi
1. Navbar'dan "My List" linkine tıklayın
2. **Test Adımları:**
   - Boş favori listesi durumu görünür mü?
   - Filmleri favorilere ekleyin
   - Favori listesinde görünür mü?
   - Grid/liste görünümü değişir mi?
   - Filtreleme çalışır mı?
   - Toplu silme işlemi çalışır mı?

#### ✅ Arama Sayfası Testi
1. Arama ikonuna tıklayın
2. **Test Adımları:**
   - Arama kutusu odaklanır mı?
   - Öneriler görünür mü?
   - Son aramalar listesi görünür mü?
   - Trend filmler yüklenir mi?
   - Arama sonuçları görünür mü?
   - Filtreleme ve sıralama çalışır mı?

### 3. Error Handling Testleri

#### ✅ Network Error Testi
1. Tarayıcı Developer Tools'u açın (F12)
2. Network tab'ında "Offline" seçin
3. **Test Adımları:**
   - Sayfa yenileme yapın
   - Offline sayfası görünür mü?
   - "Try Again" butonu çalışır mı?
   - Online'a geçince otomatik yönlendirme olur mu?

#### ✅ API Error Testi
1. Developer Tools'da Network tab'ını açın
2. Herhangi bir API çağrısını block edin
3. **Beklenen Sonuçlar:**
   - Error toast mesajı görünür
   - Sayfa çökmez
   - Retry seçenekleri sunulur

#### ✅ JavaScript Error Testi
1. Console'da şu kodu çalıştırın:
```javascript
// Test error handling
throw new Error('Test error');
```
2. **Beklenen Sonuç:**
   - Error toast mesajı görünür
   - Console'da error loglanır

### 4. Offline Support Testleri

#### ✅ Service Worker Testi
1. Developer Tools > Application > Service Workers
2. **Kontrol Edin:**
   - Service Worker kayıtlı mı?
   - Cache'de dosyalar var mı?
   - Offline durumda çalışıyor mu?

#### ✅ Cache Testi
1. Application > Storage > Cache Storage
2. **Kontrol Edin:**
   - Static assets cache'lenmiş mi?
   - API responses cache'lenmiş mi?

### 5. Responsive Design Testleri

#### ✅ Mobil Test
1. Developer Tools'da mobil görünümü açın
2. **Test Edin:**
   - iPhone, iPad, Android boyutları
   - Touch interactions
   - Navigation menüsü
   - Film kartları
   - Modal'lar

#### ✅ Tablet Test
1. Orta boyut ekranlarda test edin
2. **Kontrol Edin:**
   - Grid layout düzgün mü?
   - Sidebar navigation çalışır mı?

## 🔧 Developer Tools Test Komutları

### Console'da Test Etme
```javascript
// Service Worker durumunu kontrol et
navigator.serviceWorker.ready.then(reg => console.log('SW ready:', reg));

// Cache durumunu kontrol et
caches.keys().then(names => console.log('Cache names:', names));

// Error handler test
window.handleError({type: 'test', message: 'Test error'});

// Toast test
showToast('Test mesajı', 'success');

// Offline/online durumu test
navigator.onLine ? console.log('Online') : console.log('Offline');
```

### Network Throttling Test
1. Developer Tools > Network
2. Throttling dropdown'dan seçin:
   - **Slow 3G**: Yavaş bağlantı testi
   - **Fast 3G**: Orta hız testi
   - **Offline**: Offline testi

## 🐛 Yaygın Sorunlar ve Çözümleri

### Problem: Service Worker kayıt olmuyor
**Çözüm:**
- HTTPS kullanın (localhost hariç)
- Cache temizleyin
- Hard refresh yapın (Ctrl+Shift+R)

### Problem: API çağrıları çalışmıyor
**Çözüm:**
- CORS ayarlarını kontrol edin
- API endpoint'lerini kontrol edin
- Network tab'ında hataları inceleyin

### Problem: Stil dosyaları yüklenmiyor
**Çözüm:**
- Dosya yollarını kontrol edin
- Cache'i temizleyin
- Console'da 404 hatalarını kontrol edin

## 📊 Performance Testleri

### Lighthouse Test
1. Developer Tools > Lighthouse
2. **Test Kategorileri:**
   - Performance
   - Accessibility
   - Best Practices
   - SEO
   - PWA

### Core Web Vitals
1. Performance tab'ında Core Web Vitals'ı kontrol edin
2. **Metrikler:**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

## 🎯 Test Checklist

### ✅ Temel Fonksiyonlar
- [ ] Landing page yüklenir
- [ ] Login/logout çalışır
- [ ] Film listesi görünür
- [ ] Film detayları açılır
- [ ] Favoriler çalışır
- [ ] Arama çalışır

### ✅ Error Handling
- [ ] Network hatalarında toast görünür
- [ ] JavaScript hatalarında sayfa çökmez
- [ ] Offline durumda offline sayfası görünür
- [ ] API hatalarında retry seçenekleri var

### ✅ Offline Support
- [ ] Service Worker kayıtlı
- [ ] Cache'de dosyalar var
- [ ] Offline durumda çalışır
- [ ] Online'a geçince sync olur

### ✅ Responsive Design
- [ ] Mobilde çalışır
- [ ] Tablet'te çalışır
- [ ] Desktop'ta çalışır
- [ ] Touch interactions çalışır

### ✅ Performance
- [ ] Sayfa hızlı yüklenir
- [ ] Images lazy load olur
- [ ] Cache stratejisi çalışır
- [ ] Bundle size makul

## 🚀 Production Test

### Deployment Öncesi
1. **Build Test:**
```bash
# Minify CSS/JS
# Optimize images
# Check file sizes
```

2. **HTTPS Test:**
   - Service Worker HTTPS'de çalışır mı?
   - Mixed content hataları var mı?

3. **Cross-browser Test:**
   - Chrome
   - Firefox
   - Safari
   - Edge

4. **Real Device Test:**
   - iOS Safari
   - Android Chrome
   - Tablet browsers

## 📱 Mobile Testing

### Chrome DevTools Mobile
1. F12 > Device toolbar
2. Test edilecek cihazlar:
   - iPhone 12/13/14
   - iPad
   - Samsung Galaxy
   - Pixel

### Real Device Testing
1. **QR Code ile Test:**
   - ngrok kullanarak public URL oluşturun
   - QR code ile mobil cihazda test edin

2. **Local Network Test:**
   - Aynı WiFi'deki cihazlarla test edin
   - `http://[your-ip]:8000` ile erişin

## 🎉 Test Tamamlandı!

Tüm testler başarılı ise projeniz production'a hazır! 

**Son Kontrol:**
- [ ] Tüm sayfalar çalışıyor
- [ ] Error handling aktif
- [ ] Offline support çalışıyor
- [ ] Mobile responsive
- [ ] Performance iyi
- [ ] Cross-browser uyumlu

**Deployment için hazır! 🚀**
