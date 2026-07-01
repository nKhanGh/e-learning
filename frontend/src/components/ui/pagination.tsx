import {
    faChevronLeft,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Pagination = ({
    items,
    totalItems,
    totalPages,
    page,
    setPage,
    name = 'items',
}: {
  items: unknown[];
  totalItems: number;
  totalPages: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  name?: string;
}) => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        items.length > 0 && (
            <div className='flex items-center justify-between w-full'>
                <p className='text-xs text-primary'>
                    Showing <span className='font-medium'>{items.length}</span>{' '}
                    of <span className='font-medium'>{totalItems}</span> {name}
                </p>

                <div className='flex items-center gap-1.5'>
                    {totalPages > 1 && (
                        <button
                            onClick={() => {
                                scrollToTop();
                                setPage((prev) => Math.max(prev - 1, 0));
                            }}
                            disabled={page === 0}
                            className='cursor-pointer px-2.5 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-md disabled:opacity-50 focus:outline-none'
                        >
                            <FontAwesomeIcon
                                icon={faChevronLeft}
                                className='w-3.5 h-3.5'
                            />
                        </button>
                    )}

                    <button
                        onClick={() => {
                            scrollToTop();
                            setPage(0);
                        }}
                        className={`px-3.5 py-1.5 rounded-md font-medium border text-primary  ${
                            page === 0
                                ? 'bg-primary text-white border-primary focus:outline-none'
                                : 'border-primary hover:bg-primary hover:text-white focus:outline-none'
                        }`}
                    >
                        1
                    </button>

                    {page >= 3 && <span className='px-1.5 text-gray-500'>…</span>}

                    {Array.from({ length: totalPages }, (_, i) => i)
                        .filter(
                            (i) =>
                                i >= page - 1 &&
                                i <= page + 1 &&
                                i != 0 &&
                                i != totalPages - 1,
                        )
                        .map((i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    scrollToTop();
                                    setPage(i);
                                }}
                                className={`px-3.5 py-1.5 rounded-md font-medium border text-primary ${
                                    page === i
                                        ? 'bg-primary text-white border-primary focus:outline-none'
                                        : 'border-primary hover:bg-primary hover:text-white focus:outline-none'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                    {page < totalPages - 3 && (
                        <span className='px-1.5 text-gray-500'>…</span>
                    )}
                    {totalPages > 1 && (
                        <button
                            onClick={() => {
                                scrollToTop();
                                setPage(totalPages - 1);
                            }}
                            className={`px-3.5 py-1.5 rounded-md font-medium border text-primary ${
                                page === totalPages - 1
                                    ? 'bg-primary text-white border-primary focus:outline-none dark:hover:bg-gray-300 dark:hover:text-gray-300'
                                    : 'border-primary hover:bg-primary hover:text-white focus:outline-none'
                            }`}
                        >
                            {totalPages}
                        </button>
                    )}

                    {/* Nút Next */}
                    {totalPages > 1 && (
                        <button
                            onClick={() => {
                                scrollToTop();
                                setPage( prev =>
                                    Math.min(prev + 1, totalPages - 1),
                                );
                            }}
                            disabled={page >= totalPages - 1}
                            className=' cursor-pointer px-2.5 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-md  disabled:opacity-50 focus:outline-none'
                        >
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className='w-3.5 h-3.5'
                            />
                        </button>
                    )}
                </div>
            </div>
        )
    );
};


export default Pagination;
