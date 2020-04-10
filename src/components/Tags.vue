<template>
  <div class="tags">
    <div @click="toggleChildren">
      <div :style="indent">
        <p v-if="children"></p>
        {{ name }}
      </div>
    </div>
    <tags
      v-if="showChildren"
      v-for="child in children"
      :children="child.children"
      :name="child.name"
      :depth="depth+1"
      :key="child.id"
    >
    </tags>
    </div>
</template>
<script>
export default {
  props: [ 'name', 'children', 'depth' ],
  data () {
    return { showChildren: false }
  },
  name: 'tags',
  computed: {
    indent () {
      return { transform: `translate(${this.depth * 10}px)` }
    }
  },
  methods: {
    toggleChildren () {
      this.showChildren = !this.showChildren
    }
  }
}
</script>
