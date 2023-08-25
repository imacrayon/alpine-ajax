import ajax from '../src/index.js'
import send from '../src/send.js'

export default function (Alpine) {
  ajax(Alpine)
  send(Alpine)
}
