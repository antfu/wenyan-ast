import path from 'path'
import fs from 'fs-extra'
import glob from 'fast-glob'

function preprocess(code: string) {
  // TODO: preprocess the code
  return code
}

async function build() {
  const libDir = path.resolve(__dirname, '../lib')
  const filenames = await glob('**/*.wy', {
    cwd: libDir,
    onlyFiles: true,
  })

  const libs: Record<string, Record<string, string>> = {
    js: {},
    py: {},
    default: {},
  }

  for (const filename of filenames) {
    const filenameWithoutExt = filename.slice(0, -3)
    let target = 'default'
    let name = filenameWithoutExt
    if (filenameWithoutExt.includes('/'))
      [target, name] = filenameWithoutExt.split('/')
    const code = await fs.readFile(path.join(libDir, filename), 'utf-8')
    libs[target][name] = preprocess(code)
  }
  const json = JSON.stringify(libs)

  await fs.writeFile(path.resolve(__dirname, '../index.js'), `module.exports=${json}`, 'utf-8')
  await fs.writeFile(path.resolve(__dirname, '../index.ts'), `export default ${json}`, 'utf-8')
}

build()
