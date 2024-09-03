import { describe, it, expect } from 'vitest'
import {
  type TreeNode,
  flatTreeNodes,
  addAssociations,
  assembleTree,
  updateNodeByKey,
  calculateChildrenCount
} from '@/utils/tree'
import { cloneDeep } from 'lodash'

interface Item extends TreeNode {
  id: number
  parentId?: number
}

const item1: Item = {
  id: 1
}
const item2: Item = {
  id: 2,
  parentId: 1
}
const item3: Item = {
  id: 3,
  parentId: 2
}
const item4: Item = {
  id: 4,
  parentId: 2
}
const item5: Item = {
  id: 5,
  parentId: 3
}
const item6: Item = {
  id: 6,
  parentId: 1
}
const item7: Item = {
  id: 7
}

const tree: Item = {
  id: 1,
  children: [
    {
      id: 2,
      parentId: 1,
      children: [
        {
          id: 3,
          parentId: 2,
          children: [
            {
              id: 5,
              parentId: 3
            }
          ]
        },
        {
          id: 4,
          parentId: 2
        }
      ]
    },
    {
      id: 6,
      parentId: 1
    }
  ]
}

describe('Tree Utils', () => {
  it('should able to assmeble nodes to trees', () => {
    const { tree: newTree, map } = assembleTree(
      [item1, item2, item3, item4, item5, item6, item7],
      'id',
      'parentId'
    )

    expect(newTree).toMatchObject([tree, item7])
    expect(map.get(1)).toMatchObject(tree)
  })

  it('should return a flat array of nodes', () => {
    const result = flatTreeNodes(tree)

    expect(result).toEqual([
      tree,
      tree.children?.[0],
      tree.children?.[0]?.children?.[0],
      tree.children?.[0]?.children?.[0]?.children?.[0],
      tree.children?.[0]?.children?.[1],
      tree.children?.[1]
    ])
  })

  it('should add associations to the tree', () => {
    addAssociations(tree)

    expect(tree.children?.[0].parent?.id).toEqual(1)
    expect(tree.children?.[0].parents?.length).toEqual(1)
    expect(tree.children?.[0].children?.[0].parent?.id).toEqual(2)
    expect(tree.children?.[0].children?.[0].parents?.length).toEqual(2)
    expect(tree.children?.[1].isLast).toBeTruthy()
  })

  it('should be able to update node by key', () => {
    const newTree = cloneDeep(tree)

    expect(newTree.children?.[0].children?.[0].children?.[0].parentId).toEqual(3)
    updateNodeByKey(newTree, 'id', 5, (node) => {
      node.parentId = 4
    })
    expect(newTree.children?.[0].children?.[0].children?.[0].parentId).toEqual(4)
  })

  it('should be able to calculate the childrenCount for each node', () => {
    const newTree = cloneDeep(tree)
    calculateChildrenCount(newTree)

    expect(newTree.childrenCount).toEqual(5)
    expect(newTree.children?.[0].childrenCount).toEqual(3)
  })
})
