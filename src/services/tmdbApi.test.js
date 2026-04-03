import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPosterUrl,
  getProfileUrl,
  getBackdropUrl,
  getTopRatedMovies,
  searchMovies,
  getMoviesByGenre,
  getMovieDetails,
  getMovieCredits,
  getGenres,
} from './tmdbApi';

// ── URL helper tests (pure functions, no fetch) ──────────────────────────────

describe('getPosterUrl', () => {
  it('returns a URL with the given size and path', () => {
    const url = getPosterUrl('/abc.jpg', 'w342');
    expect(url).toContain('w342');
    expect(url).toContain('/abc.jpg');
  });

  it('returns null when path is null', () => {
    expect(getPosterUrl(null)).toBeNull();
  });

  it('returns null when path is undefined', () => {
    expect(getPosterUrl(undefined)).toBeNull();
  });

  it('defaults to w500 size', () => {
    const url = getPosterUrl('/test.jpg');
    expect(url).toContain('w500');
  });
});

describe('getProfileUrl', () => {
  it('returns a URL with the given path', () => {
    const url = getProfileUrl('/cast.jpg');
    expect(url).toContain('/cast.jpg');
  });

  it('returns null when path is null', () => {
    expect(getProfileUrl(null)).toBeNull();
  });

  it('defaults to w185 size', () => {
    const url = getProfileUrl('/cast.jpg');
    expect(url).toContain('w185');
  });
});

describe('getBackdropUrl', () => {
  it('returns a URL with the given path', () => {
    const url = getBackdropUrl('/backdrop.jpg');
    expect(url).toContain('/backdrop.jpg');
  });

  it('returns null when path is null', () => {
    expect(getBackdropUrl(null)).toBeNull();
  });

  it('defaults to w1280 size', () => {
    const url = getBackdropUrl('/backdrop.jpg');
    expect(url).toContain('w1280');
  });
});

// ── Fetch-based API tests ────────────────────────────────────────────────────

const mockMoviesResponse = {
  results: [{ id: 1, title: 'Test Movie' }],
  total_pages: 10,
  page: 1,
};

const mockResponse = (data, ok = true) => ({
  ok,
  status: ok ? 200 : 404,
  statusText: ok ? 'OK' : 'Not Found',
  json: () => Promise.resolve(data),
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getTopRatedMovies', () => {
  it('calls the top_rated endpoint', async () => {
    fetch.mockResolvedValueOnce(mockResponse(mockMoviesResponse));
    const data = await getTopRatedMovies(1);
    expect(fetch).toHaveBeenCalledOnce();
    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain('/movie/top_rated');
    expect(calledUrl).toContain('page=1');
    expect(data.results).toHaveLength(1);
  });

  it('defaults to page 1', async () => {
    fetch.mockResolvedValueOnce(mockResponse(mockMoviesResponse));
    await getTopRatedMovies();
    expect(fetch.mock.calls[0][0]).toContain('page=1');
  });
});

describe('searchMovies', () => {
  it('calls the search/movie endpoint with the query', async () => {
    fetch.mockResolvedValueOnce(mockResponse(mockMoviesResponse));
    await searchMovies('inception', 2);
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('/search/movie');
    expect(url).toContain('query=inception');
    expect(url).toContain('page=2');
  });
});

describe('getMoviesByGenre', () => {
  it('calls the discover/movie endpoint with genre id', async () => {
    fetch.mockResolvedValueOnce(mockResponse(mockMoviesResponse));
    await getMoviesByGenre(28, 1);
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('/discover/movie');
    expect(url).toContain('with_genres=28');
  });
});

describe('getMovieDetails', () => {
  it('calls the correct movie endpoint', async () => {
    fetch.mockResolvedValueOnce(mockResponse({ id: 42, title: 'Movie' }));
    await getMovieDetails(42);
    expect(fetch.mock.calls[0][0]).toContain('/movie/42');
  });
});

describe('getMovieCredits', () => {
  it('calls the credits endpoint', async () => {
    fetch.mockResolvedValueOnce(mockResponse({ cast: [] }));
    await getMovieCredits(42);
    expect(fetch.mock.calls[0][0]).toContain('/movie/42/credits');
  });
});

describe('getGenres', () => {
  it('calls the genre/movie/list endpoint', async () => {
    fetch.mockResolvedValueOnce(mockResponse({ genres: [] }));
    await getGenres();
    expect(fetch.mock.calls[0][0]).toContain('/genre/movie/list');
  });
});

describe('fetchFromTMDB error handling', () => {
  it('throws when the response is not ok', async () => {
    fetch.mockResolvedValueOnce(mockResponse({}, false));
    await expect(getTopRatedMovies()).rejects.toThrow('TMDB API error');
  });

  it('throws when fetch itself rejects (network error)', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    await expect(getTopRatedMovies()).rejects.toThrow('Network error');
  });
});
