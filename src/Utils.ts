/**
 * Replace Types in texts by Discord Emojis
 */
export function replaceTypesByEmojis(text: string): string {
	const emojis = {
		Colorless: '860202321983963146',
		'Fire~1': '860202322029838336',
		'Dragon~1': '860202321984094228',
		Electric: '860202321975443486',
		'Metal~1': '860202321975443476',
		Darkness: '860202321971249193',
		Grass: '860202321967185970',
		Psychic: '860202321958142002',
		Lightning: '860202321950670898',
		Water: '860202321786830900',
		'Fairy~1': '860202321682366535',
		Fighting: '860202322134827098'
	}
	for (const emoji of Object.keys(emojis)) {
		text = text.replace(
			new RegExp(emoji.replace('~1', ''), 'gu'),
			`<:${emoji.toLowerCase()}:${emojis[emoji as 'Colorless']}>`
		) ?? text
	}
	return text
}
