export function flatNodes(childNodes) {
  const nodes = [];

  for (const node of childNodes) {
    if (node.nodeName === 'DIV') {
      nodes.push(...node.childNodes);
    } else {
      nodes.push(node);
    }
  }

  return nodes;
}

export function getTextContent(node, ignoreBRs) {
  if (node.nodeName === '#text') return node.data.replace(/\n/g, '');
  if (node.nodeName === 'BR' && ignoreBRs !== true) return '\n';
  if (node.nodeName === 'IMG') return node.alt;

  return [...node.childNodes].map((node) => getTextContent(node, ignoreBRs)).join('');
}

export function isNodeEqualFragment(node, fragment) {
  // node может быть либо #text...
  if (node.nodeType === Node.TEXT_NODE) {
    return (
      fragment.childNodes.length === 1 &&
      fragment.childNodes[0].nodeType === Node.TEXT_NODE
    );
  }

  // ...либо span
  // Проверяем, что fragment это тот же span
  return node.isEqualNode(fragment.childNodes[0]);
}
