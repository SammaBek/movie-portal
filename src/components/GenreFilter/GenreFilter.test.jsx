import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenreFilter from "./GenreFilter";

const mockGenres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
];

const setup = (props = {}) => {
  const onGenreChange = vi.fn();
  render(
    <GenreFilter
      genres={mockGenres}
      selectedGenre={null}
      onGenreChange={onGenreChange}
      {...props}
    />,
  );
  return { onGenreChange };
};

describe("GenreFilter", () => {
  it('renders the "Genre:" label', () => {
    setup();
    expect(screen.getByText("Genre:")).toBeInTheDocument();
  });

  it('renders the "All" button', () => {
    setup();
    expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
  });

  it("renders a button for each genre", () => {
    setup();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comedy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Drama" })).toBeInTheDocument();
  });

  it("renders no genre buttons when genres list is empty", () => {
    render(
      <GenreFilter genres={[]} selectedGenre={null} onGenreChange={vi.fn()} />,
    );
    // only the "All" button should be present
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it('calls onGenreChange(null) when "All" is clicked', async () => {
    const user = userEvent.setup();
    const { onGenreChange } = setup();
    await user.click(screen.getByRole("button", { name: /^all$/i }));
    expect(onGenreChange).toHaveBeenCalledWith(null);
  });

  it("calls onGenreChange with the genre id when a genre button is clicked", async () => {
    const user = userEvent.setup();
    const { onGenreChange } = setup();
    await user.click(screen.getByRole("button", { name: "Action" }));
    expect(onGenreChange).toHaveBeenCalledWith(28);
  });

  it("triggers onGenreChange each time a different genre is clicked", async () => {
    const user = userEvent.setup();
    const { onGenreChange } = setup();
    await user.click(screen.getByRole("button", { name: "Action" }));
    await user.click(screen.getByRole("button", { name: "Drama" }));
    expect(onGenreChange).toHaveBeenCalledTimes(2);
    expect(onGenreChange).toHaveBeenNthCalledWith(1, 28);
    expect(onGenreChange).toHaveBeenNthCalledWith(2, 18);
  });
});
