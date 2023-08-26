import ajax from '../src/index.js'
import send from '../src/send.js'
import { configure } from '../src/helpers.js'

function GoblinMode(Alpine) {
  console.log('GOBLIN MODE ACTIVATE: v1')
  ajax(Alpine)
  send(Alpine)
}

GoblinMode.configure = (options) => {
  configure(options)

  return GoblinMode
}

export default GoblinMode;
