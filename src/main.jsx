import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StaffProvider } from './context/StaffContext.jsx';
import { PlayerProvider } from './context/PlayerContext.jsx';
import { TeamProvider } from './context/TeamContext.jsx';
import { TournamentProvider } from './context/TournamentContext.jsx';
import { GroupProvider } from './context/GroupContext.jsx'; 
import { MatchProvider } from './context/MatchContext.jsx';


const toastConfig = {
  style: {
    borderRadius: '10px',
    fontWeight: 'bold',
    padding: '12px 20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  error: {
    style: {
      background: '#fee2e2', // Fondo Rojo clarito
      color: '#b91c1c',      // Texto Rojo oscuro
      border: '1px solid #fecaca'
    },
    iconTheme: {
      primary: '#b91c1c',
      secondary: '#fee2e2',
    },
  },
  success: {
    style: {
      background: '#dcfce7', // Fondo Verde clarito
      color: '#15803d',      // Texto Verde oscuro
      border: '1px solid #bbf7d0'
    },
    iconTheme: {
      primary: '#15803d',
      secondary: '#dcfce7',
    },
  },
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <StaffProvider>
        <PlayerProvider> 
          <TeamProvider> 
            <TournamentProvider>
              <GroupProvider>
                <MatchProvider>
                
                  <App />
                  <Toaster position="top-center" reverseOrder={false} toastOptions={toastConfig} />

                </MatchProvider>
              </GroupProvider>
            </TournamentProvider> 
          </TeamProvider>
        </PlayerProvider> 
      </StaffProvider>
    </AuthProvider>
  </BrowserRouter>
);