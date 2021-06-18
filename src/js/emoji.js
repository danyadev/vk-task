import { h } from 'vue';
import localEmoji from './localEmoji.json';

// Исправляет некоторые неправильно созданные символы
function generateValidEmoji(emoji) {
  return emoji
    .split('')
    .map((e) => e.charCodeAt(0).toString(16))
    .filter((e) => e.toLowerCase() !== 'fe0f')
    .map((e) => String.fromCodePoint(parseInt(e, 16)))
    .join('');
}

function getEmojiAndStyle(emoji) {
  const validEmoji = generateValidEmoji(emoji);
  const local = localEmoji[validEmoji];
  let style;

  if (local) {
    const [id, x, y, posX, posY] = local.split('|');
    const isRetina = devicePixelRatio > 1;
    const x2 = isRetina ? '_2x' : '';
    const pos = isRetina ? `/ ${posX}px ${posY}px` : '';
    style = `background: url('assets/sprites/sprite_${id}${x2}.png') -${x}px -${y}px ${pos}`;
  }

  return [validEmoji, style];
}

export function generateEmojiImageVNode(emoji) {
  const [validEmoji, style] = getEmojiAndStyle(emoji);

  if (style) {
    return h('img', {
      class: 'emoji',
      src: 'assets/blank.gif',
      alt: validEmoji,
      style
    });
  }

  return validEmoji;
}
