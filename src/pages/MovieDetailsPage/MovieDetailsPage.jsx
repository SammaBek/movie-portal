import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MovieDetailsPortal from '../../components/MovieDetailsPortal/MovieDetailsPortal';
import { getMovieDetails, getMovieCredits } from '../../services/tmdbApi';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMovie(null);
    setCredits(null);

    Promise.all([getMovieDetails(id), getMovieCredits(id)])
      .then(([movieData, creditsData]) => {
        if (!cancelled) {
          setMovie(movieData);
          setCredits(creditsData);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return (
    <MovieDetailsPortal
      movie={movie}
      credits={credits}
      loading={loading}
      error={error}
    />
  );
};

export default MovieDetailsPage;
