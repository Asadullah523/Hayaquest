import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setupBackButtonHandler } from '../../utils/backButtonHandler';

export const BackButtonHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Setup back button handler with navigation capabilities
    const getCurrentPath = () => location.pathname;
    setupBackButtonHandler(navigate, getCurrentPath);
  }, [navigate, location]);

  return <>{children}</>;
};
