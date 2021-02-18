export const loggingMiddleware = (store) => {
  return (next) => {
    return (action) => {
      console.log('dispatch', action.type);
      const result = next(action);
      return result;
    };
  };
};

export const delayActionMiddleware = (store) => (next) => (action) => {
  console.log('state', store.getState());
  if (action.type === 'done') {
    setTimeout(() => {
      next(action);
    }, 1000);
  } else {
    next(action);
  }
};

export const asyncMiddleware = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }

  return next(action);
};
