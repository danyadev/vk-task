<template>
  <Scrolly
    ref="scrolly"
    vclass="emoji_content"
    :lock="lockScroll"
    @scroll="onScroll"
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
          class="emoji_section_item"
          @click="$emit('addEmoji', emoji)"
        >
          <Emoji>{{ emoji }}</Emoji>
        </div>
      </div>
    </div>
  </Scrolly>
</template>

<script>
import { reactive, toRefs, nextTick, onActivated } from 'vue';
import { timer, endScroll } from '../js/utils';

import Scrolly from './Scrolly.vue';
import Emoji from './Emoji.vue';

export default {
  props: ['sections'],
  emits: ['addEmoji'],

  components: {
    Scrolly,
    Emoji
  },

  setup(props) {
    const state = reactive({
      scrolly: null,
      scrollTop: null,
      lockScroll: false,
      visibleSections: 1
    });

    onActivated(() => {
      if (state.scrollTop !== null) {
        state.scrolly.viewport.scrollTop = state.scrollTop;
      }
    });

    function onScroll(scrollyEvent) {
      state.scrollTop = scrollyEvent.viewport.scrollTop;
      checkScroll(scrollyEvent);
    }

    const checkScroll = endScroll(async () => {
      if (!state.lockScroll && state.visibleSections !== props.sections.length) {
        state.lockScroll = true;

        // Вполне комфортное время ожидания для окончания скролла,
        // чтобы при добавлении секций эмодзи не было видно подлагивания
        await timer(100);

        state.visibleSections = Math.min(state.visibleSections + 2, props.sections.length);

        await nextTick();
        requestIdleCallback(() => (state.lockScroll = false));
      }
    });

    return {
      ...toRefs(state),
      onScroll
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

.emoji_content::-webkit-scrollbar {
  display: none;
}

.emoji_section_name {
  color: #939393;
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
}
</style>
