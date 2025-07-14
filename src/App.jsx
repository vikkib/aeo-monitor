import { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">AEO Monitor</h1>
        <nav className="app-nav">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>
            Dashboard
          </button>
          <button onClick={() => setActiveTab('analysis')} className={activeTab === 'analysis' ? 'active' : ''}>
            Analysis
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>Deployment Successful!</h2>
            <p>Your AEO Monitor is live. We can now safely add your features and styling.</p>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="tab-content">
            <h2>Content Analysis</h2>
            <textarea className="content-textarea" placeholder="Paste your content here..."></textarea>
            <button className="analyze-button">Analyze Content</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

