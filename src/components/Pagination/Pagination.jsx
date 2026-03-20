import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        className={styles.btn}
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="First page"
      >
        «
      </button>
      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {start > 1 && (
        <>
          <button className={styles.btn} onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className={styles.ellipsis}>…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`${styles.btn} ${page === currentPage ? styles.active : ''}`}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className={styles.ellipsis}>…</span>}
          <button className={styles.btn} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
      <button
        className={styles.btn}
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        »
      </button>
    </nav>
  );
};

export default Pagination;
