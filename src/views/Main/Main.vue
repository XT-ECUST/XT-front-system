<template>
  <div class="common-layout">
    <el-container>
      <el-aside :width="!$store.state.isCollapse ? '200px' : '64px'"
        ><SideVue></SideVue
      ></el-aside>
      <el-container>
        <el-header><HeaderVue></HeaderVue></el-header>
        <el-main><router-view /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import HeaderVue from "../../components/layout/Header.vue";
import SideVue from "../../components/layout/Aside.vue";

export default {
  name: "Main",
  components: {
    HeaderVue,
    SideVue,
  },
  setup() {
    return {};
  },
};
</script>

<style scoped lang="less">
.common-layout {
  width: 100%;
  height: 100%;
  .el-container {
    width: 100%;
    height: 100%;

    .el-aside {
      height: 100%;
      background-color: #001529;
    }
    .el-header {
      height: 50px;
      background-color: #fff;
    }

    .el-main {
      margin: 20px;
      background-color: #fff;
    }
  }
}
</style>
