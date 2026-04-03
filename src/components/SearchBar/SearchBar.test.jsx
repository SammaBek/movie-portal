import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

const setup = (props = {}) => {
  const onSearch = vi.fn();
  render(<SearchBar onSearch={onSearch} {...props} />);
  return { onSearch };
};

describe('SearchBar', () => {
  it('renders the search input and button', () => {
    setup();
    expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('initialises with empty string by default', () => {
    setup();
    expect(screen.getByPlaceholderText('Search movies...')).toHaveValue('');
  });

  it('initialises with the provided initialValue', () => {
    setup({ initialValue: 'inception' });
    expect(screen.getByPlaceholderText('Search movies...')).toHaveValue('inception');
  });

  it('updates the input as the user types', async () => {
    const user = userEvent.setup();
    setup();
    const input = screen.getByPlaceholderText('Search movies...');
    await user.type(input, 'avatar');
    expect(input).toHaveValue('avatar');
  });

  it('calls onSearch with trimmed value on form submit', async () => {
    const user = userEvent.setup();
    const { onSearch } = setup();
    await user.type(screen.getByPlaceholderText('Search movies...'), '  dune  ');
    // Use exact name to avoid matching "Clear search" button
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledWith('dune');
  });

  it('calls onSearch on Enter key press', async () => {
    const user = userEvent.setup();
    const { onSearch } = setup();
    const input = screen.getByPlaceholderText('Search movies...');
    await user.type(input, 'matrix{Enter}');
    expect(onSearch).toHaveBeenCalledWith('matrix');
  });

  it('does not show clear button when input is empty', () => {
    setup();
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('shows the clear button when input has a value', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByPlaceholderText('Search movies...'), 'test');
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clicking the clear button resets the input and calls onSearch("")', async () => {
    const user = userEvent.setup();
    const { onSearch } = setup();
    await user.type(screen.getByPlaceholderText('Search movies...'), 'test');
    await user.click(screen.getByLabelText('Clear search'));
    expect(screen.getByPlaceholderText('Search movies...')).toHaveValue('');
    expect(onSearch).toHaveBeenLastCalledWith('');
  });

  it('prevents default form submission', () => {
    setup();
    const form = screen.getByRole('button', { name: /search/i }).closest('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    fireEvent(form, submitEvent);
    expect(submitEvent.defaultPrevented).toBe(true);
  });
});
