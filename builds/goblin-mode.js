import ajax from '../src/index.js'
import send from '../src/send.js'

export default function (Alpine) {
  console.log('GOBLIN MODE ACTIVATE: v1')
  ajax(Alpine)
  send(Alpine)
}
