import { parse } from '../src/parse'
import { VarType, VariableDeclaration, Accessability, Program } from '../src/types'

const p = (s: string) => parse(s, { sourcemap: false })

describe('parse', () => {
  it('empty', () => {
    expect(p('')).toEqual<Program>({
      type: 'Program',
      body: [],
    })
  })

  it('var a = 3', () => {
    expect(p('吾有一數。曰三。名之曰「甲」。').body).toEqual([{
      type: 'VariableDeclaration',
      count: 1,
      varType: VarType.Number,
      names: ['甲'],
      values: [{
        type: 'Value',
        value: 3,
      }],
      accessability: Accessability.private,
    }])
  })

  it('multiple vars', () => {
    expect(p('吾有三數。曰一。曰三。曰五。名之曰「甲」曰「乙」曰「丙」。').body).toEqual<VariableDeclaration[]>([
      {
        type: 'VariableDeclaration',
        count: 3,
        varType: VarType.Number,
        names: ['甲', '乙', '丙'],
        values: [{
          type: 'Value',
          value: 1,
        },
        {
          type: 'Value',
          value: 3,
        },
        {
          type: 'Value',
          value: 5,
        }],
        accessability: Accessability.private,
      },
    ])
  })
})
