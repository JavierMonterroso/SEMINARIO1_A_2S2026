import { useState } from 'react';
import { api } from '../api/client';

const WELCOME = 'Hola, soy el asistente de la Facultad de Ingeniería. Pregúntame por horarios, ubicación, carreras, asignación de cursos o contacto.';

// Boton flotante de acceso al bot de Amazon Lex.
export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState([{ from: 'bot', text: WELCOME }]);
  const [message, setMessage] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const question = message.trim();
    if (!question) return;
    setMessage('');
    setEntries((current) => [...current, { from: 'user', text: question }]);
    setIsWaiting(true);
    try {
      const { messages } = await api.chatbot(question);
      setEntries((current) => [...current, ...messages.map((text) => ({ from: 'bot', text }))]);
    } catch (err) {
      setEntries((current) => [...current, { from: 'bot', text: err.message }]);
    } finally {
      setIsWaiting(false);
    }
  }

  return (
    <div className="chatbot">
      {isOpen && (
        <section className="card chatbot-panel">
          <header className="row spread">
            <strong>Bot de la facultad</strong>
            <button type="button" className="link" onClick={() => setIsOpen(false)}>Cerrar</button>
          </header>
          <div className="chatbot-messages">
            {entries.map((entry, index) => (
              <p key={index} className={`bubble ${entry.from === 'user' ? 'mine' : ''}`}>{entry.text}</p>
            ))}
            {isWaiting && <p className="bubble muted">Escribiendo…</p>}
          </div>
          <form className="row" onSubmit={handleSubmit}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escribe tu pregunta" maxLength={1024} />
            <button type="submit" disabled={isWaiting}>Enviar</button>
          </form>
        </section>
      )}
      <button type="button" className="chatbot-toggle" onClick={() => setIsOpen((current) => !current)}>
        Bot FIUSAC
      </button>
    </div>
  );
}
