export enum TokenType {
  EOF = 'EOF',
  Answer = 'Answer',
  ArrayOperator = 'ArrayOperator',
  Assign = 'Assign',
  Bool = 'Bool',
  Builtin = 'Builtin',
  Call = 'Call',
  Comment = 'Comment',
  Control = 'Control',
  Declarion = 'Declarion',
  Expression = 'Expression',
  Identifier = 'Identifier',
  Import = 'Import',
  Macro = 'Macro',
  Name = 'Name',
  Number = 'Number',
  Operator = 'Operator',
  ConditionOperator = 'ConditionOperator',
  OpOrd = 'OpOrd',
  Punctuations = 'Punctuations',
  Reassign = 'Reassign',
  String = 'String',
  Throw = 'Throw',
  Try = 'Try',
  Type = 'Type',
  PropertyDeclarion = 'PropertyDeclarion',
}

export const KEYWORDS_NUMBERS = '負·又零〇一二三四五六七八九十百千萬億兆京垓秭穰溝澗正載極分釐毫絲忽微纖沙塵埃渺漠'

export const KEYWORDS_ALL = {
  吾有: { type: TokenType.Declarion, value: 'private' },
  今有: { type: TokenType.Declarion, value: 'public' },
  有: { type: TokenType.Declarion, value: 'private' },
  物之: { type: TokenType.PropertyDeclarion, value: undefined },

  數: { type: TokenType.Type, value: 'number' },
  列: { type: TokenType.Type, value: 'array' },
  言: { type: TokenType.Type, value: 'string' },
  術: { type: TokenType.Type, value: 'function' },
  爻: { type: TokenType.Type, value: 'bool' },
  物: { type: TokenType.Type, value: 'object' },
  元: { type: TokenType.Type, value: 'any' },

  曰: { type: TokenType.Assign, value: undefined },

  書之: { type: TokenType.Builtin, value: 'print' },
  名之曰: { type: TokenType.Name, value: undefined },
  施: { type: TokenType.Call, value: 'right' },
  以施: { type: TokenType.Call, value: 'left' },
  噫: { type: TokenType.Builtin, value: 'discard' },
  取: { type: TokenType.Builtin, value: 'take' },

  昔之: { type: TokenType.Reassign, value: 'part1' },
  今: { type: TokenType.Reassign, value: 'part2' },
  是矣: { type: TokenType.Reassign, value: 'part3' },
  不復存矣: { type: TokenType.Reassign, value: 'delete' },
  其: { type: TokenType.Answer, value: undefined },

  乃得: { type: TokenType.Control, value: 'return' },
  乃得矣: { type: TokenType.Control, value: 'returnPrev' },
  乃歸空無: { type: TokenType.Control, value: 'returnVoid' },
  是謂: { type: TokenType.Control, value: 'bigend' },
  之術也: { type: TokenType.Control, value: 'functionEnd' },
  必先得: { type: TokenType.Control, value: 'functionArgs' },
  是術曰: { type: TokenType.Control, value: 'functionBody' },
  乃行是術曰: { type: TokenType.Control, value: 'functionBody' },
  欲行是術: { type: TokenType.Control, value: 'functionStart' },
  也: { type: TokenType.Control, value: 'end' },
  云云: { type: TokenType.Control, value: 'end' },
  凡: { type: TokenType.Control, value: 'for' },
  中之: { type: TokenType.Control, value: 'forIn' },
  恆為是: { type: TokenType.Control, value: 'whiletrue' },
  為是: { type: TokenType.Control, value: 'whileN0' },
  遍: { type: TokenType.Control, value: 'whileN1' },
  乃止: { type: TokenType.Control, value: 'break' },
  乃止是遍: { type: TokenType.Control, value: 'continue' },

  若非: { type: TokenType.Control, value: 'else' },
  若: { type: TokenType.Control, value: 'if' },
  者: { type: TokenType.Control, value: 'conj' },
  若其然者: { type: TokenType.Control, value: 'ifTrue' },
  若其不然者: { type: TokenType.Control, value: 'ifFalse' },
  或若: { type: TokenType.Control, value: 'elseif' },

  其物如是: { type: TokenType.Control, value: 'objectBody' },
  之物也: { type: TokenType.Control, value: 'objectEnd' },

  夫: { type: TokenType.Expression, value: undefined },

  等於: { type: TokenType.ConditionOperator, value: '==' },
  不等於: { type: TokenType.ConditionOperator, value: '!=' },
  不大於: { type: TokenType.ConditionOperator, value: '<=' },
  不小於: { type: TokenType.ConditionOperator, value: '>=' },
  大於: { type: TokenType.ConditionOperator, value: '>' },
  小於: { type: TokenType.ConditionOperator, value: '<' },

  加: { type: TokenType.Operator, value: '+' },
  減: { type: TokenType.Operator, value: '-' },
  乘: { type: TokenType.Operator, value: '*' },
  除: { type: TokenType.Operator, value: '/' },
  中有陽乎: { type: TokenType.Operator, value: '||' },
  中無陰乎: { type: TokenType.Operator, value: '&&' },
  變: { type: TokenType.Operator, value: 'not' },
  所餘幾何: { type: TokenType.Operator, value: 'mod' },

  以: { type: TokenType.OpOrd, value: 'left' },
  於: { type: TokenType.OpOrd, value: 'right' },

  之長: { type: TokenType.ArrayOperator, value: 'len' },
  之: { type: TokenType.ArrayOperator, value: 'subs' },
  充: { type: TokenType.ArrayOperator, value: 'push' },
  銜: { type: TokenType.ArrayOperator, value: 'cat' },
  其餘: { type: TokenType.ArrayOperator, value: 'rest' },

  陰: { type: TokenType.Bool, value: false },
  陽: { type: TokenType.Bool, value: true },

  吾嘗觀: { type: TokenType.Import, value: 'file' },
  中: { type: TokenType.Import, value: 'in' },
  之書: { type: TokenType.Import, value: 'fileEnd' },
  方悟: { type: TokenType.Import, value: 'iden' },
  之義: { type: TokenType.Import, value: 'idenEnd' },

  嗚呼: { type: TokenType.Throw, value: 'a' },
  之禍: { type: TokenType.Throw, value: 'b' },
  姑妄行此: { type: TokenType.Try, value: 'try' },
  如事不諧: { type: TokenType.Try, value: 'catch' },
  豈: { type: TokenType.Try, value: 'catchErr0' },
  之禍歟: { type: TokenType.Try, value: 'catchErr1' },
  不知何禍歟: { type: TokenType.Try, value: 'catchAll' },
  乃作罷: { type: TokenType.Try, value: 'end' },

  或云: { type: TokenType.Macro, value: 'from' },
  蓋謂: { type: TokenType.Macro, value: 'to' },

  注曰: { type: TokenType.Comment, value: '' as string },
  疏曰: { type: TokenType.Comment, value: '' as string },
  批曰: { type: TokenType.Comment, value: '' as string },
} as const

export type KeywordTokenDefinition = (typeof KEYWORDS_ALL)[keyof typeof KEYWORDS_ALL]

export const KEYWORDS_COMMENT = ['注曰', '疏曰', '批曰']

export const KEYWORDS_MAX_LENGTH = 5

export const KEYWORDS = new Array(KEYWORDS_MAX_LENGTH)
  .fill(null)
  .map((): Record<string, KeywordTokenDefinition> => ({}))

export const KEYWORDS_TEXTS = Object.keys(KEYWORDS_ALL) as (keyof typeof KEYWORDS_ALL)[]

KEYWORDS_TEXTS.forEach((v) => {
  KEYWORDS[v.length - 1][v] = KEYWORDS_ALL[v]
})
