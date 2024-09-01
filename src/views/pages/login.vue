<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img style="width: 35px" src="" alt="" />
        <div class="login-title">新特工业互联网系统平台</div>
      </div>
      <div class="login-form">
        <el-form :model="user" label-width="auto" ref="userRef" :rules="rules" style="max-width: 450px">
          <el-form-item prop="username">
            <el-input v-model="user.username" placeholder="请输入用户名" minlength="8" maxlength="16">
              <template #prepend>
                <el-icon>
                  <User />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              v-model="user.password"
              placeholder="请输入密码"
              minlength="6"
              maxlength="16"
              @keyup.enter.native="handleLogin(userRef)"
            >
              <template #prepend>
                <el-icon>
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <div class="pwd-tips">
            <el-checkbox class="pwd-checkbox" v-model="checked" label="记住密码" />
          </div>
          <el-form-item>
            <el-button type="primary" @click="handleLogin(userRef)" class="login-btn" size="large">登录</el-button>
          </el-form-item>
          <p class="login-text">
            没有账号？<el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
          </p>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { login } from "../../../api/login.js";
import { useRouter } from "vue-router";

const router = useRouter();

const lgStr = localStorage.getItem("user-param");
const userParam = lgStr ? JSON.parse(lgStr) : null;
const checked = ref(lgStr ? true : false);
const user = ref({
  username: userParam ? userParam.username : "",
  password: userParam ? userParam.password : "",
});

const userRef = ref(null);

const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 8, max: 16, message: "工号长度为8位", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 16, message: "密码长度为6-16位", trigger: "blur" },
  ],
};

const handleLogin = (formEl) => {
  formEl.validate().then(() => {
    login(user.value)
      .then((response) => {
        console.log(response);
        if (response.data.code === 1) {
          ElMessage.success("登录成功");
          sessionStorage.setItem("token", response.data.data);
          console.log(response.data.data);
          localStorage.setItem("username", user.value.username);
          router.push("/");
          if (checked.value) {
            localStorage.setItem("user-param", JSON.stringify(user.value));
          } else {
            localStorage.removeItem("user-param");
          }
        } else {
          ElMessage.error(response.data.msg);
        }
      })
      .catch((error) => {
        ElMessage.error(error.message);
      });
  });
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: url(../../assets/images/login-bg.jpg) center/cover no-repeat;
}

.login-box {
  width: 450px;
  padding: 40px 50px 50px;
  background-color: #fff;
  border-radius: 5px;
  box-sizing: border-box;
}

.login-title {
  font-size: 22px;
  color: #333;
  font-weight: bold;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.pwd-tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin: 10px 0 10px;
  color: #787878;
}

.pwd-checkbox {
  height: auto;
}

.login-btn {
  display: block;
  width: 100%;
}

.login-text {
  display: flex;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
  color: #787878;
}
</style>
