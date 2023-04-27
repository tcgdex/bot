import Emoji from '../Emoji'
import { default as Component, ComponentType } from './Component'

export enum ButtonStyle {
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
	private _style?: ButtonStyle = ButtonStyle.Primary
	private _disabled?: boolean = false

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
		if (typeof callback === 'undefined') {
			return this._callback
		}
		// TODO: move this code to the discord code
		// if (customID.length > 100) {
		// 	throw new Error(`CustomIDs can\t be more than 100 characters (${customID})`)
		// }
		if (this.style() === ButtonStyle.Link) {
			this.style(ButtonStyle.Primary)
		}
		this._callback = callback
		return this
	}

	public url(): string
	public url(url: string): this
	public url(url?: string) {
		if (typeof url === 'undefined') {
			return this._url
		}
		if (this.style() !== ButtonStyle.Link) {
			this.style(ButtonStyle.Link)
		}
		this._url = url
		return this
	}

	public style(): ButtonStyle
	public style(style: ButtonStyle): this
	public style(style?: ButtonStyle) {
		if (typeof style === 'undefined') {
			return this._style
		}

		this._style = style
		return this
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
