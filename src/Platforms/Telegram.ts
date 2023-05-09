/* eslint-disable max-depth */
/* eslint-disable no-irregular-whitespace */
import Logger from '@dzeio/logger'
import { objectKeys, objectLoop } from '@dzeio/object-util'
import { Telegraf } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import Bot from '../Bot'
import Button from '../Components/Components/Button'
import Select from '../Components/Components/Select'
import Embed from '../Components/Embed'
import Emoji from '../Components/Emoji'
import Message from '../Components/Message'
import { clamp } from '../Utils'
import { Command, Localized, Platform, TelegramConfig, TelegramContext } from '../interfaces'

const logger = new Logger('Platforms/Telegram')

interface TelegramCommand {
	command: string
	description: string
}

export default class Telegram implements Platform {

	public name = 'Telegram'

	public constructor(
		private config: TelegramConfig
	) {}

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
		const locCommands = this.createLocalizedCommands(commands)
		objectLoop(locCommands, (cmd, localization) => {
			bot.telegram.setMyCommands(cmd.map((command) => ({
				command: command.command,
				description: command.description
			})), localization ?{
				language_code: localization
			} : undefined)
			// setup a feedback for each command calls
			for (const command of cmd) {
				bot.command(command.command, async (ctx) => {

					logger.log(`processing command: ${ctx.message.text}`)
					const response = await Bot.get().handleCommand(this.buildContext(
						'/',
						command.command,
						ctx.message.text.split(' ').slice(1),
						(ctx.message.from.language_code ?? localization) as keyof Localized ?? undefined
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
		})


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
			const response = await Bot.get().handleCommand(this.buildContext(
				'',
				commandTxt,
				args,
				ctx.callbackQuery.from.language_code as keyof Localized
			))
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

		return message.row().map<Array<Array<InlineKeyboardButton>>>((row) => {
			const components = row.components().map((component) => {
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
			}).flat(1)

			const subs: Array<Array<InlineKeyboardButton>> = []

			const optionsPerLines = clamp(this.config.components?.select?.optionsPerLines ?? Infinity, 1, 8)

			for (let optIdx = 0; optIdx < components.length; optIdx += optionsPerLines) {
				subs.push(components.slice(optIdx, optIdx + optionsPerLines))
			}


			return subs
		}).flat(1)
	}

	private buildContext(prefix: string, command: string, args: Array<string>, lang?: keyof Localized): TelegramContext {
		return {
			prefix,
			args,
			command,
			platform: this,
			lang: lang
		}
	}

	private arrayUnique<T>(arr: Array<T>): Array<T> {
		return arr.filter((value, key) => arr.indexOf(value) === key)
	}

	// eslint-disable-next-line complexity
	private createLocalizedCommands(commands: Array<Command>): Record<string, Array<TelegramCommand>> {
		const list: Record<string, Array<TelegramCommand>> = {}
		for (const command of commands) {
			// eslint-disable-next-line max-len
			const defaultName = typeof command.name === 'string' ? command.name : command.name[this.config.defaultLang ?? objectKeys(command.name)[0]] as string
			const defaultDescription = typeof command.description === 'string' ? command.description : command.description[this.config.defaultLang ?? objectKeys(command.description)[0]] as string
			let langs: Array<keyof Localized> = []
			if (typeof command.name === 'object') {
				langs.push(...objectKeys(command.name))
			}
			if (typeof command.description === 'object') {
				langs.push(...objectKeys(command.description))
			}
			langs = this.arrayUnique(langs)
			for (const lang of langs) {
				let name = defaultName
				let description = defaultDescription
				if (typeof command.name === 'object') {
					name = command.name[lang] ?? defaultName
				}
				if (typeof command.description === 'object') {
					description = command.description[lang] ?? defaultDescription
				}
				if (!(lang in list)) {
					list[lang] = []
				}
				list[lang].push({command: name, description})
			} if (langs.length === 0) {
				if (!('' in list)) {
					list[''] = []
				}
				list[''].push({command: defaultName, description: defaultDescription})
			}
		}
		const langs = objectKeys(list)
		if (langs.length === 1 && '' in list) {
			langs.push(this.config.defaultLang ?? 'en')
		}
		objectLoop(list[''] ?? {}, (cmd) => {
			for (const lang of langs) {
				list[lang].push(cmd as TelegramCommand)
			}
		})
		delete list['']
		return list
	}

}
