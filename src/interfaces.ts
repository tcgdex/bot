import Message from './Components/Message'

export interface Context {
	prefix: string
	command: string
	args: Array<string>

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
	COMMAND_GROUP,
	STRING,
	INTEGER,
	BOOLEAN,
	USER,
	CHANNEL,
	ROLE,
	MENTIONABLE
}

export interface CommandOptionChoice {
	name: string
	value: string | number
}

interface BaseCommandOptions {
	type: CommandOptionType
	name: string
	description: string
	required?: boolean
}


export type CommandOptions = SubCommandOptions | FieldCommandOptions

export interface SubCommandOptions extends BaseCommandOptions {
	type: CommandOptionType.COMMAND_GROUP
	commands: Array<Command>
}

export interface FieldCommandOptions extends BaseCommandOptions {
	type: CommandOptionType.STRING | CommandOptionType.INTEGER | CommandOptionType.USER | CommandOptionType.ROLE | CommandOptionType.MENTIONABLE
	name: string
	description: string
	choices?: Array<CommandOptionChoice>
	options?: Array<CommandOptions>
}

export interface Command {
	/**
	 * the name of the command
	 */
	name: string

	/**
	 * Displayed description of the command
	 */
	description: string

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

export interface DiscordConfig {
	enabled: boolean
	intents?: Array<string>
	partials?: Array<string>
}

export interface TelegramConfig {
	enabled: boolean
}
