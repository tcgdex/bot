import Emoji from '../Emoji'
import { default as Component, ComponentType } from './Component'

export enum ButtonType {
	Primary,
	Secondary,
	Success,
	Danger,
	Link,
}

/**
 * Button Component
 */
export default class Button extends Component {

	private _label?: string
	private _emoji?: Emoji
	private _callback?: string
	private _url?: string
	private _disabled?: boolean

	public constructor() {
		super(ComponentType.Button)
	}

	public label(): string
	public label(label: string): this
	public label(label?: string) {
		if (label) {
			this._label = label
			return this
		}
		return this._label
	}

	public emoji(): Emoji
	public emoji(emoji: Emoji): this
	public emoji(emoji?: Emoji) {
		if (emoji) {
			this._emoji = emoji
			return this
		}
		return this._emoji
	}

	public callback(): string
	public callback(callback: string): this
	public callback(callback?: string) {
		if (callback) {
			// TODO: move this code to the discord code
			// if (customID.length > 100) {
			// 	throw new Error(`CustomIDs can\t be more than 100 characters (${customID})`)
			// }
			this._callback = callback
			return this
		}
		return this._callback
	}

	public url(): string
	public url(url: string): this
	public url(url?: string) {
		if (url) {
			this._url = url
			return this
		}
		return this._url
	}

	public disabled(): boolean
	public disabled(disabled: boolean): this
	public disabled(disabled?: boolean) {
		if (typeof disabled === 'boolean') {
			this._disabled = disabled
			return this
		}
		return this._disabled
	}
}
