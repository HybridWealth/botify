const TelegramBot = require('node-telegram-bot-api');
const tls = require('node:tls');
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const cron = require('node-cron');


// Replace 'YOUR_BOT_TOKEN' with your actual bot token
const bot = new Telegraf('6870199671:AAG2YKZwGy0qCG9TJjt0TrQdBGrbzgllXpE');
const chatId = '2060484332'; // Replace with your group chat ID

// Command handler for '/start'
bot.start((ctx) => {
    console.log(ctx.from);
    ctx.reply('Hello there! You are interacting with Botify created by @Hybrid_Wealth.');
});

// Function to send reminders
function sendReminder(message) {
    bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
}

// Schedule the reminders...
const reminders = [
    { timeBefore: -12, text: 'Hello everyone! Just a friendly reminder: Prayer Meeting in 12 hours! 🕒' },
    { timeBefore: -2, text: 'Meeting in 2 hours! 🕝' },
    { timeBefore: -0.5, text: 'Meeting in 30 minutes! 🕒' }
];

// Schedule the meetings on Tuesdays and Fridays at 10:00 GMT+1
cron.schedule('0 22 * * 2', () => {
    const now = new Date();
    const time = now.setHours(now.getHours() + 1); // GMT+1

    reminders.forEach((reminder) => {
        const reminderTime = new Date(time);
        reminderTime.setHours(reminderTime.getHours() + reminder.timeBefore);

        schedule.scheduleJob(reminderTime, () => {
            sendReminder(reminder.text);
        });
    });

    // Notify about the meeting at the scheduled time
    sendReminder('Meeting starting now! 🎉');
    {
        timezone: 'Europe/London' // Adjust timezone as needed
    }
});

// Handle new members joining the chat
bot.on('new_chat_members', async (ctx) => {
    const newMembers = ctx.message.new_chat_members;

    let welcomeMessage = 'Welcome';

    newMembers.forEach((member, index) => {
        if (member.username) {
            welcomeMessage += ` @${member.username}! 🎉`;
        } else if (member.first_name) {
            welcomeMessage += ` ${member.first_name}! 🎉`;
        }

        if (index < newMembers.length - 1) {
            welcomeMessage += ',';
        }
    });

    welcomeMessage += '\n\nThis group\'s meeting is scheduled for Tuesdays at 10:00PM - 11:00PM GMT+1.\n\n\
    Please make sure to be present and invites your friends & family along. God bless You\n\n\
    Best regards, Ẹ̀mí awọn Wòólì'; // Formal closing

    // Send a welcome message including meeting times
    await ctx.reply(welcomeMessage);
});


// Your ESV API key
const apiKey = '05c561791c953957257f067e03ce4faac14271f0';

// Function to get a daily Bible verse
async function getDailyVerse() {
  try {
    const response = await axios.get(`https://api.esv.org/v3/passage/text/?q=dailyVerse&include-verse-numbers=false&include-footnotes=false&include-footnote-body=false&include-headings=false&include-chapter-numbers=false&include-audio-link=false`, {
      headers: {
        Authorization: `Token ${apiKey}`
      }
    });

    return response.data.passages[0]; // Assuming ESV API returns passage in passages array
  } catch (error) {
    console.error('Error fetching daily verse:', error);
    return null;
  }
}


// Function to send daily verse to the group
async function sendDailyVerse() {
  const verse = await getDailyVerse();

  if (verse) {
    const groupChatId = '2060484332'; // Replace with your group's chat ID
    bot.telegram.sendMessage(groupChatId, `Good Day you all. Kindly grow in spirit on this blessed day with this Daily Bible verse:\n\n${verse}`);
  }
}

// Schedule the task to run daily at a specific time (change the cron schedule as needed)
cron.schedule('0 7,14,15,20 * * *', () => {
	const now = new Date();
	const time = now.setHours(now.getHours() + 1); // GMT+1
  // This will run the function to send the daily verse at 9 AM (change the time as needed)
  sendDailyVerse();
  {
    timezone: 'Europe/London' // Adjust time }
  }
});




// Start the bot
bot.launch().then(() => {
    console.log('Bot started');
}).catch((err) => {
    console.error('Error starting bot:', err);
});
