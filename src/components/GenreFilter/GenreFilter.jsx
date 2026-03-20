import styles from './GenreFilter.module.css';

const GenreFilter = ({ genres, selectedGenre, onGenreChange }) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Genre:</span>
      <div className={styles.genres}>
        <button
          className={`${styles.genreBtn} ${!selectedGenre ? styles.active : ''}`}
          onClick={() => onGenreChange(null)}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            className={`${styles.genreBtn} ${selectedGenre === genre.id ? styles.active : ''}`}
            onClick={() => onGenreChange(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter;
