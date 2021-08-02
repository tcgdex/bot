import { MessageSelectMenuOptions } from 'discord.js'
import MessageComponent, { MessageComponentStructure } from '.'
import { PartialEmojiStructure } from '../Emoji'

export interface SelectOptionStructure {
	label: string
	value: string
	description?: string
	emoji?: PartialEmojiStructure
	default?: boolean
}

export interface SelectStructure extends MessageComponentStructure {
	custom_id: string
	options: Array<SelectOptionStructure>
	placeholder?: string
	min_value?: number
	max_values?: number
}

export default class Select extends MessageComponent<SelectStructure> {

	public constructor(customID: string) {
		super(3)
		this.definition.custom_id = customID
		this.definition.options = []
	}

	public customID(): string
	public customID(customID: string): this
	public customID(customID?: string) {
		if (customID) {
			this.definition.custom_id = customID
			return this
		}
		return this.definition.custom_id
	}

	public placeholder(): string
	public placeholder(placeholder: string): this
	public placeholder(placeholder?: string) {
		if (placeholder) {
			this.definition.placeholder = placeholder
			return this
		}
		return this.definition.placeholder
	}

	public addOption(label: string, value: string, options?: {description?: string, emoji?: PartialEmojiStructure, default?: boolean}) {
		return this.definition.options.push({label, value, ...options}) - 1
	}

	public removeOption(index: number) {
		this.definition.options.splice(index, 1)
		return this
	}

	public option(): Array<SelectOptionStructure>
	public option(index: number): SelectOptionStructure
	public option(index: number, label: string, value: string, options?: {description?: string, emoji?: PartialEmojiStructure, default?: boolean}): this
	public option(index?: number, label?: string, value?: string, options?: {description?: string, emoji?: PartialEmojiStructure, default?: boolean}) {
		if (index && label && value) {
			this.definition.options[index] = {label, value, ...options}
			return this
		} else if (!index) {
			return this.definition.options
		}
		return this.definition.options[index]
	}

	public toDiscordJS(): MessageSelectMenuOptions {
		return {
			type: 3,
			customId: this.definition.custom_id,
			maxValues: this.definition.max_values,
			minValues: this.definition.min_value,
			placeholder: this.definition.placeholder,
			options: this.definition.options.map((o) => ({
				default: o.default,
				description: o.description,
				// emoji: o.
				label: o.label,
				value: o.value
			}))
		}
	}
}
