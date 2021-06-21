import { emojiRegex } from './emoji';
import domains from '../json/domains.json';

// Создает парсер текста, который делит текст на блоки с помощью регулярки.
// parseText вызывается если кусок текста не входит в регулярку
// parseText(value (кусок текста)) {}
// parseElement вызывается если кусок текста уже входит в регулярку
// parseElement(value, match (вывод регулярки)) {}
// Эти функции обязательны и должны вернуть массив, который затем добавится к ответу
// Пример:
// const parser = createParser({
//   regexp: /element/g,
//   parseText: (value) => [{ type: 'text', value }],
//   parseElement: (value, match) => [{ type: 'el', value }]
// });
// const result = parser('text element');
// result = [{ type: 'text', value: 'text ' }, { type: 'el', value: 'element' }];
function createParser({ regexp, parseText, parseElement }) {
  return function(text) {
    const blocks = [];
    let offset = 0;

    for (const match of text.matchAll(regexp)) {
      const { 0: result, index } = match;

      if (index !== offset) {
        blocks.push(...parseText(text.slice(offset, index)));
      }

      blocks.push(...parseElement(result, match));

      offset = index + result.length;
    }

    if (text.length !== offset) {
      blocks.push(...parseText(text.slice(offset, text.length)));
    }

    return blocks;
  };
}
// Хештеги парсятся после масс меншнов потому что #abc@all
// будет упоминать всю беседу, а не игнорировать @all
const hashtagParser = createParser({
  regexp: /#[a-zа-яё0-9_@]+/ig,
  parseText: (value) => [{ type: 'text', value }],
  parseElement: (value) => [{ type: 'hashtag', value }]
});

const linkParser = createParser({
  regexp: /((https?:\/\/)?([a-zа-яё0-9.\-_]+\.([a-zа-яё]{2,18})|(?<localhost>(?<![a-zа-яё0-9])localhost)|(?<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(?<port>:\d{1,5})?(\/(\S*[^.,!?()"';\n\\ ])?)?)(?=$|\s|[^a-zа-яё0-9])/ig,
  parseText: hashtagParser,
  parseElement(value, match) {
    const { localhost, port, ip } = match.groups;
    const isValidIP = !ip || !ip.split('.').find((v) => v > 255);
    const isValidPort = !port || port.slice(1) <= 65535;
    const domain = match[4] && match[4].toLowerCase();
    const isValidDomain = isValidIP && isValidPort && (ip || localhost || domains.includes(domain));

    if (!isValidDomain || match[3].startsWith('.')) {
      return [{ type: 'text', value }];
    }

    // Удаляем из ссылки все, что находится после ) или ",
    // чтобы не ломать отображение ссылок в сжатом JSON или при закрытии скобки
    const removeTextMatch = value.match(/((?:\)|"|\\).+)/);
    let textAfterLink;

    if (removeTextMatch) {
      textAfterLink = removeTextMatch[1];
      value = value.replace(textAfterLink, '');
    }

    let decodedUri = value;

    try {
      decodedUri = decodeURI(value);
    } catch {
      // Попалась ссылка со сломанным закодированным текстом
    }

    return [
      {
        type: 'link',
        value: decodedUri.replace(/(.{55}).+/, '$1..'),
        link: (match[2] ? '' : 'http://') + value
      },
      ...(textAfterLink ? linkParser(textAfterLink) : [])
    ];
  }
});

const mentionParser = createParser({
  regexp: /(?<![a-zа-яё0-9])@([a-z0-9_]{2,})/ig,
  parseText: linkParser,
  parseElement: (value, match) => [{
    type: 'mention',
    value,
    domain: match[1]
  }]
});

const massMentionParser = createParser({
  regexp: /(?:@|\*)(?:(all|everyone|все)|(online|here|здесь|тут))/ig,
  parseText: mentionParser,
  parseElement: (value, match) => [{
    type: 'massMention',
    subtype: match[1] ? 'all' : 'online',
    value
  }]
});

const emailParser = createParser({
  regexp: /\S+@[^\s.]+(\.[^\s.]+)+/ig,
  parseText: massMentionParser,
  parseElement: (value) => [{ type: 'email', value }]
});

const emojiParser = createParser({
  regexp: emojiRegex,
  parseText: emailParser,
  parseElement: (value) => [{ type: 'emoji', value }]
});

export default (text) => emojiParser(text);
