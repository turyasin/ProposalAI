// Configuration for different environments
const config = {
    // Production Flowise URL (Render'dan alacağız)
    FLOWISE_API_URL: 'https://YOUR-FLOWISE-URL.onrender.com/api/v1/prediction/YOUR-CHATFLOW-ID',

    // Development (localhost)
    // FLOWISE_API_URL: 'http://localhost:3000/api/v1/prediction/a7851946-02e8-442e-b880-14c0d0d221c6'
};

// Export for use in chat.html
window.CONFIG = config;
