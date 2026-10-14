const { WebSocketServer } = require('ws');

const POLL_INTERVAL_MS = 1000;
const HEARTBEAT_INTERVAL_MS = 30000;
const UNAUTHORIZED_CLOSE_CODE = 4401;

// Canal de solo recepcion del chat. Los mensajes se guardan en RDS por la API REST y cada
// instancia los detecta consultando la tabla, asi llegan aunque los amigos esten
// conectados a instancias EC2 distintas detras del balanceador.
class ChatGateway {
  constructor({ server, verifyToken, messages }) {
    this.verifyToken = verifyToken;
    this.messages = messages;
    this.connectionsByUser = new Map();
    this.lastMessageId = 0;
    this.isPolling = false;
    this.server = new WebSocketServer({ server, path: '/ws' });
  }

  async start() {
    this.lastMessageId = await this.messages.latestId();
    this.server.on('connection', (socket, request) => this.accept(socket, request));
    this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
    // El ALB cierra conexiones inactivas a los 60 s; el ping las mantiene vivas.
    this.heartbeatTimer = setInterval(() => this.server.clients.forEach((socket) => socket.ping()), HEARTBEAT_INTERVAL_MS);
  }

  stop() {
    clearInterval(this.pollTimer);
    clearInterval(this.heartbeatTimer);
    this.server.close();
  }

  accept(socket, request) {
    const userId = this.authenticate(request);
    if (!userId) {
      socket.close(UNAUTHORIZED_CLOSE_CODE, 'Token invalido');
      return;
    }
    this.register(userId, socket);
    socket.on('close', () => this.unregister(userId, socket));
  }

  authenticate(request) {
    const token = new URL(request.url, 'http://localhost').searchParams.get('token');
    try {
      return this.verifyToken(token).id;
    } catch {
      return null;
    }
  }

  register(userId, socket) {
    if (!this.connectionsByUser.has(userId)) this.connectionsByUser.set(userId, new Set());
    this.connectionsByUser.get(userId).add(socket);
  }

  unregister(userId, socket) {
    const sockets = this.connectionsByUser.get(userId);
    sockets?.delete(socket);
    if (sockets?.size === 0) this.connectionsByUser.delete(userId);
  }

  async poll() {
    if (this.isPolling) return;
    this.isPolling = true;
    try {
      const newMessages = await this.messages.newerThan(this.lastMessageId);
      newMessages.forEach((message) => this.deliver(message));
      if (newMessages.length) this.lastMessageId = newMessages[newMessages.length - 1].id;
    } catch (error) {
      console.error('No se pudieron consultar los mensajes nuevos:', error.code || error.name);
    } finally {
      this.isPolling = false;
    }
  }

  deliver(message) {
    const payload = JSON.stringify({ type: 'message', message });
    for (const userId of new Set([message.senderId, message.receiverId])) {
      this.connectionsByUser.get(userId)?.forEach((socket) => socket.send(payload));
    }
  }
}

module.exports = ChatGateway;
