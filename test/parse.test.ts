import { parse, ASTType, VarType } from '../src/parse'

describe('parse', () => {
  it('empty', () => {
    expect(parse('')).toEqual({
      type: ASTType.Program,
      body: [],
    })
  })

  it('var a = 3', () => {
    expect(parse('吾有一數。曰三。名之曰「甲」。')).toEqual({
      type: ASTType.Program,
      body: [{
        type: ASTType.VariableDeclaration,
        count: 1,
        varType: VarType.Number,
        names: ['甲'],
        values: [{
          type: ASTType.Value,
          value: 3,
        }],
      }],
    })
  })
})
