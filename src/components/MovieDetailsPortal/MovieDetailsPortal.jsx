import { useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getPosterUrl, getProfileUrl, getBackdropUrl } from '../../services/tmdbApi';
import styles from './MovieDetailsPortal.module.css';

const CastCard = memo(({ member }) => {
  const profileUrl = getProfileUrl(member.profile_path);
  return (
    <div className={styles.castCard}>
      {profileUrl ? (
        <img src={profileUrl} alt={member.name} className={styles.castPhoto} loading="lazy" />
      ) : (
        <div className={styles.castNoPhoto}>
          <span>👤</span>
        </div>
      )}
      <div className={styles.castInfo}>
        <span className={styles.castName}>{member.name}</span>
        <span className={styles.castCharacter}>{member.character}</span>
      </div>
    </div>
  );
});

const MovieDetailsPortal = ({ movie, credits, loading, error }) => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) navigate('/');
  };

  const releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const posterUrl = movie ? getPosterUrl(movie.poster_path, 'w500') : null;
  const backdropUrl = getBackdropUrl(movie?.backdrop_path);
  const topCast = credits?.cast?.slice(0, 8) ?? [];

  const content = (
    <div className={styles.overlay} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Movie Details">
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={() => navigate('/')} aria-label="Close and go back">
          ✕
        </button>

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading movie details...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorState}>
            <p>Failed to load movie details. Please try again.</p>
            <button className={styles.backBtn} onClick={() => navigate('/')}>Back to Home</button>
          </div>
        )}

        {movie && !loading && (
          <>
            {backdropUrl && (
              <div className={styles.backdrop} style={{ backgroundImage: `url(${backdropUrl})` }}>
                <div className={styles.backdropOverlay} />
              </div>
            )}

            <div className={styles.content}>
              <div className={styles.hero}>
                <div className={styles.posterWrapper}>
                  {posterUrl ? (
                    <img src={posterUrl} alt={`${movie.title} poster`} className={styles.poster} />
                  ) : (
                    <div className={styles.noPoster}>No Image</div>
                  )}
                </div>

                <div className={styles.heroInfo}>
                  <h1 className={styles.title}>{movie.title}</h1>
                  <div className={styles.meta}>
                    <span className={styles.year}>{releaseYear}</span>
                    {movie.runtime && (
                      <span className={styles.metaDot}>·</span>
                    )}
                    {movie.runtime && (
                      <span className={styles.runtime}>
                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                      </span>
                    )}
                  </div>

                  {movie.genres?.length > 0 && (
                    <div className={styles.genres}>
                      {movie.genres.map((g) => (
                        <span key={g.id} className={styles.genreTag}>{g.name}</span>
                      ))}
                    </div>
                  )}

                  <div className={styles.ratingRow}>
                    <span className={styles.ratingStar}>★</span>
                    <span className={styles.ratingValue}>{movie.vote_average.toFixed(1)}</span>
                    <span className={styles.ratingMax}> / 10</span>
                    <span className={styles.voteCount}>({movie.vote_count.toLocaleString()} votes)</span>
                  </div>

                  {movie.tagline && (
                    <p className={styles.tagline}>"{movie.tagline}"</p>
                  )}

                  <div className={styles.overview}>
                    <h2 className={styles.sectionTitle}>Overview</h2>
                    <p className={styles.overviewText}>{movie.overview || 'No overview available.'}</p>
                  </div>
                </div>
              </div>

              {topCast.length > 0 && (
                <div className={styles.castSection}>
                  <h2 className={styles.sectionTitle}>Top Cast</h2>
                  <div className={styles.castGrid}>
                    {topCast.map((member) => (
                      <CastCard key={member.cast_id ?? member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.footer}>
                <button className={styles.backBtn} onClick={() => navigate('/')}>
                  ← Back to Home
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MovieDetailsPortal;
