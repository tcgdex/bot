import Logger from '@dzeio/logger'
import { objectValues } from '@dzeio/object-util'
import { Telegraf } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import Bot from '../Bot'
import Button from '../Components/Components/Button'
import Select from '../Components/Components/Select'
import Embed from '../Components/Embed'
import Message from '../Components/Message'
import { Client } from '../interfaces'

const logger = new Logger('Client/Telegram')

export default class Telegram implements Client {

	public get token(): string {
		const token = process.env.TELEGRAM_TOKEN
		if (!token) {
			throw new Error('Telegram token not set')
		}
		return token
	}

	public async init(): Promise<void> {
		logger.log('loading...')

		const commands = await Bot.get().getCommands()

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
				const response = await command.execute({
					prefix: '/',
					args: ctx.message.text.split(' ').slice(1),
					client: this
				})
				ctx.replyWithMarkdownV2(this.formatMessage(response), {
					reply_markup: {
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
			const command = commands[args.shift() ?? '']
			if (!command) {
				ctx.reply('command not found!')
				return
			}
			const response = await command.execute({
				prefix: '/',
				args: args,
				client: this
			})
			ctx.replyWithMarkdownV2(this.formatMessage(response), {
				reply_markup: {
					inline_keyboard: this.formatMarkup(response)
				}
			})
			logger.log(`command processed: ${text}`)
		})
		bot.launch()
		logger.log(`Loaded as ${(await bot.telegram.getMe()).username}`)
	}

	private formatMessage(message: Message | string): string {
		if (typeof message === 'string') {
			return message
		}
		return `${message.text()}

${message.embed().map(this.formatEmbed)}
`.replace(/([()<>\-.+])/g, '\\$1')
	}

	private formatEmbed(embed: Embed) {
		return `${embed.title()}

${embed.description()}

${embed.field().map((field) => `${field.name}
${field.value}`).join('\n\n')}

${embed.footer()}`
	}

	private formatMarkup(message: Message | string): Array<Array<InlineKeyboardButton>> {
		if (typeof message === 'string') {
			return []
		}

		return message.row().map<Array<InlineKeyboardButton>>((row) => row.components().map((component) => {
			if (component instanceof Button) {
				return {
					text: component.label(),
					callback_data: component.customID(),
					url: component.url()
				}
			// because we can't have selectors, we display a big list of buttons
			} else if (component instanceof Select) {
				return component.option().map((choice) => ({
					text: choice.label,
					callback_data: `${component.customID()} ${choice.value}`
				}))
			}
			throw new Error('unhandled type')
		}).flat(1))

	}

}
