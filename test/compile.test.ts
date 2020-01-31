import { compile } from '../src/compiler'

describe('compile js', () => {
  it('var a = 3', () => {
    expect(compile('吾有一數。曰三。名之曰「甲」。'))
      .toEqual('var 甲=3;')
  })
})
