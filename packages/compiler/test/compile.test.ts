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
})
