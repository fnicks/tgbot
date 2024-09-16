import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { LINKS_LIST_PAGE_ELEMENTS, WELCOME_MESSAGE } from 'src/consts';
import { LinkService } from 'src/link/link.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;

  constructor(private readonly linkService: LinkService) {}

  onModuleInit() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });

    // Инструкция на команду /start
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, WELCOME_MESSAGE);
    });

    // Сохранение ссылки
    this.bot.onText(/\/save (.+) (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const url = match[1];
      const internalName = match[2];

      if (!this.isValidUrl(url)) {
        this.bot.sendMessage(chatId, 'Неверный URL!');
        return;
      }

      const link = await this.linkService.createLink(url, internalName);
      this.bot.sendMessage(chatId, `Ссылка сохранена! Код: ${link.id}`);
    });

    // Получение списка всех ссылок
    this.bot.onText(/\/list/, async (msg) => {
      const chatId = msg.chat.id;
      await this.sendPaginatedLinks(chatId, 1);
    });

    this.bot.on('callback_query', async (callbackQuery) => {
      const message = callbackQuery.message;
      const data = callbackQuery.data;

      const match = data.match(/list_(\d+)/);
      if (match) {
        const page = parseInt(match[1], 10);
        await this.sendPaginatedLinks(message.chat.id, page);

        // Закрываем всплывающее сообщение (если необходимо)
        this.bot.answerCallbackQuery(callbackQuery.id);
      }
    });

    // Получение ссылки по коду
    this.bot.onText(/\/get (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const id = match[1];

      const link = await this.linkService.getLinkById(id);
      if (!link) {
        this.bot.sendMessage(chatId, 'Ссылка не найдена!');
        return;
      }

      this.bot.sendMessage(chatId, `Ссылка: ${link.url}`);
    });

    // Удаление ссылки
    this.bot.onText(/\/delete (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const id = match[1];

      const link = await this.linkService.getLinkById(id);
      if (!link) {
        this.bot.sendMessage(chatId, 'Ссылка не найдена!');
        return;
      }
      await this.linkService.deleteLink(id);
      this.bot.sendMessage(chatId, 'Ссылка удалена!');
    });
  }

  // Отправка пагинированного списка ссылок
  private async sendPaginatedLinks(chatId: number, page: number) {
    const { links, total } = await this.linkService.getAllLinks(page);
    const totalPages = Math.ceil(total / LINKS_LIST_PAGE_ELEMENTS);

    if (links.length === 0) {
      this.bot.sendMessage(chatId, 'Нет сохранённых ссылок.');
      return;
    }

    let message = `Страница ${page} из ${totalPages}:\n\n`;
    message += links
      .map((link) => `Код: ${link.id}, Название: ${link.internalName}`)
      .join('\n');

    // Создаём inline-кнопки для пагинации
    const inlineKeyboard = [];

    // Добавляем кнопку "Предыдущая", если это не первая страница
    if (page > 1) {
      inlineKeyboard.push({
        text: '⬅️ Предыдущая',
        callback_data: `list_${page - 1}`,
      });
    }

    // Добавляем кнопку "Следующая", если есть следующая страница
    if (page < totalPages) {
      inlineKeyboard.push({
        text: 'Следующая ➡️',
        callback_data: `list_${page + 1}`,
      });
    }

    this.bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [inlineKeyboard],
      },
    });
  }

  private isValidUrl(url: string): boolean {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(url);
  }
}
