<template>
  <div class="header">
    <!-- 左侧图标 -->
    <div class="l-container">
      <el-button size="small" @click="handleCollapse">
        <el-icon :size="20">
          <Menu />
        </el-icon>
      </el-button>
    </div>

    <!-- 右侧头像 -->
    <div class="r-container">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="el-dropdown-link">
          <img src="../../assets/images/wogua.jpg" alt="" class="wogua" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="user">个人中心</el-dropdown-item>
            <el-dropdown-item divided command="loginout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const store = useStore();

    // 1. 侧边栏折叠
    const handleCollapse = () => {
      store.commit("setIsCollapse");
    };

    // 2. 处理下拉菜单命令
    const handleCommand = (command) => {
      if (command === "loginout") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        router.push("/login");
      } else if (command === "user") {
        router.push("/ucenter");
      }
    };

    return {
      handleCollapse,
      handleCommand,
    };
  },
};
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
