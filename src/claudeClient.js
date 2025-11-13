/**
 * claudeClient.js - Frontend utility to call the Claude Haiku Lambda backend
 * 
 * Usage:
 *   import { analyzePhoto, generateTags, describePhoto } from './claudeClient';
 *   
 *   const analysis = await analyzePhoto("A sunset over mountains");
 *   const tags = await generateTags("A cat sleeping on a couch");
 *   const description = await describePhoto("A beach scene");
 */

const CLAUDE_LAMBDA_ENDPOINT = process.env.REACT_APP_CLAUDE_API_URL || 
  'https://YOUR_API_GATEWAY_ENDPOINT_HERE/prod/claude';

export async function callClaude(message, action = 'analyze-photo') {
  try {
    const response = await fetch(CLAUDE_LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        action,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

export async function analyzePhoto(photoDescription) {
  return callClaude(photoDescription, 'analyze-photo');
}

export async function generateTags(photoDescription) {
  return callClaude(photoDescription, 'generate-tags');
}

export async function describePhoto(photoDescription) {
  return callClaude(photoDescription, 'describe-photo');
}
