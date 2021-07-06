import { Serie, Set } from '@tcgdex/sdk'
import Embed from '../Components/Embed'
import BaseEmbed from './BaseEmbed'

export default function(serie: Serie) {
	return BaseEmbed()
		.title(serie.name)
		.addField('ID', 'TCGdex ID: ' + serie.id)
}
