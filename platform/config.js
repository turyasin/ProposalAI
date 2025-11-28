// Configuration for different environments
const config = {
    // Production Flowise URL (ngrok tunnel)
    // NOTE: You need to import your HR_Assistant_RAG.json flow and update the chatflow ID
    FLOWISE_API_URL: 'https://alexandra-sternal-jaunita.ngrok-free.dev/api/v1/prediction/a7851946-02e8-442e-b880-14c0d0d221c6',
};

// Export for use in chat.html
window.CONFIG = config;
