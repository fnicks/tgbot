import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { WELCOME_MESSAGE } from 'src/consts';
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
      const links = await this.linkService.getAllLinks();

      if (links.length === 0) {
        this.bot.sendMessage(chatId, 'Нет сохраненных ссылок.');
        return;
      }

      const message = links
        .map((link) => `Код: ${link.id}, Название: ${link.internalName}`)
        .join('\n');
      this.bot.sendMessage(chatId, message);
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

  private isValidUrl(url: string): boolean {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(url);
  }
}
