import { useState, useMemo, useCallback } from 'react';

interface UseFilterOptions<T> {
  data: T[] | undefined;
  filterKeys: (keyof T)[];
  initialFilter?: string;
  customFilter?: (item: T, filter: string) => boolean;
}

interface UseFilterReturn<T> {
  filteredData: T[];
  filter: string;
  setFilter: (filter: string) => void;
  clearFilter: () => void;
  isFiltered: boolean;
}

function useFilter<T>({
  data,
  filterKeys,
  initialFilter = '',
  customFilter,
}: UseFilterOptions<T>): UseFilterReturn<T> {
  const [filter, setFilter] = useState(initialFilter);

  const filteredData = useMemo(() => {
    if (!data || !filter) {
      return data || [];
    }

    const lowerCaseFilter = filter.toLowerCase();

    return data.filter((item) => {
      if (customFilter) {
        return customFilter(item, lowerCaseFilter);
      }

      return filterKeys.some((key) => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerCaseFilter);
        }
        if (typeof value === 'number') {
          return value.toString().includes(lowerCaseFilter);
        }
        return false;
      });
    });
  }, [data, filter, filterKeys, customFilter]);

  const clearFilter = useCallback(() => {
    setFilter('');
  }, []);

  return {
    filteredData,
    filter,
    setFilter,
    clearFilter,
    isFiltered: filter.length > 0,
  };
}

export default useFilter;
