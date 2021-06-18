<template>
  <div class="emoji_box">
    <Scrolly vclass="emoji_content">
      <template v-if="activeTab === 'emoji'">
        <div v-for="section in sections" class="emoji_section">
          <div class="emoji_section_name">{{ section.title }}</div>
          <div class="emoji_section_items">
            <div v-for="emoji of section.items" class="emoji_section_item">
              {{ emoji }}
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="emoji_section">
          <div class="emoji_section_name">Часто используемые</div>
          <div class="emoji_section_items">...</div>
        </div>
      </template>
    </Scrolly>

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
import { ref } from 'vue';
import sections from '../js/sections.json';

import Icon from './Icon.vue';
import Scrolly from './Scrolly.vue';

export default {
  components: {
    Icon,
    Scrolly
  },

  setup() {
    return {
      activeTab: ref('emoji'),
      tabs: ['emoji', 'recent'],
      sections
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
  display: flex;
  align-items: center;
  justify-content: center;
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
