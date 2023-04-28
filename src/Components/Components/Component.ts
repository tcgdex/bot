export enum ComponentType {
	ActionRow,
	Button,
	Select
}

export interface ComponentOptions {
	type: ComponentType
}

export default abstract class Component {

	private _type: ComponentType = ComponentType.ActionRow

	protected constructor(type: ComponentType) {
		this._type = type
	}

	public type() {
		return this._type
	}
}
