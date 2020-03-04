import { compile } from '../src/compiler'

describe('compile js', () => {
  it('var a = 3', () => {
    expect(compile('吾有一數。曰三。名之曰「甲」。'))
      .toEqual('var 甲=3;')
  })

  it('multiple vars', () => {
    expect(compile('吾有三數。曰一。曰三。曰五。名之曰「甲」曰「乙」曰「丙」。'))
      .toEqual('var 甲=1;var 乙=3;var 丙=5;')
  })

  it('function without args', () => {
    expect(compile('吾有一術。名之曰「甲」。欲行是術。必先得二數。曰「乙」。曰「丙」。是術曰。是謂「甲」之術也。'))
      .toEqual('var 甲=乙=>丙=>{};')
  })

  it('function with multiple args', () => {
    expect(compile('吾有一術。名之曰「甲」。乃行是術曰。是謂「甲」之術也。'))
      .toEqual('var 甲=()=>{};')
  })

  it('function call', () => {
    expect(compile('施「漢諾塔」於「盤數」。於一。於「「丙」」。於三。'))
      .toEqual('var _ans1=漢諾塔(盤數)(1)("丙")(3);')
  })

  it('name assign', () => {
    expect(compile('減「甲」以一。加「甲」以二。名之曰「乙」。曰「丙」。'))
      .toEqual('var 乙=甲-1;var 丙=甲+2;')
  })

  it('duplicated name assign', () => {
    expect(() => compile('減「甲」以一。名之曰「丁」。加「甲」以二。名之曰「乙」。曰「丙」。'))
      .toThrowError()
  })

  it('array push', () => {
    expect(compile('充「丁」以一。以二。以三。以四。'))
      .toEqual('丁.push(1,2,3,4);')
  })

  it('array push 2', () => {
    expect(compile('充「丁」以「甲」。以「「甲」」。以六。'))
      .toEqual('丁.push(甲,"甲",6);')
  })
})
