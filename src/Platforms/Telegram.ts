/* eslint-disable no-irregular-whitespace */
import Logger from '@dzeio/logger'
import { objectValues } from '@dzeio/object-util'
import { Telegraf } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import Bot from '../Bot'
import Button from '../Components/Components/Button'
import Select from '../Components/Components/Select'
import Embed from '../Components/Embed'
import Emoji from '../Components/Emoji'
import Message from '../Components/Message'
import { Platform, TelegramContext } from '../interfaces'

const logger = new Logger('Platforms/Telegram')

export default class Telegram implements Platform {

	public name = 'Telegram'

	public get token(): string {
		const token = process.env.TELEGRAM_TOKEN
		if (!token) {
			throw new Error('Telegram token not set')
		}
		return token
	}

	public async init(): Promise<void> {
		logger.log('loading...')

		const commands = await Bot.get().getCommands(this)

		const bot = new Telegraf(this.token)

		// set the bot commands
		bot.telegram.setMyCommands(objectValues(commands).map((command) => ({
			command: command.name,
			description: command.description
		})))

		// setup a feedback for ech command calls
		for (const command of objectValues(commands)) {
			bot.command(command.name, async (ctx) => {
				logger.log(`processing command: ${ctx.message.text}`)
				const response = await Bot.get().handleCommand(this.buildContext(
					'/',
					command.name,
					ctx.message.text.split(' ').slice(1)
				))
				ctx.replyWithMarkdownV2(this.formatMessage(response), {
					reply_markup: {
						resize_keyboard: true,
						inline_keyboard: this.formatMarkup(response)
					}
				})
				logger.log(`command processed: ${ctx.message.text}`)
			})
		}

		// handle callback from a button click
		bot.on('callback_query', async (ctx) => {
			// @ts-expect-error data is present
			const text: string = ctx.callbackQuery.data
			logger.log(`processing command: ${text}`)
			const args = text.split(' ')
			const commandTxt = args.shift()
			if (!commandTxt) {
				return
			}
			const command = commands[commandTxt]
			if (!command) {
				ctx.reply('command not found!')
				return
			}
			const response = await Bot.get().handleCommand(this.buildContext('', commandTxt, args))
			try {
				ctx.editMessageText(this.formatMessage(response), {
					parse_mode: 'MarkdownV2',
					reply_markup: {
						inline_keyboard: this.formatMarkup(response)
					}
				})
			} catch (error) {
				logger.warn('command failed being edited', error)
			}
			logger.log(`command processed: ${text}`)
		})
		bot.launch()
		logger.log(`Loaded as ${(await bot.telegram.getMe()).username}`)
	}

	private formatMessage(message: Message | string): string {
		if (typeof message === 'string') {
			return Emoji.formatText(message, () => '')
				.replace(/([()<>\-.+!?#=()])/g, '\\$1')
				.replace(/undefined/g, '')
				.replace(/\n{2,}/g, '\n\n')
		}
		const msg = `${message.text()}

${message.embed().map(this.formatEmbed)}`

		return Emoji.formatText(msg, () => '')
			.replace(/([()<>\-.+!?#=()])/g, '\\$1')
			.replace(/undefined/g, '')
			.replace(/\n{2,}/g, '\n\n')
	}

	private formatEmbed(embed: Embed) {
		return `*${embed.title()}*

${embed.image()?.url}

${embed.description()}

${embed.field().map((field) => `*${field.name}*
${field.value}`).join('\n\n')}

${embed.footer()?.text}`
	}

	private formatMarkup(message: Message | string): Array<Array<InlineKeyboardButton>> {
		if (typeof message === 'string') {
			return []
		}

		return message.row().map<Array<InlineKeyboardButton>>((row) => row.components().map((component) => {
			if (component instanceof Button) {
				return {
					text: component.label(),
					callback_data: component.callback(),
					url: component.url()
				}
			// because we can't have selectors, we display a big list of buttons
			} else if (component instanceof Select) {
				return component.options().map((choice) => ({
					text: choice.label,
					callback_data: `${component.callback()} ${choice.value}`
				}))
			}
			throw new Error('unhandled type')
		}).flat(1))

	}

	private buildContext(prefix: string, command: string, args: Array<string>): TelegramContext {
		return {
			prefix,
			args,
			command,
			platform: this
		}
	}

}
