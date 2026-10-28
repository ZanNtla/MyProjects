# MCP Calculator Application

## 1. Project Overview

Build a simple calculator application that uses the **Model Context Protocol (MCP)** instead of a traditional REST API.

The purpose of this project is to demonstrate how an AI application can discover and use calculator tools through MCP.

The calculator must support:

* Addition
* Subtraction
* Multiplication
* Division

The application must use:

```text
AI Model
    ↓
MCP Host
    ↓
MCP Client
    ↓
MCP Server
    ↓
Calculator Functions
```

Do NOT implement the calculator as a REST API.

Do NOT create endpoints such as:

```text
GET /add
POST /calculate
GET /multiply
```

The calculator operations must be exposed as **MCP tools**.

---

# 2. Goal

The user should be able to enter a natural language calculation such as:

```text
What is 25 multiplied by 4?
```

The AI should determine that it needs to use the `multiply` MCP tool.

The request should travel through the MCP architecture:

```text
User
 ↓
AI Model
 ↓
MCP Host
 ↓
MCP Client
 ↓
MCP Server
 ↓
multiply(25, 4)
 ↓
100
 ↓
MCP Client
 ↓
AI Model
 ↓
User
```

The user should receive a natural language response such as:

```text
25 multiplied by 4 is 100.
```

---

# 3. MCP Architecture

The project must contain the following components.

```text
┌─────────────────────────────┐
│           USER              │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          AI MODEL           │
│                             │
│ Determines which tool       │
│ should be used               │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          MCP HOST           │
│                             │
│ AI application that manages │
│ the MCP connection          │
│                             │
│      ┌──────────────┐       │
│      │  MCP Client  │       │
│      └──────┬───────┘       │
└─────────────┼───────────────┘
              │
              │ MCP / JSON-RPC
              ▼
┌─────────────────────────────┐
│        MCP SERVER           │
│                             │
│ Tools:                      │
│                             │
│ add                         │
│ subtract                    │
│ multiply                    │
│ divide                      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     CALCULATOR FUNCTIONS    │
└─────────────────────────────┘
```

---

# 4. Technology Requirements

Use:

* Python 3.11+
* MCP Python SDK
* An LLM provider of your choice
* JSON-RPC through MCP
* Standard Python functions for calculations

Suggested project structure:

```text
mcp-calculator/
│
├── server/
│   ├── __init__.py
│   └── calculator_server.py
│
├── client/
│   ├── __init__.py
│   └── calculator_client.py
│
├── host/
│   ├── __init__.py
│   └── calculator_host.py
│
├── calculator/
│   ├── __init__.py
│   └── operations.py
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

# 5. Calculator Functions

Create normal Python functions for the actual calculations.

The functions should be:

```python
add(a, b)
subtract(a, b)
multiply(a, b)
divide(a, b)
```

Example:

```python
def add(a: float, b: float) -> float:
    return a + b
```

The calculation logic should remain separate from the MCP server logic.

---

# 6. MCP Server

Create an MCP server that exposes the calculator functions as MCP tools.

The server must expose these tools:

```text
add
subtract
multiply
divide
```

Each tool must have a clear description.

For example:

```text
Tool:
    add

Description:
    Adds two numbers together.

Arguments:
    a: number
    b: number
```

The MCP tool definition must provide enough information for an MCP Client to understand:

1. The tool name
2. What the tool does
3. What parameters it requires
4. The parameter types

---

# 7. Tool Requirements

## add

```text
Name:
    add

Parameters:
    a: number
    b: number

Returns:
    a + b
```

Example:

```text
add(10, 5)
```

Result:

```text
15
```

---

## subtract

```text
Name:
    subtract

Parameters:
    a: number
    b: number

Returns:
    a - b
```

Example:

```text
subtract(10, 5)
```

Result:

```text
5
```

---

## multiply

```text
Name:
    multiply

Parameters:
    a: number
    b: number

Returns:
    a * b
```

Example:

```text
multiply(10, 5)
```

Result:

```text
50
```

---

## divide

```text
Name:
    divide

Parameters:
    a: number
    b: number

Returns:
    a / b
```

The server must handle division by zero safely.

Example:

```text
divide(10, 0)
```

Expected result:

```text
Error: Cannot divide by zero.
```

The server must not crash.

---

# 8. MCP Client

Create an MCP Client that connects to the MCP Server.

The Client must NOT contain hardcoded calculator endpoints.

Do not implement:

```text
/add
/subtract
/multiply
/divide
```

Instead, the client should use MCP to discover the tools provided by the server.

The Client should be able to:

1. Connect to the MCP Server.
2. Discover available tools.
3. Read the tool names.
4. Read tool descriptions.
5. Read the input schemas.
6. Call a selected tool.
7. Pass arguments to the tool.
8. Receive the result.
9. Return the result to the Host.

---

# 9. Tool Discovery

When the MCP Client connects to the server, it should discover something similar to:

```text
Available MCP Tools:

1. add
   Parameters:
      a: number
      b: number

2. subtract
   Parameters:
      a: number
      b: number

3. multiply
   Parameters:
      a: number
      b: number

4. divide
   Parameters:
      a: number
      b: number
```

The Client should obtain this information through MCP.

It should not manually maintain a list of calculator endpoints.

---

# 10. MCP Host

Create an MCP Host application.

The Host is the application that:

* Interacts with the user
* Communicates with the AI model
* Contains/manages the MCP Client
* Provides the AI model with the available MCP tools
* Coordinates tool calls
* Sends tool results back to the AI model

The architecture should be:

```text
Host
│
├── AI Model
│
└── MCP Client
       │
       ▼
   MCP Server
```

---

# 11. AI Tool Selection

The AI should be given access to the tools discovered from the MCP Server.

For example, if the user asks:

```text
What is 25 multiplied by 4?
```

The AI should identify:

```text
Tool:
    multiply

Arguments:
    {
        "a": 25,
        "b": 4
    }
```

The Host should then instruct the MCP Client to call the tool.

The AI must NOT directly execute the Python calculation function.

The calculation must be performed by the MCP Server.

---

# 12. Example Complete Flow

User:

```text
What is 25 multiplied by 4?
```

AI:

```text
I need the multiply tool.
```

MCP Client:

```text
Call multiply with:

a = 25
b = 4
```

MCP Server:

```text
multiply(25, 4)
```

Calculator:

```text
25 * 4 = 100
```

MCP Server returns:

```text
100
```

MCP Client returns the result to the Host.

Host provides the result to the AI.

AI:

```text
25 multiplied by 4 is 100.
```

---

# 13. JSON-RPC / MCP Communication

The implementation must use MCP communication rather than manually creating REST requests.

The team should be able to inspect the communication and understand that MCP uses JSON-RPC messages.

Conceptually, a tool call should contain information equivalent to:

```json
{
  "method": "tools/call",
  "params": {
    "name": "multiply",
    "arguments": {
      "a": 25,
      "b": 4
    }
  }
}
```

The exact wire format should be handled by the MCP SDK rather than manually implemented unless needed for educational demonstration.

---

# 14. No REST API

The project must NOT contain:

```text
FastAPI
Flask REST endpoints
Express REST endpoints
GET /add
POST /calculate
POST /multiply
```

The calculator functionality must be exposed through MCP tools.

The purpose of the project is specifically to understand:

```text
MCP Server
MCP Client
MCP Host
MCP tools
Tool discovery
Tool schemas
JSON-RPC communication
```

---

# 15. Demonstration Requirements

The final application must demonstrate the following.

## Demonstration 1 — Addition

User:

```text
What is 10 + 5?
```

Expected:

```text
15
```

The team must show that the AI used:

```text
add(10, 5)
```

---

## Demonstration 2 — Multiplication

User:

```text
What is 20 multiplied by 5?
```

Expected:

```text
100
```

---

## Demonstration 3 — Division

User:

```text
What is 100 divided by 4?
```

Expected:

```text
25
```

---

## Demonstration 4 — Division by zero

User:

```text
What is 10 divided by 0?
```

Expected:

```text
Cannot divide by zero.
```

The MCP Server must handle the error.

---

# 16. Tool Discovery Demonstration

Add a new MCP tool:

```text
power(a, b)
```

The tool should calculate:

```text
a ** b
```

For example:

```text
power(2, 5)
```

returns:

```text
32
```

The Client should discover the new tool without requiring a new hardcoded REST endpoint.

After reconnecting to the server, the Client should show:

```text
add
subtract
multiply
divide
power
```

Then ask the AI:

```text
What is 2 to the power of 5?
```

The AI should use:

```text
power(2, 5)
```

---

# 17. Multiple Tool Calls

The application must support calculations requiring multiple tool calls.

Example:

```text
What is 10 multiplied by 5, then add 20?
```

Expected calculation:

```text
multiply(10, 5)
        ↓
       50
        ↓
add(50, 20)
        ↓
       70
```

Expected answer:

```text
70
```

This demonstrates that the AI can use MCP tools multiple times during one interaction.

---

# 18. Group Responsibilities

## Einstein — MCP Server

Responsible for:

* Creating the MCP Server
* Creating calculator functions
* Exposing functions as MCP tools
* Defining tool descriptions
* Defining input schemas
* Handling errors
* Demonstrating tool execution

Main question:

> How does an MCP Server expose capabilities to an MCP Client?

---

## Hawking — MCP Client

Responsible for:

* Connecting to the MCP Server
* Discovering tools
* Reading tool schemas
* Calling tools
* Sending arguments
* Receiving results

Main question:

> How does an MCP Client discover and use tools without hardcoding every endpoint?

---

## Newton — MCP Host

Responsible for:

* Creating the AI application
* Connecting the AI model to the MCP Client
* Providing tools to the AI
* Coordinating tool calls
* Returning results to the AI

Main question:

> What does the MCP Host control and how does it coordinate the AI and MCP Client?

---

## Curie — MCP Architecture

Responsible for:

* Integrating all components
* Demonstrating the complete request flow
* Explaining Host, Client, and Server relationships
* Demonstrating JSON-RPC/MCP communication
* Demonstrating multiple tool calls
* Demonstrating what happens when a new tool is added

Main question:

> How does a request travel through the complete MCP architecture?

---

# 19. Final Architecture Demonstration

The final demonstration must show:

```text
                    USER
                      │
                      ▼
                 ┌─────────┐
                 │ AI Model│
                 └────┬────┘
                      │
                      ▼
              ┌───────────────┐
              │   MCP HOST    │
              │               │
              │  MCP Client   │
              └───────┬───────┘
                      │
                 MCP / JSON-RPC
                      │
                      ▼
              ┌───────────────┐
              │  MCP SERVER   │
              │               │
              │ add           │
              │ subtract      │
              │ multiply      │
              │ divide        │
              │ power         │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │  CALCULATOR   │
              │   FUNCTIONS   │
              └───────────────┘
```

Every group must be able to explain where their component exists in this diagram.

---

# 20. Learning Outcomes

After completing the project, the team should be able to explain and demonstrate:

* What an MCP Server is
* What an MCP Client is
* What an MCP Host is
* Why the Host is needed
* How an MCP Client discovers tools
* How tool schemas describe parameters
* How an MCP Client calls a tool
* How an MCP Server executes a tool
* How tool results are returned
* How MCP uses JSON-RPC
* How multiple tools can be used
* How new tools can be discovered
* How multiple MCP Servers could be connected to one Host
* How MCP differs from a traditional REST API

The most important requirement is that every concept should be demonstrated through the working calculator rather than only explained theoretically.
