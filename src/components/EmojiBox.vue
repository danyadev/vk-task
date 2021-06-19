<template>
  <div class="emoji_box">
    <KeepAlive>
      <EmojiBoxContent
        :key="activeTab"
        :sections="tabContent[activeTab]"
        @addEmoji="$emit('addEmoji')"
      />
    </KeepAlive>

    <div class="emoji_tabs">
      <div
        v-for="tab of tabs"
        :key="tab"
        :class="['emoji_tab', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        <Icon :name="tab" color="var(--button_background)" />
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed } from 'vue';
import sections from '../js/sections.json';

import EmojiBoxContent from './EmojiBoxContent.vue';
import Icon from './Icon.vue';

export default {
  emits: ['addEmoji'],

  components: {
    EmojiBoxContent,
    Icon
  },

  setup() {
    const state = reactive({
      recentEmoji: JSON.parse(localStorage.getItem('recentEmoji') || '[]'),

      tabs: ['emoji', 'recent'],
      activeTab: 'emoji',

      tabContent: computed(() => ({
        emoji: sections,
        recent: [{
          title: 'Часто используемые',
          items: state.recentEmoji
        }]
      }))
    });

    return state;
  }
};
</script>

<style>
.emoji_box {
  position: absolute;
  width: 289px;
  bottom: calc(100% + 10px);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
}

.emoji_tabs {
  display: flex;
  height: 36px;
  background-color: var(--emoji_box_bottom_background);
  border: 1px solid var(--border_color);
  border-top-width: 0;
  border-radius: 0 0 4px 4px;
}

.emoji_tab {
  cursor: pointer;
  width: 36px;
  height: 36px;
  padding: 8px;
  border-bottom: 1px solid var(--border_color);
  transition: background-color .2s;
}

.emoji_tab:first-child {
  border-radius: 0 0 0 4px;
}

.emoji_tab.active {
  background-color: #fff;
}

/* Стрелка */

.emoji_box::before, .emoji_box::after {
  position: absolute;
  content: '';
  top: 100%;
  right: 13px;
  border: solid transparent;
}

.emoji_box::before {
  border-width: 5.4px;
  border-top-color: var(--border_color);
}

.emoji_box::after {
  margin-right: 0.4px;
  border-width: 5px;
  border-top-color: var(--emoji_box_bottom_background);
  transform: translate3d(0, -1px, 0);
}
</style>
