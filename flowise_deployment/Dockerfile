FROM node:18-alpine

WORKDIR /usr/src/app

# Install Flowise globally
RUN npm install -g flowise

# Expose the port
EXPOSE 3000

# Start Flowise binding to 0.0.0.0 (Required for Render)
CMD ["flowise", "start", "--PORT=3000", "--FLOWISE_HOST=0.0.0.0"]
