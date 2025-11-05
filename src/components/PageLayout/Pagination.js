export const Pagination = ({ totalPages, currPage, onPageChange }) => {

  if (!totalPages || totalPages <= 1) return null;
  const buttons = [];

  // Show only 5 pages around current page for better UX with many pages
  const startPage = Math.max(1, currPage - 2);
  const endPage = Math.min(totalPages, currPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    buttons.push(
      <button
        key={i}
        className={`page-btn ${currPage === i ? "active" : ""}`}
        onClick={() => onPageChange(i)}
        aria-label={`Go to page ${i}`}
        aria-current={currPage === i ? "page" : undefined}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="pagination-container">
      {/* Previous Button */}
      <button
        className="page-btn nav-btn"
        disabled={currPage === 1}
        onClick={() => onPageChange(currPage - 1)}
        aria-label="Go to previous page"
      >
        «
      </button>

      {/* Show first page + ellipsis if needed */}
      {startPage > 1 && (
        <>
          <button
            className="page-btn"
            onClick={() => onPageChange(1)}
            aria-label="Go to page 1"
          >
            1
          </button>
          {startPage > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}

      {/* Page Number Buttons */}
      {buttons}

      {/* Show last page + ellipsis if needed */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="pagination-ellipsis">...</span>
          )}
          <button
            className="page-btn"
            onClick={() => onPageChange(totalPages)}
            aria-label={`Go to page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        className="page-btn nav-btn"
        disabled={currPage === totalPages}
        onClick={() => onPageChange(currPage + 1)}
        aria-label="Go to next page"
      >
        »
      </button>
    </div>
  );
};
