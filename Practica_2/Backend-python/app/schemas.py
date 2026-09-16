from typing import Optional
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class TaskCompleteRequest(BaseModel):
    completed: bool


class FileCreateRequest(BaseModel):
    name: str
    type: str
    url: str
