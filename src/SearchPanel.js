// src/SearchPanel.js
import React, { useState } from 'react';
import { Card, Flex, Heading, TextField, Button, Text, Loader } from '@aws-amplify/ui-react';
import { analyzePhoto } from './claudeClient';

function SearchPanel({ onSearch }) {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const quickSearches = [
    { label: "💡 Light", prompt: "light" },
    { label: "🐱 Cat", prompt: "cat" },
    { label: "📱 Screenshot", prompt: "screenshot" },
    { label: "🌳 Nature", prompt: "nature" },
    { label: "🍔 Food", prompt: "food" },
    { label: "🚗 Vehicle", prompt: "vehicle" }
  ];

  const handleQuickSearch = (prompt) => {
    setSearchPrompt(prompt);
    onSearch(prompt);
    if (!searchHistory.includes(prompt)) {
      setSearchHistory(prev => [prompt, ...prev.slice(0, 4)]);
    }
  };

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (searchPrompt.trim()) {
      setLoading(true);
      try {
        // Use Claude Haiku 4.5 to analyze search intent
        const result = await analyzePhoto(searchPrompt.trim());
        const enhancedSearch = result.message || searchPrompt.trim();
        onSearch(enhancedSearch);
        if (!searchHistory.includes(searchPrompt.trim())) {
          setSearchHistory(prev => [searchPrompt.trim(), ...prev.slice(0, 4)]);
        }
      } catch (error) {
        console.error('Claude search failed, falling back to regular search:', error);
        // Fall back to regular search if Claude fails
        onSearch(searchPrompt.trim());
        if (!searchHistory.includes(searchPrompt.trim())) {
          setSearchHistory(prev => [searchPrompt.trim(), ...prev.slice(0, 4)]);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const clearSearch = () => {
    setSearchPrompt('');
    onSearch('');
  };

  return (
    <Card className="search-panel">
      <div className="search-header">
        <div className="search-icon">🔍</div>
        <Heading level={4} margin="0">AI Photo Search</Heading>
      </div>
      <Text fontSize="small" color="gray.600" marginBottom="1rem">
        Search by content, objects, or scenes in your photos
      </Text>
      <form onSubmit={handleAISearch} className="search-form">
        <TextField
          label="Search photos:"
          value={searchPrompt}
          onChange={(e) => setSearchPrompt(e.target.value)}
          placeholder="e.g., light, cat, screenshot"
          size="small"
          className="search-input"
          disabled={loading}
        />
        <Flex gap="small" marginTop="0.75rem">
          <Button type="submit" variation="primary" className="search-btn" isLoading={loading} disabled={loading}>
            {loading ? <Loader /> : 'Search Photos'}
          </Button>
          {searchPrompt && (
            <Button onClick={clearSearch} variation="link" size="small" disabled={loading}>
              Clear
            </Button>
          )}
        </Flex>
        <Text fontSize="tiny" color="gray.500" marginTop="0.5rem">
          🤖 Powered by Claude Haiku 4.5 AI
        </Text>
      </form>
      <div className="quick-searches">
        <Text className="quick-searches-title">Quick Searches:</Text>
        <div className="quick-search-grid">
          {quickSearches.map((item, index) => (
            <div 
              key={index}
              className="quick-search-item"
              onClick={() => handleQuickSearch(item.prompt)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
      {searchHistory.length > 0 && (
        <div className="search-history">
          <Text className="quick-searches-title">Recent Searches:</Text>
          <Flex direction="column" gap="xs">
            {searchHistory.map((search, index) => (
              <div 
                key={index}
                className="history-item"
                onClick={() => {
                  setSearchPrompt(search);
                  onSearch(search);
                }}
                title="Click to use this search again"
              >
                {search}
              </div>
            ))}
          </Flex>
        </div>
      )}
    </Card>
  );
}

export default SearchPanel;
