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
})
