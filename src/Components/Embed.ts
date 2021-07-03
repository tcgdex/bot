import { MessageEmbedOptions } from 'discord.js'

interface Field {
	name: string
	value: string
	inline: boolean
}

interface EmbedAuthor {
	name?: string
	url?: string
	iconUrl?: string
	proxyIconUrl?: string
}

interface EmbedImage {
	url: string;
	proxyUrl?: string;
	height?: number;
	width?: number;
}

interface EmbedFooter {
	text?: string;
	iconUrl?: string;
	proxyIconUrl?: string;
}

/**
 * Global Embed object
*/
export default class Embed {

	private definition: MessageEmbedOptions = {
		fields: [],
		color: '#FE4566'
	}

	public constructor(title?: string, description?: string) {
		this.definition.title = title ?? ' '
		this.definition.description = description ?? ' '
	}

	public title(): string
	public title(value: string): this
	public title(value?: string) {
		if (value) {
			this.definition.title = value
			return this
		}
		return this.definition.title
	}

	public description(): string
	public description(value: string): this
	public description(value?: string) {
		if (value) {
			this.definition.description = value
			return this
		}
		return this.definition.description
	}

	public url(): string
	public url(value: string): this
	public url(value?: string) {
		if (value) {
			this.definition.url = value
			return this
		}
		return this.definition.url
	}

	public author(): EmbedAuthor
	public author(name?: string, iconUrl?: string, url?: string, proxyIconUrl?: string): this
	public author(name?: string, iconUrl?: string, url?: string, proxyIconUrl?: string): this | EmbedAuthor {
		if (name || url || iconUrl || proxyIconUrl) {
			this.definition.author = {name, url, iconURL: iconUrl, proxyIconURL: proxyIconUrl}
			return this
		}
		return {name: this.definition.author?.name, url: this.definition.author?.url, iconUrl: this.definition.author?.iconURL, proxyIconUrl: this.definition.author?.proxyIconURL}
	}

	public image(): EmbedImage
	public image(url: string, proxyUrl?: string, width?: number, height?: number): this
	public image(url?: string, proxyUrl?: string, width?: number, height?: number) {
		if (url || proxyUrl || width || height) {
			this.definition.image = {url, proxyURL: proxyUrl, width, height}
			return this
		}
		return this.definition.image
	}

	public footer(): EmbedFooter
	public footer(text?: string, iconUrl?: string, proxyIconUrl?: string): this
	public footer(text?: string, iconUrl?: string, proxyIconUrl?: string) {
		if (text || iconUrl || proxyIconUrl) {
			this.definition.footer = {text, iconURL: iconUrl, proxyIconURL: proxyIconUrl}
			return this
		}
		return this.definition.footer
	}

	public field(): Array<Field>
	public field(index: number): Field
	public field(index: number, name: string, value: string, inline?: boolean): this
	public field(index?: number, name?: string, value?: string, inline?: boolean) {
		if (!this.definition.fields) {
			this.definition.fields = []
		}
		if (typeof index !== 'undefined' && name && value) {
			const field = {name, value, inline: inline ?? false}
			this.definition.fields[index] = field
			return this
		} else if (typeof index == 'number') {
			return this.definition.fields[index]
		}
		return this.definition.fields
	}

	public addField(name: string, value: string, inline?: boolean): this {
		this.definition.fields?.push({name, value, inline: inline ?? false})
		return this
	}

	public toDiscordJS(): MessageEmbedOptions {
		return this.definition
	}
}
