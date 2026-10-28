import asyncio

from mcp.client.session import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client


async def main():
    params = StdioServerParameters(command="python", args=["server/calculator_server.py"])
    print("starting stdio client")
    async with stdio_client(params) as (read, write):
        print("transport opened")
        async with ClientSession(read, write) as session:
            print("session opened")
            await session.initialize()
            print("initialized")
            tools = await session.list_tools()
            print([tool.name for tool in tools.tools])
            print(await session.call_tool("multiply", {"a": 25, "b": 4}))
            print(await session.call_tool("divide", {"a": 10, "b": 0}))


asyncio.run(main())
