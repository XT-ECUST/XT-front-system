<template>
  <div ref="container" style="width: 800px; height: 600px;"></div>
</template>

<script>
import { Graph } from '@antv/x6'
import { ref } from 'vue'

export default {
  mounted() {
    // 获取容器
    const container = this.$refs.container

    // 创建画布
    const graph = new Graph({
      container,
      width: 800,
      height: 600
    })

    // 创建一个简单的矩形节点
    const rect = graph.addNode({
      shape: 'rect',
      x: 100,
      y: 100,
      width: 100,
      height: 50,
      attrs: {
        body: {
          fill: 'lightblue'
        }
      }
    })

    // 创建另一个节点
    const circle = graph.addNode({
      shape: 'circle',
      x: 300,
      y: 100,
      width: 50,
      height: 50,
      attrs: {
        body: {
          fill: 'lightgreen'
        }
      }
    })

    // 连接两个节点
    graph.addEdge({
      source: rect,
      target: circle
    })
  }
}
</script>