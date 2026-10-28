import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from mcp.server.mcpserver import MCPServer

from calculator.operations import add, divide, multiply, power, subtract

server = MCPServer(
    "calculator-server",
    title="Calculator MCP Server",
    description="Exposes calculator operations through MCP tools.",
)


@server.tool(name="add", description="Adds two numbers together.")
def add_tool(a: float, b: float) -> float:
    return add(a, b)


@server.tool(name="subtract", description="Subtracts the second number from the first number.")
def subtract_tool(a: float, b: float) -> float:
    return subtract(a, b)


@server.tool(name="multiply", description="Multiplies two numbers together.")
def multiply_tool(a: float, b: float) -> float:
    return multiply(a, b)


@server.tool(name="divide", description="Divides the first number by the second number. If the divisor is zero, it returns a safe error message.")
def divide_tool(a: float, b: float):
    return divide(a, b)


@server.tool(name="power", description="Raises the first number to the power of the second number.")
def power_tool(a: float, b: float) -> float:
    return power(a, b)


async def main():
    await server.run_stdio_async()


if __name__ == "__main__":
    asyncio.run(main())
