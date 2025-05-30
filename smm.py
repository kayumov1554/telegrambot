from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, CallbackQueryHandler, ContextTypes import os import json import requests from dotenv import load_dotenv



load_dotenv() TOKEN = os.getenv("BOT_TOKEN") API_KEY = os.getenv("API_KEY") API_URL = os.getenv("API_URL")  # masalan: https://panel.url/api/v2

USERS_FILE = "users.json"



def save_user(user_id): if not os.path.exists(USERS_FILE): with open(USERS_FILE, 'w') as f: json.dump({}, f) with open(USERS_FILE, 'r') as f: users = json.load(f) if str(user_id) not in users: users[str(user_id)] = {"balance": 0.0, "orders": []} with open(USERS_FILE, 'w') as f: json.dump(users, f)



def main_menu(): keyboard = [ [KeyboardButton("💰 Balans"), KeyboardButton("➕ To'ldirish")], [KeyboardButton("📦 Xizmatlar"), KeyboardButton("🛒 Buyurtma berish")] ] return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)



async def start(update: Update, context: ContextTypes.DEFAULT_TYPE): user = update.effective_user save_user(user.id) await update.message.reply_text( f"Assalomu alaykum, {user.first_name}!\nXush kelibsiz nakrutka xizmat botiga.", reply_markup=main_menu() )

 

def get_balance(user_id): with open(USERS_FILE, 'r') as f: users = json.load(f) return users[str(user_id)]["balance"]

async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE): user_id = update.effective_user.id bal = get_balance(user_id) await update.message.reply_text(f"Sizning balansingiz: {bal}$")



async def add_funds(update: Update, context: ContextTypes.DEFAULT_TYPE): await update.message.reply_text( "To'lovni quyidagi linklar orqali amalga oshiring:\n" "Click: https://my.click.uz/pay/testlink\n" "Payme: https://payme.uz/testlink\n\n" "To'lovdan keyin 2-5 daqiqa kuting, balansingiz avtomatik yangilanadi." )

 

async def services(update: Update, context: ContextTypes.DEFAULT_TYPE): keyboard = [ [InlineKeyboardButton("TikTok", callback_data="srv_tiktok")], [InlineKeyboardButton("Instagram", callback_data="srv_instagram")], [InlineKeyboardButton("Telegram", callback_data="srv_telegram")] ] reply_markup = InlineKeyboardMarkup(keyboard) await update.message.reply_text("Xizmat turini tanlang:", reply_markup=reply_markup)

  

async def service_selected(update: Update, context: ContextTypes.DEFAULT_TYPE): query = update.callback_query await query.answer() service = query.data.replace("srv_", "") await query.edit_message_text(f"{service.title()} xizmatlarini buyurtma berish funksiyasi tayyorlanmoqda...")



async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE): text = update.message.text if text == "💰 Balans": await balance(update, context) elif text == "➕ To'ldirish": await add_funds(update, context) elif text == "📦 Xizmatlar": await services(update, context) elif text == "🛒 Buyurtma berish": await update.message.reply_text("Xizmat tanlang va buyurtma bering.") else: await update.message.reply_text("Iltimos, menyudagi tugmalardan foydalaning.")


if name == 'main': app = ApplicationBuilder().token(TOKEN).build() app.add_handler(CommandHandler("start", start)) app.add_handler(CallbackQueryHandler(service_selected)) app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)) print("Bot ishga tushdi...") app.run_polling()

