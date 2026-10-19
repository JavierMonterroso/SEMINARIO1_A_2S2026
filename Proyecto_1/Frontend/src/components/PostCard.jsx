import { useState } from 'react';
import { api } from '../api/client';
import { formatDate } from '../utils/format';
import Avatar from './Avatar';
import TextTools from './TextTools';

export default function PostCard({ post, onLabelSelect }) {
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  async function handleComment(event) {
    event.preventDefault();
    setError('');
    try {
      const { comment } = await api.comment(post.id, newComment);
      setComments((current) => [...current, comment]);
      setNewComment('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <article className="card post">
      <header className="row">
        <Avatar user={post.author} />
        <div>
          <strong>{post.author.fullName}</strong>
          <div className="muted small">{formatDate(post.createdAt)}</div>
        </div>
      </header>

      {post.description && <TextTools text={post.description} />}
      <img className="post-image" src={post.imageUrl} alt={post.description || 'Publicación'} />

      <div className="labels">
        {post.labels.map((label) => (
          <button key={label} type="button" className="chip" onClick={() => onLabelSelect(label)}>{label}</button>
        ))}
      </div>

      <section className="comments">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <Avatar user={comment.author} size={28} />
            <div>
              <strong className="small">{comment.author.fullName}</strong>
              <TextTools text={comment.content} />
            </div>
          </div>
        ))}
        <form className="row" onSubmit={handleComment}>
          <input
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Escribe un comentario"
            maxLength={1000}
            required
          />
          <button type="submit">Comentar</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>
    </article>
  );
}
