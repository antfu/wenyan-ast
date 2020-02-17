import path from 'path'
import fs from 'fs-extra'
import glob from 'fast-glob'

async function build() {
  const examplesDir = path.resolve(__dirname, '../../../examples')
  const filenames = await glob('*.wy', {
    cwd: examplesDir,
    onlyFiles: true,
  })
  const examples: Record<string, string> = {}

  for (const filename of filenames) {
    const code = await fs.readFile(path.join(examplesDir, filename), 'utf-8')
    examples[filename.slice(0, -3)] = code
  }

  await fs.writeFile(path.resolve(__dirname, '../index.js'), `module.export=${JSON.stringify({ examples })}`, 'utf-8')
  await fs.writeFile(path.resolve(__dirname, '../index.ts'), `export default ${JSON.stringify({ examples })} as {examples:Record<string, string>}`, 'utf-8')
}

build()
