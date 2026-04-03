import { useState, useEffect, useCallback, useMemo } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import GenreFilter from '../../components/GenreFilter/GenreFilter';
import MovieCard from '../../components/MovieCard/MovieCard';
import Pagination from '../../components/Pagination/Pagination';
import {
  getTopRatedMovies,
  searchMovies,
  getMoviesByGenre,
  getGenres,
} from '../../services/tmdbApi';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getGenres()
      .then((data) => setGenres(data.genres))
      .catch(() => {});
  }, []);

  const fetchMovies = useCallback(async (query, genreId, page) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (query) {
        data = await searchMovies(query, page);
      } else if (genreId) {
        data = await getMoviesByGenre(genreId, page);
      } else {
        data = await getTopRatedMovies(page);
      }
      setMovies(data.results);
      setTotalPages(Math.min(data.total_pages, 500));
    } catch (err) {
      setError('Failed to load movies. Please check your API key and try again.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(searchQuery, selectedGenre, currentPage);
  }, [fetchMovies, searchQuery, selectedGenre, currentPage]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setSelectedGenre(null);
    setCurrentPage(1);
  }, []);

  const handleGenreChange = useCallback((genreId) => {
    setSelectedGenre(genreId);
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const modeLabel = useMemo(() => {
    if (searchQuery) return `Results for "${searchQuery}"`;
    if (selectedGenre) {
      const genre = genres.find((g) => g.id === selectedGenre);
      return genre ? `${genre.name} Movies` : 'Filtered Movies';
    }
    return 'Top Rated Movies';
  }, [searchQuery, selectedGenre, genres]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>🎬</span>
            <h1 className={styles.brandName}>MoviePortal</h1>
          </div>
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.controls}>
          <div className={styles.controlsTop}>
            <h2 className={styles.modeLabel}>{modeLabel}</h2>
          </div>
          <GenreFilter
            genres={genres}
            selectedGenre={selectedGenre}
            onGenreChange={handleGenreChange}
          />
        </div>

        {loading && (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>⚠️</span>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={() => fetchMovies(searchQuery, selectedGenre, currentPage)}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎭</span>
            <p>No movies found. Try a different search or filter.</p>
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <>
            <div className={styles.grid}>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
