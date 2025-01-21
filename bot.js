const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const token = "7622592986:AAFMo7pFWKh0U1__wbkk9OJAWHdnGFDbAGM"; // Tokenni yangilash
const bot = new TelegramBot(token, { polling: true });

const channel = "@androidapk_uzbot"; // Kanal username
const files = {
  112: "https://t.me/fayllarimkayumov/6",
};

// Kanalga obuna holatini tekshirish funksiyasi
async function isUserSubscribed(userId) {
  try {
    const chatMember = await bot.getChatMember(channel, userId);
    return (
      chatMember.status === "member" ||
      chatMember.status === "administrator" ||
      chatMember.status === "creator"
    );
  } catch (error) {
    console.error("Obuna tekshirishda xatolik:", error);
    return false;
  }
}

// Kanal obunasini tekshirishni har doim ishlovchi funksiyaga qo‘shish
async function ensureSubscription(chatId, userId) {
  const subscribed = await isUserSubscribed(userId);
  if (!subscribed) {
    await bot.sendMessage(
      chatId,
      `❌ Siz hali kanalimizga obuna bo'lmagansiz. Iltimos, quyidagi tugmani bosing va obuna bo'ling:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Kanalga obuna bo'lish",
                url: `https://t.me/${channel.slice(1)}`,
              },
              {
                text: "Tekshirish",
                callback_data: "check_subscription",
              },
            ],
          ],
        },
      }
    );
    return false;
  }
  return true;
}

// /start komandasi
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || "Dost";

  // Obuna holatini tekshirish
  const subscribed = await ensureSubscription(chatId, userId);
  if (!subscribed) return;

  // Obuna bo'lgandan keyin xush kelibsiz xabari
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "Bums",
          url: "https://t.me/bums/app?startapp=ref_xvNLpaOO", // Referal link
        },
      ],
      [
        {
          text: "Android apk",
          url: `https://t.me/${channel.slice(1)}`, // Kanalga obuna bo'lish
        },
      ],
      [
        {
          text: "Tekshirish✔",
          callback_data: "check_subscription", // Tekshirish tugmasi
        },
      ],
    ],
  };

  bot.sendMessage(
    chatId,
    `Assalomu alaykum, ${userName}! Botimizga xush kelibsiz! 😊\nKanalimizga obuna bo‘lib, botdan to‘liq foydalanishingiz mumkin.`,
    { reply_markup: keyboard, parse_mode: "HTML" }
  );
});

// Har qanday boshqa xabarni boshqarish
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Obuna holatini tekshirish
  const subscribed = await ensureSubscription(chatId, userId);
  if (!subscribed) return;

  const text = msg.text;

  if (text === "/help") {
    bot.sendMessage(chatId, "bot orqali mod fayllar topshingiz mumkun ✅ ");
    return;
  }
  if (text === "/start") return;

  const number = parseInt(text);
  if (!isNaN(number) && files[number]) {
    const fileId = files[number];
    bot.sendDocument(chatId, fileId).catch((error) => {
      console.error("Fayl yuborishda xatolik:", error);
      bot.sendMessage(
        chatId,
        "Kechirasiz, faylni yuborishda xatolik yuz berdi."
      );
    });
  } else {
    bot.sendMessage(chatId, "Siz yuborgan raqamga mos fayl topilmadi.");
  }
});

// Admin komandasi
bot.onText(/\/admin (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userName = msg.from.username || "Dost";
  const text = match[1];
  const groupUsername = "@foydalanuvchilaruchuntxt";

  console.log("Foydalanuvchi yubordi:", { userName, text });

  try {
    await bot.sendMessage(
      groupUsername,
      `📩 <b>Foydalanuvchi:</b> @${userName}\n<b>Xabar:</b> ${text}`,
      { parse_mode: "HTML" }
    );
    bot.sendMessage(chatId, "Xabaringiz adminga muvaffaqiyatli yuborildi!");
  } catch (error) {
    console.error("Adminga xabar yuborishda xatolik:", error);
    bot.sendMessage(
      chatId,
      "Kechirasiz, xabaringizni adminga yuborishda xatolik yuz berdi."
    );
  }
});

// Callback query uchun tekshirish
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (data === "check_subscription") {
    const subscribed = await isUserSubscribed(userId);

    if (subscribed) {
      bot.sendMessage(
        chatId,
        "Siz kanallarga obuna bo'ldingiz botdan foydalanshingiz mumkun ✅ "
      );
      await bot.deleteMessage(chatId, callbackQuery.message.message_id);
    } else {
      bot.sendMessage(chatId, "❌ Siz hali kanalga obuna bo'lmagansiz!");
      if (text === "/start") return;
    }
  }
});

// Express server sozlamalari
app.get("/", (req, res) => {
  res.send("Telegram bot ishlamoqda!");
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} manzilida ishlamoqda`);
});
