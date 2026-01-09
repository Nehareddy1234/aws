/**
 * photoAnalysisClient.js - Frontend utility to call the photo analysis backend
 *
 * Usage:
 *   import { analyzePhoto, generateTags, describePhoto } from './claudeClient';
 *
 *   const analysis = await analyzePhoto("A sunset over mountains");
 *   const tags = await generateTags("A cat sleeping on a couch");
 *   const description = await describePhoto("A beach scene");
 */

const ANALYSIS_ENDPOINT = process.env.REACT_APP_CLAUDE_API_URL ||
  'https://YOUR_API_GATEWAY_ENDPOINT_HERE/prod/claude';

export async function callAnalysisAPI(message, action = 'analyze-photo') {
  try {
    const response = await fetch(ANALYSIS_ENDPOINT, {
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
    console.error('Photo analysis API error:', error);
    throw error;
  }
}

export async function analyzePhoto(photoDescription) {
  return callAnalysisAPI(photoDescription, 'analyze-photo');
}

export async function generateTags(photoDescription) {
  return callAnalysisAPI(photoDescription, 'generate-tags');
}

export async function describePhoto(photoDescription) {
  return callAnalysisAPI(photoDescription, 'describe-photo');
}
