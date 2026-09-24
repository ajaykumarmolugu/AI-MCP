import cdsPkg from '@sap/cds';
const cds = cdsPkg;

export default class ChatService extends cds.ApplicationService {
  init() {
    this.on('chat', async (req) => {
      const { message, history } = req.data;
      const priorMessages = history ? JSON.parse(history) : [];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [...priorMessages, { role: "user", content: message }],
          mcp_servers: [
            {
              type: "url",
              url: process.env.MCP_SERVER_URL,
              name: "bot-catalog-mcp",
              authorization_token: req.user.tokenInfo?.getTokenValue?.()
            }
          ]
        })
      });

      const data = await response.json();
      const text = data.content
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("\n");

      return text;
    });

    return super.init();
  }
}