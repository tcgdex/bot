import Embed from '../Components/Embed'
import TCGMessage from '../Components/Message'
import { Command } from '../interfaces'

const cmd: Command = {
	definition: {
		name: 'help',
		description: 'TCGdex Help',
	},
	async all({ commands, prefix }) {

		const embed = new Embed()
		for (const commandName of Object.keys(commands)) {
			const command = commands[commandName]
			const options = command.definition.options?.map((o) => `[${o.name}]`).join(' ')
			const optionsDescriptions = command.definition.options?.map((opt) => `**${opt.name}**\n${opt.description}\nRequired: ${opt.required}\nType: ${opt.type}`)
			embed.addField(
				`\`${prefix} ${command.definition.name} ${options ?? ''}\``,
				`**${command.definition.description ?? ''}**\n${optionsDescriptions ?? ''}`
			)
		}

		return new TCGMessage('test')
			.embed(embed)
	}
}

export default cmd
// https://discord.com/api/oauth2/authorize?client_id=465978667022024704&permissions=2147483664&scope=bot%20applications.commands
