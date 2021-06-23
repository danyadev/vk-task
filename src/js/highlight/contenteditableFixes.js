// В некоторых случаях, когда в поле уже нет текста, внутри поля
// все еще не отображается placeholder (не отрабатывает :empty в css),
// потому что в поле еще есть <br> или <div><br></div>
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

// При переносе строки сразу после подсвеченного текста
// <br> вставляется внутрь <span>text</span>, который и дает тексту другой цвет,
// из-за чего появляются различные проблемы
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

// Shift + Enter так же вставляют <br> внутрь спана,
// делаем такой же фикс, как и в функции выше
export function moveBRs(node) {
  const nodes = [...node.childNodes].reverse();

  for (const child of nodes) {
    if (child.nodeName !== 'BR') {
      break;
    }

    node.insertAdjacentElement('afterend', document.createElement('br'));
    child.remove();
  }

  return node;
}
