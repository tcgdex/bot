import { MessageSelectMenuOptions, MessageSelectOptionData } from 'discord.js'

export default class Select {

	private definition: MessageSelectMenuOptions = {
		type: 'SELECT_MENU'
	}

	public customID(): string
	public customID(customID: string): this
	public customID(customID?: string) {
		if (customID) {
			this.definition.customID = customID
			return this
		}
		return this.definition.customID
	}

	public disabled(): boolean
	public disabled(disabled: boolean): this
	public disabled(disabled?: boolean) {
		if (typeof disabled === 'boolean') {
			this.definition.disabled = disabled
			return this
		}
		return this.definition.disabled
	}

	public option(index: number): MessageSelectOptionData
	public option(index: number | 'add', label: string, value: string): this
	public option(index: number | 'add', label?: string, value?: string) {
		if (label && value && index) {
			if (!this.definition.options) {
				this.definition.options = []
			}
			if (index === 'add') {
				this.definition.options.push({label, value})
			} else {
				this.definition.options[index] = {label, value}

			}
			return this
		}
		if (!index || index === 'add') {
			throw new Error('Please provide an index')
		}
		return (this.definition.options as Array<MessageSelectOptionData>)[index]
	}

	public toDiscordJS(): MessageSelectMenuOptions {
		return this.definition
	}
}
