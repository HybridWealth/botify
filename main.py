#!/usr/bin/env python3

import os
import fitz  
from telegram import Update, Chat
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# Constants
TELEGRAM_BOT_TOKEN = 'TELEGRAM_BOT_TOKEN'
DATA_STORE = "data_store.txt"

# Function to extract text from PDF
def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

# Function to save extracted text to a file
def save_extracted_text(text):
    with open(DATA_STORE, "a") as file:
        file.write(text + "\n")

# Function to load extracted text from the data store
def load_extracted_text():
    if not os.path.exists(DATA_STORE):
        return ""
    with open(DATA_STORE, "r") as file:
        return file.read()

# Command handler for /start
def start(update: Update, context: CallbackContext):
    update.message.reply_text('Welcome to the Aspiring Mechanical Engineers Study Group Bot! Send me a PDF file to learn from it.')

# Function to handle PDF files
def handle_document(update: Update, context: CallbackContext):
    file = context.bot.get_file(update.message.document.file_id)
    file_path = f"downloads/{update.message.document.file_name}"
    file.download(file_path)
    
    text = extract_text_from_pdf(file_path)
    save_extracted_text(text)
    update.message.reply_text('PDF processed and information stored.')

# Function to handle text messages
def handle_text(update: Update, context: CallbackContext):
    message_text = update.message.text
    extracted_text = load_extracted_text()

    if '?' in message_text:
        # Simple question detection
        query = message_text.split('?')[0]
        if query.strip().lower() in extracted_text.lower():
            update.message.reply_text(f"Information about '{query.strip()}': {extracted_text}")
        else:
            update.message.reply_text(f"Sorry, I don't have information about '{query.strip()}'.")
    else:
        update.message.reply_text("I'm here to help with questions about the information in the PDFs.")

# Main function to set up the bot
def main():
    updater = Updater(TELEGRAM_BOT_TOKEN, use_context=True)
    dispatcher = updater.dispatcher

    # Create download directory if it doesn't exist
    if not os.path.exists("downloads"):
        os.makedirs("downloads")

    # Handlers
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(MessageHandler(Filters.document.pdf, handle_document))
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, handle_text))

    # Start the Bot
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
