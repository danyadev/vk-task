import parseText from '../textParser';
import { getEmojiAndBackground } from '../emoji';
import { flatNodes, getTextContent, isNodeEqualFragment } from './shared';
import { saveCaretPosition, restoreCaretPosition } from './caret';
import { needClearInput, fixBreakingBr, moveBRs } from './contenteditableFixes';

// Эта функция умеет возвращать отдельно удаленные, измененные и добавленные ноды,
// но мне нужен только список измененных + добавленных
function diffNodes(nodes, prevNodes, prevNodesCopy) {
  const { addedNodes, maybeChangedNodes } = nodes.reduce((acc, node) => {
    if (!prevNodes.includes(node)) {
      acc.addedNodes.push(node);
    } else {
      acc.maybeChangedNodes.push(node);
    }

    return acc;
  }, { addedNodes: [], maybeChangedNodes: [] });

  const removedNodeIndexes = prevNodes
    .filter((node) => !nodes.includes(node))
    .map((node) => prevNodes.indexOf(node));

  prevNodesCopy = prevNodesCopy.filter((node, index) => (
    removedNodeIndexes.indexOf(index) === -1
  ));

  const changedNodes = maybeChangedNodes.filter((node, index) => (
    getTextContent(node) !== getTextContent(prevNodesCopy[index])
  ));

  return addedNodes.concat(changedNodes);
}

function createSpan(content) {
  const span = document.createElement('span');

  span.innerText = content;
  span.classList.add('link');

  return span;
}

function createEmojiImg(emoji) {
  const [validEmoji, background] = getEmojiAndBackground(emoji);

  if (background) {
    const img = document.createElement('img');

    img.classList.add('emoji');
    img.src = 'assets/blank.gif';
    img.alt = validEmoji;
    img.style.background = background;

    return img;
  }

  return emoji;
}

const getBlockElement = {
  emoji: (block) => createEmojiImg(block.value),
  email: (block) => createSpan(block.value),
  massMention: (block) => createSpan(block.value),
  mention: (block) => createSpan(block.value),
  link: (block) => createSpan(block.value),
  hashtag: (block) => createSpan(block.value),
  text: (block) => block.value
};

let prevNodesCopy = [];
let prevNodes = [];

export default function(input) {
  // Фикс отображения пустого инпута вместо placeholder
  if (needClearInput(input)) {
    input.replaceChildren();
    return;
  }

  const nodes = flatNodes(input.childNodes).filter((node) => node.nodeName !== 'BR');
  const changedNodes = diffNodes(nodes, prevNodes, prevNodesCopy)
    // нам не нужно по новой рендерить эмодзи
    .filter((node) => node.nodeName !== 'IMG');

  if (fixBreakingBr(changedNodes)) {
    return;
  }

  for (const node of changedNodes) {
    const blocks = parseText(getTextContent(node));
    const fragment = document.createDocumentFragment();

    for (const block of blocks) {
      const element = getBlockElement[block.type](block);
      fragment.append(element);
    }

    if (isNodeEqualFragment(moveBRs(node), fragment)) {
      continue;
    }

    const position = saveCaretPosition(input);
    node.replaceWith(fragment);
    restoreCaretPosition(input, position);
  }

  prevNodes = nodes;
  prevNodesCopy = nodes.map((node) => node.cloneNode(true));
}
