import json
import os
import re

from dotenv import load_dotenv
from groq import AsyncGroq


def _number_regex():
    return r"(\d+(?:\.\d+)?)"


def parse_calculation_plan(prompt: str):
    text = prompt.lower()

    if "then" in text and ("add" in text or "plus" in text) and ("multiplied" in text or "multiply" in text or "times" in text):
        multiply_match = re.search(rf"{_number_regex()}\s*(?:multiplied by|multiplied|times)\s*{_number_regex()}", text)
        add_match = re.search(r"(?:then\s+)?(?:plus\s+|add\s+)" + _number_regex(), text)
        if multiply_match and add_match:
            a, b = multiply_match.groups()
            c = add_match.group(1)
            return [
                {"tool": "multiply", "arguments": {"a": float(a), "b": float(b)}},
                {"tool": "add", "arguments": {"a": float(a) * float(b), "b": float(c)}},
            ]

    if "multiplied" in text or "multiply" in text or "times" in text:
        match = re.search(rf"{_number_regex()}\s*(?:multiplied by|multiplied|times)\s*{_number_regex()}", text)
        if match:
            a, b = match.groups()
            return [{"tool": "multiply", "arguments": {"a": float(a), "b": float(b)}}]

    if "plus" in text or "add" in text or "+" in text:
        match = re.search(rf"{_number_regex()}\s*(?:plus|add|\+)\s*{_number_regex()}", text)
        if match:
            a, b = match.groups()
            return [{"tool": "add", "arguments": {"a": float(a), "b": float(b)}}]

    if "minus" in text or "subtract" in text or "-" in text:
        match = re.search(rf"{_number_regex()}\s*(?:minus|subtract|-)\s*{_number_regex()}", text)
        if match:
            a, b = match.groups()
            return [{"tool": "subtract", "arguments": {"a": float(a), "b": float(b)}}]

    if "divided by" in text or "/" in text:
        match = re.search(rf"{_number_regex()}\s*(?:divided by|/)\s*{_number_regex()}", text)
        if match:
            a, b = match.groups()
            return [{"tool": "divide", "arguments": {"a": float(a), "b": float(b)}}]

    if "to the power of" in text or "power" in text:
        match = re.search(rf"{_number_regex()}\s*(?:to the power of|power)\s*{_number_regex()}", text)
        if match:
            a, b = match.groups()
            return [{"tool": "power", "arguments": {"a": float(a), "b": float(b)}}]

    raise ValueError(f"Unable to parse calculation from prompt: {prompt}")


class CalculatorHost:
    def __init__(self, client):
        self.client = client

    async def respond(self, prompt: str):
        plan = parse_calculation_plan(prompt)
        results = []
        for step in plan:
            result = await self.client.call_tool(step["tool"], step["arguments"])
            results.append(result)

        final = results[-1]
        if isinstance(final, str):
            return final
        return str(final)

    async def list_tools(self):
        return await self.client.list_tools()


class GroqCalculatorHost:
    def __init__(self, client, model: str | None = None):
        load_dotenv()
        if not os.getenv("GROQ_API_KEY"):
            raise RuntimeError("GROQ_API_KEY is missing. Add it to the .env file.")

        self.client = client
        self.model = model or os.getenv("MODEL_NAME", "llama-3.1-8b-instant")
        self.ai_client = AsyncGroq()

    async def respond(self, prompt: str) -> str:
        mcp_tools = await self.client.list_tools()
        tools = [
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description or "Calculator operation.",
                    "parameters": tool.input_schema,
                },
            }
            for tool in mcp_tools
        ]
        messages = [
            {
                "role": "system",
                "content": "You are a calculator assistant. Use the available calculator tools for arithmetic and explain the final result briefly.",
            },
            {"role": "user", "content": prompt},
        ]

        for _ in range(8):
            response = await self.ai_client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=tools,
                tool_choice="auto",
            )
            message = response.choices[0].message
            messages.append(message.model_dump(exclude_none=True))

            if not message.tool_calls:
                return message.content or "The model returned no answer."

            for tool_call in message.tool_calls:
                arguments = json.loads(tool_call.function.arguments)
                result = await self.client.call_tool(tool_call.function.name, arguments)
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(result),
                    }
                )

        raise RuntimeError("The model exceeded the maximum number of tool calls.")
