import type { KeysByType } from './type'

export interface TreeNode {
  children?: this[]
  parent?: this
  parents?: this[]
  isLast?: boolean
  level?: number
  expanded?: boolean
  childrenCount?: number
}

export function assembleTree<
  T extends object,
  R extends T & TreeNode,
  OptionalKeyType = string | number | undefined,
  K extends keyof T = KeysByType<T, OptionalKeyType>,
  KeyType = Exclude<T[K], undefined>,
  PK extends keyof T = KeysByType<T, KeyType>
>(
  flattenedNodes: T[],
  key: PK,
  parentKey: K
): {
  tree: R[]
  map: Map<KeyType, R>
} {
  const map = new Map<KeyType, R>()
  const tree: R[] = []

  if (!flattenedNodes || flattenedNodes.length === 0) {
    return {
      tree,
      map
    }
  }

  for (const node of flattenedNodes) {
    map.set(node[key] as KeyType, node as unknown as R)
  }

  for (const node of flattenedNodes) {
    if (node[parentKey]) {
      const parent = map.get(node[parentKey] as KeyType)

      if (parent) {
        if (!parent.children) {
          parent.children = []
        }

        parent.children.push(node as unknown as R)
      } else {
        tree.push(node as unknown as R)
      }
    } else {
      tree.push(node as unknown as R)
    }
  }

  return {
    tree,
    map
  }
}

export function updateNodeByKey<T extends TreeNode>(
  tree: T,
  key: keyof T,
  keyValue: unknown,
  callback: (target: T) => void
) {
  const traverse = (node: T) => {
    if (node[key] === keyValue) {
      callback(node)
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  traverse(tree)
}

export function addAssociations<T extends TreeNode>(tree: T, callback?: (node: T) => void) {
  const traverse = (node: T, parent: T | null = null, parents: T[] = []) => {
    if (parent) {
      node.parent = parent
    }

    node.parents = parents
    node.isLast = !node.children || node.children.length === 0
    node.level = parents.length + 1

    callback?.(node)

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: T, index: number) => {
        traverse(child, node, [...parents, node])
        child.isLast = index === (node.children || []).length - 1
      })
    }
  }

  traverse(tree)
}

export function flatTreeNodes<T extends TreeNode>(tree: T, condition?: (target: T) => boolean) {
  const result: T[] = []

  function traverse(node: T) {
    result.push(node)

    if (node.children && node.children.length > 0 && (!condition || condition(node))) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  traverse(tree)

  return result
}

export function calculateChildrenCount<T extends TreeNode>(tree: T) {
  const calculate = (node: T): number => {
    if (!node.children || node.children.length === 0) {
      return 0
    }

    const counts = node.children.map((child: T) => {
      const count = calculate(child)

      child.childrenCount = count

      return count
    })

    return counts.reduce((acc, count) => acc + count, 0) + node.children.length
  }

  tree.childrenCount = calculate(tree)
}
