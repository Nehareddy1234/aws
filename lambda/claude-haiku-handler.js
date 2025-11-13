/**
 * AWS Lambda handler for Claude Haiku 4.5 integration
 * Proxies requests to Anthropic API securely
 * 
 * Environment variables:
 * - ANTHROPIC_API_KEY: stored in AWS Secrets Manager (not in env directly)
 */

const https = require('https');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretsManagerClient = new SecretsManagerClient({ region: 'ap-south-1' });

// Cache the API key to avoid repeated Secrets Manager calls
let cachedApiKey = null;

async function getAnthropicApiKey() {
  if (cachedApiKey) {
    return cachedApiKey;
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: 'anthropic/api-key', // Store this secret in AWS Secrets Manager
    });

    const response = await secretsManagerClient.send(command);
    cachedApiKey = response.SecretString;
    return cachedApiKey;
  } catch (error) {
    console.error('Failed to retrieve API key from Secrets Manager:', error);
    throw new Error('Unable to retrieve authentication credentials');
  }
}

function callClaudeHaiku(apiKey, message) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(new Error('Failed to parse Anthropic response'));
          }
        } else {
          reject(new Error(`Anthropic API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'OK' }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { message, action } = body;

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing message field' }),
      };
    }

    // Retrieve API key from Secrets Manager
    const apiKey = await getAnthropicApiKey();

    // Call Claude Haiku based on action type
    let prompt = message;

    if (action === 'analyze-photo') {
      prompt = `You are a photo analysis expert. Analyze the following photo description and provide insights:\n\n${message}`;
    } else if (action === 'generate-tags') {
      prompt = `Based on the following photo description, generate 5-10 relevant tags (comma-separated):\n\n${message}`;
    } else if (action === 'describe-photo') {
      prompt = `Provide a detailed and engaging description of the following photo:\n\n${message}`;
    }

    // Call Anthropic API
    const response = await callClaudeHaiku(apiKey, prompt);

    // Extract the text response
    const textContent = response.content.find((block) => block.type === 'text');
    const responseText = textContent ? textContent.text : 'No response generated';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: responseText,
        usage: response.usage,
      }),
    };
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
    };
  }
};
