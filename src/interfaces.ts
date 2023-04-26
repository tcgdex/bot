import Message from './Components/Message'

export interface Context {
	prefix: string
	command: string
	args: Array<string>

	/**
	 * Discord or Telegram depending the client that ask the command
	 */
	client: Client
}

type OptionnalPromise<T> = Promise<T> | T

export enum CommandOptionType {
	SUB_COMMAND,
	SUB_COMMAND_GROUP,
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

export interface CommandOptions {
	type: CommandOptionType
	name: string
	description: string
	required?: boolean
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
}

/**
 * interface managing underlying clients
 */
export interface Client {
	/**
	 * initialize the underlying client bot
	 */
	init(): Promise<void>
}

export interface DiscordContext extends Context {

}

export interface TelegramContext extends Context {

}

export interface DiscordConfig {
	enabled: boolean
	intents?: Array<string>
}

export interface TelegramConfig {
	enabled: boolean
}
