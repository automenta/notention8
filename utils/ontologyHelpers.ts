import { OntologyNode, OntologyAttribute } from '../types';

/**
 * Pure functions for manipulating the Ontology tree.
 * All functions return a new copy of the tree (immutable).
 */

// Helper to deep clone the tree to ensure immutability
const cloneTree = (tree: OntologyNode[]): OntologyNode[] => JSON.parse(JSON.stringify(tree));

// Helper to find a node by ID path or just ID?
// Since IDs might not be unique globally (though they should be), we'll search recursively.
// Actually, UI usually interacts with a specific node reference, but for pure state updates
// we need to traverse. Let's assume IDs are unique.

export const findNode = (tree: OntologyNode[], nodeId: string): OntologyNode | null => {
  for (const node of tree) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
};

// --- Node Operations ---

export const addNode = (
  tree: OntologyNode[],
  parentId: string | null,
  newNode: OntologyNode
): OntologyNode[] => {
  const newTree = cloneTree(tree);
  if (!parentId) {
    newTree.push(newNode);
    return newTree;
  }

  const parent = findNode(newTree, parentId);
  if (parent) {
    parent.children = parent.children || [];
    parent.children.push(newNode);
  }
  return newTree;
};

export const deleteNode = (tree: OntologyNode[], nodeId: string): OntologyNode[] => {
  // Filter from root or recursive children
  const filterNodes = (nodes: OntologyNode[]): OntologyNode[] => {
    return nodes
      .filter(n => n.id !== nodeId)
      .map(n => ({
        ...n,
        children: n.children ? filterNodes(n.children) : undefined
      }));
  };
  return filterNodes(tree);
};

export const renameNode = (
  tree: OntologyNode[],
  nodeId: string,
  newLabel: string
): OntologyNode[] => {
  const newTree = cloneTree(tree);
  const node = findNode(newTree, nodeId);
  if (node) {
    node.label = newLabel;
  }
  return newTree;
};

// --- Attribute Operations ---

export const addAttribute = (
  tree: OntologyNode[],
  nodeId: string,
  key: string,
  attribute: OntologyAttribute
): OntologyNode[] => {
  const newTree = cloneTree(tree);
  const node = findNode(newTree, nodeId);
  if (node) {
    node.attributes = node.attributes || {};
    node.attributes[key] = attribute;
  }
  return newTree;
};

export const deleteAttribute = (
  tree: OntologyNode[],
  nodeId: string,
  key: string
): OntologyNode[] => {
  const newTree = cloneTree(tree);
  const node = findNode(newTree, nodeId);
  if (node && node.attributes) {
    delete node.attributes[key];
  }
  return newTree;
};

export const renameAttribute = (
  tree: OntologyNode[],
  nodeId: string,
  oldKey: string,
  newKey: string
): OntologyNode[] => {
  const newTree = cloneTree(tree);
  const node = findNode(newTree, nodeId);
  if (node && node.attributes && node.attributes[oldKey]) {
    // Check collision
    if (node.attributes[newKey]) {
        throw new Error(`Attribute '${newKey}' already exists.`);
    }
    const attr = node.attributes[oldKey];
    delete node.attributes[oldKey];
    node.attributes[newKey] = attr;
  }
  return newTree;
};

/**
 * Merges sourceAttribute into targetAttribute.
 * - Source is removed.
 * - Target is kept.
 * - Target's description/operators could be updated (optional, for now we just keep target).
 */
export const mergeAttributes = (
  tree: OntologyNode[],
  nodeId: string,
  sourceKey: string,
  targetKey: string
): OntologyNode[] => {
  const newTree = cloneTree(tree);
  const node = findNode(newTree, nodeId);

  if (node && node.attributes) {
    if (!node.attributes[sourceKey] || !node.attributes[targetKey]) {
        // One doesn't exist, can't merge
        return newTree;
    }
    // Logic: We simply remove source. In a real app we might merge metadata.
    delete node.attributes[sourceKey];
  }
  return newTree;
};
