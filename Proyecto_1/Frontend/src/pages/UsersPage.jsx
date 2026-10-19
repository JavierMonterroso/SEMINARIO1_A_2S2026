import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import Avatar from '../components/Avatar';

export default function UsersPage() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [requestsResult, usersResult] = await Promise.all([api.friendRequests(), api.suggestions()]);
      setRequests(requestsResult.requests);
      setUsers(usersResult.users);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action) {
    setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const accept = (requestId) => run(() => api.acceptFriendRequest(requestId));
  const reject = (requestId) => run(() => api.rejectFriendRequest(requestId));
  const sendRequest = (userId) => run(() => api.sendFriendRequest(userId));

  return (
    <div className="stack">
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Solicitudes de amistad</h2>
        {requests.length === 0 && <p className="muted">No tienes solicitudes pendientes.</p>}
        {requests.map((request) => (
          <div key={request.id} className="row spread person">
            <div className="row">
              <Avatar user={request.sender} />
              <strong>{request.sender.fullName}</strong>
            </div>
            <div className="row">
              <button type="button" onClick={() => accept(request.id)}>Aceptar</button>
              <button type="button" className="secondary" onClick={() => reject(request.id)}>Rechazar</button>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Otros usuarios</h2>
        {users.length === 0 && <p className="muted">No hay más usuarios por ahora.</p>}
        {users.map((person) => (
          <div key={person.id} className="row spread person">
            <div className="row">
              <Avatar user={person} />
              <strong>{person.fullName}</strong>
            </div>
            <FriendAction person={person} onSend={sendRequest} onAccept={accept} onReject={reject} />
          </div>
        ))}
      </section>
    </div>
  );
}

function FriendAction({ person, onSend, onAccept, onReject }) {
  const actions = {
    NONE: <button type="button" onClick={() => onSend(person.id)}>Agregar amigo</button>,
    SENT: <span className="muted small">Solicitud enviada</span>,
    RECEIVED: (
      <div className="row">
        <button type="button" onClick={() => onAccept(person.requestId)}>Aceptar</button>
        <button type="button" className="secondary" onClick={() => onReject(person.requestId)}>Rechazar</button>
      </div>
    ),
  };
  return actions[person.requestStatus];
}
