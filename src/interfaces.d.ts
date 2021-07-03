import { ApplicationCommandData, Client, Guild, MessagePayload, WebhookMessageOptions } from 'discord.js'
import Message from './Components/Message'

type Response = string | MessagePayload | Omit<WebhookMessageOptions, 'username' | 'avatarURL'>

export interface Inputs {
	commands: Record<string, Command>
	prefix: string
	args: Array<string>
	client: Client
	guild?: Guild | null
}

export type CommandFunction = (inputs: Inputs) => Promise<Message | string> | Message | string

export interface Command {
	definition: ApplicationCommandData

	// Fallback if the other functions are not set
	all?: CommandFunction

	// Run when a command is launched through the chat
	messageCommand?: CommandFunction

	// Run when a command is launched with Slash commands
	slashCommand?: CommandFunction

	// run when a command is launched with buttons
	buttonCommand?: CommandFunction
}
