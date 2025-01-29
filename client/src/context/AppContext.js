import React, { createContext, useContext, useMemo, useCallback, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  leads: [],
  notifications: [],
  loading: false,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_LEADS':
      return { ...state, leads: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const showNotification = useCallback((message, type = 'info') => {
    // ... notification logic ...
  }, []);

  const hideNotification = useCallback(() => {
    // ... hide logic ...
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }, []);

  const updateLeads = useCallback((leads) => {
    dispatch({ type: 'UPDATE_LEADS', payload: leads });
  }, []);

  const contextValue = useMemo(() => ({
    ...state,
    dispatch,
    updateUser,
    updateLeads,
    showNotification,
    hideNotification,
  }), [state, updateUser, updateLeads, showNotification, hideNotification]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 