from typing import Any

from mcp import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client


class MCPClient:
    def __init__(self, server_script: str):
        self.server_script = server_script
        self.session = None
        self._context = None

    async def connect(self):
        server_params = StdioServerParameters(command="python", args=[self.server_script])
        self._context = stdio_client(server_params)
        self.read_stream, self.write_stream = await self._context.__aenter__()
        self.session = ClientSession(self.read_stream, self.write_stream)
        await self.session.__aenter__()
        await self.session.initialize()
        return self.session

    async def list_tools(self):
        if self.session is None:
            raise RuntimeError("Client is not connected to the server.")
        result = await self.session.list_tools()
        return result.tools

    async def call_tool(self, name: str, arguments: dict[str, Any]):
        if self.session is None:
            raise RuntimeError("Client is not connected to the server.")
        result = await self.session.call_tool(name, arguments)
        if getattr(result, "is_error", False):
            raise RuntimeError(f"Tool {name} failed: {result}")

        if getattr(result, "structured_content", None) is not None:
            return result.structured_content

        text_results = []
        for item in getattr(result, "content", []):
            if hasattr(item, "text"):
                text_results.append(item.text)
        if len(text_results) == 1:
            return text_results[0]
        return text_results

    async def close(self):
        if self.session is not None:
            await self.session.__aexit__(None, None, None)
            self.session = None
        if self._context is not None:
            await self._context.__aexit__(None, None, None)
            self._context = None
