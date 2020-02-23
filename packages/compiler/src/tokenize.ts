import { hanzi2num } from './converts'
import { KEYWORDS_MAX_LENGTH, KEYWORDS, KEYWORDS_NUMBERS, KEYWORDS_COMMENT } from './types/keywords'
import { ErrorHandler } from './errors/handler'
import { Messages } from './messages'
import { Character } from './character'
import { Token, TokenType, Position, SourceLocation, TokenDefinition, ModuleContext, createContext } from './types'

export interface TokenizerOptions {
  errorHandler: ErrorHandler
  context: ModuleContext
}

export class Tokenizer {
  public readonly options: TokenizerOptions
  private readonly length: number

  index: number
  lineNumber: number
  lineStart: number
  curlyStack: string[]

  constructor(
    public readonly source: string,
    options: Partial<TokenizerOptions>,
  ) {
    const {
      errorHandler = new ErrorHandler(),
      context = createContext(),
    } = options

    this.options = {
      errorHandler,
      context,
    }

    this.length = source.length
    this.index = 0
    this.lineNumber = (source.length > 0) ? 1 : 0
    this.lineStart = 0
    this.curlyStack = []
  }

  get tokens() {
    return this.options.context.tokens
  }

  set tokens(v) {
    this.options.context.tokens = v
  }

  getNextToken(): Token {
    throw new Error('as')
  }

  getTokens() {
    this.tokens = []

    let last = this.index - 1

    while (!this.eof()) {
      if (last === this.index) this.throwUnexpectedToken()
      last = this.index

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

      if (!this.scanKeywords())
        this.throwUnexpectedToken(Messages.UnexpectedToken, char)
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
        return true
      }
    }
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
    if (chars)
      this.pushToken({ type: TokenType.Number, value: hanzi2num(chars) || undefined }, start)
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
            this.index += 2
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
    this.pushToken({ type, value: chars }, start)
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
      pos: this.getPosition(),
      message,
      parameters,
    })
  }

  private tolerateUnexpectedToken(message = Messages.UnexpectedTokenIllegal, ...parameters: string[]) {
    return this.options.errorHandler.tolerateError({
      pos: this.getPosition(),
      message,
      parameters,
    })
  }
}

export function tokenize(src: string, options: Partial<TokenizerOptions> = {}) {
  const {
    errorHandler = new ErrorHandler(),
  } = options
  return new Tokenizer(src, { errorHandler }).getTokens()
}
