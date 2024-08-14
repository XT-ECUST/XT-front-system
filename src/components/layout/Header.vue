<template>
  <div class="header">
    <!-- 左侧图标 -->
    <div class="l-container">
      <el-button size="small" @click="handleCollapse">
        <el-icon :size="20">
          <Menu />
        </el-icon>
      </el-button>
      <!-- <h4>
        <el-breadcrumb separator="/" class="brand">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="currentMenu.path" v-if="currentMenu">{{
            currentMenu.name
          }}</el-breadcrumb-item>
        </el-breadcrumb>
      </h4> -->
    </div>

    <!-- 右侧头像 -->
    <div class="r-container">
      <el-dropdown>
        <span class="el-dropdown-link">
          <img src="../../assets/images/wogua.jpg" alt="" class="wogua" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item @click="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "Header",
  setup() {
    const store = useStore();
    // 1. 侧边栏折叠
    const handleCollapse = () => {
      store.commit("setIsCollapse");
    };
    // 2. 退出登录
    const logout = () => { };
    return { handleCollapse, logout };
  },
});
</script>

<style scoped lang="less">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;

  .l-container {
    display: flex;
    align-items: center;

    h4 {
      margin-left: 20px;
    }
  }

  .r-container {
    .wogua {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }

  .brand span {
    color: #fff !important;
    cursor: pointer;
  }

}
</style>
