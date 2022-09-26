import { MessageActionRowOptions } from 'discord.js'
import MessageComponent, { MessageComponentStructure, MessageComponentType } from '.'

export interface ActionRowStructure extends MessageComponentStructure {
	type: 1
	components: Array<MessageComponent>
}

export default class ActionRow extends MessageComponent<ActionRowStructure> {
	private subType?: MessageComponentType
	public constructor(...subComponents: Array<MessageComponent>) {
		super(1)
		this.definition.components = []
		if (subComponents.length === 0) {
			return
		}
		this.subType = subComponents[0].definition.type

		this.addComponent(...subComponents)
	}

	public addComponent(...components: Array<MessageComponent>) {
		if (components.length === 0) {
			return
		}
		if (!this.subType && components[0].definition.type !== 1) {
			this.subType = components[0].definition.type
		}
		const error = components.findIndex((s) => s.definition.type === 1 || s.definition.type !== this.subType)
		if (error !== -1) {
			if (components[error].definition.type === 1) {
				throw new Error('An Action row cannot contains another ActionRow')
			}
			throw new Error('An Action row cannot contains differents types of elements')
		}
		if (
			this.subType === 2 && this.definition.components.length >= 5 ||
			this.subType === 3 && this.definition.components.length >= 1
		) {
			throw new Error(`Can't add more of this component to the row (${MessageComponentType[this.subType]})`)
		}
		this.definition.components.push(...components)
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public removeComponent() {}

	public toDiscordJS(): MessageActionRowOptions {
		return {type: 'ACTION_ROW', components: this.definition.components.map((v) => (v as any).toDiscordJS())}
	}
}
