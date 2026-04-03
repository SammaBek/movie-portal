import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieDetailsPortal from './MovieDetailsPortal';

vi.mock('../../services/tmdbApi', () => ({
  getPosterUrl: (path, size) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null),
  getProfileUrl: (path, size) => (path ? `https://image.tmdb.org/t/p/${size || 'w185'}${path}` : null),
  getBackdropUrl: (path, size) => (path ? `https://image.tmdb.org/t/p/${size || 'w1280'}${path}` : null),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const baseMovie = {
  id: 1,
  title: 'Interstellar',
  release_date: '2014-11-05',
  poster_path: '/interstellar.jpg',
  backdrop_path: '/backdrop.jpg',
  vote_average: 8.6,
  vote_count: 34000,
  runtime: 169,
  genres: [{ id: 878, name: 'Science Fiction' }, { id: 18, name: 'Drama' }],
  tagline: 'Mankind was born on Earth. It was never meant to die here.',
  overview: 'A team of explorers travel through a wormhole in space.',
};

const baseCredits = {
  cast: [
    { cast_id: 1, name: 'Matthew McConaughey', character: 'Cooper', profile_path: '/matt.jpg' },
    { cast_id: 2, name: 'Anne Hathaway', character: 'Brand', profile_path: null },
  ],
};

const renderPortal = (props = {}) =>
  render(
    <MemoryRouter>
      <MovieDetailsPortal
        movie={baseMovie}
        credits={baseCredits}
        loading={false}
        error={null}
        {...props}
      />
    </MemoryRouter>
  );

describe('MovieDetailsPortal – loading state', () => {
  it('shows the loading message when loading is true', () => {
    renderPortal({ movie: null, credits: null, loading: true });
    expect(screen.getByText(/loading movie details/i)).toBeInTheDocument();
  });

  it('does not show movie content while loading', () => {
    renderPortal({ loading: true });
    expect(screen.queryByText('Interstellar')).not.toBeInTheDocument();
  });
});

describe('MovieDetailsPortal – error state', () => {
  it('shows the error message when error is truthy', () => {
    renderPortal({ movie: null, credits: null, loading: false, error: true });
    expect(screen.getByText(/failed to load movie details/i)).toBeInTheDocument();
  });

  it('shows a "Back to Home" button on error', () => {
    renderPortal({ movie: null, loading: false, error: true });
    expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
  });

  it('"Back to Home" on error navigates to "/"', async () => {
    renderPortal({ movie: null, loading: false, error: true });
    fireEvent.click(screen.getByRole('button', { name: /back to home/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

describe('MovieDetailsPortal – movie content', () => {
  it('renders the movie title', () => {
    renderPortal();
    expect(screen.getByRole('heading', { name: 'Interstellar' })).toBeInTheDocument();
  });

  it('renders the release year', () => {
    renderPortal();
    expect(screen.getByText('2014')).toBeInTheDocument();
  });

  it('renders the runtime in h/m format', () => {
    renderPortal();
    expect(screen.getByText('2h 49m')).toBeInTheDocument();
  });

  it('renders genre tags', () => {
    renderPortal();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
  });

  it('renders the vote average', () => {
    renderPortal();
    expect(screen.getByText('8.6')).toBeInTheDocument();
  });

  it('renders the vote count with locale formatting', () => {
    renderPortal();
    expect(screen.getByText(/34[,.]?000 votes/i)).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    renderPortal();
    expect(screen.getByText(/mankind was born on earth/i)).toBeInTheDocument();
  });

  it('renders the overview text', () => {
    renderPortal();
    expect(screen.getByText(/team of explorers travel/i)).toBeInTheDocument();
  });

  it('renders the poster image', () => {
    renderPortal();
    expect(screen.getByAltText('Interstellar poster')).toBeInTheDocument();
  });

  it('shows "No Image" placeholder when poster_path is null', () => {
    renderPortal({ movie: { ...baseMovie, poster_path: null } });
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('shows "No overview available." when overview is empty', () => {
    renderPortal({ movie: { ...baseMovie, overview: '' } });
    expect(screen.getByText('No overview available.')).toBeInTheDocument();
  });

  it('does not render tagline section when tagline is empty', () => {
    renderPortal({ movie: { ...baseMovie, tagline: '' } });
    expect(screen.queryByText(/mankind was born/i)).not.toBeInTheDocument();
  });

  it('does not render runtime when runtime is null', () => {
    renderPortal({ movie: { ...baseMovie, runtime: null } });
    expect(screen.queryByText(/h \d+m/)).not.toBeInTheDocument();
  });
});

describe('MovieDetailsPortal – cast section', () => {
  it('renders cast member names', () => {
    renderPortal();
    expect(screen.getByText('Matthew McConaughey')).toBeInTheDocument();
    expect(screen.getByText('Anne Hathaway')).toBeInTheDocument();
  });

  it('renders cast member characters', () => {
    renderPortal();
    expect(screen.getByText('Cooper')).toBeInTheDocument();
    expect(screen.getByText('Brand')).toBeInTheDocument();
  });

  it('renders a profile photo when profile_path exists', () => {
    renderPortal();
    expect(screen.getByAltText('Matthew McConaughey')).toBeInTheDocument();
  });

  it('shows 👤 placeholder when cast member has no profile photo', () => {
    renderPortal();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('limits cast to 8 members', () => {
    const cast = Array.from({ length: 12 }, (_, i) => ({
      cast_id: i,
      name: `Actor ${i}`,
      character: `Character ${i}`,
      profile_path: null,
    }));
    renderPortal({ credits: { cast } });
    expect(screen.getAllByText(/^Actor \d+$/).length).toBe(8);
  });

  it('hides the cast section when credits has no cast', () => {
    renderPortal({ credits: { cast: [] } });
    expect(screen.queryByText('Top Cast')).not.toBeInTheDocument();
  });
});

describe('MovieDetailsPortal – navigation / close', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('has role="dialog" and aria-modal="true"', () => {
    renderPortal();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('navigates to "/" when the close button is clicked', () => {
    renderPortal();
    fireEvent.click(screen.getByLabelText('Close and go back'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to "/" on Escape key press', () => {
    renderPortal();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to "/" when clicking the backdrop overlay', () => {
    renderPortal();
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('does not navigate when clicking inside the modal content', () => {
    renderPortal();
    fireEvent.click(screen.getByRole('heading', { name: 'Interstellar' }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('MovieDetailsPortal – body scroll lock', () => {
  it('sets document.body overflow to "hidden" on mount', () => {
    renderPortal();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores document.body overflow on unmount', () => {
    const { unmount } = renderPortal();
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
