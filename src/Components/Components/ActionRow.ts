import Component, { ComponentType } from './Component'

export default class ActionRow extends Component {

	private _components: Array<Component> = []

	public constructor() {
		super(ComponentType.ActionRow)
	}

	public components(): Array<Component>
	public components(components?: Array<Component>) {
		if (typeof components === 'undefined') {
			return this._components
		}
		this._components = components
		return this
	}

	public addComponent(...components: Array<Component>) {
		// TODO: move this limits to the discord code
		// if (!this.subType && components[0].definition.type !== 1) {
		// 	this.subType = components[0].definition.type
		// }
		// const error = components.findIndex((s) => s.definition.type === 1 || s.definition.type !== this.subType)
		// if (error !== -1) {
		// 	if (components[error].definition.type === 1) {
		// 		throw new Error('An Action row cannot contains another ActionRow')
		// 	}
		// 	throw new Error('An Action row cannot contains differents types of elements')
		// }
		// if (
		// 	this.subType === 2 && this.definition.components.length >= 5 ||
		// 	this.subType === 3 && this.definition.components.length >= 1
		// ) {
		// 	throw new Error(`Can't add more of this component to the row (${MessageComponentType[this.subType]})`)
		// }
		this._components.push(...components)
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public removeComponent(index: number) {
		this._components.splice(index)
	}
}
