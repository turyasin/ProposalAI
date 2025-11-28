# CoreMind Flowise Deployment

## Render.com'a Deploy Etme Adımları

1. **Render.com'a Giriş Yapın**
   - https://render.com adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni Web Service Oluşturun**
   - "New +" butonuna tıklayın
   - "Web Service" seçin
   - Bu repository'yi seçin (veya manuel olarak bağlayın)

3. **Ayarları Yapın**
   - **Name:** coremind-flowise
   - **Region:** Frankfurt (veya size en yakın)
   - **Branch:** main
   - **Root Directory:** flowise_deployment
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Environment Variables Ekleyin**
   - `FLOWISE_USERNAME` = admin
   - `FLOWISE_PASSWORD` = (güçlü bir şifre)
   - `PORT` = 3000
   - `APIKEY_PATH` = /opt/render/.flowise
   - `DATABASE_PATH` = /opt/render/.flowise

5. **Deploy Edin**
   - "Create Web Service" butonuna tıklayın
   - Deploy işlemi 5-10 dakika sürecek

6. **URL'i Alın**
   - Deploy tamamlandığında size bir URL verilecek
   - Örnek: `https://coremind-flowise.onrender.com`
   - Bu URL'i chat.html dosyasında kullanacağız

## Önemli Notlar

- Free tier'da 15 dakika hareketsizlikten sonra uyur, ilk istek 30-60 saniye sürebilir
- Production için $7/ay Starter plan önerilir
- Flowise chatflow'larınızı export edip Render'daki Flowise'a import etmeniz gerekecek
