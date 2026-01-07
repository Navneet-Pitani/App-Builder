import os

from langchain_core.tools import tool


@tool
def read_file(path: str) -> str:
    """Read a file and return its contents as text. Returns empty string if file does not exist."""
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


@tool
def write_file(path: str, content: str) -> str:
    """
    Write the given content to a file at the specified path.
    Creates parent directories if they do not exist.
    Overwrites the file if it already exists.
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return "OK"


@tool
def list_files(path: str = ".") -> list[str]:
    """
    List all files and directories at the given path.
    """
    try:
        return os.listdir(path)
    except FileNotFoundError:
        return []


@tool
def get_current_directory() -> str:
    """
    Return the current working directory path.
    """
    return os.getcwd()
