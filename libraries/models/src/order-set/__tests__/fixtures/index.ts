import type { SerializedOrder } from '../../../order/index.js'
import _orders1 from './orders1.json'
import _orders1Legacy from './orders1-legacy.json'

const orders1 = _orders1 as unknown as SerializedOrder[]
const orders1Legacy = _orders1Legacy as unknown as SerializedOrder[]

export { orders1, orders1Legacy }
