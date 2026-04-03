import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

// ── Mock the API service ─────────────────────────────────────────────────────
vi.mock('../../services/tmdbApi', () => ({
  getTopRatedMovies: vi.fn(),
  searchMovies: vi.fn(),
  getMoviesByGenre: vi.fn(),
  getGenres: vi.fn(),
}));

import {
  getTopRatedMovies,
  searchMovies,
  getMoviesByGenre,
  getGenres,
} from '../../services/tmdbApi';

// Mock MovieCard to avoid router/image complexity inside unit tests
vi.mock('../../components/MovieCard/MovieCard', () => ({
  default: ({ movie }) => <div data-testid="movie-card">{movie.title}</div>,
}));

const makeMoviesResponse = (count = 3, total = 10) => ({
  results: Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Movie ${i + 1}`,
    release_date: '2020-01-01',
    poster_path: null,
    vote_average: 7.0,
  })),
  total_pages: total,
});

const genresResponse = {
  genres: [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
  ],
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  getGenres.mockResolvedValue(genresResponse);
  getTopRatedMovies.mockResolvedValue(makeMoviesResponse());
  searchMovies.mockResolvedValue(makeMoviesResponse(2));
  getMoviesByGenre.mockResolvedValue(makeMoviesResponse(1));
});

describe('HomePage – initial render', () => {
  it('renders the MoviePortal brand name', async () => {
    renderPage();
    expect(screen.getByText('MoviePortal')).toBeInTheDocument();
  });

  it('shows skeleton cards while loading', () => {
    renderPage();
    // Loading grid should be in the DOM immediately before data resolves
    expect(document.querySelector('[class*="skeleton"]')).not.toBeNull();
  });

  it('fetches top-rated movies on mount', async () => {
    renderPage();
    await waitFor(() => expect(getTopRatedMovies).toHaveBeenCalledWith(1));
  });

  it('fetches genres on mount', async () => {
    renderPage();
    await waitFor(() => expect(getGenres).toHaveBeenCalled());
  });

  it('displays the correct number of movie cards after data loads', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByTestId('movie-card')).toHaveLength(3)
    );
  });

  it('shows "Top Rated Movies" label by default', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Top Rated Movies')).toBeInTheDocument()
    );
  });

  it('renders genre filter buttons after genres load', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    );
  });
});

describe('HomePage – search', () => {
  it('calls searchMovies when a search is submitted', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getAllByTestId('movie-card'));

    await user.type(screen.getByPlaceholderText('Search movies...'), 'avatar');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() =>
      expect(searchMovies).toHaveBeenCalledWith('avatar', 1)
    );
  });

  it('updates the mode label to reflect the search query', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getAllByTestId('movie-card'));

    await user.type(screen.getByPlaceholderText('Search movies...'), 'dune');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() =>
      expect(screen.getByText(/results for "dune"/i)).toBeInTheDocument()
    );
  });
});

describe('HomePage – genre filter', () => {
  it('calls getMoviesByGenre when a genre button is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: 'Action' }));

    await user.click(screen.getByRole('button', { name: 'Action' }));

    await waitFor(() =>
      expect(getMoviesByGenre).toHaveBeenCalledWith(28, 1)
    );
  });

  it('updates the mode label to reflect the selected genre', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: 'Action' }));

    await user.click(screen.getByRole('button', { name: 'Action' }));

    await waitFor(() =>
      expect(screen.getByText('Action Movies')).toBeInTheDocument()
    );
  });

  it('resets to top-rated when "All" is clicked after a genre selection', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: 'Action' }));

    await user.click(screen.getByRole('button', { name: 'Action' }));
    await waitFor(() => expect(getMoviesByGenre).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /^all$/i }));
    await waitFor(() =>
      expect(screen.getByText('Top Rated Movies')).toBeInTheDocument()
    );
  });
});

describe('HomePage – error state', () => {
  it('shows the error state when the API call fails', async () => {
    getTopRatedMovies.mockRejectedValueOnce(new Error('API down'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/failed to load movies/i)).toBeInTheDocument()
    );
  });

  it('shows a Retry button on error', async () => {
    getTopRatedMovies.mockRejectedValueOnce(new Error('API down'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    );
  });

  it('retries fetch when Retry button is clicked', async () => {
    const user = userEvent.setup();
    getTopRatedMovies
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(makeMoviesResponse());
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /retry/i }));
    await user.click(screen.getByRole('button', { name: /retry/i }));
    await waitFor(() =>
      expect(screen.getAllByTestId('movie-card')).toHaveLength(3)
    );
  });
});

describe('HomePage – empty state', () => {
  it('shows empty state when results array is empty', async () => {
    getTopRatedMovies.mockResolvedValueOnce({ results: [], total_pages: 0 });
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByText(/no movies found/i)
      ).toBeInTheDocument()
    );
  });
});

describe('HomePage – pagination', () => {
  it('renders pagination when movies are present', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
    );
  });

  it('does not render pagination on error', async () => {
    getTopRatedMovies.mockRejectedValueOnce(new Error('fail'));
    renderPage();
    await waitFor(() => screen.getByText(/failed to load movies/i));
    expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
  });
});
