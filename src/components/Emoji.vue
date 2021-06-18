<script>
import { h, computed } from 'vue';
import { generateEmojiImageVNode } from '../js/emoji';

export default {
  setup(props, { slots }) {
    const text = computed(() => slots.default()[0].children);

    return () => generateEmojiImageVNode(text.value);
  }
};
</script>
