<script>
import { h, computed } from 'vue';
import { getEmojiAndBackground } from '../js/emoji';

export default {
  setup(props, { slots }) {
    const text = computed(() => slots.default()[0].children);

    return () => {
      const [emoji, background] = getEmojiAndBackground(text.value);

      if (background) {
        return h('img', {
          class: 'emoji',
          src: 'assets/blank.gif',
          alt: emoji,
          style: { background }
        });
      }

      return emoji;
    };
  }
};
</script>
