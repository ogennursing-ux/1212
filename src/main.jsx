import React from 'react';
import ReactDOM from 'react-dom/client';
import TikApp from './TikApp.jsx';
import IntakeChat from './IntakeChat.jsx';
import CasesBoard from './CasesBoard.jsx';
import SignFields from './SignFields.jsx';
import RegistryApp from './RegistryApp.jsx';
import ReportPage from './ReportPage.jsx';
import './index.css';

document.documentElement.lang = 'he';
document.documentElement.dir = 'rtl';

// Routing by hash:
//   …/#chat   → the public customer chat (no login)
//   …/#board  → the cases control room (office login)
//   …/#report/<key> → one report, in its own browser tab
//   anything else → the full office app (TikApp)
const route = location.hash.replace(/^#\/?/, '').toLowerCase();
const isChat = route.startsWith('chat');
const isBoard = route.startsWith('board');
const isSignFields = route.startsWith('signfields');
const isRegistry = route.startsWith('registry');
const isReport = route.startsWith('report');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isChat ? <IntakeChat />
      : isSignFields ? <SignFields />
      : isReport ? <ReportPage />
      : isRegistry ? <RegistryApp />
      : isBoard ? <CasesBoard />
      : <TikApp />}
  </React.StrictMode>,
);
