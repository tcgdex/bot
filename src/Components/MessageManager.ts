import { Command, CommandFunction, Inputs } from '../interfaces'
import Message from './Message'

/**
 * Global manager for messages
 */
export default class MessageManager {
	public static async processCommand(command: Command, inputs: Inputs, action: 'message' | 'slash' | 'button'): Promise<Message> {
		console.log('Running command', command.definition.name, ...inputs.args)
		const result = await this.getCommandFunction(command, action)(inputs)
		if (typeof result === 'string') {
			return new Message(result)
		}
		return result
	}

	public static getCommandFunction(command: Command, action: 'message' | 'slash' | 'button'): CommandFunction {
		if (action === 'message' && command.messageCommand) {
			return command.messageCommand
		}
		if (action === 'slash' && command.slashCommand) {
			return command.slashCommand
		}
		if (action === 'button' && command.buttonCommand) {
			return command.buttonCommand
		}
		if (!command.all) {
			throw new Error('Command not found!')
		}
		return command.all
	}
}
