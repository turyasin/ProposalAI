// Configuration for different environments
const config = {
    // Production Flowise URL (Fly.io)
    // NOTE: You may need to update the Chatflow ID after importing your flow to the live server
    FLOWISE_API_URL: 'https://coremind-flowise.fly.dev/api/v1/prediction/a7851946-02e8-442e-b880-14c0d0d221c6',
};

// Export for use in chat.html
window.CONFIG = config;
