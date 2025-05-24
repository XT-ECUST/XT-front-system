<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <img style="width: 35px" src="" alt="" />
        <div class="register-title">新特工业互联网系统平台</div>
      </div>
      <div class="register-form">
        <el-form :model="registerForm" label-width="auto" ref="registerRef" :rules="rules" style="max-width: 450px">
          <el-form-item prop="username">
            <el-input v-model="registerForm.username" placeholder="请输入用户名" maxlength="8">
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
              v-model="registerForm.password"
              placeholder="请输入密码"
              minlength="6"
              maxlength="16"
              @keyup.enter.native="handleRegister(registerRef)"
            >
              <template #prepend>
                <el-icon>
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRegister(registerRef)" class="register-btn" size="large"
              >注册</el-button
            >
          </el-form-item>
          <p class="register-text">
            已有账号，<el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
          </p>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { register } from "../../../api/login.js";
import { useRouter } from "vue-router";

const router = useRouter();

const registerForm = ref({
  username: "",
  password: "",
});

const registerRef = ref(null);

const rules = {
  jobnumber: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 8, max: 8, message: "用户名长度为8位", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 16, message: "密码长度为6-16位", trigger: "blur" },
  ],
};

const handleRegister = (formEl) => {
  formEl.validate().then(() => {
    register(registerForm.value)
      .then((response) => {
        if (response.data.code === 1) {
          ElMessage.success("注册成功，请登录");
          localStorage.removeItem("user-param");
          router.push("/login");
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: url(../../assets/images/bk2.jpg) center/cover no-repeat;
}

.register-box {
  width: 450px;
  padding: 40px 50px 50px;
  background-color: #fff;
  border-radius: 5px;
  box-sizing: border-box;
}

.register-title {
  font-size: 22px;
  color: #333;
  font-weight: bold;
}

.register-header {
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

.register-btn {
  display: block;
  width: 100%;
}

.register-text {
  display: flex;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
  color: #787878;
}
</style>
