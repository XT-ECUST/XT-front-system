<template>
  <div style="margin: 10px 50px 0px 50px">
    <!--搜索栏-->
    <div class="search-container">
      <el-form :inline="true" :model="maintenanceSearch" class="demo-form-inline">
        <el-form-item label="设备名称：">
          <el-input v-model="maintenanceSearch.deviceName" placeholder="设备名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="maintenanceSearch.status" placeholder="状态" clearable>
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
    <!--新增与批量删除按钮-->
    <el-button type="primary" plain icon="Plus" @click="handleAddMaintenance"> 新增维保记录 </el-button>
    <el-button type="danger" plain icon="Delete" @click="deleteByIds"> 批量删除 </el-button>
    <!--表格展示列表-->
    <el-table
      :data="maintenanceData"
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
      <el-table-column prop="status" label="维保状态" width="180" header-align="center" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'pending' ? 'warning' : row.status === 'processing' ? 'primary' : 'success'"
            style="width: 80px; margin-right: 10px"
          >
            {{ row.status === "pending" ? "待处理" : row.status === "processing" ? "处理中" : "已完成" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="维保类型" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ maintenanceTypeMap.get(row.type) || row.type }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="维保描述" width="300" header-align="center" align="center" />
      <el-table-column prop="startTime" label="维保时间" width="180" header-align="center" align="center" />
      <el-table-column prop="maintainer" label="维保人员" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ userMap.get(Number(row.maintainer))?.name || row.maintainer }}
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
    <el-dialog v-model="showAddMaintenance" title="维保记录">
      <el-form :model="maintenance" ref="formRef" :rules="rules" label-width="auto" style="max-width: 600px">
        <el-form-item label="设备名称" prop="deviceName">
          <el-select v-model="maintenance.deviceName" placeholder="请选择设备" clearable>
            <el-option v-for="item in deviceList" :key="item.value" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="维保状态" prop="status">
          <el-radio-group v-model="maintenance.status">
            <el-radio label="pending">待处理</el-radio>
            <el-radio label="processing">处理中</el-radio>
            <el-radio label="completed">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="维保类型" prop="type">
          <el-radio-group v-model="maintenance.type">
            <el-radio label="regular">定期维保</el-radio>
            <el-radio label="repair">故障维修</el-radio>
            <el-radio label="inspection">设备巡检</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="维保描述" prop="description">
          <el-input v-model="maintenance.description" type="textarea" placeholder="请输入维保描述" />
        </el-form-item>
        <el-form-item label="维保时间" prop="startTime">
          <el-date-picker
            v-model="maintenance.startTime"
            type="datetime"
            placeholder="选择维保时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :default-time="new Date()"
          />
        </el-form-item>
        <el-form-item label="维保人员" prop="maintainer">
          <el-select v-model="maintenance.maintainer" placeholder="请选择维保人员" clearable>
            <el-option v-for="user in userOptions" :key="user.value" :label="user.label" :value="user.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitAdd">确定</el-button>
          <el-button @click="showAddMaintenance = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { page, add, update, deleteById, selectById } from "../../../../api/maintain.js";
import { page as devicePage } from "../../../../api/device.js";
import { useUser } from "../../../hooks/useUser.js";

interface Maintenance {
  id: string | number;
  deviceId: string | number;
  deviceName: string;
  status: string;
  type: string;
  description: string;
  startTime: string;
  maintainer: string;
}

interface DeviceOption {
  label: string;
  value: string | number;
}

//展示添加维保记录表单变量
const showAddMaintenance = ref(false);

//分页参数
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

//维保记录对象
const maintenance = ref<Maintenance>({
  id: "",
  deviceId: "",
  deviceName: "",
  status: "pending",
  type: "regular",
  description: "",
  startTime: "",
  maintainer: "",
});

//查询维保记录参数
const maintenanceSearch = ref({
  deviceName: "",
  status: "",
});

//维保记录展示数据
const maintenanceData = ref<Maintenance[]>([]);

//设备列表
const deviceList = ref<DeviceOption[]>([]);

//表单引用
const formRef = ref<FormInstance | null>(null);

//被选中的id数组
const selectedIds = ref<(string | number)[]>([]);

//复选框选中数据集合
const multipleSelection = ref<Maintenance[]>([]);

//表单验证规则
const rules = {
  deviceName: [{ required: true, message: "请选择设备", trigger: "change" }],
  status: [{ required: true, message: "请选择维保状态", trigger: "change" }],
  type: [{ required: true, message: "请输入维保类型", trigger: "blur" }],
  description: [{ required: true, message: "请输入维保描述", trigger: "blur" }],
  startTime: [{ required: true, message: "请选择维保时间", trigger: "change" }],
  maintainer: [{ required: true, message: "请输入维保人员", trigger: "blur" }],
};

// 维保类型映射
const maintenanceTypeMap = new Map([
  ["regular", "定期维保"],
  ["repair", "故障维修"],
  ["inspection", "设备巡检"],
]);

//使用用户钩子
const { userOptions, userMap, loadUserOptions } = useUser();

//清空查询条件
const clearAll = () => {
  maintenanceSearch.value = { deviceName: "", status: "" };
  searchMaintenance();
};

//查询分页数据
const searchMaintenance = () => {
  page(maintenanceSearch.value.deviceName, maintenanceSearch.value.status, currentPage.value, pageSize.value).then(
    (res) => {
      totalCount.value = res.data.data.total;
      maintenanceData.value = res.data.data.rows;
    }
  );
};

//查询方法
const onSubmit = () => {
  currentPage.value = 1;
  searchMaintenance();
};

// 复选框选中后执行的方法
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  searchMaintenance();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  searchMaintenance();
};

//重置维保记录信息
const resetMaintenance = () => {
  maintenance.value = {
    id: "",
    deviceId: "",
    deviceName: "",
    status: "pending",
    type: "regular",
    description: "",
    startTime: "",
    maintainer: "",
  };
};

//新增维保记录按钮点击事件
const handleAddMaintenance = () => {
  resetMaintenance();
  showAddMaintenance.value = true;
};

//处理编辑请求
const handleEdit = async (id) => {
  showAddMaintenance.value = true;
  const result = await selectById(id);
  if (result.data.code === 1) {
    maintenance.value = result.data.data;
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
        searchMaintenance();
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
  ElMessageBox.confirm("此操作将删除选中的维保记录, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      selectedIds.value = multipleSelection.value.map((item) => item.id);
      deleteById(selectedIds.value).then((resp) => {
        if (resp.data.code === 1) {
          ElMessage.success("删除成功");
          searchMaintenance();
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
    const selectedDevice = deviceList.value.find((device) => device.label === maintenance.value.deviceName);
    if (!selectedDevice) {
      ElMessage.error("请选择有效的设备");
      return;
    }

    // Set the deviceId before submitting
    maintenance.value.deviceId = selectedDevice.value;

    // Ensure startTime is set
    if (!maintenance.value.startTime) {
      ElMessage.error("请选择维保时间");
      return;
    }

    // Convert the date to LocalDateTime format if needed
    if (maintenance.value.startTime) {
      const date = new Date(maintenance.value.startTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      maintenance.value.startTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    // Log the data being sent
    console.log("Submitting maintenance data:", maintenance.value);

    let method;
    if (maintenance.value.id) {
      method = update(maintenance.value);
    } else {
      method = add(maintenance.value);
    }

    const result = await method;
    if (result.data.code === 1) {
      ElMessage.success("保存成功");
      searchMaintenance();
      showAddMaintenance.value = false;
    } else {
      ElMessage.error(result.data.msg);
    }
  } catch (error) {
    console.error("表单验证失败:", error);
    ElMessage.error("请正确填写所有必填项");
  }
};

//加载设备列表
const loadDeviceList = () => {
  devicePage("", "", 1, 1000).then((res) => {
    if (res.data.code === 1) {
      deviceList.value = res.data.data.rows.map((item) => ({
        label: item.deviceName,
        value: item.deviceId,
      }));
    }
  });
};

// 在组件挂载时加载用户列表
onMounted(() => {
  searchMaintenance();
  loadDeviceList();
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
