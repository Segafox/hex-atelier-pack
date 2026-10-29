// These Common items carry inexhaustible power, so the extra-denials tag excludes them.
const coalescerRulesConfig = Java.loadClass('dev.hexatelier.integration.IntegrationConfig').get()
let coalescerRarityLogged = false

ServerEvents.tags('item', event => {
  if (!Platform.isLoaded('hexwright') || !coalescerRulesConfig.restrictCoalescerToCommon) return

  // Reading membership invalidates KubeJS's empty preliminary pass; work in the full pass.
  const exempt = event.get('hexatelier:coalescer_rarity_exempt').getObjectIds()
  const ids = event.getElementIds()
  if (ids.isEmpty()) return

  let generated = 0
  ids.forEach(id => {
    const stack = event.registry.getValue(id).getDefaultInstance()
    if (String(stack.getRarity().name()) !== 'COMMON' && !exempt.contains(id)) {
      event.add('hexwright:not_coalescable', id.toString())
      generated++
    }
  })
  event.add('hexwright:not_coalescable', '#hexatelier:coalescer_extra_denials')
  if (!coalescerRarityLogged) {
    console.info('Coalescer: generated ' + generated + ' rarity denials; extra denials use their own tag.')
    coalescerRarityLogged = true
  }
})

ServerEvents.recipes(event => {
  if (!coalescerRulesConfig.disableRegeneratingProducerRecipes) return
  const staffs = [
    'blossom', 'dark_forest', 'eclipse', 'end', 'fern', 'geode', 'hydra', 'light',
    'nether', 'ocean', 'penitence', 'redstone', 'shadow', 'totem', 'wind'
  ]
  staffs.forEach(name => event.remove({ id: 'manifestation:staff/' + name + '_staff' }))
  event.remove({ id: 'oneironaut:endless_phial' })
  event.remove({ id: 'oneironaut:bottomless_trinket' })
})
