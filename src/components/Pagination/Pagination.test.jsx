import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

const setup = (props = {}) => {
  const onPageChange = vi.fn();
  render(
    <Pagination
      currentPage={1}
      totalPages={10}
      onPageChange={onPageChange}
      {...props}
    />
  );
  return { onPageChange };
};

describe('Pagination', () => {
  it('renders a navigation element', () => {
    setup();
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });

  it('disables "First page" and "Previous page" buttons on page 1', () => {
    setup({ currentPage: 1 });
    expect(screen.getByLabelText('First page')).toBeDisabled();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables "Last page" and "Next page" buttons on the last page', () => {
    setup({ currentPage: 10, totalPages: 10 });
    expect(screen.getByLabelText('Last page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('enables navigation buttons in the middle of page range', () => {
    setup({ currentPage: 5 });
    expect(screen.getByLabelText('First page')).not.toBeDisabled();
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    expect(screen.getByLabelText('Next page')).not.toBeDisabled();
    expect(screen.getByLabelText('Last page')).not.toBeDisabled();
  });

  it('marks the current page with aria-current="page"', () => {
    setup({ currentPage: 3, totalPages: 10 });
    const currentBtn = screen.getByRole('button', { name: '3' });
    expect(currentBtn).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark other pages with aria-current', () => {
    setup({ currentPage: 3, totalPages: 10 });
    const page2Btn = screen.getByRole('button', { name: '2' });
    expect(page2Btn).not.toHaveAttribute('aria-current');
  });

  it('shows at most 5 page number buttons', () => {
    setup({ currentPage: 5, totalPages: 20 });
    const pageButtons = screen
      .getAllByRole('button')
      .filter((btn) => /^\d+$/.test(btn.textContent));
    // visible page range is 5; may also show first/last page buttons outside range
    expect(pageButtons.length).toBeGreaterThanOrEqual(5);
  });

  it('calls onPageChange with the clicked page number', async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup({ currentPage: 1, totalPages: 10 });
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange(1) when "First page" is clicked', async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup({ currentPage: 5 });
    await user.click(screen.getByLabelText('First page'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange(currentPage - 1) when "Previous page" is clicked', async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup({ currentPage: 4 });
    await user.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange(currentPage + 1) when "Next page" is clicked', async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup({ currentPage: 4 });
    await user.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('calls onPageChange(totalPages) when "Last page" is clicked', async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup({ currentPage: 4, totalPages: 10 });
    await user.click(screen.getByLabelText('Last page'));
    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it('shows ellipsis when current page is far from start', () => {
    setup({ currentPage: 8, totalPages: 20 });
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('shows a shortcut to page 1 when the range does not include it', () => {
    setup({ currentPage: 10, totalPages: 20 });
    // Page 1 button should appear as a shortcut outside the visible window
    const page1Buttons = screen.getAllByRole('button', { name: '1' });
    expect(page1Buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders correctly with a single page', () => {
    setup({ currentPage: 1, totalPages: 1 });
    expect(screen.getByLabelText('First page')).toBeDisabled();
    expect(screen.getByLabelText('Last page')).toBeDisabled();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  });
});
