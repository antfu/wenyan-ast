import { ASTScope, Identifier, Statement, Answer, Literal, Expression } from '../../types'

export function shake<T extends ASTScope>(ast: T, identifiers: Identifier[]): T {
  // TODO:
  return filterNodes(ast, identifiers)
}

function filterNodes<T extends ASTScope>(ast: T, identifiers: Identifier[]): T {
  return {
    ...ast,
    body: ast.body.filter((node) => {
      if (node.type === 'Comment')
        return false
      const ids = getIdentifiers(getDirectRefs(node))
      return !ids.length || identifiersContains(ids, identifiers)
    }),
  }
}

function getDirectRefs(node?: Statement): (Identifier| Answer)[] {
  if (!node)
    return []

  if (node.type === 'VariableDeclaration')
    return node.names

  if (node.type === 'FunctionDeclaration')
    return [node.name]

  if (node.type === 'FunctionCall')
    return [node.function]

  if (node.type === 'ExpressStatement')
    return getRefsFromExpressions(node.expression)

  if (node.type === 'IfStatement')
    return [...getRefsFromExpressions(node.condition), ...getDirectRefs(node.else)]

  if (node.type === 'ForInStatement')
    return [node.collection]

  if (node.type === 'ArrayPush')
    return [node.target, ...getRefs(node.values)]

  return []
}

function getRefs(nodes: (Literal | Identifier | Answer)[]) {
  return nodes.filter(i => i.type === 'Identifier' || i.type === 'Answer') as (Identifier | Answer)[]
}

function getIdentifiers(nodes: (Literal | Identifier | Answer)[]) {
  return nodes.filter(i => i.type === 'Identifier') as Identifier[]
}

function getRefsFromExpressions(exp?: Expression): (Identifier|Answer)[] {
  if (!exp)
    return []
  if (typeof exp !== 'object')
    return []
  if (exp.type === 'Identifier')
    return [exp]
  if (exp.type === 'ArrayOperation')
    return getRefs([exp.identifier])
  if (exp.type === 'BinaryOperation')
    return [...getRefsFromExpressions(exp.left), ...getRefsFromExpressions(exp.right)]
  if (exp.type === 'UnaryOperation')
    return getRefsFromExpressions(exp.expression)
  return []
}

function identifiersContains(a: Identifier[], b: Identifier[]) {
  for (const ia of a) {
    for (const ib of b) {
      if (ia.name === ib.name)
        return true
    }
  }
  return false
}

function collectIdentifiers(node: Statement): Identifier[] {
  const ids: Identifier[] = []

  return ids
}
