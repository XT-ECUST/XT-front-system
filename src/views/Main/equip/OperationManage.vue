<template>
  <div style="margin: 10px 50px 0px 50px">
    <!--搜索栏-->
    <div class="search-container">
      <el-form :inline="true" :model="operationSearch" class="demo-form-inline">
        <el-form-item label="设备名称">
          <el-input v-model="operationSearch.deviceName" placeholder="设备名称：" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button type="info" icon="RefreshLeft" @click="clearAll">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--新增与批量删除按钮-->
    <el-button type="primary" plain icon="Plus" @click="handleAddoperation"> 新增运行数据 </el-button>
    <el-button type="danger" plain icon="Delete" @click="deleteByIds"> 批量删除 </el-button>
    <el-button type="success" plain icon="Download" @click="exportToExcel(operationData)">导出全部数据</el-button>
    <el-button type="info" plain icon="Download" @click="showExport = true">导出单设备数据</el-button>
    <!--表格展示列表-->
    <el-table
      :data="operationData"
      style="width: 100%; margin-top: 10px; margin-bottom: 10px"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column fixed prop="dataId" label="序号" width="100" header-align="center" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="deviceId" label="设备名称" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ getDeviceLabel(row.deviceId) }}
        </template>
      </el-table-column>
      <el-table-column prop="temperature" label="温度" width="180" header-align="center" align="center" />
      <el-table-column prop="pressure" label="压力" width="180" header-align="center" align="center" />
      <el-table-column prop="hydrogenConcentration" label="氢气浓度" width="180" header-align="center" align="center" />
      <el-table-column prop="powerConsumption" label="能耗" width="180" header-align="center" align="center" />
      <el-table-column label="时间" width="300" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.timestamp ? row.timestamp.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="300" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" plain icon="Edit" @click="handleEdit(row.dataId)"> 编辑 </el-button>
          <el-button type="danger" size="small" plain icon="delete" @click="handleDelete(row.dataId)">删除</el-button>
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
    <el-dialog v-model="showAddOperation" title="新增运行数据">
      <el-form :model="operation" ref="formRef" label-width="auto" style="max-width: 600px">
        <el-form-item label="设备类型">
          <el-select v-model="operation.deviceId" placeholder="请选择设备" clearable>
            <el-option v-for="item in deviceList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="温度">
          <el-input v-model="operation.temperature" placeholder="请输入设备温度" />
        </el-form-item>
        <el-form-item label="压力">
          <el-input v-model="operation.pressure" placeholder="请输入设备压力" />
        </el-form-item>
        <el-form-item label="氢气浓度">
          <el-input v-model="operation.hydrogenConcentration" placeholder="请输入H2浓度" />
        </el-form-item>
        <el-form-item label="功耗">
          <el-input v-model="operation.powerConsumption" placeholder="请输入设备功耗" />
        </el-form-item>
      </el-form>
      <el-form-item>
        <el-button type="primary" @click="submitAdd()">确定</el-button>
        <el-button @click="showAddOperation = false">取消</el-button>
      </el-form-item>
    </el-dialog>
    <!--导出excel对话框-->
    <el-dialog v-model="showExport" title="导出设备运行数据" style="width: 600px">
      <el-form-item label="设备名称">
        <el-select v-model="exportDeviceId" placeholder="请选择设备" clearable>
          <el-option v-for="item in deviceList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-button icon="Download" type="primary" @click="submitExport(exportDeviceId)">确定</el-button>
      <el-button @click="showExport = false">取消</el-button>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { pageOperationData, add, update, deleteById, selectById } from "../../../../api/operation.js";
import { page } from "../../../../api/device.js";
import * as XLSX from "xlsx";
import { da, de } from "element-plus/es/locale/index.js";

//展示添加设备表单变量
const showAddOperation = ref(false);

//导出对话框控制变量
const showExport = ref(false);
//分页参数
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(5);
const totalCount = ref(0);
//设备对象
const operation = ref({
  dataId: "",
  deviceId: "",
  temperature: "",
  pressure: "",
  hydrogenConcentration: "",
  powerConsumption: "",
});
//查询设备参数
const operationSearch = ref({
  deviceName: "",
});
//设备展示数据
const operationData = ref([]);

//
const formRef = ref(null);

//设备映射集合
const deviceData = ref([]);
const deviceList = ref([]);

//被选中的id数组
const selectedIds = ref([]);

//复选框选中数据集合
const multipleSelection = ref([]);
//选择的要导出运行数据的设备ID
const exportDeviceId = ref("");

//清空查询条件
const clearAll = () => {
  console.log("清空查询条件");
  operationSearch.value = { deviceName: "" };
  searchOperationData();
};
//查询分页数据
const searchOperationData = () => {
  console.log("查询设备信息");
  pageOperationData(operationSearch.value.deviceName, currentPage.value, pageSize.value).then((res) => {
    totalCount.value = res.data.data.total;
    operationData.value = res.data.data.rows;
  });
};
const getDeviceList = (deviceData) => {
  let deviceList = deviceData.value.map((item) => {
    return {
      label: item.deviceName,
      value: item.deviceId,
    };
  });
  console.log("设备列表", deviceList);
  return deviceList;
};

const loadDeviceList = () => {
  let deviceName = "";
  let deviceType = "";
  page(deviceName, deviceType, 1, 1000)
    .then((res) => {
      if (res.data.code === 1) {
        deviceData.value = res.data.data.rows;
        deviceList.value = getDeviceList(deviceData);
        console.log("设备数据加载成功", deviceData.value);
      } else {
        ElMessage.error(res.data.msg);
      }
    })
    .catch((error) => {
      ElMessage.error(error.message);
    });
};

//查询方法
const onSubmit = () => {
  currentPage.value = 1;
  searchOperationData();
};

// 复选框选中后执行的方法
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handleSizeChange = (val) => {
  // 重新设置每页显示的条数
  pageSize.value = val;
  searchOperationData();
};

const handleCurrentChange = (val) => {
  // 重新设置当前页码
  currentPage.value = val;
  searchOperationData();
};

//重置设备信息
const resetOperation = () => {
  operation.value = {
    dataId: "",
    deviceId: "",
    temperature: "",
    pressure: "",
    hydrogenConcentration: "",
    powerConsumption: "",
  };
};
//新增设备按钮点击事件
const handleAddoperation = () => {
  resetOperation(); // 重置 operation 对象属性为初始状态
  showAddOperation.value = true; // 打开新增用户对话框
};

//处理编辑请求
const handleEdit = async (id: number) => {
  //打开窗口
  showAddOperation.value = true;
  loadDeviceList(); // 刷新设备列表
  //发送请求
  const result = await selectById(id);
  if (result.data.code === 1) {
    operation.value = result.data.data;
    console.log("编辑数据", operation.value);
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
        searchOperationData();
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
      // 设备点击确认按钮
      // 1. 创建id数组, 从 multipleSelection 获取即可
      selectedIds.value = multipleSelection.value.map((item) => item.operationId);

      // 2. 发送AJAX请求
      deleteById(selectedIds.value).then((resp) => {
        if (resp.data.code === 1) {
          // 删除成功
          ElMessage.success("恭喜你，删除成功");
          searchOperationData();
        } else {
          ElMessage.error(resp.data.msg);
        }
      });
    })
    .catch(() => {
      // 设备点击取消按钮
      ElMessage.info("已取消删除");
    });
};

// 提交添加
const submitAdd = async () => {
  // 获取表单实例
  const form = formRef.value;

  // 调用表单的 validate 方法
  const valid = await form.validate();
  if (valid) {
    let method;
    if (operation.value.dataId) {
      method = update(operation.value); // 修改
    } else {
      method = add(operation.value); // 添加
    }
    const result = await method;
    if (result.data.code === 1) {
      ElMessage.success("保存成功");
      // loadDeviceList(); // 刷新设备列表
      searchOperationData();

      showAddOperation.value = false;
    } else {
      ElMessage.error(result.data.msg);
    }
  } else {
    ElMessage.error("请正确填写表单");
  }
};

const getDeviceLabel = (deviceId) => {
  const device = deviceList.value.find((item) => item.value === deviceId);
  return device ? device.label : "";
};

const exportToExcel = (data) => {
  const cleanedList = data.map((item) => {
    return {
      时间: item.timestamp ? item.timestamp.replace("T", " ") : "",
      设备名称: getDeviceLabel(item.deviceId),
      压力: item.pressure,
      氢气浓度: item.hydrogenConcentration,
      功耗: item.powerConsumption,
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(cleanedList);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "运行数据");
  XLSX.writeFile(workbook, "运行数据.xlsx");
};

const submitExport = (deviceId) => {
  const data = operationData.value.filter((item) => item.deviceId === deviceId);
  exportToExcel(data);
  showExport.value = false;
};

onMounted(() => {
  searchOperationData();
  loadDeviceList();
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
