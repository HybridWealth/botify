const { Telegraf } = require('telegraf');
const schedule = require('node-schedule');
const pdfParse = require('pdf-parse');
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = '6870199671:AAG2YKZwGy0qCG9TJjt0TrQdBGrbzgllXpE';
const CHAT_ID = '2090071905'; // Replace with your group chat ID

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// In-memory store for warnings, PDF text content, and greetings
const warnings = {};
let pdfTextContent = '';
let learningMode = false;
const greetings = [];

// List of foul language words (example)
const foulWords = ['badword1', 'badword2', 'badword3']; // Add actual words

// Function to check for foul language
function containsFoulLanguage(text) {
  return foulWords.some(word => text.toLowerCase().includes(word));
}

// Handle '/start' command
bot.start((ctx) => {
  ctx.reply('Welcome to the Aspiring Mechanical Engineers Study Group Bot! Send me a PDF and ask questions based on its content.');
});

// Handle '/learn' command
bot.command('learn', (ctx) => {
  learningMode = true;
  ctx.reply('I am ready to accept a PDF file for information processing. Please send the PDF file now.');
});

// Welcome new members and learn from greetings
bot.on('new_chat_members', (ctx) => {
  ctx.message.new_chat_members.forEach((member) => {
    const greetingMessage = `Welcome, @${member.username || member.first_name}! We're glad to have you here.`;
    greetings.push(greetingMessage);
    ctx.reply(greetingMessage);
  });
});

// Handle any text messages in group chat
bot.on('text', async (ctx) => {
  const userId = ctx.message.from.id;
  const username = ctx.message.from.username || ctx.message.from.first_name;
  const chatId = ctx.chat.id;
  const messageText = ctx.message.text;

  // Learn from user interactions
  if (!greetings.includes(messageText) && !containsFoulLanguage(messageText)) {
    greetings.push(messageText);
  }

  if (ctx.chat.type === 'private') {
    // Handle private messages
    if (pdfTextContent) {
      const response = getPDFResponse(messageText);
      ctx.reply(response);
    } else {
      ctx.reply('Please send a PDF file first.');
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
      if (pdfTextContent) {
        const response = getPDFResponse(messageText);
        ctx.reply(response);
      } else {
        ctx.reply('Please send a PDF file first.');
      }
    }
  }
});

// Function to handle PDF files
bot.on('document', async (ctx) => {
  if (learningMode) {
    const fileId = ctx.message.document.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    // Download and parse the PDF
    try {
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      const data = await pdfParse(response.data);
      pdfTextContent = data.text;
      learningMode = false; // Exit learning mode
      ctx.reply('PDF content has been processed and stored. You can now ask questions based on the PDF.');
    } catch (error) {
      console.error('Error parsing PDF:', error);
      ctx.reply('Failed to process the PDF file.');
    }
  } else {
    ctx.reply('Please use the /learn command before sending a PDF file.');
  }
});

// Simple keyword search function to respond based on PDF content
function getPDFResponse(query) {
  const sentences = pdfTextContent.split('.'); // Split PDF content into sentences
  const matches = sentences.filter(sentence => sentence.toLowerCase().includes(query.toLowerCase()));
  return matches.length > 0 ? matches.join('. ') + '.' : 'No relevant information found in the PDF.';
}

// Schedule daily greeting message at 07:00 AM GMT+1
schedule.scheduleJob('0 7 * * *', 'Etc/GMT+1', async () => {
  const message = greetings.length > 0 ? greetings[Math.floor(Math.random() * greetings.length)] : 'Good morning everyone! Hope you all have a productive day ahead. Let’s crush our study goals today!';
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

