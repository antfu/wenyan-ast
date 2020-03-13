import { hanzi2num } from '../../utils/src'
import { KEYWORDS_MAX_LENGTH, KEYWORDS, KEYWORDS_NUMBERS, KEYWORDS_COMMENT } from '../../types/keywords'
import { Token, TokenType, Position, SourceLocation, TokenDefinition, ModuleContext, createContext, ImportOptions } from '../../types'
import { ErrorHandler } from './errors/handler'
import { Messages } from './messages'
import { Character } from './character'
import { ImportModule } from './moduleReader'

export interface TokenizerOptions {
  errorHandler: ErrorHandler
  enableMacro?: boolean
  strict?: boolean
  importOptions?: ImportOptions
}

export class Tokenizer {
  public readonly options: TokenizerOptions

  index: number
  lineNumber: number
  lineStart: number
  curlyStack: string[]
  pendingMacroFrom: string | undefined

  constructor(
    public readonly context: ModuleContext,
    options: Partial<TokenizerOptions>,
  ) {
    const {
      errorHandler = new ErrorHandler(),
      enableMacro = true,
      strict = false,
      importOptions,
    } = options

    this.options = {
      errorHandler,
      enableMacro,
      strict,
      importOptions,
    }

    this.index = 0
    this.lineNumber = (context.source.length > 0) ? 1 : 0
    this.lineStart = 0
    this.curlyStack = []
    this.pendingMacroFrom = undefined
  }

  get tokens() {
    return this.context.tokens
  }

  set tokens(v) {
    this.context.tokens = v
  }

  get last() {
    return this.context.tokens[this.context.tokens.length - 1]
  }

  get source() {
    return this.context.expandedSource || this.context.source
  }

  get length() {
    return this.source.length
  }

  get originalSource() {
    return this.context.source
  }

  getNextToken(): Token {
    throw new Error('as')
  }

  getTokens() {
    this.tokens = []

    let last = this.index - 1

    while (!this.eof()) {
      if (last === this.index)
        this.throwUnexpectedToken()
      last = this.index

      if (this.options.enableMacro) {
        for (const { from, to } of this.context.macros) {
          if (this.source.slice(this.index).match(from)) {
            this.context.expandedSource = this.source.slice(0, this.index) + this.source.slice(this.index).replace(from, to)
            break
          }
        }
      }

      const ch = this.source.charCodeAt(this.index)
      const char = this.source[this.index]

      if (Character.isWhiteSpace(ch)) {
        this.index++
        continue
      }

      if (Character.isLineTerminator(ch)) {
        this.newLine()
        continue
      }

      if (Character.isPunctuation(ch)) {
        this.index++
        const start = this.getPosition(-1)
        this.pushToken({ type: TokenType.Punctuations, value: char }, start)
        continue
      }

      if (KEYWORDS_NUMBERS.includes(char)) {
        this.scanNumber()
        continue
      }

      if (Character.isBracketStart(ch)) {
        this.scanBracket()
        continue
      }

      const twoChars = this.source.slice(this.index, this.index + 2)

      if (KEYWORDS_COMMENT.includes(twoChars)) {
        this.scanComment()
        continue
      }

      if (this.scanKeywords())
        continue

      if (this.options.strict) { this.throwUnexpectedToken(Messages.UnexpectedToken, char) }
      else {
        let last: Token
        if (this.last.type === TokenType.Unknown) {
          last = this.last
        }
        else {
          last = {
            type: TokenType.Unknown,
            value: '',
            loc: {
              start: this.getPosition(),
              end: this.getPosition(),
            },
          }
          this.pushToken(last)
        }
        last.value += char
        this.index += 1
        last.loc.end = this.getPosition()
      }
    }

    // EOF
    this.pushToken({ type: TokenType.EOF })

    return this.tokens
  }

  public eof() {
    return this.index >= this.length
  }

  public scanKeywords() {
    for (let len = KEYWORDS_MAX_LENGTH; len > 0; len--) {
      const keywords = KEYWORDS[len - 1]

      const id = this.source.slice(this.index, this.index + len)

      if (keywords[id]) {
        const start = this.getPosition()
        const end = this.getPosition(len)
        this.index += len
        this.pushToken(keywords[id], start, end)

        if (keywords[id].value === 'importEnd')
          this.scanImport()

        return true
      }
    }
  }

  private scanImport() {
    const name = this.tokens[this.tokens.length - 2].value as string
    const context = ImportModule(name, this.options.importOptions)
    this.context.imports[name] = context
    tokenizeContext(context)
  }

  private newLine() {
    const ch = this.source.charCodeAt(this.index)
    const next = this.source.charCodeAt(this.index + 1)

    this.index++

    if (ch === 0x0D && next === 0x0A) { // \n\t
      this.index++
    }

    this.lineNumber++
    this.lineStart = this.index
  }

  public scanNumber() {
    const start = this.getPosition()
    let chars = ''
    while (true) {
      const char = this.source[this.index]

      if (!KEYWORDS_NUMBERS.includes(char))
        break

      chars += char
      this.index++
    }
    if (chars) {
      const value = hanzi2num(chars)
      if (value == null)
        this.throwUnexpectedToken(`Can not parse number "${chars}"`)
      this.pushToken({ type: TokenType.Number, value }, start)
    }
  }

  public scanComment() {
    const start = this.getPosition()
    let chars = this.source.slice(this.index, this.index + 2)
    this.index += 2

    if (Character.isPunctuation(this.source.charCodeAt(this.index))) {
      chars += this.source[this.index]
      this.index++
    }

    if (Character.isDoubleBracketStart(
      this.source.charCodeAt(this.index),
      this.source.charCodeAt(this.index + 1),
    )) {
      const { chars: text } = this.scanBracketPair(true)
      chars += text
    }

    this.pushToken({ type: TokenType.Comment, value: chars }, start)
  }

  private scanBracketPair(preseveBrackets = false) {
    let curly = 1
    let chars = ''
    let type: TokenType = TokenType.Identifier
    let bracketType: 'single' | 'double' = 'single'

    const start = this.getPosition()
    const char = this.source[this.index]
    const next = this.source[this.index + 1]

    if (preseveBrackets)
      chars += char

    if (char === '『') {
      type = TokenType.String
      bracketType = 'double'
      curly = 2
      this.index += 1
    }
    else if (char === '「' && next === '「') {
      type = TokenType.String
      curly = 2
      if (preseveBrackets)
        chars += char

      this.index += 2
    }
    else {
      curly = 1
      this.index += 1
    }

    while (!this.eof()) {
      const char = this.source[this.index]
      const ch = this.source.charCodeAt(this.index)

      // escaping back-slash
      if (char === '\\') {
        const char = this.source[this.index + 1]
        chars += ({
          n: '\\n',
          t: '\\t',
          '\\': '\\\\',
        } as Record<string, string>)[char] || char
        this.index += 2
        continue
      }

      if (Character.isLineTerminator(ch)) {
        chars += char
        this.newLine()
        continue
      }

      if (preseveBrackets)
        chars += char

      if (bracketType === 'single') {
        if (char === '「') {
          curly += 1
        }
        else if (char === '」') {
          curly -= 1
          if (curly <= 0) {
            if (type === TokenType.String && !preseveBrackets)
              chars = chars.slice(0, -1)

            this.index += 1
            break
          }
        }
      }
      else {
        if (char === '『') {
          curly += 2
        }
        else if (char === '』') {
          curly -= 2
          if (curly <= 0) {
            this.index += 1
            break
          }
        }
      }

      if (!preseveBrackets)
        chars += char

      this.index++
    }

    if (curly < 0)
      this.throwUnexpectedToken()

    return { type, chars, start, end: this.getPosition() }
  }

  public scanBracket() {
    const { type, chars, start } = this.scanBracketPair()

    // scan macro
    if (this.options.enableMacro && type === TokenType.String) {
      const last = this.tokens[this.tokens.length - 1]
      if (last.value === 'macroFrom') {
        this.pendingMacroFrom = chars
      }
      else if (last.value === 'macroTo') {
        if (this.pendingMacroFrom == null)
          this.throwUnexpectedToken('Missing 或云 before 蓋謂')

        this.pushPendingMacro({
          from: this.pendingMacroFrom,
          to: chars,
        })

        this.pendingMacroFrom = undefined
      }
    }

    this.pushToken({ type, value: chars }, start)
  }

  private pushPendingMacro({ from, to }: {from: string; to: string}) {
    if (!this.options.enableMacro)
      return

    const regex = /「[甲乙丙丁戊己庚辛壬癸]」/g
    const ins = from.match(regex)
    const ous = to.match(regex)

    if (ins !== null && ous !== null) {
      for (let k = 0; k < ous.length; k++) {
        const ii = ins.indexOf(ous[k])
        if (ii >= 0)
          to = to.replace(new RegExp(ous[k], 'g'), `$${ii + 1}`)
      }
    }
    from = from.replace(regex, '(.+?)')

    this.context.macros.push({
      from: RegExp(`^${from}`),
      to,
    })
  }

  /**
   * Return current position
   */
  private getPosition(offest = 0): Position {
    const index = this.index + offest
    return {
      line: this.lineNumber,
      column: index - this.lineStart,
      index,
    }
  }

  private pushToken(define: TokenDefinition, start?: Position, end?: Position) {
    const loc: SourceLocation = {
      start: start || this.getPosition(),
      end: end || this.getPosition(),
    }
    this.tokens.push({
      ...define,
      loc,
    })
  }

  private throwUnexpectedToken(message = Messages.UnexpectedTokenIllegal, ...parameters: string[]): never {
    return this.options.errorHandler.throwError({
      loc: {
        start: this.getPosition(),
        end: this.getPosition(1),
      },
      message,
      parameters,
    })
  }

  private tolerateUnexpectedToken(message = Messages.UnexpectedTokenIllegal, ...parameters: string[]) {
    return this.options.errorHandler.tolerateError({
      loc: {
        start: this.getPosition(),
        end: this.getPosition(1),
      },
      message,
      parameters,
    })
  }
}

export function tokenize(src: string, options: Partial<TokenizerOptions> = {}) {
  return new Tokenizer(createContext(src), options).getTokens()
}

export function tokenizeContext(context: ModuleContext, options: Partial<TokenizerOptions> = {}) {
  const tokenizer = new Tokenizer(context, options)
  tokenizer.getTokens()
  return context
}
