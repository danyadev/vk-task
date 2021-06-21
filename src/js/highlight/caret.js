import { flatNodes, getTextContent } from './shared';

export function saveCaretPosition(input) {
  const range = window.getSelection().getRangeAt(0);
  const preCaretRange = range.cloneRange();

  preCaretRange.selectNodeContents(input);
  preCaretRange.setEnd(range.endContainer, range.endOffset);

  const nodes = [...preCaretRange.cloneContents().childNodes];

  return nodes.map(getTextContent).join('').length;
}

function getCaretNodeAndOffset(input, caretPosition) {
  const nodes = flatNodes(input.childNodes);
  let readed = 0;

  for (const node of nodes) {
    const len = getTextContent(node).length;

    if (readed + len >= caretPosition) {
      return [node, caretPosition - readed];
    }

    readed += len;
  }

  return [];
}

export function restoreCaretPosition(input, caretPosition) {
  const [node, offset] = getCaretNodeAndOffset(input, caretPosition);

  if (node) {
    const range = window.getSelection().getRangeAt(0);

    if (node.nodeName === 'IMG') {
      range.setStartAfter(node, offset);
    } else if (node.nodeType === Node.TEXT_NODE) {
      range.setStart(node, offset);
    } else {
      range.setStart(node.childNodes[0], offset);
    }

    range.collapse(true);
  }
}
