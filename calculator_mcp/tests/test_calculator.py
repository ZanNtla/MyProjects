from calculator.operations import add, divide, multiply, power, subtract
from host.calculator_host import parse_calculation_plan


def test_basic_operations():
    assert add(10, 5) == 15
    assert subtract(10, 5) == 5
    assert multiply(10, 5) == 50
    assert divide(10, 5) == 2
    assert power(2, 5) == 32


def test_divide_by_zero_is_safe():
    assert divide(10, 0) == "Cannot divide by zero."


def test_sequence_plan_parsing():
    plan = parse_calculation_plan("What is 10 multiplied by 5, then add 20?")
    assert plan == [
        {"tool": "multiply", "arguments": {"a": 10, "b": 5}},
        {"tool": "add", "arguments": {"a": 50, "b": 20}},
    ]
