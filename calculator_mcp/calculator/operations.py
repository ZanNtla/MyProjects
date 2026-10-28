def add(a: float, b: float) -> float:
    return a + b


def subtract(a: float, b: float) -> float:
    return a - b


def multiply(a: float, b: float) -> float:
    return a * b


def divide(a: float, b: float):
    if b == 0:
        return "Cannot divide by zero."
    return a / b


def power(a: float, b: float) -> float:
    return a ** b
