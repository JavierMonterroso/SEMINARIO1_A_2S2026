import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import CreatePost from '../components/CreatePost';
import LabelFilter from '../components/LabelFilter';
import PostCard from '../components/PostCard';

const ALL_POSTS = { label: null, search: '' };

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [labels, setLabels] = useState([]);
  const [filter, setFilter] = useState(ALL_POSTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [postsResult, labelsResult] = await Promise.all([api.posts(filter), api.labels()]);
      setPosts(postsResult.posts);
      setLabels(labelsResult.labels);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const selectLabel = (label) => setFilter({ ...ALL_POSTS, label });

  return (
    <div className="stack">
      <CreatePost onCreated={loadPosts} />
      <LabelFilter labels={labels} filter={filter} onChange={(change) => setFilter({ ...ALL_POSTS, ...change })} />
      {error && <p className="error">{error}</p>}
      {isLoading && <p className="muted">Cargando publicaciones…</p>}
      {!isLoading && posts.length === 0 && <p className="muted">No hay publicaciones para mostrar.</p>}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLabelSelect={selectLabel} />
      ))}
    </div>
  );
}
