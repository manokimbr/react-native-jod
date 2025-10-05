export function toPrettyTree(node, prefix = '') {
  if (!node) return ''
  const lines = []
  const isDir = node.type === 'dir'
  const label = isDir ? `📁 ${node.name}${node.interesting ? '' : ' (dim)'}` 
                      : `📄 ${node.name}${node.ext ? ' .' + node.ext : ''}${node.size ? ` (${fmt(node.size)})` : ''}`
  lines.push(prefix + label)

  if (isDir && node.children?.length) {
    const lastIdx = node.children.length - 1
    node.children.forEach((child, i) => {
      const isLast = i === lastIdx
      const branch = isLast ? '└─ ' : '├─ '
      const nextPrefix = prefix + (isLast ? '   ' : '│  ')
      lines.push(toPrettyTree(child, prefix + branch).replace(prefix + branch, prefix + branch))
      // treeText recursion already prints prefixes
      // (we built it simple—works well enough for mid-sized trees)
      lines.push(...[]) // no-op to keep structure explicit
    })
  }
  return lines.join('\n')
}

function fmt(n) {
  if (n < 1024) return `${n}B`
  if (n < 1024 * 1024) return `${(n/1024).toFixed(1)}KB`
  return `${(n/1024/1024).toFixed(1)}MB`
}
