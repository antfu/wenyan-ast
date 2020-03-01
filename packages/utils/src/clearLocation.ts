export function clearLocation(object: any): any {
  if (Array.isArray(object))
    return object.map(v => clearLocation(v))

  if (object.loc)
    delete object.loc

  for (const [key, value] of Object.entries(object)) {
    if (Array.isArray(value))
      object[key] = clearLocation(value)

    else if (typeof value === 'object' && value != null)
      object[key] = clearLocation(value)
  }
  return object
}
