export function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Возвращает функцию, которая вызывает колбэк, если юзер долистал
// список до конца, чтобы загрузить новую часть списка
export function endScroll(callback) {
  return function({ viewport: { scrollTop, scrollHeight, offsetHeight } }) {
    // Если блок пустой либо видимая область блока = 0px.
    // Обычно возникает когда у блока стоит display: none или он скрыт другим способом.
    if (!scrollHeight || !offsetHeight) {
      return;
    }

    const isScrolledDown = scrollTop + offsetHeight + 20 >= scrollHeight;

    if (isScrolledDown) {
      callback.call(this);
    }
  };
}

export function mouseOverWrapper(fn) {
  return (event) => {
    const root = event.currentTarget;

    if (!event.fromElement || !root.contains(event.fromElement)) {
      fn(event);
    }
  };
}

export function mouseOutWrapper(fn, getIgnore) {
  return (event) => {
    const root = event.currentTarget;

    if (
      !event.toElement ||
      !root.contains(event.toElement) &&
        !getIgnore().some((el) => el.contains(event.toElement))
    ) {
      fn(event);
    }
  };
}
