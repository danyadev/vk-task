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
        @paste.prevent="paste"
        @mousedown="setCaretForEmoji"
      ></div>

      <Transition name="toggle">
        <KeepAlive>
          <EmojiBox v-if="isEmojiBoxOpened" @addEmoji="onAddEmoji" />
        </KeepAlive>
      </Transition>

      <Icon name="emoji" class="emoji_btn" @click="isEmojiBoxOpened = !isEmojiBoxOpened" />
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from 'vue';
import { escape } from './js/utils';
import { isEmoji, getEmojiHTML } from './js/emoji';

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
      lastSelection: null
    });

    onMounted(() => {
      document.addEventListener('selectionchange', () => {
        const selection = document.getSelection();

        if (state.input.contains(selection.anchorNode)) {
          console.log('set selection', selection);
          state.lastSelection = selection;
        }
      });
    });

    function addHTMLToSelection(selection, html) {
      if (selection.type === 'Range') {
        selection.deleteFromDocument();
        selection.collapseToEnd();
      }

      const range = selection.getRangeAt(0);
      const fragment = range.createContextualFragment(html);
      const lastNode = fragment.childNodes[fragment.childNodes.length - 1];

      range.insertNode(fragment);
      range.setStartAfter(lastNode);
      range.collapse(true);
    }

    function onAddEmoji(emoji) {
      console.log('before add emoji');
      addHTMLToSelection(state.lastSelection, getEmojiHTML(emoji));
      console.log('before focus (after add emoji)');
      state.input.focus();
      console.log('after focus');
    }

    function onInput(event) {
      if (!event.data) {
        return;
      }

      // Если юзер вводит эмодзи через системную панель
      if (isEmoji(event.data)) {
        preventInputEvent(event);

        const text = escape(event.data).replace(/\n/g, '<br>');
        document.execCommand('insertHTML', false, getEmojiHTML(text));
      }
    }

    function preventInputEvent(event) {
      const range = new Range();
      const sel = window.getSelection();

      const node = [...state.input.childNodes].find((el) => el === sel.anchorNode);
      const emojiIndex = node.data.indexOf(event.data);

      range.setStart(node, emojiIndex);
      range.setEnd(node, emojiIndex + event.data.length);

      if (!sel.isCollapsed) {
        // Удаляем уже выделенный ранее текст
        document.execCommand('delete');
      }

      // Создаем свое выделение
      sel.removeAllRanges();
      sel.addRange(range);

      // Удаляем выделенный текст
      document.execCommand('delete');
    }

    async function paste(pasteText) {
      const text = escape(
        typeof pasteText === 'string'
          ? pasteText
          : await navigator.clipboard.readText()
      ).replace(/\n/g, '<br>');

      document.execCommand('insertHTML', false, getEmojiHTML(text));
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

    return {
      ...toRefs(state),

      onAddEmoji,
      onInput,
      paste,
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
  max-height: 150px;
}

.input:empty::before {
  content: attr(placeholder);
  color: var(--placeholder_color);
  cursor: text;
}

.input::-webkit-scrollbar {
  display: none;
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
