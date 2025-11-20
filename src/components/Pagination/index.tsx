import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './index.less';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ current, total, pageSize, onChange }) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (current > 1) {
      onChange(current - 1);
    }
  };

  const handleNext = () => {
    if (current < totalPages) {
      onChange(current + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== current) {
      onChange(page);
    }
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // 显示的页码数量

    if (totalPages <= showPages + 2) {
      // 总页数较少，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数较多，显示省略号
      pages.push(1);

      if (current <= 3) {
        // 当前页靠前
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        // 当前页靠后
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="cc-pagination">
      <div className="cc-pagination__info">
        {t('common.pagination.totalInfo', { total, pageSize })}
      </div>
      <div className="cc-pagination__controls">
        <button
          className="cc-pagination__button cc-pagination__button--prev"
          onClick={handlePrevious}
          disabled={current === 1}
          title={t('common.pagination.previousPage')}
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="cc-pagination__ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`cc-pagination__button cc-pagination__button--page ${current === page ? 'cc-pagination__button--active' : ''}`}
              onClick={() => handlePageClick(page as number)}
            >
              {page}
            </button>
          )
        ))}

        <button
          className="cc-pagination__button cc-pagination__button--next"
          onClick={handleNext}
          disabled={current === totalPages}
          title={t('common.pagination.nextPage')}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
