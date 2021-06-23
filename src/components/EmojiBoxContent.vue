<template>
  <Scrolly
    ref="scrolly"
    vclass="emoji_content"
    :lock="lockScroll"
    @scroll="onScroll"
    @keydown="onScrollKeydown"
  >
    <div
      v-for="section of sections.slice(0, visibleSections)"
      :key="section.title"
      class="emoji_section"
    >
      <div class="emoji_section_name">{{ section.title }}</div>
      <div class="emoji_section_items">
        <div
          v-for="emoji of section.items"
          :key="emoji"
          tabindex="-1"
          class="emoji_section_item"
          :data-emoji="emoji"
          @focus="addFocus"
          @blur="removeFocus"
          @click="addEmoji($event, emoji)"
        >
          <Emoji>{{ emoji }}</Emoji>
        </div>
      </div>
    </div>
  </Scrolly>
</template>

<script>
import { reactive, computed, toRefs, onActivated, onDeactivated } from 'vue';
import { endScroll } from '../js/utils';

import Scrolly from './Scrolly.vue';
import Emoji from './Emoji.vue';

export default {
  props: ['sections'],
  emits: ['addEmoji'],

  components: {
    Scrolly,
    Emoji
  },

  setup(props, { emit }) {
    const state = reactive({
      scrolly: null,
      viewport: computed(() => state.scrolly && state.scrolly.viewport),
      scrollTop: null,
      lockScroll: false,
      visibleSections: 1,
      sections: computed(() => props.sections.map((section) => section.items))
    });

    const arrowKeys = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];

    function addEmoji(event, emoji) {
      emit('addEmoji', emoji);
      addFocus(event);
    }

    /* Scroll */

    function onScroll(scrollyEvent) {
      state.scrollTop = scrollyEvent.viewport.scrollTop;
      checkScroll(scrollyEvent);
    }

    const checkScroll = endScroll(() => {
      if (state.visibleSections !== props.sections.length) {
        state.visibleSections = Math.min(state.visibleSections + 2, props.sections.length);
      }
    });

    function onScrollKeydown(event) {
      if (arrowKeys.includes(event.code)) {
        event.preventDefault();
      }
    }

    /* Focus */

    function addFocus(event) {
      [...state.viewport.querySelectorAll('.emoji_section_item.focused')].map((el) => {
        el.classList.remove('focused');
      });

      event.currentTarget.classList.add('focused');
    }

    function removeFocus(event) {
      const emojis = state.viewport.querySelectorAll('.emoji_section_item.focused');

      if (emojis.length > 1) {
        event.currentTarget.classList.remove('focused');
      }
    }

    /* KeyDown handling */

    function onKeyDown(event) {
      if (
        // ctrl - для возможности исползовать стрелки в инпуте
        // shift - для переноса строки (и выделения текста стрелкой)
        event.ctrlKey || event.shiftKey ||
        event.code !== 'Enter' && !arrowKeys.includes(event.code)
      ) {
        return;
      }

      event.preventDefault();

      const emojiItem = state.viewport.querySelector('.emoji_section_item.focused');

      if (!emojiItem) {
        const item = state.viewport.querySelector('.emoji_section_item');

        if (item) {
          item.classList.add('focused');
        }

        // Первым нажатием мы просто "инициализируем" работу с клавиатурой
        return;
      }

      if (event.code === 'Enter') {
        emit('addEmoji', emojiItem.dataset.emoji);
      }

      const EMOJI_ON_LINE = 10;
      const { emoji } = emojiItem.dataset;

      const getPosition = (section) => {
        const index = section.indexOf(emoji);
        const line = Math.floor(index / EMOJI_ON_LINE);
        const row = index % EMOJI_ON_LINE;

        return { line, row };
      };

      const getByPosition = (section, line, row) => (
        section[line * EMOJI_ON_LINE + row]
      );

      const getLines = (section) => {
        const linesCount = Math.ceil(section.length / EMOJI_ON_LINE);
        const lines = [];

        for (let i = 0; i < linesCount; i++) {
          lines.push(section.slice(i * EMOJI_ON_LINE, (i + 1) * EMOJI_ON_LINE));
        }

        return lines;
      };

      const setEmoji = (emoji) => {
        const el = state.viewport.querySelector(`[data-emoji="${emoji}"]`);
        el.focus();
      };

      const sectionIndex = state.sections.findIndex((section) => section.includes(emoji));
      const prevSection = state.sections[sectionIndex - 1];
      const section = state.sections[sectionIndex];
      const nextSection = state.sections[sectionIndex + 1];

      if (event.code === 'ArrowLeft') {
        const emojiIndex = section.indexOf(emoji);

        if (emojiIndex) {
          setEmoji(section[emojiIndex - 1]);
        } else if (prevSection) {
          setEmoji(prevSection[prevSection.length - 1]);
        }
      }

      if (event.code === 'ArrowRight') {
        const emojiIndex = section.indexOf(emoji);

        if (emojiIndex !== section.length - 1) {
          setEmoji(section[emojiIndex + 1]);
        } else if (nextSection) {
          setEmoji(nextSection[0]);
        }
      }

      if (event.code === 'ArrowUp') {
        const position = getPosition(section);

        if (position.line) {
          setEmoji(getByPosition(section, position.line - 1, position.row));
        } else if (prevSection) {
          const lines = getLines(prevSection);
          const row = Math.min(position.row, lines[lines.length - 1].length - 1);

          setEmoji(getByPosition(prevSection, lines.length - 1, row));
        }
      }

      if (event.code === 'ArrowDown') {
        const position = getPosition(section);
        const lines = getLines(section);

        if (position.line !== lines.length - 1) {
          const row = Math.min(position.row, lines[position.line + 1].length - 1);
          setEmoji(getByPosition(section, position.line + 1, row));
        } else if (nextSection) {
          setEmoji(getByPosition(nextSection, 0, position.row));
        }
      }

      document.querySelector('.input').focus();
    }

    onActivated(() => {
      // Восстанавливаем сохраненную позицию скролла
      if (state.scrollTop !== null) {
        state.viewport.scrollTop = state.scrollTop;
      }

      window.addEventListener('keydown', onKeyDown);
    });

    onDeactivated(() => {
      window.removeEventListener('keydown', onKeyDown);
    });

    return {
      ...toRefs(state),

      addEmoji,

      onScroll,
      onScrollKeydown,

      addFocus,
      removeFocus
    };
  }
};
</script>

<style>
.emoji_content {
  height: 245px;
  padding: 0 10px 10px 10px;
  border: 1px solid var(--border_color);
  border-bottom-width: 0;
  border-radius: 4px 4px 0 0;
}

.emoji_section_name {
  color: var(--placeholder_color);
  margin: 10px 0 8px 0;
}

.emoji_section_items {
  display: flex;
  flex-wrap: wrap;
}

.emoji_section_item {
  width: 26px;
  height: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color .1s;
}

.emoji_section_item:hover,
.emoji_section_item.focused {
  background-color: var(--emoji_box_item_hover);
  border-radius: 3px;
}
</style>
