import React, { useCallback, useEffect, useState } from 'react';
import omitBy from "lodash.omitby";
import { PRIORITIES_SEQUENCE, PRIORITY_ICONS } from "../Priority/constants.ts";
import { TodoPriority, TodosRequestSortBy, TodoStatus } from "../../../types/todo.ts";
import { useAppDispatch } from "../../../hooks/useAppDispatch.ts";
import { useDebounce } from "../../../hooks/useDebounce.ts";
import { fetchTodos } from "../../../store/features/todos/todosSlice.ts";
import styles from './Filter.module.css';

const updateUrlParams = (filterParams: FilterState) => {
  const url = new URL(window.location.href);

  url.search = '';

  Object.entries(filterParams).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  window.history.pushState({}, '', url);
};

interface FilterState {
  search: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  sortBy: TodosRequestSortBy;
}

export const Filter: React.FC = () => {
  const dispatch = useAppDispatch();

  // It would be good to move this into a hook that will work with query parameters and the URL.
  const [filters, setFilters] = useState<FilterState>(() => {
    const url = new URL(window.location.href);
    const urlFilters: FilterState = {
      search: '',
      status: undefined,
      priority: undefined,
      sortBy: 'createdAt'
    };

    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status') as 'completed' | 'active' | null;
    const priority = url.searchParams.get('priority') as TodoPriority | null;
    const sortBy = url.searchParams.get('sortBy') as TodosRequestSortBy;

    if (search) urlFilters.search = search;
    if (status) urlFilters.status = status;
    if (priority) urlFilters.priority = priority;
    if (sortBy) urlFilters.sortBy = sortBy;

    return urlFilters;
  });

  const debouncedFilters = useDebounce(filters, 500);

  // Wrapping in useCallback because filters can change frequently, causing re-renders,
  // while handleFilterChange never changes due to dependencies.
  const handleFilterChange = useCallback((
    { target: { value, name } }: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilters((prev) => {
      return { ...prev, [name]: value ?? '' };
    });
  }, []);

  const handleRefetch = useCallback(() => {
    dispatch(
      fetchTodos(
        omitBy({
          search: debouncedFilters.search,
          status: debouncedFilters.status,
          priority: debouncedFilters.priority,
          sortBy: debouncedFilters.sortBy || 'createdAt',
        }, (value) => !value),
      ));
  }, [debouncedFilters]);

  useEffect(() => {
    handleRefetch();

    updateUrlParams(debouncedFilters);
  }, [debouncedFilters, handleRefetch]);

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <label>Search:</label>
        <input
          name="search"
          type="text"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search..."
          className={styles.input}
        />
      </div>

      <div className={styles.filterGroup}>
        <label>Status:</label>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Priority:</label>
        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="">All</option>
          {PRIORITIES_SEQUENCE.map((priority) => (
            <option key={priority} value={priority}>{PRIORITY_ICONS[priority]} {priority}</option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Sort By:</label>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
          className={styles.select}
        >
          <option value="createdAt">Created At</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <div className={styles.refetchWrap}>
        <button className={styles.refetchButton} onClick={handleRefetch}> 🔄</button>
      </div>
    </div>
  );
};