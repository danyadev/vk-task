<template>
  <div class="chat">
    <div class="messages_filler"></div>
    Поле для ввода текста будет здесь
  </div>
</template>

<script>
export default {
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
  height: 300px;
}
</style>
