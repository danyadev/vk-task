<template>
  <div class="emoji_box">
    <div class="emoji_container"></div>

    <div class="emoji_bottom_nav"></div>
  </div>
</template>

<script>
export default {
};
</script>

<style>
.emoji_box {
  position: absolute;
  width: 289px;
  bottom: calc(100% + 10px);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
}

.emoji_container {
  height: 245px;
  border: 1px solid var(--border_color);
  border-bottom-width: 0;
  border-radius: 4px 4px 0 0;
}

.emoji_bottom_nav {
  height: 36px;
  background-color: var(--emoji_box_bottom_background);
  border: 1px solid var(--border_color);
  border-top-width: 0;
  border-radius: 0 0 4px 4px;
}

/* Стрелка */

.emoji_box::before, .emoji_box::after {
  right: 13px;
  top: 100%;
  border: solid transparent;

  position: absolute;
  content: '';
  height: 0;
  width: 0;
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
