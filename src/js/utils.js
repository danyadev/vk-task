export function timer(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function escape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Вызывает переданную функцию через delay мс после последнего вызова
export function debounce(fn, delay) {
  let timerId;

  return function(...args) {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delay);
  };
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
