import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MovieDetailsPage from './MovieDetailsPage';

// ── Mock API calls ────────────────────────────────────────────────────────────
vi.mock('../../services/tmdbApi', () => ({
  getMovieDetails: vi.fn(),
  getMovieCredits: vi.fn(),
}));

import { getMovieDetails, getMovieCredits } from '../../services/tmdbApi';

// ── Mock the portal to keep tests lean ───────────────────────────────────────
vi.mock('../../components/MovieDetailsPortal/MovieDetailsPortal', () => ({
  default: ({ movie, credits, loading, error }) => (
    <div data-testid="portal">
      {loading && <p>loading</p>}
      {error && <p>error</p>}
      {movie && <p data-testid="movie-title">{movie.title}</p>}
      {credits && <p data-testid="cast-count">{credits.cast.length}</p>}
    </div>
  ),
}));

const mockMovie = {
  id: 42,
  title: 'Dune',
  release_date: '2021-09-15',
  poster_path: '/dune.jpg',
  vote_average: 7.9,
  vote_count: 8000,
  runtime: 155,
  genres: [],
  tagline: '',
  overview: 'A desert planet.',
};

const mockCredits = { cast: [{ cast_id: 1, name: 'Timothée Chalamet', character: 'Paul', profile_path: null }] };

const renderPage = (id = '42') =>
  render(
    <MemoryRouter initialEntries={[`/movie/${id}`]}>
      <Routes>
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  getMovieDetails.mockResolvedValue(mockMovie);
  getMovieCredits.mockResolvedValue(mockCredits);
});

describe('MovieDetailsPage', () => {
  it('renders the portal component', () => {
    renderPage();
    expect(screen.getByTestId('portal')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderPage();
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('calls getMovieDetails and getMovieCredits with the id from the URL', async () => {
    renderPage('42');
    await waitFor(() => expect(getMovieDetails).toHaveBeenCalledWith('42'));
    expect(getMovieCredits).toHaveBeenCalledWith('42');
  });

  it('passes movie data to the portal after fetch resolves', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('movie-title')).toHaveTextContent('Dune')
    );
  });

  it('passes credits data to the portal after fetch resolves', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('cast-count')).toHaveTextContent('1')
    );
  });

  it('hides the loading indicator after data loads', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText('loading')).not.toBeInTheDocument()
    );
  });

  it('shows error state when the API call fails', async () => {
    getMovieDetails.mockRejectedValueOnce(new Error('Not found'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('error')).toBeInTheDocument()
    );
  });

  it('calls getMovieDetails with the correct id from the URL params', async () => {
    renderPage('99');
    await waitFor(() => expect(getMovieDetails).toHaveBeenCalledWith('99'));
    await waitFor(() => expect(getMovieCredits).toHaveBeenCalledWith('99'));
  });
});
