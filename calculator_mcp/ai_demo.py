import asyncio

from client.calculator_client import MCPClient
from host.calculator_host import GroqCalculatorHost


async def main():
    client = MCPClient("server/calculator_server.py")
    await client.connect()
    try:
        host = GroqCalculatorHost(client)
        prompt = input("Ask the calculator: ")
        print(await host.respond(prompt))
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())