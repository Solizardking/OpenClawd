/**
 * Telegram Bot Service
 * Command handling, message routing, admin controls
 */

import { Bot, Context, GrammyError } from 'grammy';

export interface TelegramMessage {
  text: string;
  chatId: number;
  fromId: number;
}

type CommandHandler = (ctx: TelegramContext) => Promise<void> | void;

class TelegramContext {
  message: TelegramMessage;
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
    this.message = {
      text: ctx.message?.text || '',
      chatId: ctx.chat?.id || 0,
      fromId: ctx.from?.id || 0,
    };
  }

  async reply(text: string): Promise<void> {
    await this.ctx.reply(text);
  }
}

export class TelegramService {
  private bot: Bot;
  private adminIds: Set<number>;
  private commandHandlers: Map<string, CommandHandler[]> = new Map();

  constructor(botToken: string, adminIds: string[]) {
    this.bot = new Bot(botToken);
    this.adminIds = new Set(adminIds.map(id => parseInt(id)).filter(n => !isNaN(n)));
    
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    // Admin-only command middleware
    this.bot.use(async (ctx, next) => {
      const text = ctx.message?.text || '';
      
      // Check if command is admin-only
      if (text.startsWith('/spawn') || text.startsWith('/kill')) {
        const userId = ctx.from?.id;
        if (!this.adminIds.has(userId || 0)) {
          await ctx.reply('🦞 Only leviathan masters can use this command.');
          return;
        }
      }
      
      await next();
    });
  }

  onCommand(command: string, handler: CommandHandler): void {
    const cmd = command.toLowerCase().replace(/^\//, '');
    
    this.bot.command(cmd, async (ctx) => {
      const telegramCtx = new TelegramContext(ctx);
      await handler(telegramCtx);
    });
  }

  onMessage(handler: (ctx: TelegramContext) => Promise<void> | void): void {
    this.bot.on('message:text', async (ctx) => {
      const text = ctx.message?.text || '';
      
      // Skip commands (they're handled by onCommand)
      if (text.startsWith('/')) return;
      
      const telegramCtx = new TelegramContext(ctx);
      await handler(telegramCtx);
    });
  }

  async start(): Promise<void> {
    try {
      await this.bot.start();
      console.log('🦞 Telegram bot started');
    } catch (error) {
      if (error instanceof GrammyError) {
        console.error('Telegram bot error:', error.message);
      } else {
        throw error;
      }
    }
  }

  async stop(): Promise<void> {
    await this.bot.stop();
  }

  async sendMessage(chatId: number, text: string): Promise<void> {
    await this.bot.api.sendMessage(chatId, text);
  }

  isAdmin(userId: number): boolean {
    return this.adminIds.has(userId);
  }
}