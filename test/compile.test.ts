import { compile } from '../src/compiler'

describe('compile js', () => {
  it('var a = 3', () => {
    expect(compile('吾有一數。曰三。名之曰「甲」。'))
      .toEqual('let 甲=3;')
  })

  it('multiple vars', () => {
    expect(compile('吾有三數。曰一。曰三。曰五。名之曰「甲」曰「乙」曰「丙」。'))
      .toEqual('let 甲=1;let 乙=3;let 丙=5;')
  })

  it('function without args', () => {
    expect(compile('吾有一術。名之曰「甲」。欲行是術。必先得二數。曰「乙」。曰「丙」。是術曰。是謂「甲」之術也。'))
      .toEqual('let 甲=乙=>丙=>{};')
  })

  it('function with multiple args', () => {
    expect(compile('吾有一術。名之曰「甲」。乃行是術曰。是謂「甲」之術也。'))
      .toEqual('let 甲=()=>{};')
  })
})
