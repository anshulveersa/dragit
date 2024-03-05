<template>
  <div class="container">
    <div class="scrollable">
      <draggable resizable v-slot="attrs">
        <div class="tile" v-bind="attrs">Some draggable content</div>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import Draggable from "./components/Draggable.vue";
</script>

<style scoped>
.container {
  width: 80%;
  height: 80vh;
  overflow-y: scroll;
  margin: 80px auto;
}

.scrollable {
  height: 200vh;
  background: linear-gradient(rgb(119, 43, 43), rgb(0, 255, 17));
}

.tile {
  border: 1px solid rgb(118, 98, 98);
  background-color: cadetblue;
  padding: 24px;
}
</style>
