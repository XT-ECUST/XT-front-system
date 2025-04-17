<template>
  <div style="margin: 10px 50px 0px 50px">
    <el-button type="primary" icon="Plus" plain style="margin-bottom: 10px" @click="handleAddDept">
      新增部门
    </el-button>
    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column fixed prop="id" label="序号" width="200" header-align="center" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="部门名称" width="400" header-align="center" align="center" />
      <el-table-column label="最后操作时间" width="500" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.updateTime ? row.updateTime.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="400" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" plain icon="Edit" @click="handleEdit(row.id)"> 编辑 </el-button>
          <el-button type="danger" size="small" plain icon="delete" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogvisible" title="新增部门">
      <el-form :model="dept" label-width="auto" style="max-width: 600px">
        <el-form-item label="部门名称">
          <el-input v-model="dept.name" />
        </el-form-item>
      </el-form>
      <el-form-item>
        <el-button type="primary" @click="onSubmit()">确定</el-button>
        <el-button @click="dialogvisible = false">取消</el-button>
      </el-form-item>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { findAll, add, update, deleteById, selectById } from "../../../../api/dept.js";

const dialogvisible = ref(false);
const dept = ref({
  id: null as string | null,
  name: "",
});
const tableData = ref([]);

//重置部门表单元素
const resetDept = () => {
  dept.value = {
    id: "",
    name: "",
  };
};
//新增用户按钮点击事件
const handleAddDept = () => {
  resetDept(); // 重置 user 对象属性为初始状态
  dialogvisible.value = true; // 打开新增用户对话框
};

const handleEdit = async (id: number) => {
  dialogvisible.value = true;
  const result = await selectById(id);
  if (result.data.code === 1) {
    dept.value = result.data.data;
  } else {
    ElMessage.error(result.data.msg);
  }
};

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
        init();
      } else {
        ElMessage.error(result.data.msg);
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

const onSubmit = async () => {
  let method;
  if (dept.value.id) {
    method = update(dept.value); // 修改
  } else {
    method = add(dept.value); // 添加
  }
  const result = await method;
  if (result.data.code === 1) {
    ElMessage.success("保存成功");
    init();
    dialogvisible.value = false;
  } else {
    ElMessage.error(result.data.msg);
  }
};

const init = () => {
  findAll().then((result) => {
    console.log(result);
    if (result.data.code === 1) {
      tableData.value = result.data.data;
    }
  });
};

onMounted(() => {
  init();
});
</script>

<style scoped>
/* 可以在这里添加组件的样式 */
</style>
