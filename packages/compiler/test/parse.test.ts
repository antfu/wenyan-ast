import { parse } from '../src/parse'
import { VarType, VariableDeclaration, Accessability, AST, Statement } from '../src/types'
import { clearLocation } from '../../utils'

const expectParsed = <T extends AST>(s: string, v: T) => expect(clearLocation(parse(s))).toEqual<T>(v)
const expectBody = <T extends Statement[]>(s: string, v: T) => expect(clearLocation(parse(s).body)).toEqual<T>(v)

describe('parse', () => {
  it('empty', () => {
    expectParsed('', {
      type: 'Program',
      body: [],
    })
  })

  it('var a = 3', () => {
    expectBody('吾有一數。曰三。名之曰「甲」。', [{
      type: 'VariableDeclaration',
      count: 1,
      varType: VarType.Number,
      names: ['甲'],
      values: [{
        type: 'Value',
        varType: VarType.Number,
        value: 3,
      }],
      accessability: Accessability.private,
    }])
  })

  it('multiple vars', () => {
    expectBody('吾有三數。曰一。曰三。曰五。名之曰「甲」曰「乙」曰「丙」。', [{
      type: 'VariableDeclaration',
      count: 3,
      varType: VarType.Number,
      names: ['甲', '乙', '丙'],
      values: [{
        type: 'Value',
        varType: VarType.Number,
        value: 1,
      },
      {
        type: 'Value',
        varType: VarType.Number,
        value: 3,
      },
      {
        type: 'Value',
        varType: VarType.Number,
        value: 5,
      }],
      accessability: Accessability.private,
    },
    ])
  })
})
