<template>
  <div class="chat">
    <div class="messages_filler"></div>

    <div class="input_wrap">
      <div
        ref="inputRef"
        class="input"
        role="textbox"
        contenteditable
        placeholder="Ваше сообщение"
      ></div>

      <Transition name="toggle">
        <EmojiBox v-if="isEmojiBoxOpened" @addEmoji="onAddEmoji" />
      </Transition>

      <Icon name="emoji" class="emoji_btn" @click="isEmojiBoxOpened = !isEmojiBoxOpened" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

import EmojiBox from './components/EmojiBox.vue';
import Icon from './components/Icon.vue';

export default {
  components: {
    EmojiBox,
    Icon
  },

  setup() {
    const isEmojiBoxOpened = ref(false);
    const inputRef = ref();

    function onAddEmoji() {
      // TODO
    }

    return {
      isEmojiBoxOpened,
      inputRef,
      onAddEmoji
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
