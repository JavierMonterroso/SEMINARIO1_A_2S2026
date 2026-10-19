import { API_URL } from '../config';

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let currentToken = null;
let onUnauthorized = () => {};

export function setToken(token) {
  currentToken = token;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (currentToken) headers.Authorization = `Bearer ${currentToken}`;

  let response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }

  const data = await response.json().catch(() => ({}));
  if (response.status === 401 && currentToken) onUnauthorized();
  if (!response.ok) throw new ApiError(response.status, data.error || 'Ocurrió un error inesperado', data.code);
  return data;
}

function post(path, body = {}) {
  return request(path, { method: 'POST', body });
}

function query(params) {
  const search = new URLSearchParams(Object.entries(params).filter(([, value]) => value));
  return search.toString() ? `?${search}` : '';
}

export const api = {
  register: (data) => post('/auth/register', data),
  confirm: (email, code) => post('/auth/confirm', { email, code }),
  resendCode: (email) => post('/auth/resend-code', { email }),
  login: (username, password) => post('/auth/login', { username, password }),
  faceLogin: (username, photo) => post('/auth/face-login', { username, photo }),

  me: () => request('/users/me'),
  updateMe: (data) => request('/users/me', { method: 'PUT', body: data }),

  suggestions: () => request('/users/suggestions'),
  friends: () => request('/friends'),
  friendRequests: () => request('/friend-requests'),
  sendFriendRequest: (receiverId) => post('/friend-requests', { receiverId }),
  acceptFriendRequest: (id) => post(`/friend-requests/${id}/accept`),
  rejectFriendRequest: (id) => post(`/friend-requests/${id}/reject`),

  posts: (filter) => request(`/posts${query(filter)}`),
  labels: () => request('/labels'),
  createPost: (data) => post('/posts', data),
  comment: (postId, content) => post(`/posts/${postId}/comments`, { content }),

  translate: (text, targetLanguage) => post('/translate', { text, targetLanguage }),
  speech: (text, language) => post('/speech', { text, language }),
  chatbot: (message) => post('/chatbot', { message }),

  messages: (friendId) => request(`/chat/${friendId}/messages`),
  sendMessage: (friendId, content) => post(`/chat/${friendId}/messages`, { content }),
};
