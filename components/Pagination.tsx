import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
      >
        Prev
      </button>

      {/* First page */}
      <button
        onClick={() => onPageChange(1)}
        className={`px-3 py-1 rounded ${
          currentPage === 1 ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        1
      </button>

      {currentPage > 6 && <span className="px-2">...</span>}

      {/* Middle pages */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => {
          if (page === 1 || page === totalPages) return false;
          if (currentPage <= 6) return page <= 10;
          if (currentPage >= totalPages - 5) return page >= totalPages - 9;
          return page >= currentPage - 4 && page <= currentPage + 4;
        })
        .map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? "bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {page}
          </button>
        ))}

      {currentPage < totalPages - 5 && <span className="px-2">...</span>}

      {/* Last page */}
      {totalPages > 1 && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? "bg-red-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {totalPages}
        </button>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
