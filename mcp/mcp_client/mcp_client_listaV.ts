import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let client: Client | null = null;

export async function getMcpClient() {
    if (client) return client;

    // esto es el spawn() que lanzaba el proceso hijo, esta envuelto por el SDK 
    const transport = new StdioClientTransport({
        command: process.platform === "win32" ? "npx.cmd" : "npx",
        args: ["tsx", "./mcp/mcp_server.ts"],
    });

    //permite usar el callTool, crea el transporte 
    client = new Client({ name: "products-api-client", version: "1.0.0" });
    await client.connect(transport);

    return client;
}