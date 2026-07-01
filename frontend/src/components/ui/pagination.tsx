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
                <p className='text-sm text-primary'>
                    Showing <span className='font-medium'>{items.length}</span>{' '}
                    of <span className='font-medium'>{totalItems}</span> {name}
                </p>

                <div className='flex items-center gap-2'>
                    {totalPages > 1 && (
                        <button
                            onClick={() => {
                                scrollToTop();
                                setPage((prev) => Math.max(prev - 1, 0));
                            }}
                            disabled={page === 0}
                            className='cursor-pointer px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg disabled:opacity-50 focus:outline-none'
                        >
                            <FontAwesomeIcon
                                icon={faChevronLeft}
                                className='w-4 h-4'
                            />
                        </button>
                    )}

                    <button
                        onClick={() => {
                            scrollToTop();
                            setPage(0);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium border text-primary  ${
                            page === 0
                                ? 'bg-primary text-white border-primary focus:outline-none'
                                : 'border-primary hover:bg-primary hover:text-white focus:outline-none'
                        }`}
                    >
                        1
                    </button>

                    {page >= 3 && <span className='px-2 text-gray-500'>…</span>}

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
                                className={`px-4 py-2 rounded-lg font-medium border text-primary ${
                                    page === i
                                        ? 'bg-primary text-white border-primary focus:outline-none'
                                        : 'border-primary hover:bg-primary hover:text-white focus:outline-none'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                    {page < totalPages - 3 && (
                        <span className='px-2 text-gray-500'>…</span>
                    )}
                    {totalPages > 1 && (
                        <button
                            onClick={() => {
                                scrollToTop();
                                setPage(totalPages - 1);
                            }}
                            className={`px-4 py-2 rounded-lg font-medium border text-primary ${
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
                            className=' cursor-pointer px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg  disabled:opacity-50 focus:outline-none'
                        >
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className='w-4 h-4'
                            />
                        </button>
                    )}
                </div>
            </div>
        )
    );
};


export default Pagination;
