import { objectKeys } from '@dzeio/object-util'
import TCGdex from '@tcgdex/sdk'
import Emoji from './Components/Emoji'
import { Localized } from './interfaces'

/**
 * Replace Types in texts by Discord Emojis
 */
export function replaceTypesByEmojis(text: string): string {
	const emojis = {
		Colorless: '860202321983963146',
		Fire: '860202322029838336',
		Dragon: '860202321984094228',
		Electric: '860202321975443486',
		Metal: '860202321975443476',
		Darkness: '860202321971249193',
		Grass: '860202321967185970',
		Psychic: '860202321958142002',
		Lightning: '860202321950670898',
		Water: '860202321786830900',
		Fairy: '860202321682366535',
		Fighting: '860202322134827098'
	}
	for (const emoji of Object.keys(emojis)) {
		text = text.replace(
			new RegExp(emoji.replace('~1', ''), 'gu'),
			new Emoji(emojis[emoji as 'Colorless'], emoji).toString()
		) ?? text
	}
	return text
}

/**
 * shortcut to translate elements
 */
export const t = getLocalizedValue

export function getLocalizedValue(it: Localized | string, lang?: keyof Localized) {

	if (typeof it === 'string') {
		return it
	}

	if (lang && lang in it) {
		return it[lang] as NonNullable<typeof it['en']>
	}
	return it[objectKeys(it)[0]] as NonNullable<typeof it['en']>
}


export function clamp(value: number, min: number, max: number): number {
	return Math.max(Math.min(value, max), min)
}

export function getTCGdexLang(locale?: keyof Localized): NonNullable<TCGdex['lang']> {
	if (!locale) {
		return 'en'
	}
	switch (locale) {
		case 'en':
		case 'es':
		case 'fr':
		case 'pt':
		case 'it':
		case 'de':
			return locale
		default:
			return 'en'
	}
}
