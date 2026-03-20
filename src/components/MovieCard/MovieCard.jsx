import { useNavigate } from 'react-router-dom';
import { getPosterUrl } from '../../services/tmdbApi';
import styles from './MovieCard.module.css';

const StarRating = ({ rating }) => {
  const stars = Math.round(rating / 2);
  return (
    <div className={styles.stars} aria-label={`Rating: ${rating.toFixed(1)} out of 10`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < stars ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );
};

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const posterUrl = getPosterUrl(movie.poster_path, 'w342');

  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/movie/${movie.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/movie/${movie.id}`)}
      aria-label={`${movie.title} (${releaseYear})`}
    >
      <div className={styles.posterWrapper}>
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className={styles.poster}
            loading="lazy"
          />
        ) : (
          <div className={styles.noPoster}>
            <span>No Image</span>
          </div>
        )}
        <div className={styles.ratingBadge}>
          <span className={styles.ratingIcon}>★</span>
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{movie.title}</h3>
        <span className={styles.year}>{releaseYear}</span>
        <StarRating rating={movie.vote_average} />
      </div>
    </article>
  );
};

export default MovieCard;
