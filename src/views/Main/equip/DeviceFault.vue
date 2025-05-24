<template>
  <div style="margin: 10px 50px 0px 50px">
    <!--搜索栏-->
    <div class="search-container">
      <el-form :inline="true" :model="faultSearch" class="demo-form-inline">
        <el-form-item label="设备名称：">
          <el-input v-model="faultSearch.deviceName" placeholder="设备名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="faultSearch.status" placeholder="状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button type="info" icon="RefreshLeft" @click="clearAll">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--新增与批量删除按钮-->
    <el-button type="primary" plain icon="Plus" @click="handleAddFault"> 新增故障上报 </el-button>
    <el-button type="danger" plain icon="Delete" @click="deleteByIds"> 批量删除 </el-button>
    <!--表格展示列表-->
    <el-table
      :data="faultData"
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
      <el-table-column prop="deviceName" label="设备名称" width="180" header-align="center" align="center" />
      <el-table-column prop="status" label="故障状态" width="180" header-align="center" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'pending' ? 'danger' : row.status === 'processing' ? 'warning' : 'success'"
            style="width: 80px; margin-right: 10px"
          >
            {{ row.status === "pending" ? "待处理" : row.status === "processing" ? "处理中" : "已解决" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="故障类型" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ faultTypeMap.get(row.type) || row.type }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="故障描述" width="300" header-align="center" align="center" />
      <el-table-column prop="reportTime" label="上报时间" width="180" header-align="center" align="center" />
      <el-table-column prop="reporter" label="上报人" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ userMap.get(Number(row.reporter))?.name || row.reporter }}
        </template>
      </el-table-column>
      <el-table-column prop="handler" label="处理人" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ userMap.get(Number(row.handler))?.name || row.handler }}
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
    <el-dialog v-model="showAddFault" title="故障上报">
      <el-form :model="fault" ref="formRef" :rules="rules" label-width="auto" style="max-width: 600px">
        <el-form-item label="设备名称" prop="deviceName">
          <el-select v-model="fault.deviceName" placeholder="请选择设备" clearable>
            <el-option v-for="item in deviceOptions" :key="item.value" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="故障状态" prop="status">
          <el-radio-group v-model="fault.status">
            <el-radio label="pending">待处理</el-radio>
            <el-radio label="processing">处理中</el-radio>
            <el-radio label="resolved">已解决</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="故障类型" prop="type">
          <el-radio-group v-model="fault.type">
            <el-radio label="hardware">硬件故障</el-radio>
            <el-radio label="software">软件故障</el-radio>
            <el-radio label="network">网络故障</el-radio>
            <el-radio label="other">其他故障</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="故障描述" prop="description">
          <el-input v-model="fault.description" type="textarea" placeholder="请输入故障描述" />
        </el-form-item>
        <el-form-item label="上报人" prop="reporter">
          <el-select v-model="fault.reporter" placeholder="请选择上报人" clearable>
            <el-option v-for="user in userOptions" :key="user.value" :label="user.label" :value="user.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人" prop="handler">
          <el-select v-model="fault.handler" placeholder="请选择处理人" clearable>
            <el-option v-for="user in userOptions" :key="user.value" :label="user.label" :value="user.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitAdd">确定</el-button>
          <el-button @click="showAddFault = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { page, add, update, deleteById, selectById } from "../../../api/fault.js";
import { page as devicePage } from "../../../../api/device.js";
import { useUser } from "../../../hooks/useUser.js";
import { useDevice } from "../../../hooks/useDevice.js";

interface Fault {
  id: string | number;
  deviceId: string | number;
  deviceName: string;
  status: string;
  type: string;
  description: string;
  reportTime?: string;
  reporter: string | number;
  handler: string | number;
}

interface DeviceOption {
  label: string;
  value: string | number;
}

//展示添加故障上报表单变量
const showAddFault = ref(false);

//分页参数
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

//故障上报对象
const fault = ref<Fault>({
  id: "",
  deviceId: "",
  deviceName: "",
  status: "pending",
  type: "hardware",
  description: "",
  reportTime: "",
  reporter: "",
  handler: "",
});

//查询故障上报参数
const faultSearch = ref({
  deviceName: "",
  status: "",
});

//故障上报展示数据
const faultData = ref<Fault[]>([]);

//表单引用
const formRef = ref<FormInstance | null>(null);

//被选中的id数组
const selectedIds = ref<(string | number)[]>([]);

//复选框选中数据集合
const multipleSelection = ref<Fault[]>([]);

// 使用用户钩子
const { userOptions, userMap, loadUserOptions } = useUser();

// 使用设备钩子
const { deviceOptions, deviceMap, loadDeviceOptions } = useDevice();

//表单验证规则
const rules = {
  deviceName: [{ required: true, message: "请选择设备", trigger: "change" }],
  status: [{ required: true, message: "请选择故障状态", trigger: "change" }],
  type: [{ required: true, message: "请选择故障类型", trigger: "change" }],
  description: [{ required: true, message: "请输入故障描述", trigger: "blur" }],
  reporter: [{ required: true, message: "请选择上报人", trigger: "change" }],
  handler: [{ required: true, message: "请选择处理人", trigger: "change" }],
};

// 故障类型映射
const faultTypeMap = new Map([
  ["hardware", "硬件故障"],
  ["software", "软件故障"],
  ["network", "网络故障"],
  ["other", "其他故障"],
]);

//清空查询条件
const clearAll = () => {
  faultSearch.value = { deviceName: "", status: "" };
  searchFault();
};

//查询分页数据
const searchFault = () => {
  page(faultSearch.value.deviceName, faultSearch.value.status, currentPage.value, pageSize.value).then((res) => {
    totalCount.value = res.data.data.total;
    faultData.value = res.data.data.rows;
  });
};

//查询方法
const onSubmit = () => {
  currentPage.value = 1;
  searchFault();
};

// 复选框选中后执行的方法
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  searchFault();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  searchFault();
};

//重置故障上报信息
const resetFault = () => {
  fault.value = {
    id: "",
    deviceId: "",
    deviceName: "",
    status: "pending",
    type: "hardware",
    description: "",
    reporter: "",
    handler: "",
  };
};

//新增故障上报按钮点击事件
const handleAddFault = () => {
  resetFault();
  showAddFault.value = true;
};

//处理编辑请求
const handleEdit = async (id) => {
  showAddFault.value = true;
  const result = await selectById(id);
  if (result.data.code === 1) {
    fault.value = result.data.data;
  } else {
    ElMessage.error(result.data.msg);
  }
};

//处理删除请求
const handleDelete = (id) => {
  ElMessageBox.confirm("确认删除?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const result = await deleteById(id);
      if (result.data.code === 1) {
        ElMessage.success("删除成功");
        searchFault();
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
  ElMessageBox.confirm("此操作将删除选中的故障记录, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      selectedIds.value = multipleSelection.value.map((item) => item.id);
      deleteById(selectedIds.value).then((resp) => {
        if (resp.data.code === 1) {
          ElMessage.success("删除成功");
          searchFault();
        } else {
          ElMessage.error(resp.data.msg);
        }
      });
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 提交添加
const submitAdd = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // Find the selected device's ID
    const selectedDevice = deviceOptions.value.find((device) => device.label === fault.value.deviceName);
    if (!selectedDevice) {
      ElMessage.error("请选择有效的设备");
      return;
    }

    // Set the deviceId before submitting
    fault.value.deviceId = selectedDevice.value;

    // Log the data being sent
    console.log("Submitting fault data:", fault.value);

    let method;
    if (fault.value.id) {
      method = update(fault.value);
    } else {
      method = add(fault.value);
    }

    const result = await method;
    if (result.data.code === 1) {
      ElMessage.success("保存成功");
      searchFault();
      showAddFault.value = false;
    } else {
      ElMessage.error(result.data.msg);
    }
  } catch (error) {
    console.error("表单验证失败:", error);
    ElMessage.error("请正确填写所有必填项");
  }
};

onMounted(() => {
  searchFault();
  loadDeviceOptions();
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
