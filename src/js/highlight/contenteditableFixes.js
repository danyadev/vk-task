export function needClearInput(input) {
  const nodes = input.childNodes;

  if (nodes.length !== 1) return false;
  if (nodes[0].nodeName === 'BR') return true;

  const { childNodes } = nodes[0];

  return (
    nodes[0].nodeName === 'DIV' &&
    childNodes.length === 1 &&
    childNodes[0].nodeName === 'BR'
  );
}

export function fixBreakingBr(nodes) {
  const [node] = nodes;

  if (
    nodes.length === 1 &&
    node.nodeName === 'SPAN' && node.classList.contains('link') &&
    node.childNodes.length === 1 &&
    node.childNodes[0].nodeName === 'BR'
  ) {
    node.insertAdjacentElement('beforebegin', document.createElement('br'));
    node.remove();
    return true;
  }
}

export function moveBRs(node) {
  const nodes = [...node.childNodes].reverse();

  for (const child of nodes) {
    if (child.nodeName !== 'BR') {
      break;
    }

    child.remove();
    node.insertAdjacentElement('afterend', document.createElement('br'));
  }

  return node;
}
