import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { batchDeleteTodos, batchUpdateTodos } from '../../../store/features/todos/todosSlice';
import { selectDeleteStatus, selectUpdateStatus } from "../../../store/features/todos/todosSelectors.ts";
import { RootState } from "../../../store/store.ts";
import { Loader } from "../../common/Loading/Loader.tsx";
import { useAppDispatch } from "../../../hooks/useAppDispatch.ts";
import styles from './StatusIndicator.module.css';

const selectors = (state: RootState) => ({
  updateStatus: selectUpdateStatus(state),
  deleteStatus: selectDeleteStatus(state),
});

export const StatusIndicator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { updateStatus, deleteStatus } = useSelector(selectors, shallowEqual);

  const isLoading = updateStatus === 'loading' || deleteStatus === 'loading';
  const isError = updateStatus === 'failed' || deleteStatus === 'failed';

  const handleRetry = () => {
    if (updateStatus === 'failed') {
      dispatch(batchUpdateTodos());
    }

    if (deleteStatus === 'failed') {
      dispatch(batchDeleteTodos());
    }
  };

  if (isLoading) {
    return (
      <div className={styles.indicatorWrap}>
        <span>Saving </span>
        <Loader size="small" />
      </div>
    );
  }

  if (isError) {
    return (
      <button type="button" className={styles.indicatorWrap} onClick={handleRetry}>
        ⚠️ Error | Click to retry
      </button>
    );
  }

  return <div className={styles.indicatorWrap} />;
};