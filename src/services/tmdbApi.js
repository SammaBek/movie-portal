const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

const fetchFromTMDB = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const getTopRatedMovies = (page = 1) =>
  fetchFromTMDB('/movie/top_rated', { page });

export const searchMovies = (query, page = 1) =>
  fetchFromTMDB('/search/movie', { query, page });

export const getMoviesByGenre = (genreId, page = 1) =>
  fetchFromTMDB('/discover/movie', { with_genres: genreId, sort_by: 'vote_average.desc', 'vote_count.gte': 100, page });

export const getMovieDetails = (movieId) =>
  fetchFromTMDB(`/movie/${movieId}`);

export const getMovieCredits = (movieId) =>
  fetchFromTMDB(`/movie/${movieId}/credits`);

export const getGenres = () =>
  fetchFromTMDB('/genre/movie/list');

export const getPosterUrl = (path, size = 'w500') =>
  path ? `${IMAGE_BASE_URL}/${size}${path}` : null;

export const getProfileUrl = (path, size = 'w185') =>
  path ? `${IMAGE_BASE_URL}/${size}${path}` : null;

export const getBackdropUrl = (path, size = 'w1280') =>
  path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
