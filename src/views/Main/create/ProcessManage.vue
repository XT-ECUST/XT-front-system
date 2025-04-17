<template>
  <div class="craft-management">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="工艺名称">
        <el-input v-model="searchForm.craftName" placeholder="请输入工艺名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="onReset">重置 </el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row style="margin-bottom: 20px">
      <el-button type="primary" plain @click="openDialog('add')"
        >新增工艺</el-button
      >
      <el-button type="danger" plain @click="onBatchDelete">批量删除</el-button>
      <el-button type="success" plain @click="onExport">导出数据 </el-button>
    </el-row>

    <!-- 表格展示 -->
    <el-table
      :data="craftList"
      style="width: 100%; margin-bottom: 20px"
      ref="craftTable"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="craftCode" label="工艺编号" width="150" />
      <el-table-column prop="craftName" label="工艺名称" width="170" />
      <el-table-column
        prop="formattedRequiredTime"
        label="工艺时长"
        width="150"
      />
      <el-table-column prop="status" label="生产状态" width="150" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="text" @click="openDialog('edit', scope.row)"
            >编辑</el-button
          >
          <el-button
            type="text"
            style="color: red"
            @click="confirmDelete(scope.row.craftId)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      background
      layout="prev, pager, next, total, jumper"
      :total="totalItems"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      @size-change="handlePageSizeChange"
      style="text-align: right"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="800px"
      center
    >
      <!-- 基本信息区域 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="8">
          <el-form-item label="工艺编码">
            <el-input
              v-model="craftForm.craftCode"
              placeholder="请输入工艺编码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="工艺名称">
            <el-input
              v-model="craftForm.craftName"
              placeholder="请输入工艺名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="生产状态">
            <el-select v-model="craftForm.status" placeholder="请选择生产状态">
              <el-option label="运行中" value="处理中" />
              <el-option label="已停止" value="已完成" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input
          v-model="craftForm.remark"
          type="textarea"
          placeholder="请输入备注"
        />
      </el-form-item>

      <!-- 标签页选项卡 -->
      <el-tabs v-model="activeTab" type="card">
        <!-- 组成工序标签页 -->
        <el-tab-pane label="组成工序" name="processComposition">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="工艺ID">
                <el-input
                  v-model="craftForm.craftId"
                  placeholder="系统自动生成"
                  :disabled="dialogTitle === '新增工艺'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="序号">
                <el-input-number v-model="craftForm.sequence" :min="1" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="所需设备">
                <el-select
                  v-model="craftForm.equipment"
                  placeholder="请选择设备"
                >
                  <el-option label="反应器" value="反应器" />
                  <el-option label="流化床反应器" value="流化床反应器" />
                  <el-option label="还原炉" value="还原炉" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="下一道工序">
                <el-select
                  v-model="craftForm.nextProcess"
                  placeholder="请选择工序"
                >
                  <el-option label="合成工段" value="合成工段" />
                  <el-option label="还原工段" value="还原工段" />
                  <el-option label="氢化工段" value="氢化工段" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="所需时间">
                <el-time-picker
                  v-model="craftForm.requiredTime"
                  placeholder="所需时间"
                />
              </el-form-item>
            </el-col>
            <el-col :span="9">
              <el-form-item label="需求系数">
                <el-input
                  v-model="craftForm.demand"
                  placeholder="请输入需求系数"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 产品指标标签页 -->
        <el-tab-pane label="产品指标" name="productMetrics">
          <el-table :data="craftForm.products" border style="width: 97%">
            <el-table-column prop="craftName" label="工艺名称" width="150" />
            <el-table-column prop="productCode" label="产品编号" width="150" />
            <el-table-column prop="productName" label="产品名称" width="150" />
            <el-table-column prop="attribute" label="属性" width="150" />
            <el-table-column prop="measurement" label="计量单位" width="150" />
          </el-table>
          <el-pagination
            layout="prev, pager, next, total"
            :total="productMetrics.length"
            style="margin-top: 20px; text-align: right"
          />
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getCraftDetails,
  addCraft,
  updateCraft,
  deleteCraft,
} from "../../../../api/craft.js";

// 搜索表单
const searchForm = reactive({
  craftName: "",
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0); // 总数据条数

// 工艺列表
const craftList = ref([]);

// 弹窗状态
const dialogVisible = ref(false);
const dialogTitle = ref("");
const activeTab = ref("processComposition");
const craftForm = reactive({
  craftId: "", // 工艺ID
  craftCode: "", // 工艺编码
  craftName: "", // 工艺名称
  sequence: "1", // 工艺序列
  equipment: "", // 设备
  nextProcess: "", // 下一工序
  requiredTime: "", // 所需时间
  demand: "", // 需求
  status: "", // 状态
  description: "", // 描述
  formattedRequiredTime: "", // 格式化后的所需时间
  products: [], // 相关产品信息
});

// 产品指标
const productMetrics = ref([]);

// 时间转换函数
const convertToTimeObject = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":");
  return new Date(1970, 0, 1, hours, minutes, seconds);
};

// 打开新增/编辑弹窗
const openDialog = (type, row = {}) => {
  dialogTitle.value = type === "add" ? "新增工艺" : "编辑工艺";
  if (type === "add") {
    // 新增工艺时，清空所有表单数据
    Object.keys(craftForm).forEach((key) => {
      if (Array.isArray(craftForm[key])) {
        craftForm[key] = [];
      } else {
        craftForm[key] = "";
      }
    });
    craftForm.sequence = "1"; // 重置序列为默认值
  } else {
    // 编辑工艺时，填充表单数据
    craftForm.craftId = row.craftId;
    craftForm.craftCode = row.craftCode || "";
    craftForm.craftName = row.craftName || "";
    craftForm.status = row.status || "";
    craftForm.remark = row.remark || "";
    craftForm.sequence = row.sequence || "";
    craftForm.equipment = row.equipment || "";
    craftForm.nextProcess = row.nextProcess || "";
    craftForm.requiredTime = row.requiredTime || "";
    craftForm.demand = row.demand || "";
    craftForm.products = row.products || [];
  }

  // 如果存在返回的时间对象，格式化为字符串
  if (craftForm.requiredTime instanceof Date) {
    craftForm.formattedRequiredTime = formatTime(craftForm.requiredTime);
  }

  // 确保将产品信息赋值给 craftForm.products
  craftForm.products = row.products || [];
  dialogVisible.value = true;
};

// 时间格式化函数
const formatTime = (time) => {
  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

// 删除操作
const confirmDelete = (id) => {
  console.log("Deleting craft with ID:", id);
  if (!id) {
    ElMessage.error("无效的工艺ID");
    return;
  }
  ElMessageBox.confirm("确认删除该工艺吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteCraft(id).then(() => {
      ElMessage.success("删除成功");
      fetchCraftList();
    });
  });
};

// 搜索操作
const onSearch = () => {
  currentPage.value = 1; // 重置为第一页
  fetchCraftList();
};

import { watch } from "vue";

// 监听 craftName 的变化
watch(
  () => searchForm.craftName,
  (newValue) => {
    console.log("craftName changed:", newValue);
  }
);

// 重置
const onReset = () => {
  searchForm.craftName = "";
  currentPage.value = 1;
  fetchCraftList();
};

// 存储选中的工艺
const selectedCrafts = ref([]);

// 处理选中变化
const handleSelectionChange = (val) => {
  selectedCrafts.value = val;
};

// 批量删除
const onBatchDelete = () => {
  if (selectedCrafts.value.length === 0) {
    ElMessage.warning("请选择要删除的工艺");
    return;
  }

  ElMessageBox.confirm("确认删除选中的工艺吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    selectedCrafts.value.forEach((item) => {
      deleteCraft(item.craftId).then(() => {
        ElMessage.success("删除成功");
        fetchCraftList(); // 刷新列表
      });
    });
  });
};

// 导出
const onExport = () => {
  if (craftList.value.length === 0) {
    ElMessage.warning("没有数据可供导出");
    return;
  }

  // CSV文件的头部
  const headers = [
    "工艺ID",
    "工艺编号",
    "工艺名称",
    "工艺时长",
    "生产状态",
    "序号",
    "所需设备",
    "下一道工序",
    "需求系数",
  ];

  // 将表格数据转换为CSV格式
  const rows = craftList.value.map((craft) => [
    craft.craftId,
    craft.craftCode,
    craft.craftName,
    craft.formattedRequiredTime,
    craft.status,
    craft.sequence,
    craft.equipment,
    craft.nextProcess,
    craft.demand,
  ]);

  // 拼接CSV内容
  const csvContent = [
    headers.join(","), // 添加表头
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // 创建一个Blob对象
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // 创建一个链接并模拟点击下载文件
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "craft_list.csv"); // 设置下载文件名
    link.click(); // 触发下载
    URL.revokeObjectURL(url); // 释放URL对象
  } else {
    ElMessage.warning("当前浏览器不支持下载功能");
  }
};

// 保存
const onSave = () => {
  // 更新 formattedRequiredTime
  if (craftForm.requiredTime instanceof Date) {
    craftForm.formattedRequiredTime = formatTime(craftForm.requiredTime);
  }

  // 映射 craftForm 数据
  const requestData = {
    craft: {
      craftId: craftForm.craftId, // 工艺ID
      craftCode: craftForm.craftCode, // 工艺编码
      craftName: craftForm.craftName, // 工艺名称
      sequence: craftForm.sequence, // 工艺序列
      equipment: craftForm.equipment, // 设备
      nextProcess: craftForm.nextProcess, // 下一工序
      requiredTime: craftForm.requiredTime, // 所需时间
      demand: craftForm.demand, // 需求
      status: craftForm.status, // 状态
      description: craftForm.description, // 描述
      formattedRequiredTime: craftForm.formattedRequiredTime, // 格式化的时间
    },
    products: craftForm.products, // 相关产品信息
  };

  console.log("将要提交的数据:", requestData);
  console.log("craftForm.craftId:", craftForm.craftId);

  if (craftForm.craftId) {
    // 编辑操作
    updateCraft(requestData).then(() => {
      console.log("编辑成功");
      ElMessage.success("编辑成功");
      fetchCraftList();
      dialogVisible.value = false;
    });
  } else {
    // 新增操作
    addCraft(requestData).then((response) => {
      console.log("新增成功");
      ElMessage.success("新增成功");
      if (response.data && response.data.data && response.data.data.craftId) {
        craftForm.craftId = response.data.data.craftId;
      }
      fetchCraftList();
      dialogVisible.value = false;
    });
  }
};

// 分页
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchCraftList();
};

const handlePageSizeChange = (size) => {
  pageSize.value = size;
  fetchCraftList();
};

// 获取工艺列表
const fetchCraftList = async () => {
  try {
    const { data } = await getCraftDetails(
      searchForm.craftName,
      currentPage.value,
      pageSize.value
    );
    console.log("接口返回的数据:", data);

    // 将返回的工艺列表处理成平铺结构
    craftList.value = data.data.list.map((item) => {
      const requiredTimeObj = convertToTimeObject(item.craft.requiredTime);
      return {
        craftId: item.craft.craftId,
        craftCode: item.craft.craftCode,
        craftName: item.craft.craftName,
        sequence: item.craft.sequence,
        equipment: item.craft.equipment,
        nextProcess: item.craft.nextProcess,
        requiredTime: requiredTimeObj,
        demand: item.craft.demand,
        status: item.craft.status,
        description: item.craft.description,
        // 使用 formatTime 函数重新格式化时间
        formattedRequiredTime: formatTime(requiredTimeObj),
        products: item.products,
      };
    });
    totalItems.value = data.data.total; // 赋值总记录数
  } catch (error) {
    ElMessage.error("加载数据失败");
    console.error("加载数据失败：", error);
  }
};

onMounted(() => {
  fetchCraftList(); // 初始化加载工艺列表
});
</script>

<style scoped>
.craft-management {
  padding: 20px;
}

.el-dialog__body {
  padding-top: 10px;
}
</style>
