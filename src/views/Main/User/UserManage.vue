<template>
  <div style="margin: 10px 50px 0px 50px">
    <!--搜索栏-->
    <div class="search-container">
      <el-form :inline="true" :model="userSearch" class="demo-form-inline">
        <el-form-item label="姓名：">
          <el-input v-model="userSearch.name" placeholder="姓名" clearable />
        </el-form-item>
        <el-form-item label="性别" style="width: 200px">
          <el-select v-model="userSearch.gender" placeholder="性别" clearable>
            <el-option label="男" value="1" />
            <el-option label="女" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button type="info" icon="RefreshLeft" @click="clearAll">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--新增与批量删除按钮-->
    <el-button type="primary" plain icon="Plus" @click="handleAddUser"> 新增用户 </el-button>
    <el-button type="danger" plain icon="Delete" @click="deleteByIds"> 批量删除 </el-button>
    <!--表格展示列表-->
    <el-table
      :data="userData"
      style="width: 100%; margin-top: 10px; margin-bottom: 10px"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column fixed prop="id" label="序号" width="100" header-align="center" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="180" header-align="center" align="center" />
      <el-table-column prop="name" label="姓名" width="180" header-align="center" align="center" />
      <el-table-column prop="role" label="角色" width="180" header-align="center" align="center">
        <template #default="{ row }">
          <!-- <span style="margin-right: 10px">
            {{row.role == "1" ? "普通用户" : "VIP"}}</span> -->
          <el-tag :type="row.role == '1' ? 'success' : 'warning'" style="width: 55px; margin-right: 10px">
            {{ row.role == "1" ? "普通用户" : "VIP" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="gender" label="性别" width="200" header-align="center" align="center">
        <template #default="{ row }">
          <span style="margin-right: 10px"> {{ row.gender == "1" ? "男" : "女" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机" width="200" header-align="center" align="center" />
      <el-table-column label="最后操作时间" width="300" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.updateTime ? row.updateTime.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="300" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" plain icon="Edit" @click="handleEdit(row.id)"> 编辑 </el-button>
          <el-button type="danger" size="small" plain icon="delete" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页工具条-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :background="background"
      :current-page="currentPage"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="5"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount"
    >
    </el-pagination>

    <!--对话框组件-->
    <el-dialog v-model="showAddUser" title="新增用户">
      <el-form :model="user" :rules="rules" ref="formRef" label-width="auto" style="max-width: 600px">
        <el-form-item label="用户名">
          <el-input v-model="user.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="user.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="user.gender" placeholder="性别" clearable>
            <el-option v-for="item in genderList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="user.role" placeholder="角色" clearable>
            <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="user.phone" placeholder="请输入11位手机号" @input="handlePhoneInput" />
        </el-form-item>
      </el-form>
      <el-form-item>
        <el-button type="primary" @click="submitAdd()">确定</el-button>
        <el-button @click="showAddUser = false">取消</el-button>
      </el-form-item>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { page, add, update, deleteById, selectById } from "../../../../api/user.js";

interface User {
  id: number;
  username: string;
  name: string;
  gender: string;
  role: string;
  phone: string;
  updateTime?: string;
}

//展示添加用户表单变量
const showAddUser = ref(false);

//分页参数
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(5);
const totalCount = ref(0);
//用户对象
const user = ref({
  id: "",
  username: "",
  name: "",
  gender: "",
  role: "",
  phone: "",
});
//查询用户参数
const userSearch = ref({
  name: "",
  gender: "",
});
//默认用户数据
const userData = ref<User[]>([]);

//
const formRef = ref<FormInstance | null>(null);

//性别映射集合
const genderList = [
  { id: 1, name: "男" },
  { id: 2, name: "女" },
];

//角色映射集合
const roleList = [
  { id: 1, name: "普通用户" },
  { id: 2, name: "VIP" },
];
//被选中的id数组
const selectedIds = ref<number[]>([]);

//复选框选中数据集合
const multipleSelection = ref<User[]>([]);

//清空查询条件
const clearAll = () => {
  console.log("清空查询条件");
  userSearch.value = { name: "", gender: "" };
  searchUser();
};
//查询分页数据
const searchUser = () => {
  console.log("查询用户");
  page(userSearch.value.name, userSearch.value.gender, currentPage.value, pageSize.value).then((res) => {
    totalCount.value = res.data.data.total;
    userData.value = res.data.data.rows;
  });
};
//查询方法
const onSubmit = () => {
  currentPage.value = 1;
  searchUser();
};

// 复选框选中后执行的方法
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handleSizeChange = (val) => {
  // 重新设置每页显示的条数
  pageSize.value = val;
  searchUser();
};

const handleCurrentChange = (val) => {
  // 重新设置当前页码
  currentPage.value = val;
  searchUser();
};

//重置user函数
const resetUser = () => {
  user.value = {
    id: "",
    username: "",
    name: "",
    gender: "",
    role: "",
    phone: "",
  };
};

//新增用户按钮点击事件
const handleAddUser = () => {
  resetUser(); // 重置 user 对象属性为初始状态
  showAddUser.value = true; // 打开新增用户对话框
};

//处理编辑请求
const handleEdit = async (id: number) => {
  //打开窗口
  showAddUser.value = true;
  //发送请求
  const result = await selectById(id);
  if (result.data.code === 1) {
    user.value = result.data.data;
  } else {
    ElMessage.error(result.data.msg);
  }
};

//处理删除请求
const handleDelete = (id: number) => {
  ElMessageBox.confirm("确认删除?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const result = await deleteById(id);
      if (result.data.code === 1) {
        ElMessage.success("删除成功");
        searchUser();
      } else {
        ElMessage.error(result.data.msg);
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

//批量删除函数
const deleteByIds = () => {
  ElMessageBox.confirm("此操作将删除该数据, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 用户点击确认按钮
      // 1. 创建id数组, 从 multipleSelection 获取即可
      selectedIds.value = multipleSelection.value.map((item) => item.id);

      // 2. 发送AJAX请求
      deleteById(selectedIds.value).then((resp) => {
        if (resp.data.code === 1) {
          // 删除成功
          ElMessage.success("恭喜你，删除成功");
          searchUser();
        } else {
          ElMessage.error(resp.data.msg);
        }
      });
    })
    .catch(() => {
      // 用户点击取消按钮
      ElMessage.info("已取消删除");
    });
};

// 提交添加
const submitAdd = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (valid) {
    let method;
    if (user.value.id) {
      method = update(user.value); // 修改
    } else {
      method = add(user.value); // 添加
    }
    const result = await method;
    if (result.data.code === 1) {
      ElMessage.success("保存成功");
      searchUser();
      showAddUser.value = false;
    } else {
      ElMessage.error(result.data.msg);
    }
  } else {
    ElMessage.error("请正确填写表单");
  }
};

// 表单校验规则
const rules = {
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^\d{11}$/, message: "手机号格式不正确，应为11位数字", trigger: "blur" },
  ],
};

// 处理手机号输入
const handlePhoneInput = (val: string) => {
  user.value.phone = val.replace(/\D/g, "").slice(0, 11);
};
onMounted(() => {
  searchUser();
});
</script>

<style scoped>
.search-container {
  padding: 20px 30px 0;
  background-color: #fff;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
