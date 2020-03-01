import {
  ImportOptions,
  CacheObject,
  CompileOptions,
  ModuleContext,
  createContext,
} from '../../types'

const INDEX_FILENAME = '序'

function isHostTrusted(url: string, trustedHosts: string[]) {
  for (const host of trustedHosts) {
    // FIXME: it can be bypassed by relative path resolving,
    // for examples: https://trusted.com/a/../../hijack.com/a/
    if (url.startsWith(host)) return true
  }
  return false
}

function isHttpURL(uri: string) {
  return !!uri.match(/^https?:\/\//)
}

function fetchTextSync(url: string, timeout: number) {
  let XHR
  if (typeof window !== 'undefined' && 'XMLHttpRequest' in window)
    XHR = window.XMLHttpRequest
  else XHR = eval('require')('xmlhttprequest').XMLHttpRequest

  const xmlHttp = new XHR()
  // xmlHttp.timeout = timeout;
  xmlHttp.open('GET', url, false) // false for synchronous request
  xmlHttp.send(null)

  if (xmlHttp.status >= 200 && xmlHttp.status < 300)
    return xmlHttp.responseText

  throw new URIError(xmlHttp.responseText)
}

function fetchSync(uri: string, cache: CacheObject, requestTimeout: number) {
  if (cache[uri]) return cache[uri]

  const data = isHttpURL(uri)
    ? fetchTextSync(uri, requestTimeout)
    : eval('require')('fs').readFileSync(uri, 'utf-8')

  cache[uri] = data

  return data
}

export function ImportModule(
  name: string,
  importOptions: Partial<ImportOptions> = {},
): ModuleContext {
  const {
    lib = { js: {}, py: {}, default: {} },
    lang = 'js',
    allowHttp = false,
    entryFilepath,
    importPaths = [],
    importCache = {},
    importContext = {},
    trustedHosts = [],
    requestTimeout = 2000,
  } = importOptions

  const stdlib = lib[lang][name] || lib.default[name]
  if (stdlib)
    return createContext(stdlib, 'module', name, 'stdlib')

  const imported = importContext[name]
  if (imported) {
    if (typeof imported === 'string')
      return createContext(imported, 'module', name)

    if (imported.entry) {
      return createContext(
        imported.src || fetchSync(imported.entry, importCache, requestTimeout),
        'module',
        name,
        'context',
        imported.entry,
      )
    }

    throw new SyntaxError(`Failed to parse context: ${imported}`)
  }

  const pathes: string[] = []

  if (typeof importPaths === 'string')
    pathes.push(importPaths)

  else
    pathes.push(...importPaths)

  if (entryFilepath) {
    pathes.push(
      entryFilepath
        .replace(/\\/g, '/')
        .split('/')
        .slice(0, -1)
        .join('/'),
    )
  }

  for (const dir of pathes) {
    let uri = dir
    let entries = []

    if (uri.endsWith('/')) uri = uri.slice(0, -1)

    const online = isHttpURL(uri)
    if (online) {
      if (!allowHttp && !isHostTrusted(uri, trustedHosts)) {
        throw new URIError(
          `URL request "${uri}" is blocked by default for security purpose. `
            + 'You can turn it on by specify the "allowHttp" option.',
        )
      }
      entries = [
        `${uri}/${encodeURIComponent(name)}.wy`,
        `${uri}/${encodeURIComponent(name)}/${encodeURIComponent(INDEX_FILENAME)}.wy`,
      ]
    }
    else {
      entries = [
        `${uri}/${name}.wy`,
        `${uri}/${name}/${INDEX_FILENAME}.wy`,
      ]
    }

    for (const entry of entries) {
      try {
        return createContext(
          fetchSync(entry, importCache, requestTimeout),
          'module',
          name,
          online ? 'network' : 'fs',
          entry,
        )
      }
      catch (e) {}
    }
  }

  throw new ReferenceError(
    `Module "${name}" is not found. Searched in ${importPaths}`,
  )
}

export function bundleImports(
  imports: string[],
  options: {
    lib: CompileOptions['lib']
    lang: CompileOptions['lang']
  },
  importOptions: ImportOptions,
): ModuleContext[] {
  const { lib, lang } = options

  return imports.map((moduleName) => {
    const src = lib[lang][moduleName] || lib.default[moduleName]
    if (src)
      return createContext(src, 'module', moduleName, 'stdlib')

    return ImportModule(moduleName, importOptions)
  })
}
