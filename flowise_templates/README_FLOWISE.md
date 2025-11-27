# Flowise Kurulum ve Kullanım Rehberi

Bu rehber, **CoreMind** platformunun "beyni" olacak Flowise uygulamasını nasıl kuracağınızı ve hazırladığımız şablonu nasıl içeri aktaracağınızı anlatır.

## 1. Flowise Nedir?
Flowise, kod yazmadan (Drag & Drop) LLM uygulamaları geliştirmenizi sağlayan açık kaynaklı bir araçtır. CoreMind platformunda oluşturacağımız "İK Asistanı", "Satış Asistanı" gibi yapıları burada tasarlayacağız.

## 2. Kurulum (Bilgisayarınızda Çalıştırma)

Flowise'ı çalıştırmanın en kolay yolu `npx` komutunu kullanmaktır (Node.js yüklü olmalıdır).

1.  Terminali açın (PowerShell veya CMD).
2.  Aşağıdaki komutu yapıştırın ve Enter'a basın:
    ```bash
    npx flowise start
    ```
3.  Kurulum tamamlandığında tarayıcınızda şu adresi açın:
    `http://localhost:3000`

## 3. Şablonu İçeri Aktarma (Import)

Hazırladığım `HR_Assistant_RAG.json` dosyasını Flowise'a yükleyerek İK Asistanını hemen oluşturabilirsiniz.

1.  Flowise ana ekranında sağ üstteki **"Add New"** butonuna tıklayın.
2.  Açılan boş sayfada, yine sağ üstteki **"Settings" (Çark ikonu)** veya **"Load"** butonuna tıklayın.
3.  **"Load Chatflow"** seçeneğini seçin.
4.  Bilgisayarınızdaki `flowise_templates/HR_Assistant_RAG.json` dosyasını seçin.
5.  Akış şeması ekrana gelecektir.

## 4. Akışı Yapılandırma

Şablon yüklendikten sonra çalışması için API anahtarlarınızı girmeniz gerekir:

1.  **ChatOpenAI Kutusu:**
    *   `Connect Credential` kısmına tıklayın.
    *   `Create New` diyerek OpenAI API Key'inizi (sk-...) yapıştırın.
2.  **OpenAI Embeddings Kutusu:**
    *   Aynı şekilde OpenAI API Key'inizi seçin.
3.  **Pdf File Loader Kutusu:**
    *   `Upload File` butonuna basarak test etmek istediğiniz bir PDF (örn: Şirket İzin Politikası) yükleyin.

## 5. Test Etme

*   Sağ üstteki **"Save"** (Disk ikonu) butonuna basın.
*   Sağdaki **"Chat"** (Mesaj ikonu) butonuna tıklayın.
*   Sorunuzu sorun: *"Yıllık izin politikamız nedir?"*
*   Asistan, yüklediğiniz PDF'i okuyup cevap verecektir.

## 6. Sitemize Bağlama (API)

Bu akışı CoreMind Dashboard'una bağlamak için:
1.  Flowise'da sağ üstteki **"Code"** (</>) ikonuna tıklayın.
2.  **"Embed"** sekmesine gelin.
3.  Oradaki URL'i kopyalayın (Örn: `http://localhost:3000/api/v1/prediction/...`).
4.  Bu URL'i bizim Dashboard kodumuzdaki ilgili yere yapıştıracağız.
