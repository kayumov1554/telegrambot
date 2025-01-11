const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const token = "7297351320:AAEThpSy0o3-agW3HG6KKziCqxuKOJsnzIY";
const bot = new TelegramBot(token, { polling: true });

const groupUsername = "@foydalanuvchilaruchuntxt";

const files = {
  112: "https://t.me/fayllarimkayumov/4",
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || "Dost";

  bot.sendMessage(
    chatId,
    `Assalomu alaykum, ${userName}! Botimizga xush kelibsiz! 😊\nRaqam yuboring, sizga mos faylni yuboramiz.👇`,
    { parse_mode: "HTML" }
  );
  if (msg.new_chat_members) {
    const newMembers = msg.new_chat_members; // Yangi foydalanuvchilar ro'yxati
    newMembers.forEach((member) => {
      const username = member.username
        ? `@${member.username}`
        : member.first_name || "Noma'lum foydalanuvchi";
      const chatId = msg.chat.id;

      bot
        .sendMessage(
          groupUsername,
          `🎉 Yangi foydalanuvchi qo'shildi: ${username}`,
          { parse_mode: "HTML" }
        )
        .catch((error) => {
          console.error("Guruhga xabar yuborishda xatolik:", error);
        });
    });
  }
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") return;
  if (text === "/help") return;

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
  } else if (!text.startsWith("/admin")) {
    bot.sendMessage(chatId, "siz yuborgan raqamda fayl mavjud emas");
  }
});

bot.onText(/\/admin (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userName = msg.from.username || "Noma'lum";
  const text = match[1];
  const message = msg.message_id;

  console.log("Foydalanuvchi yubordi:", { userName, text });

  bot
    .sendMessage(
      groupUsername,
      `📩 <b>Foydalanuvchi:</b> @${userName}\n<b>Xabar:</b> ${text}`,
      { parse_mode: "HTML" }
    )
    .then(() => {
      bot.sendMessage(chatId, "Xabaringiz adminga muvaffaqiyatli yuborildi!");
    })
    .catch((error) => {
      console.error("adminga xabar yuborishda xatolik:", error);
      bot.sendMessage(
        chatId,
        "Kechirasiz, xabaringizni adminga yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      );
    });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `<b>Assalomu alaykum, 112 raqam CapCut Pro agar szga boshqa fayllar kerak bo'lsa /admin ga habar bering tez orada qo'shamiz: </b>`,
    {
      parse_mode: "HTML",
    }
  );
});

app.get("/", (req, res) => {
  res.send("Telegram bot ishlamoqda!");
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} manzilida ishlamoqda`);
});
