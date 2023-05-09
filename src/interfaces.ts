import Message from './Components/Message'

export interface Context {
	prefix: string
	command: string
	args: Array<string>

	/**
	 * if the request language is known, add it to the context
	 */
	lang?: keyof Localized

	/**
	 * Discord or Telegram depending the client that ask the command
	 */
	platform: Platform
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DiscordContext extends Context {

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TelegramContext extends Context {

}

type OptionnalPromise<T> = Promise<T> | T

export enum CommandOptionType {
	/**
	 * group of commands
	 */
	COMMANDS,
	STRING,
	INTEGER,
	BOOLEAN,
	USER,
	CHANNEL,
	ROLE,
	MENTIONABLE
}

export interface CommandOptionChoice {
	name: string | Localized
	value: string | number
}

interface BaseCommandOptions {
	type: CommandOptionType
	name: string | Localized
	description: string | Localized
	required?: boolean
}


export type CommandOptions = SubCommandOptions | FieldCommandOptions

export interface SubCommandOptions extends BaseCommandOptions {
	type: CommandOptionType.COMMANDS
	commands: Array<Command>
}

export interface FieldCommandOptions extends BaseCommandOptions {
	type: CommandOptionType.STRING | CommandOptionType.INTEGER | CommandOptionType.USER | CommandOptionType.ROLE | CommandOptionType.MENTIONABLE
	choices?: Array<CommandOptionChoice>
	options?: Array<CommandOptions>
}

export interface Localized<T = string> {
	id?: T
	da?: T
	de?: T
	en?: T
	es?: T
	fr?: T
	hr?: T
	it?: T
	lt?: T
	hu?: T
	nl?: T
	no?: T
	pl?: T
	pt?: T
	ro?: T
	fi?: T
	sv?: T
	vi?: T
	tr?: T
	cs?: T
	el?: T
	bg?: T
	ru?: T
	uk?: T
	hi?: T
	th?: T
	zh?: T
	ja?: T
	ko?: T
}

export interface Command {
	/**
	 * the name of the command
	 */
	name: string | Localized

	/**
	 * Displayed description of the command
	 */
	description: string | Localized

	/**
	 * Command execution options
	 */
	options?: Array<CommandOptions>

	/**
	 * TODO: find what it means lol
	 */
	default_permission?: boolean

	/**
	 * execute the command
	 *
	 * @param inputs inputs necessary for the command to work
	 */
	execute(inputs: Context): OptionnalPromise<Message | string>
	availableOn?(client: Platform): boolean
}

/**
 * interface managing underlying clients
 */
export interface Platform {
	/**
	 * the platform display name
	 */
	name: string
	/**
	 * initialize the underlying client bot
	 */
	init(): Promise<void>
}

export interface Config {
	defaultLang?: keyof Localized
}

export interface DiscordConfig extends Config {
	enabled: boolean
	intents?: Array<string>
	partials?: Array<string>
	componentsLimit?: string | Localized
}

export interface TelegramConfig extends Config {
	enabled: boolean
	components?: {
		select?: {
			optionsPerLines?: number
		}
	}
}
