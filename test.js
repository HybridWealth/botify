const axios = require('axios');
const OPENAI_API_KEY = 'sk-proj-dZx6v879jrkvUW8PpBv2T3BlbkFJn3RZUhNjGqM4F739Tfpc';

async function testOpenAIApi() {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello, how are you?' }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    console.log('OpenAI API response:', response.data.choices[0].message.content.trim());
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error.response ? error.response.data : error.message);
  }
}

testOpenAIApi();
