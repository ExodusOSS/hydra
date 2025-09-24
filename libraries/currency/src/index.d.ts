declare module '@exodus/currency' {
  type NumberLike = string | number
  type ToNumberUnitType = string | Unit | Object | UnitType

  export type Unit = {
    (val: NumberLike | NumberUnit): NumberUnit
    unitName: string
    power: number
    // multiplier: BN;
    unitType: UnitType
    toJSON: () => Object
    toString: () => string
  }

  function isNumberUnit(param: unknown): param is NumberUnit

  class NumberUnit {
    static create: (num: NumberLike, unit: Unit) => NumberUnit
    static isNumberUnit: typeof isNumberUnit

    unitType: UnitType
    baseUnit: Unit
    defaultUnit: Unit

    value: number
    isNegative: boolean
    isPositive: boolean
    isZero: boolean

    constructor(num: NumberLike, unit: Unit)

    abs: () => NumberUnit
    add: (other: NumberLike | NumberUnit) => NumberUnit
    clampLowerZero: () => NumberUnit
    clone: () => NumberUnit
    equals: (other: NumberUnit) => boolean
    gt: (other: NumberUnit) => boolean
    gte: (other: NumberUnit) => boolean
    lt: (other: NumberUnit) => boolean
    lte: (other: NumberUnit) => boolean
    mul: (num: NumberLike) => NumberUnit
    div: (other: NumberLike) => NumberUnit
    floor: () => NumberUnit
    round: () => NumberUnit
    ceil: () => NumberUnit
    toFixed: (digits: number, rm?: string) => string
    negate: () => NumberUnit
    sub: (num: NumberLike | NumberUnit) => NumberUnit
    cast: (unitType: UnitType) => NumberUnit
    to: (unit: ToNumberUnitType, conversionUnit: unknown) => NumberUnit
    toJSON: () => {
      value: string
      unit: string
      unitType: string
      type: string
    }
    // the implementation allows calling toNumber/toNumberString without a param, but we want to deprecate that usage
    toNumber: (unit: ToNumberUnitType) => number
    toNumberString: (unit: ToNumberUnitType) => string
    toDefaultNumber: () => number
    toBaseNumber: () => number
    toBaseBufferLE: () => Buffer
    toBaseBufferBE: () => Buffer
    toString: ({
      unit,
      format,
      unitInstance,
    }: {
      unit?: boolean
      format?: Unit
      unitInstance: unknown
    }) => string
    toDefaultString: (options?: { unit?: boolean }) => string
    toBaseString: (options?: { unit?: boolean }) => string
    valueOf: () => number
  }

  type CreateFromBaseValueParams = {
    value: number
    symbol: string
    power: number
  }

  function createFromBaseValue(params: CreateFromBaseValueParams): UnitType

  type Definitions = Record<string, number>

  type UnitMap = {
    [unitName: string]: Unit
  }

  class UnitType {
    static create(definitions: Definitions): UnitType
    static equals(a: UnitType, b: UnitType): boolean
    static isUnitType(param: unknown): param is UnitType

    constructor(definitions: Definitions, initSymbol: symbol)

    equals: (other: UnitType) => boolean
    parse: (str: string) => NumberUnit
    toString: () => string
    toJSON: () => Definitions
    ZERO: NumberUnit

    units: UnitMap
    baseUnit: Unit
    defaultUnit: Unit
  }

  type ConversionByRateResponse = (numberUnit: NumberUnit) => NumberUnit

  function conversionByRate(
    ut1: UnitType,
    ut2: UnitType,
    rate: number | string,
    opts?: { unit1?: string; unit2?: string }
  ): ConversionByRateResponse

  type ConversionParams = {
    num1: NumberUnit
    num2: NumberUnit
  }
  type ConversionResponse = (num: NumberUnit) => NumberUnit

  function conversion(params: ConversionParams): ConversionResponse

  export default NumberUnit

  export { createFromBaseValue, isNumberUnit, conversionByRate, conversion, UnitType }
}
