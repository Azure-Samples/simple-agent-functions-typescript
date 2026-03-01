FROM mcr.microsoft.com/devcontainers/typescript-node:22-bookworm

# Copy custom first notice message.
COPY first-run-notice.txt /tmp/staging/
RUN sudo mv -f /tmp/staging/first-run-notice.txt /usr/local/etc/vscode-dev-containers/ \
    && sudo rm -rf /tmp/staging

# Install Azure Functions Core Tools
RUN sudo npm install -g azure-functions-core-tools

# Install MCP Inspector
RUN sudo npm install -g @modelcontextprotocol/inspector

# Install azurite to emulate Azure Storage
RUN sudo npm install -g azurite

# Install Azure Developer CLI
RUN curl -fsSL https://aka.ms/install-azd.sh | bash
