import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupBackButtonHandler } from '../../utils/backButtonHandler';

export const BackButtonHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Setup back button handler
    const cleanup = setupBackButtonHandler(navigate);
    return cleanup;
  }, [navigate]);

  return <>{children}</>;
};
