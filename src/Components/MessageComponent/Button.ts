import { MessageButtonOptions, MessageButtonStyle } from 'discord.js'
import { PartialEmojiStructure } from '../Emoji'
import MessageComponent, { MessageComponentStructure } from '.'


export enum ButtonStyle {
	Primary = 1,
	Secondary,
	Success,
	Danger,
	Link,
}

export interface ButtonStructure extends MessageComponentStructure {
	type: 2
	style: ButtonStyle
	label?: string
	emoji?: PartialEmojiStructure
	custom_id?: string
	url?: string
	disabled?: boolean
}

/**
 * Button Component
 */
export default class Button extends MessageComponent<ButtonStructure> {

	public constructor(type: ButtonStyle, customIdOrURL: string) {
		super(2)
		if (type === ButtonStyle.Link) {
			this.definition.url = customIdOrURL
		} else {
			this.definition.custom_id = customIdOrURL
		}
		this.definition.style = type
	}

	public label(): string
	public label(label: string): this
	public label(label?: string) {
		if (label) {
			this.definition.label = label
			return this
		}
		return this.definition.label
	}

	public type(): ButtonStyle
	public type(type: ButtonStyle): this
	public type(type?: ButtonStyle) {
		if (type) {
			this.definition.style = type
			return this
		}
		return this.definition.style
	}

	public customID(): string
	public customID(customID: string): this
	public customID(customID?: string) {
		if (customID) {
			if (customID.length > 100) {
				throw new Error(`CustomIDs can\t be more than 100 characters (${customID})`)
			}
			this.definition.custom_id = customID
			return this
		}
		return this.definition.custom_id
	}

	public url(): string
	public url(url: string): this
	public url(url?: string) {
		if (url) {
			this.definition.url = url
			return this
		}
		return this.definition.url
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

	public toDiscordJS(): MessageButtonOptions {
		return {
			customID: this.customID(),
			style: this.type() as number,
			disabled: this.disabled(),
			label: this.label(),
			url: this.url(),
			type: 2
		}
	}
}
