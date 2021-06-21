<template>
  <div class="emoji_box">
    <KeepAlive>
      <EmojiBoxContent
        :key="activeTab"
        :sections="tabContent[activeTab]"
        @addEmoji="addEmoji"
      />
    </KeepAlive>

    <div class="emoji_tabs">
      <div
        v-for="tab of tabs"
        :key="tab"
        :class="['emoji_tab', { active: activeTab === tab }]"
        @click="setActiveTab(tab)"
      >
        <Icon :name="tab" color="var(--button_background)" />
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, toRefs } from 'vue';
import copyObject from '../js/copyObject';
import sections from '../json/sections.json';

import EmojiBoxContent from './EmojiBoxContent.vue';
import Icon from './Icon.vue';

export default {
  emits: ['addEmoji'],

  components: {
    EmojiBoxContent,
    Icon
  },

  setup(props, { emit }) {
    const state = reactive({
      recentEmojiMap: JSON.parse(localStorage.getItem('recentEmoji') || '{}'),
      recentEmoji: computed(() => (
        Object
          .entries(state.recentEmojiMap)
          .sort((a, b) => b[1] - a[1])
          .map((entry) => entry[0])
      )),

      // Обновляется при переходе в раздел недавних
      currentRecentEmoji: null,

      tabs: ['emoji', 'recent'],
      activeTab: 'emoji',

      tabContent: computed(() => ({
        emoji: sections,
        recent: [{
          title: 'Часто используемые',
          items: state.currentRecentEmoji
        }]
      }))
    });

    function addEmoji(emoji) {
      if (state.recentEmojiMap[emoji]) {
        state.recentEmojiMap[emoji]++;
      } else {
        const recent = state.recentEmoji;

        if (recent.length > 25) {
          delete state.recentEmojiMap[recent[recent.length - 1]];
        }

        state.recentEmojiMap[emoji] = 1;
      }

      localStorage.setItem('recentEmoji', JSON.stringify(state.recentEmojiMap));

      emit('addEmoji', emoji);
    }

    function setActiveTab(tab) {
      if (tab === 'recent') {
        state.currentRecentEmoji = copyObject(state.recentEmoji);
      }

      state.activeTab = tab;
    }

    return {
      ...toRefs(state),

      addEmoji,
      setActiveTab
    };
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
  border-width: 6px;
  border-top-color: var(--border_color);
  transform: translate3d(0, -0.5px, 0);
}

.emoji_box::after {
  margin-right: 1px;
  border-width: 5px;
  border-top-color: var(--emoji_box_bottom_background);
  transform: translate3d(0, -1px, 0);
}
</style>
