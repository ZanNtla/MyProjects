# MCP Calculator

This project demonstrates a calculator exposed through the Model Context Protocol (MCP) instead of a REST API.

## Project structure

- `calculator/` contains the actual arithmetic functions.
- `server/` contains the MCP server exposing calculator tools.
- `client/` contains the MCP client that discovers and calls tools.
- `host/` contains the orchestrating host that selects tools and coordinates execution.
- `ai_demo.py` connects Groq to the MCP calculator.

## Setup

```bash
python -m pip install -r requirements.txt
```

## Run the server

```bash
python server/calculator_server.py
```

## Run a demo host

```bash
python -c "import asyncio; from client.calculator_client import MCPClient; from host.calculator_host import CalculatorHost; async def main():
    client = MCPClient('server/calculator_server.py')
    await client.connect()
    tools = await client.list_tools()
    print('TOOLS', tools)
    host = CalculatorHost(client)
    print(await host.respond('What is 25 multiplied by 4?'))
    await client.close()
asyncio.run(main())"
```

## Run with Groq

Add your key to `.env`:

```env
GROQ_API_KEY=your-groq-api-key-here
MODEL_NAME=llama-3.1-8b-instant
```

Then run:

```bash
python ai_demo.py
```

The Groq model chooses the calculator MCP tool, while the MCP server performs the calculation.

## Notes

- The server exposes `add`, `subtract`, `multiply`, `divide`, and `power` as MCP tools.
- The client discovers the tool schema from the server and calls tools by name.
- The host coordinates user prompts and tool execution.
- The Groq host uses model tool calling to choose those MCP tools.
- No REST endpoints are used.
