import { useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className={styles.input}
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button type="button" className={styles.clearBtn} onClick={handleClear} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>
      <button type="submit" className={styles.searchBtn}>Search</button>
    </form>
  );
};

export default SearchBar;
