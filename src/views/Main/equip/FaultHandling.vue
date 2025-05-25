<template>
  <div style="margin: 10px 50px 0px 50px">
    <!--搜索栏-->
    <div class="search-container">
      <el-form :inline="true" :model="faultHandlingSearch" class="demo-form-inline">
        <el-form-item label="设备名称：">
          <el-input v-model="faultHandlingSearch.deviceName" placeholder="设备名称" clearable />
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="faultHandlingSearch.status" placeholder="状态" clearable style="width: 120px">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button type="info" icon="RefreshLeft" @click="clearAll">清空</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!--表格展示列表-->
    <el-table :data="faultHandlingData" style="width: 100%; margin-top: 10px; margin-bottom: 10px" border>
      <el-table-column fixed prop="id" label="序号" width="100" header-align="center" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="deviceName" label="设备名称" width="180" header-align="center" align="center" />
      <el-table-column prop="faultType" label="故障类型" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ faultTypeMap.get(row.faultType) || row.faultType }}
        </template>
      </el-table-column>
      <el-table-column prop="faultDescription" label="故障描述" width="300" header-align="center" align="center" />
      <el-table-column prop="status" label="处理状态" width="180" header-align="center" align="center">
        <template #default="{ row }">
          <el-tag
            :type="
              row.status === 'pending'
                ? 'danger'
                : row.status === 'processing'
                ? 'warning'
                : row.status === 'resolved'
                ? 'success'
                : 'info'
            "
            style="width: 80px; margin-right: 10px"
          >
            {{ statusMap.get(row.status) || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="handler" label="处理人" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ userMap.get(row.handler)?.name || "未分配" }}
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180" header-align="center" align="center" />
      <el-table-column prop="endTime" label="完成时间" width="180" header-align="center" align="center" />
      <el-table-column prop="solution" label="解决方案" width="300" header-align="center" align="center" />
      <el-table-column fixed="right" label="操作" width="300" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            plain
            icon="Edit"
            @click="handleEdit(row.id)"
            :disabled="row.status === 'completed'"
          >
            处理
          </el-button>
          <el-button
            type="success"
            size="small"
            plain
            icon="Check"
            @click="handleComplete(row.id)"
            :disabled="row.status === 'completed'"
          >
            完成
          </el-button>
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

    <!--处理对话框组件-->
    <el-dialog v-model="showHandlingDialog" :title="dialogTitle" width="50%">
      <el-form :model="faultHandling" ref="formRef" :rules="rules" label-width="auto" style="max-width: 600px">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="faultHandling.deviceName" disabled />
        </el-form-item>
        <el-form-item label="故障类型" prop="faultType">
          <el-input v-model="faultHandling.faultType" disabled />
        </el-form-item>
        <el-form-item label="故障描述" prop="faultDescription">
          <el-input v-model="faultHandling.faultDescription" type="textarea" disabled />
        </el-form-item>
        <el-form-item label="处理状态" prop="status">
          <el-radio-group v-model="faultHandling.status">
            <el-radio label="pending">待处理</el-radio>
            <el-radio label="processing">处理中</el-radio>
            <el-radio label="resolved">已解决</el-radio>
            <el-radio label="closed">已关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理人" prop="handler">
          <el-select v-model="faultHandling.handler" placeholder="请选择处理人" clearable>
            <el-option v-for="user in userOptions" :key="user.value" :label="user.label" :value="user.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="解决方案" prop="solution">
          <el-input v-model="faultHandling.solution" type="textarea" placeholder="请输入解决方案" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitHandling">确定</el-button>
          <el-button @click="showHandlingDialog = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { page, add, update, selectById } from "../../../api/faultHandling.js";
import { useUser } from "../../../hooks/useUser.js";
import { selectById as selectFaultById } from "../../../api/fault.js";

interface FaultHandling {
  id: number;
  faultId: number; // 关联的故障ID
  deviceId: number;
  deviceName: string;
  faultType: string; // 故障类型
  faultDescription: string; // 故障描述
  status: string; // 状态：待处理、处理中、已解决、已关闭
  handler: number; // 处理人ID
  startTime: string; // 开始时间
  endTime: string; // 结束时间
  solution: string; // 解决方案
  createTime: string; // 创建时间
}

// 对话框显示控制
const showHandlingDialog = ref(false);
const dialogTitle = ref("故障处理");

// 分页参数
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

// 故障处理对象
const faultHandling = ref<FaultHandling>({
  id: 0,
  faultId: 0,
  deviceId: 0,
  deviceName: "",
  faultType: "",
  faultDescription: "",
  status: "pending",
  handler: 0,
  startTime: "",
  endTime: "",
  solution: "",
  createTime: "",
});

// 查询参数
const faultHandlingSearch = ref({
  deviceName: "",
  status: "",
});

// 故障处理数据
const faultHandlingData = ref<FaultHandling[]>([]);

// 表单引用
const formRef = ref<FormInstance | null>(null);

// 使用用户钩子
const { userOptions, userMap, loadUserOptions } = useUser();

// 故障类型映射
const faultTypeMap = new Map([
  ["hardware", "硬件故障"],
  ["software", "软件故障"],
  ["network", "网络故障"],
  ["other", "其他故障"],
]);

// 状态映射
const statusMap = new Map([
  ["pending", "待处理"],
  ["processing", "处理中"],
  ["resolved", "已解决"],
  ["closed", "已关闭"],
]);

// 表单验证规则
const rules = {
  status: [{ required: true, message: "请选择处理状态", trigger: "change" }],
  handler: [{ required: true, message: "请选择处理人", trigger: "change" }],
  solution: [{ required: true, message: "请输入解决方案", trigger: "blur" }],
};

// 清空查询条件
const clearAll = () => {
  faultHandlingSearch.value = { deviceName: "", status: "" };
  searchFaultHandling();
};

// 查询分页数据
const searchFaultHandling = () => {
  page(faultHandlingSearch.value.deviceName, faultHandlingSearch.value.status, currentPage.value, pageSize.value).then(
    (res) => {
      if (res.data.code === 1) {
        totalCount.value = res.data.data.total;
        faultHandlingData.value = res.data.data.rows;
      } else {
        ElMessage.error(res.data.msg || "获取数据失败");
      }
    }
  );
};

// 查询方法
const onSubmit = () => {
  currentPage.value = 1;
  searchFaultHandling();
};

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val;
  searchFaultHandling();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  searchFaultHandling();
};

// 处理编辑请求
const handleEdit = async (id) => {
  showHandlingDialog.value = true;
  dialogTitle.value = "故障处理";
  const result = await selectById(id);
  if (result.data.code === 1) {
    faultHandling.value = result.data.data;
    // 如果有关联的故障记录，获取故障详情
    if (faultHandling.value.faultId) {
      const faultResult = await selectFaultById(faultHandling.value.faultId);
      if (faultResult.data.code === 1) {
        const faultData = faultResult.data.data;
        // 更新故障相关信息
        faultHandling.value.deviceName = faultData.deviceName;
        faultHandling.value.faultType = faultData.type;
        faultHandling.value.faultDescription = faultData.description;
      }
    }
  } else {
    ElMessage.error(result.data.msg || "获取数据失败");
  }
};

// 处理完成请求
const handleComplete = async (id) => {
  ElMessageBox.confirm("确认将此故障标记为已解决?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const result = await selectById(id);
      if (result.data.code === 1) {
        const data = result.data.data;
        data.status = "resolved";
        data.endTime = new Date().toISOString();
        const updateResult = await update(data);
        if (updateResult.data.code === 1) {
          ElMessage.success("操作成功");
          searchFaultHandling();
        } else {
          ElMessage.error(updateResult.data.msg || "操作失败");
        }
      } else {
        ElMessage.error(result.data.msg || "获取数据失败");
      }
    })
    .catch(() => {
      ElMessage.info("已取消操作");
    });
};

// 提交处理
const submitHandling = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 如果是新处理，设置开始时间
    if (!faultHandling.value.startTime) {
      faultHandling.value.startTime = new Date().toISOString();
    }

    // 如果状态是已完成，设置结束时间
    if (faultHandling.value.status === "resolved" && !faultHandling.value.endTime) {
      faultHandling.value.endTime = new Date().toISOString();

      // 同步更新故障管理中的状态
      if (faultHandling.value.faultId) {
        const faultResult = await selectFaultById(faultHandling.value.faultId);
        if (faultResult.data.code === 1) {
          const faultData = faultResult.data.data;
          faultData.status = "resolved"; // 更新故障状态为已解决
          await update(faultData);
        }
      }
    }

    const result = await update(faultHandling.value);
    if (result.data.code === 1) {
      ElMessage.success("保存成功");
      searchFaultHandling();
      showHandlingDialog.value = false;
    } else {
      ElMessage.error(result.data.msg || "保存失败");
    }
  } catch (error) {
    console.error("表单验证失败:", error);
    ElMessage.error("请正确填写所有必填项");
  }
};

onMounted(() => {
  searchFaultHandling();
  loadUserOptions();
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
