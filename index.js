const TelegramBot = require('node-telegram-bot-api');
const { commands } = require('./utils/constants');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { TELEGRAM_SECRET } = process.env;
const webAppUrl = 'https://abuzar-shop.netlify.app/';
const bot = new TelegramBot(TELEGRAM_SECRET, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const { text } = msg;

  if (text === commands.start) {
    await bot.sendMessage(
      chatId,
      'Click the button below and fill out the form',
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: 'Fill out the form',
                web_app: { url: webAppUrl + '/form' },
              },
            ],
          ],
        },
      }
    );

    await bot.sendMessage(chatId, 'Open app', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Order', web_app: { url: webAppUrl } }]],
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      await bot.sendMessage(chatId, 'Thank you for your feedback!');
      await bot.sendMessage(chatId, `Your country: ${data?.country}`);
      await bot.sendMessage(chatId, `Your street: ${data?.street}`);

      setTimeout(async () => {
        await bot.sendMessage(chatId, `You get full info in this chat`);
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

app.post('/web-data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body;

  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Successful purchase',
      input_message_content: {
        message_text: `Congratulations!, You spent ${totalPrice} in total`,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Failed purchase',
      input_message_content: {
        message_text: 'Unfortunately something went wrong during checkout',
      },
    });
    return res.status(500).json({});
  }
});

const PORT = 8000;

app.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`));
