import { ApplicationCommandData, ApplicationCommandOptionData, Client, Guild } from 'discord.js'
import Message from './Message'

export enum ApplicationCommandOptionType {
	SUB_COMMAND = 1,
	SUB_COMMAND_GROUP,
	STRING,
	INTEGER,
	BOOLEAN,
	USER,
	CHANNEL,
	ROLE,
	MENTIONABLE
}

interface ApplicationCommandOptionChoiceStructure {
	name: string
	value: string | number
}

interface ApplicationCommandOptionStructure {
	type: ApplicationCommandOptionType
	name: string
	description: string
	required?: boolean
	choices?: Array<ApplicationCommandOptionChoiceStructure>
	options?: Array<ApplicationCommandOptionStructure>
}

export interface ApplicationCommandStructure {
	name: string
	description: string
	options: Array<ApplicationCommandOptionStructure>
	default_permission?: boolean
}

export interface Inputs {
	commands: Record<string, ApplicationCommand>
	prefix: string
	args: Array<string>
	client: Client
	guild?: Guild | null
}

type CommandFunctionCallback = Promise<Message | string> | Message | string
export type CommandFunction = (inputs: Inputs) => CommandFunctionCallback


export default abstract class ApplicationCommand {

	public abstract readonly definition: ApplicationCommandStructure

	// Fallback if the other functions are not set
	public all?(inputs: Inputs): CommandFunctionCallback

	// Run when a command is launched through the chat
	public messageCommand?(inputs: Inputs): CommandFunctionCallback

	// Run when a command is launched from interactions (Slash or Button/Select Feedback)
	public interactionCommand?(inputs: Inputs): CommandFunctionCallback

	public async processCommand(inputs: Inputs, action: 'message' | 'interaction'): Promise<Message> {
		console.log('Running command', this.definition.name, ...inputs.args)
		let fn: CommandFunction | undefined
		switch (action) {
			case 'message':
				fn = this.messageCommand
				break;
			case 'interaction':
				fn = this.interactionCommand
			default:
				fn = this.all
				break;
		}
		if (!fn && !this.all) {
			throw new Error('Command could not be executed!')
		}
		const res = await (fn as CommandFunction ?? this.all)(inputs)
		return typeof res === 'string' ? new Message(res) : res
	}

	/**
	 * Validate `this.definition`
	 */
	public validate() {
		let total = this.definition.name.length
		total += this.definition.description.length
		if (!/^[\w-]{1,32}$/gu.test(this.definition.name)) {
			throw new Error(`Command Name does not respect the following Regex /^[\w-]{1,32}$/gu (${this.definition.name})`)
		}
		if (this.definition.description.length > 100 || this.definition.description.length < 1) {
			throw new Error(`command does not respect 1 <= description <= 100 (${this.definition.description})`)
		}
		total += this.checkOptions(this.definition.options)
		if (total > 4000) {
			throw new Error(`the total length of names,descriptions and values can't be larger than 4000 characters (${total})`)
		}
	}

	private checkOptions(options?: Array<ApplicationCommandOptionStructure>): number {
		if (!options) {
			return 0
		}
		let len = 0
		if (options.length > 25) {
			throw new Error(`There is more than 25 options for this command (${this.definition.name})`)
		}
		let hasOptionnal = false
		for (const option of options) {

			// Name/Description
			if (!/^[\w-]{1,32}$/gu.test(option.name)) {
				throw new Error(`Option Name does not respect the following Regex /^[\w-]{1,32}$/gu (${option.name})`)
			}
			if (option.description.length > 100 || option.description.length < 1) {
				throw new Error(`command does not respect 1 <= description <= 100 (${option.description})`)
			}

			// Required options
			if (hasOptionnal && option.required) {
				throw new Error(`Required option cannot be after optionnal options (${option.name})`)
			}
			if (!option.required) {
				hasOptionnal = true
			}

			// Choices
			if (option.choices && ![ApplicationCommandOptionType.STRING, ApplicationCommandOptionType.INTEGER].includes(option.type)) {
				throw new Error(`Option (${option.name}) cannot have choices if it\'s not a STRING or INTEGER this command (${ApplicationCommandOptionType[option.type]})`)
			}
			if (option.choices && option.choices.length > 25) {
				throw new Error(`There is more than 25 choices for the option (${option.name}) this command (${this.definition.name})`)
			}
			if (option.choices) {
				for (const choice of option.choices) {
					if (choice.name.length > 100 || choice.name.length < 1) {
						throw new Error(`choice name does not respect 1 <= name <= 100 (${choice.name})`)
					}
					if (typeof choice.value === 'string' && choice.value.length > 100) {
						throw new Error(`choice value cannot be larger than 100 chars (${choice.value})`)
					}
				}
			}

			// Options
			if (option.options && ![ApplicationCommandOptionType.SUB_COMMAND, ApplicationCommandOptionType.SUB_COMMAND_GROUP].includes(option.type)) {
				throw new Error(`Option (${option.name}) cannot have options if it\'s not a SUB_COMMAND or SUB_COMMAND_GROUP this command (${ApplicationCommandOptionType[option.type]})`)
			}
			if (option.options) {
				len += this.checkOptions(option.options)
			}

			len += option.name.length + option.description.length
		}
		return len
	}

	public definitionToDiscordJS(): ApplicationCommandData {
		return {
			...this.definition,
			options: this.optionsToDiscordJS(this.definition.options)
		}
	}

	private optionsToDiscordJS(options: Array<ApplicationCommandOptionStructure>): Array<ApplicationCommandOptionData> {
		return this.definition.options.map((o) => ({
			...o,
			type: this.typeToDiscordJS(o.type),
			options: o.options ? this.optionsToDiscordJS(o.options) : undefined
		}))
	}

	private typeToDiscordJS(app: ApplicationCommandOptionType) {
		return ApplicationCommandOptionType[app] as 'BOOLEAN'
	}
}
