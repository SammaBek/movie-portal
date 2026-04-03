import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieCard from './MovieCard';

// Mock the API helper so tests don't depend on env vars
vi.mock('../../services/tmdbApi', () => ({
  getPosterUrl: (path, size) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const baseMovie = {
  id: 1,
  title: 'Inception',
  release_date: '2010-07-16',
  poster_path: '/inception.jpg',
  vote_average: 8.8,
};

const renderCard = (movie = baseMovie) =>
  render(
    <MemoryRouter>
      <MovieCard movie={movie} />
    </MemoryRouter>
  );

describe('MovieCard', () => {
  it('renders the movie title', () => {
    renderCard();
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('renders the release year', () => {
    renderCard();
    expect(screen.getByText('2010')).toBeInTheDocument();
  });

  it('shows "N/A" when release_date is missing', () => {
    renderCard({ ...baseMovie, release_date: null });
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders the vote_average in the rating badge', () => {
    renderCard();
    expect(screen.getByText('8.8')).toBeInTheDocument();
  });

  it('renders a poster image when poster_path is provided', () => {
    renderCard();
    const img = screen.getByAltText('Inception poster');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('/inception.jpg'));
  });

  it('shows "No Image" placeholder when poster_path is null', () => {
    renderCard({ ...baseMovie, poster_path: null });
    expect(screen.getByText('No Image')).toBeInTheDocument();
    expect(screen.queryByAltText('Inception poster')).not.toBeInTheDocument();
  });

  it('renders 5 star rating spans', () => {
    renderCard();
    const starsContainer = screen.getByLabelText(/Rating:/i);
    expect(starsContainer.querySelectorAll('span')).toHaveLength(5);
  });

  it('has the correct aria-label with title and year', () => {
    renderCard();
    expect(screen.getByLabelText('Inception (2010)')).toBeInTheDocument();
  });

  it('has role="button" and tabIndex=0 for keyboard accessibility', () => {
    renderCard();
    const card = screen.getByRole('button', { name: /Inception/i });
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('navigates to the movie detail page on click', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /Inception/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/movie/1');
  });

  it('navigates on Enter key press', () => {
    renderCard();
    const card = screen.getByRole('button', { name: /Inception/i });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/movie/1');
  });

  it('does not navigate on other key presses', () => {
    mockNavigate.mockClear();
    renderCard();
    const card = screen.getByRole('button', { name: /Inception/i });
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('poster image has lazy loading attribute', () => {
    renderCard();
    expect(screen.getByAltText('Inception poster')).toHaveAttribute('loading', 'lazy');
  });

  it('star rating aria-label reflects the vote_average', () => {
    renderCard({ ...baseMovie, vote_average: 7.5 });
    expect(screen.getByLabelText('Rating: 7.5 out of 10')).toBeInTheDocument();
  });
});
