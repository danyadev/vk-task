import parseText from './textParser';
import { getEmojiAndBackground } from './emoji';

function flatNodes(childNodes, isBRAdded = false) {
  const nodes = [];

  function isBR(node) {
    return (
      node.nodeName === 'BR' ||
      node.childNodes.length === 1 &&
      node.childNodes[0].nodeName === 'BR'
    );
  }

  for (const node of childNodes) {
    if (node.nodeName === 'DIV') {
      if (!isBRAdded && !isBR(node) && !nodes.every(isBR)) {
        isBRAdded = true;
        nodes.push(document.createElement('br'));
      }

      nodes.push(...flatNodes(node.childNodes, isBRAdded));
    } else if (node.nodeName === 'SPAN') {
      nodes.push(...flatNodes(node.childNodes, isBRAdded));
    } else {
      nodes.push(node);
    }
  }

  return nodes;
}

function getTextContent(nodes) {
  let text = '';

  for (const node of nodes) {
    if (node.nodeName === '#text') text += node.data.replace(/\n/g, '');
    else if (node.nodeName === 'BR') text += '\n';
    else if (node.nodeName === 'IMG') text += node.alt;
    else text += node.innerText;
  }

  return text;
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
  br: () => document.createElement('br'),
  brDiv: () => {
    const div = document.createElement('div');
    div.append(document.createElement('br'));
    return div;
  },
  email: (block) => createSpan(block.value),
  massMention: (block) => createSpan(block.value),
  mention: (block) => createSpan(block.value),
  link: (block) => createSpan(block.value),
  hashtag: (block) => createSpan(block.value),
  text: (block) => block.value
};

function getCaretIndex(input) {
  const range = window.getSelection().getRangeAt(0);
  const preCaretRange = range.cloneRange();

  preCaretRange.selectNodeContents(input);
  preCaretRange.setEnd(range.endContainer, range.endOffset);

  const nodes = [...preCaretRange.cloneContents().childNodes].filter((node) => {
    return node.nodeName !== 'BR';
  });

  return getTextContent(nodes).length;
}

function getCaretNodeAndOffset(nodes, caretIndex) {
  let readed = 0;

  for (const node of nodes) {
    if (node.nodeName === 'BR') {
      continue;
    }

    const len = getTextContent([node]).length;

    if (readed + len >= caretIndex) {
      return [node, caretIndex - readed];
    }

    readed += len;
  }

  return [];
}

let prevNodes;

export default function(input, event) {
  const childNodes = flatNodes(input.childNodes);

  // Фикс отображения пустого инпута вместо placeholder
  if (childNodes.length === 1 && childNodes[0].nodeName === 'BR') {
    input.replaceChildren();
    prevNodes = [];
    return;
  }

  // Удаление пустой строки (не меняет численную позицию каретки)
  if (event.inputType === 'deleteContentBackward') {
    const deletedNodes = prevNodes.filter((node) => !childNodes.includes(node));

    const needSkip = deletedNodes.every((node) => (
      // Удаляется пустая строка (помним, что пустая строка не меняет численную позицию каретки)
      node.nodeName === 'BR' ||
      // Создается пустая строка (был какой-то символ и его удалили)
      !node.childNodes.length
    ));

    if (deletedNodes.length && needSkip) {
      prevNodes = childNodes;
      return;
    }
  }

  prevNodes = childNodes;

  // Перенос строки (не меняет численную позицию каретки)
  if (['insertParagraph', 'insertText'].includes(event.inputType) && event.data === null) {
    return;
  }

  const content = getTextContent(childNodes);
  // Парсеры выполняются последовательно (см. исходники)
  // emoji -> br -> email -> massMention -> mention -> link -> hashtag -> text
  // последовательность, очевидно, должна быть именно такой,
  // чтобы все блоки определились правильно
  const blocks = parseText(content);
  const fragment = document.createDocumentFragment();

  for (const block of blocks) {
    const element = getBlockElement[block.type](block);
    fragment.append(element);
  }

  const caretIndex = getCaretIndex(input);

  input.replaceChildren(fragment);

  const newNodes = flatNodes(input.childNodes, true);
  const [node, offset] = getCaretNodeAndOffset(newNodes, caretIndex);

  if (node) {
    const range = window.getSelection().getRangeAt(0);

    if (node.nodeName === 'IMG') {
      range.setStartAfter(node, offset);
    } else {
      range.setStart(node, offset);
    }

    range.collapse(true);
  }

  prevNodes = newNodes;
}
