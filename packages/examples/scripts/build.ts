import path from 'path'
import fs from 'fs-extra'
import glob from 'fast-glob'

async function build() {
  const examplesDir = path.resolve(__dirname, '../../../examples')
  const filenames = await glob('*.wy', {
    cwd: examplesDir,
    onlyFiles: true,
  })
  const info = JSON.parse(await fs.readFile(path.join(examplesDir, 'info.json'), 'utf-8'))
  const examples: Record<string, {
    code: string
    name?: string
    author?: string
  }> = {}

  for (const filename of filenames) {
    const code = await fs.readFile(path.join(examplesDir, filename), 'utf-8')
    const name = filename.slice(0, -3)
    examples[name] = {
      code,
      ...info[name],
    }
  }

  await fs.writeFile(path.resolve(__dirname, '../index.js'), `module.exports=${JSON.stringify(examples)}`, 'utf-8')
}

build()
