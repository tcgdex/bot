import { MessageButtonOptions, MessageButtonStyle } from 'discord.js';

/**
 * Button Component
 */
export default class Button {

	private definition: MessageButtonOptions = {style: 'PRIMARY'}

	public constructor(type: MessageButtonStyle) {
		this.definition.style = type
	}

	public static primary(label?: string, customID?: string) {
		return new Button('PRIMARY')
			.label(label)
			.customID(customID)
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

	public type(): MessageButtonStyle
	public type(type: MessageButtonStyle): this
	public type(type?: MessageButtonStyle) {
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

	public toDiscordJS(): MessageButtonOptions {
		return {
			customID: this.customID(),
			style: this.type(),
			disabled: this.disabled(),
			label: this.label(),
			type: 'BUTTON'
		}
	}
}
