import { useRef, useCallback, useEffect } from 'react';

export const useInfiniteScroll = (loadMore, hasMore) => {
  const observer = useRef();
  const loadMoreRef = useRef(loadMore);
  
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);
  
  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreRef.current();
      }
    });
    
    if (node) observer.current.observe(node);
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore]);

  return lastElementRef;
};

export default useInfiniteScroll; 