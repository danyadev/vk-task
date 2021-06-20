<template>
  <div class="chat">
    <div class="messages_filler"></div>

    <div class="input_wrap">
      <div
        ref="input"
        class="input"
        role="textbox"
        contenteditable
        placeholder="Ваше сообщение"
        @input="onInput"
        @drop.prevent
        @paste.prevent="onPaste"
        @mousedown="setCaretForEmoji"
      ></div>

      <Transition name="toggle">
        <KeepAlive>
          <EmojiBox v-if="isEmojiBoxOpened" @addEmoji="addEmoji" />
        </KeepAlive>
      </Transition>

      <Icon name="emoji" class="emoji_btn" @click="isEmojiBoxOpened = !isEmojiBoxOpened" />
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue';
import { escape } from './js/utils';
import { isEmoji, getEmojiAndBackground } from './js/emoji';
import highlightInputContent from './js/highlightInputContent';

import EmojiBox from './components/EmojiBox.vue';
import Icon from './components/Icon.vue';

export default {
  components: {
    EmojiBox,
    Icon
  },

  setup() {
    const state = reactive({
      isEmojiBoxOpened: false,
      input: null,
      isWinAddEmoji: false
    });

    function addEmoji(emoji) {
      state.input.focus();
      insertText(emoji);
    }

    function onInput(event) {
      console.log(event);

      if (event.data) {
        // На Windows при использовании системной панели эмодзи событие с добавлением
        // эмодзи приходит аж два раза подряд, поэтому здесь нужна такая проверка
        if (state.isWinAddEmoji) {
          state.isWinAddEmoji = false;
          preventInputEvent(event);
          return;
        }

        if (event.inputType === 'insertCompositionText') {
          state.isWinAddEmoji = true;
        }
      }

      highlightInputContent(state.input, event);
    }

    function onPaste(event) {
      insertText(event.clipboardData.getData('Text'));
    }

    function setCaretForEmoji(event) {
      if (event.target.tagName !== 'IMG') {
        return;
      }

      const range = new Range();
      const sel = window.getSelection();

      range.selectNode(event.target);
      range.collapse(event.offsetX <= event.target.clientWidth / 2);

      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Удаляем последний добавленный в инпут элемент (в нашем случае эмодзи)
    function preventInputEvent(event) {
      function getNodes(childNodes) {
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

      const selection = window.getSelection();
      const nodes = getNodes(state.input.childNodes);
      const node = nodes.find((el) => el === selection.anchorNode);

      const range = new Range();
      const emojiIndex = node.data.indexOf(event.data);

      range.setStart(node, emojiIndex);
      range.setEnd(node, emojiIndex + event.data.length);
      range.deleteContents();
    }

    function getEmojiHTML(emoji) {
      const [validEmoji, background] = getEmojiAndBackground(emoji);

      if (background) {
        const style = `background: ${background}`;
        return `<img class="emoji" src="assets/blank.gif" style="${style}" alt="${validEmoji}">`;
      }

      return validEmoji;
    }

    function insertText(text) {
      const data = escape(text).replace(/\n/g, '<br>');
      document.execCommand('insertHTML', false, getEmojiHTML(data));
    }

    return {
      ...toRefs(state),

      addEmoji,
      onInput,
      onPaste,
      setCaretForEmoji
    };
  }
};
</script>

<style>
.chat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.messages_filler {
  width: 100%;
  height: 350px;
}

.input_wrap {
  position: relative;
  display: flex;
  width: 290px;
  border: 1px solid var(--border_color);
  border-radius: 4px;
  line-height: 18px;
}

.input {
  flex-grow: 1;
  overflow-x: hidden;
  padding: 9px 0 9px 9px;
  max-height: 180px;
}

/* emoji */
.input img {
  user-select: text;
}

.input:empty::before {
  content: attr(placeholder);
  color: var(--placeholder_color);
  cursor: text;
}

.emoji_btn {
  box-sizing: content-box;
  flex: none;
  height: 20px;
  padding: 8px;
  cursor: pointer;
  color: var(--button_background);
  opacity: .7;
  transition: opacity .3s;
}

.emoji_btn:active {
  transform: translateY(1px);
}

.emoji_btn:hover {
  opacity: 1;
}

.toggle-enter-active,
.toggle-leave-active {
  transition: all 0.2s ease-out;
}

.toggle-enter-from,
.toggle-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
