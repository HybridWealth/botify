const axios = require('axios');
const { Telegraf } = require('telegraf');
const schedule = require('node-schedule');

const TELEGRAM_BOT_TOKEN = '6870199671:AAG2YKZwGy0qCG9TJjt0TrQdBGrbzgllXpE';
const OPENAI_API_KEY = 'sk-proj-dZx6v879jrkvUW8PpBv2T3BlbkFJn3RZUhNjGqM4F739Tfpc';
const CHAT_ID = '2090071905'; // Replace with your group chat ID

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// In-memory store for warnings
const warnings = {};

// List of foul language words (example)
const foulWords = ['fuck', 'Shit', 'retard', 'sex']; // Add actual words

// Function to call ChatGPT API
async function getChatGPTResponse(question) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: question }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  return response.data.choices[0].message.content.trim();
}

// Function to check for foul language
function containsFoulLanguage(text) {
  return foulWords.some(word => text.toLowerCase().includes(word));
}

// Handle '/start' command
bot.start((ctx) => {
  ctx.reply('Welcome to the Aspiring Mechanical Engineers Study Group Bot! Ask me any question.');
});

// Welcome new members
bot.on('new_chat_members', (ctx) => {
  ctx.message.new_chat_members.forEach((member) => {
    ctx.reply(`Welcome, @${member.username || member.first_name}! We're glad to have you here.`);
  });
});

// Handle any text messages in group chat
bot.on('text', async (ctx) => {
  const userId = ctx.message.from.id;
  const username = ctx.message.from.username || ctx.message.from.first_name;
  const chatId = ctx.chat.id;
  const messageText = ctx.message.text;

  if (ctx.chat.type === 'private') {
    // Handle private messages
    try {
      const gptResponse = await getChatGPTResponse(messageText);
      ctx.reply(gptResponse);
    } catch (error) {
      console.error('Error getting response from ChatGPT:', error);
      ctx.reply('Sorry, I am having trouble getting a response from the server right now.');
    }
  } else if (chatId === Number(CHAT_ID)) {
    // Handle group messages
    if (containsFoulLanguage(messageText)) {
      if (warnings[userId]) {
        // User has been warned before, remove them
        try {
          await ctx.kickChatMember(userId);
          ctx.reply(`@${username} has been removed for violating the group rules.`);
        } catch (error) {
          console.error('Error removing user:', error);
          ctx.reply('Failed to remove user due to an error.');
        }
      } else {
        // Warn the user
        warnings[userId] = true;
        ctx.reply(`@${username}, please refrain from using foul language. This is a warning.`);
      }
    } else {
      // Process normal messages
      try {
        const gptResponse = await getChatGPTResponse(messageText);
        ctx.reply(gptResponse);
      } catch (error) {
        console.error('Error getting response from ChatGPT:', error);
        ctx.reply('Sorry, I am having trouble getting a response from ChatGPT right now.');
      }
    }
  }
});

// Schedule daily greeting message at 07:00 AM GMT+1
schedule.scheduleJob('0 7 * * *', 'Etc/GMT+1', async () => {
  const message = 'Good morning everyone! Hope you all have a productive day ahead. Let’s crush our study goals today!';
  try {
    await bot.telegram.sendMessage(CHAT_ID, message);
  } catch (error) {
    console.error('Error sending daily greeting message:', error);
  }
});

// Start the bot
bot.launch().then(() => {
  console.log('Bot is running');
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
