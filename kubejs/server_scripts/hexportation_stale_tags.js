// Pass 26: Complex Hex was removed in pass 14. Leave every other tag/member intact.
ServerEvents.tags('hexcasting:action', event => {
	if (Platform.isLoaded('complexhex')) return
	const deadActions = [
		'complexhex:summonblockdisplay',
		'complexhex:summonitemdisplay',
		'complexhex:summontextdisplay'
	]
	const staleTags = [
		'hexportation:can_start_enlightenment',
		'hexportation:requires_enlightenment',
		'hexportation:per_world_patterns'
	]
	staleTags.forEach(tag => {
		deadActions.forEach(action => event.remove(tag, action))
	})
})
