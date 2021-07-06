export enum MessageComponentType {
	ActionRow = 1,
	Button,
	Select
}

export interface MessageComponentStructure {
	type: MessageComponentType
}

interface ButtonStructure extends MessageComponentStructure {

}

export default abstract class MessageComponent<T extends MessageComponentStructure = MessageComponentStructure> {

	public definition: T = {} as any

	public constructor (type: MessageComponentStructure['type'] | 'Button' | 'Row' | 'Select') {
		if (typeof type === 'string') {
			switch (type) {
				case 'Row':
					type = 1
					break;
				case 'Button':
					type = 2
					break;
				case 'Select':
					type = 3
					break;

				default:
					break;
			}
		}
		this.definition.type = type
	}
}
