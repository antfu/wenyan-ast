import fs from 'fs'
import path from 'path'
import readline from 'readline'
import commander from 'commander'
import findUp from 'find-up'
import { compile } from '../../compiler/src'
import { render, unrender } from '../../render/src'
import { outputHanziWrapper, execute } from '../../executor/src'
import { version } from '../package.json'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const inputHistory: string[] = []
let inputHistoryPointer = -1

const Logo = ' ,_ ,_\n \\/ ==\n /\\ []\n'
const MODULE_LIBRARY_NAME = '藏書樓'

const program = new commander.Command()
program
  .version(version, '-v, --version')
  .name('wenyan')
  .arguments('[files...]')
  .action((files) => {
    if (!files)
      program.files = []

    else if (!Array.isArray(files))
      program.files = [files]

    else
      program.files = files
  })
  .option(
    '-l, --lang <lang>',
    'Target language, can be "js", "py" or "rb"',
    'js',
  )
  .option('-c, --compile', 'Output the compiled code instead of executing it')
  .option('-e, --eval <code>', 'Evaluate script')
  .option('-i, --interactive', 'Interactive REPL')
  .option(
    '-o, --output [file]',
    'Output compiled code or executing result to file',
  )
  .option('-r, --render', 'Outputs renderings')
  .option(
    '--roman [method]',
    'Romanize identifiers. The method can be "pinyin", "baxter" or "unicode"',
  )
  .option('--strict', 'Enable static typechecking', false)
  .option('--allowHttp', 'Allow to import from http', false)
  .option('--dir <path>', 'Directory to importing from, seprates with comma(,)')
  .option('--no-outputHanzi', 'Don\'t convert output to hanzi', false)
  .option('--log <file>', 'Save log to file')
  .option('--title <title>', 'Override title in rendering')
  .helpOption('-h, --help', 'Display help')

const emptyCall = process.argv.length <= 2
const showHelp = process.argv.includes('-h') || process.argv.includes('--help')

if (emptyCall || showHelp) {
  program.outputHelp((help) => {
    if (!help) return ''
    let text = '\n'
    text += Logo
    text += `\nWENYAN LANG 文言 Compiler v${version}\n\n`
    text += help
    text += '\n'
    return text
  })
  process.exit()
}

program.parse(process.argv);

(async() => {
  preprocess()

  if (program.compile)
    output(getCompiled())

  else if (program.render)
    doRender()

  else if (program.interactive)
    await interactive()

  else
    await exec()
})().catch((e) => {
  console.error(e)
})

// ====== Utils ======

function preprocess() {
  if (!program.output && program.render) {
    // render always outputs
    program.output = true
  }

  if (program.output === true) {
    // only set --option but not the path
    if (!program.files.length) {
      console.error('Can not write to undefined path')
      process.exit(1)
    }
    const base = program.files[0]
      .split('.')
      .slice(0, -1)
      .join('.')
    if (program.compile) program.output = `${base}.${program.lang}`
    else if (program.render) program.output = `${base}.svg`
    else program.output = `${base}.log`
  }

  if (program.roman === true)
    program.roman = 'pinyin'
}

function getCompiled() {
  const source = getSource()

  return compile(source, {
    ...getCompileOptions(),
  })
}

function getImportPaths() {
  const pathes = []
  if (program.dir)
    pathes.push(...program.dir.split(','))

  const moduleLib = findModuleLibrary()
  if (moduleLib) pathes.push(moduleLib)

  pathes.push(...program.files.map((file: string) => path.resolve(path.dirname(file))))
  pathes.push(path.resolve('.'))
  return Array.from(new Set(pathes))
}

function findModuleLibrary() {
  return findUp.sync(MODULE_LIBRARY_NAME, { type: 'directory' })
}

function getCompileOptions() {
  return {
    lang: program.lang,
    romanizeIdentifiers: program.roman,
    strict: !!program.strict,
    allowHttp: !!program.allowHttp,
    importPaths: getImportPaths(),
    logCallback: logHandler(program.log, 'a'),
    errorCallback(x: any) {
      console.error(x)
      process.exit()
    },
  }
}

function resolvePath(x: string) {
  return path.resolve(x)
}

function getSource() {
  let scripts = program.files
    .map((x: string) =>
      x.endsWith('.svg')
        ? unrender([fs.readFileSync(resolvePath(x), 'utf-8')])
        : fs.readFileSync(resolvePath(x)).toString(),
    )
    .join('\n')

  if (program.eval) scripts += `\n${program.eval}`

  return scripts
}

function output(data: string) {
  if (program.output === undefined) return console.log(data)
  else fs.writeFileSync(resolvePath(program.output), data, 'utf-8')
}

function getTitle() {
  let title = program.title
  if (!title && typeof program.output === 'string') {
    title = program.output
      .split('.')
      .slice(0, -1)
      .join('.')
  }
  if (!title && program.files.length) {
    title = program.files[0]
      .split('.')
      .slice(0, -1)
      .join('.')
  }
  return title
}

function doRender() {
  const svgs = render(getTitle(), getSource(), { plotResult: false })

  const outputEndsWithSvg = program.output.toLowerCase().endsWith('.svg')

  // only one page rendered
  if (svgs.length === 1) {
    if (!outputEndsWithSvg)
      program.output += '.svg'
    const filepath = resolvePath(program.output)
    fs.writeFileSync(filepath, svgs[0])
    console.log(filepath) // Outputs generated filename
  }
  // multiple pages rendered, output file as `filename.001.svg` etc
  else {
    if (outputEndsWithSvg) program.output = program.output.slice(0, -4) // remove .svg suffix

    for (let i = 0; i < svgs.length; i++) {
      const filepath = resolvePath(
        `${program.output}.${i.toString().padStart(3, '0')}.svg`,
      )
      fs.writeFileSync(filepath, svgs[i])
      console.log(filepath) // Outputs generated filename
    }
  }
}

function interactive() {
  if (program.lang !== 'js') {
    console.error(
      `Target language "${program.lang}" is not supported for interactive mode.`,
    )
    process.exit(1)
  }
  replscope()
  repl(getCompiled())
}

function exec() {
  if (program.lang !== 'js') {
    console.error(
      `Target language "${program.lang}" is not supported for direct executing. Please use --compile option instead.`,
    )
    process.exit(1)
  }
  execute(getCompiled(), {
    outputHanzi: program.outputHanzi,
    lang: program.lang,
  })
}

function replscope() {
  function generate(depth: number) {
    let s0 = 'global.__scope=new function(){\n'
    let s1 = '\n}'
    for (let i = 0; i < depth; i++) {
      const istr = `__${(`${i}`).padStart(8, '0')}`
      s0 += `this.evil=function(${istr}){global.__scope=this;var __r=eval(${istr});\n`
      s1 = `;return __r}${s1}`
    }
    return eval(s0 + s1)
  }
  let stackCallSize = 1000
  for (let i = stackCallSize; i > 0; i -= 200) {
    try {
      generate(i)
      stackCallSize = i
      break
    }
    catch (e) {
      // console.log(i+ " exceeds max stack size");
    }
  }
  // console.log("final stack size "+stackCallSize);
}

function repl(prescript?: string) {
  process.stdin.setMaxListeners(100000000000000)
  process.stdin.on('data', (e) => {
    const esc = JSON.stringify(e.toString())
    if (esc === '"\\u001b[A"') {
      if (inputHistoryPointer === -1)
        inputHistoryPointer = inputHistory.length

      if (inputHistory.length) {
        inputHistoryPointer
            = (inputHistoryPointer - 1 + inputHistory.length) % inputHistory.length
      }
      // @ts-ignore
      rl.write(null, { ctrl: true, name: 'u' })
      rl.write(inputHistory[inputHistoryPointer])
    }
    else if (esc === '"\\u001b[B"') {
      if (inputHistoryPointer === -1)
        inputHistoryPointer = inputHistory.length

      if (inputHistory.length)
        inputHistoryPointer = (inputHistoryPointer + 1) % inputHistory.length

      // @ts-ignore
      rl.write(null, { ctrl: true, name: 'u' })
      rl.write(inputHistory[inputHistoryPointer])
    }
  })

  if (prescript) {
    const old_log = console.log
    try {
      console.log = outputHanziWrapper(console.log, program.outputHanzi)
      // @ts-ignore
      global.__scope.evil(prescript)
      console.log = old_log
    }
    catch (e) {
      console.log = old_log
      console.log(e)
    }
  }

  // @ts-ignore
  global.haserr = false
  rl.question('> ', (inp) => {
    const out = compile(inp, {
      lang: 'js',
      romanizeIdentifiers: program.roman,
    })
    // @ts-ignore
    if (global.haserr) {
    }
    if (inp.length)
      inputHistory.push(inp)

    rl.close()
    repl(out)
    inputHistoryPointer = -1
  })
}

function logHandler(f: string, mode: string) {
  if (!f)
    return () => 0

  if (f === '/dev/stdout') {
    return (x: any) =>
      typeof x === 'string'
        ? console.log(x)
        : console.dir(x, { depth: null, maxArrayLength: null })
  }

  if (f === '/dev/stderr')
    return console.error

  if (mode === 'a') {
    return (x: string) => {
      fs.appendFileSync(
        resolvePath(f),
        `${typeof x === 'object' ? JSON.stringify(x) : x.toString()}\n`,
      )
    }
  }

  if (mode === 'w') {
    return (x: string) => {
      fs.writeFileSync(
        resolvePath(f),
        `${typeof x === 'object' ? JSON.stringify(x) : x.toString()}\n`,
      )
    }
  }
}
