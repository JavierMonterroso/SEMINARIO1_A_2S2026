import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useChatSocket } from '../hooks/useChatSocket';
import { formatTime } from '../utils/format';
import Avatar from '../components/Avatar';

function isBetween(message, userId, friendId) {
  const participants = [message.senderId, message.receiverId];
  return participants.includes(userId) && participants.includes(friendId);
}

// El mismo mensaje puede llegar por la respuesta del POST y por el WebSocket.
function appendUnique(messages, message) {
  return messages.some((item) => item.id === message.id) ? messages : [...messages, message];
}

export default function ChatPage() {
  const { user, token } = useAuth();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.friends().then((result) => setFriends(result.friends)).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedFriend) return;
    setMessages([]);
    api.messages(selectedFriend.id).then((result) => setMessages(result.messages)).catch((err) => setError(err.message));
  }, [selectedFriend]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const receive = useCallback((message) => {
    if (selectedFriend && isBetween(message, user.id, selectedFriend.id)) {
      setMessages((current) => appendUnique(current, message));
    }
  }, [selectedFriend, user.id]);

  useChatSocket(token, receive);

  async function handleSend(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setDraft('');
    try {
      const result = await api.sendMessage(selectedFriend.id, content);
      setMessages((current) => appendUnique(current, result.message));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="chat">
      <aside className="card chat-friends">
        <h2>Amigos</h2>
        {friends.length === 0 && <p className="muted small">Aún no tienes amigos. Agrégalos desde Usuarios.</p>}
        {friends.map((friend) => (
          <button
            key={friend.id}
            type="button"
            className={selectedFriend?.id === friend.id ? 'friend active' : 'friend'}
            onClick={() => setSelectedFriend(friend)}
          >
            <Avatar user={friend} size={32} />
            {friend.fullName}
          </button>
        ))}
      </aside>

      <section className="card chat-conversation">
        {!selectedFriend && <p className="muted">Elige un amigo para conversar.</p>}
        {selectedFriend && (
          <>
            <header className="row">
              <Avatar user={selectedFriend} size={32} />
              <strong>{selectedFriend.fullName}</strong>
            </header>
            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={message.senderId === user.id ? 'bubble mine' : 'bubble'}>
                  {message.content}
                  <span className="time">{formatTime(message.createdAt)}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form className="row" onSubmit={handleSend}>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribe un mensaje" maxLength={2000} />
              <button type="submit">Enviar</button>
            </form>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </div>
  );
}
