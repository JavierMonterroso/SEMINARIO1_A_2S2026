import { useState } from 'react';

// Filtro "Todos" + una opcion por etiqueta de Rekognition, y buscador por nombre.
export default function LabelFilter({ labels, filter, onChange }) {
  const [searchText, setSearchText] = useState('');

  function handleSearch(event) {
    event.preventDefault();
    onChange({ search: searchText.trim() });
  }

  function selectLabel(label) {
    setSearchText('');
    onChange({ label });
  }

  const isAllSelected = !filter.label && !filter.search;

  return (
    <section className="card">
      <form className="row" onSubmit={handleSearch}>
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Buscar etiqueta, por ejemplo: Dog"
          maxLength={100}
        />
        <button type="submit">Buscar</button>
      </form>
      <div className="labels">
        <button type="button" className={isAllSelected ? 'chip active' : 'chip'} onClick={() => selectLabel(null)}>
          Todos
        </button>
        {labels.map((label) => (
          <button
            key={label}
            type="button"
            className={filter.label === label ? 'chip active' : 'chip'}
            onClick={() => selectLabel(label)}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
