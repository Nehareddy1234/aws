// src/App.js - UPDATED
import React, { useState } from 'react';
import { withAuthenticator, Button, Heading, Text, Badge } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './styles.css';

import PhotoGallery from './PhotoGallery';
import UploadForm from './UploadForm';
import SearchPanel from './SearchPanel';

function App({ signOut, user }) {
  const userId = user?.attributes?.sub;
  const [searchPrompt, setSearchPrompt] = useState('');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📸</div>
            <div className="logo-text">
              <Heading level={1} margin="0">Photo Gallery</Heading>
              <Text className="logo-subtitle">Smart photo management with AI search</Text>
            </div>
          </div>
          
          <div className="user-section">
            <Badge backgroundColor="#10b981">
              🤖 Claude Haiku 4.5 Enabled
            </Badge>
            <Text className="welcome-text" style={{ color: '#e0e7ff' }}>
              Welcome, {user.username}!
            </Text>
            <Button onClick={signOut} variation="primary" className="sign-out-btn">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="sidebar">
          <UploadForm userId={userId} />
          <SearchPanel onSearch={setSearchPrompt} />
        </div>
        
        <div className="gallery-section">
          <PhotoGallery searchQuery={searchPrompt} />
        </div>
      </main>
    </div>
  );
}

export default withAuthenticator(App);