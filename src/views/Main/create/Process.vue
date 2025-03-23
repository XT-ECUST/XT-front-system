<template>
  <div class="craft-parameter-analysis">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" style="margin-bottom: 20px">
      <el-form-item label="工艺名称">
        <el-input v-model="searchForm.craftName" placeholder="请输入工艺名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 主内容 -->
    <el-row gutter="20">
      <!-- 左侧工艺列表 -->
      <el-col :span="6">
        <el-card class="craft-list-card">
          <div slot="header">工艺列表</div>
          <el-table
            :data="craftList"
            style="width: 100%"
            height="500px"
            @row-click="onCraftSelect"
            border
          >
            <el-table-column prop="craftName" label="工艺名称" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧内容区 -->
      <el-col :span="18">
        <el-row gutter="20">
          <!-- 参数列表 -->
          <el-col :span="24">
            <el-card>
              <div slot="header">
                参数列表
                <el-button
                  type="primary"
                  size="small"
                  @click="openDialog('add')"
                  style="float: right"
                >
                  新增参数
                </el-button>
              </div>
              <el-table
                :data="parameterList"
                style="width: 100%"
                @row-click="onParameterSelect"
                border
              >
                <el-table-column prop="parameterName" label="参数名称" />
                <el-table-column prop="value" label="数值" />
                <el-table-column prop="minValue" label="最小值" />
                <el-table-column prop="maxValue" label="最大值" />
                <el-table-column prop="unit" label="单位" />
                <el-table-column prop="createdTimeFormatted" label="创建时间" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button
                      type="text"
                      size="small"
                      @click="openDialog('edit', scope.row)"
                      >编辑</el-button
                    >
                    <el-button
                      type="text"
                      size="small"
                      style="color: red"
                      @click="confirmDelete(scope.row.parameterId)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <!-- 趋势分析图 -->
          <el-col :span="24" style="margin-top: 20px">
            <el-card>
              <div slot="header">趋势分析图</div>
              <div id="trendChart" style="width: 100%; height: 400px"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- 新增/编辑参数弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      center
    >
      <el-form :model="parameterForm" label-width="100px">
        <el-form-item label="参数名称">
          <el-input
            v-model="parameterForm.parameterName"
            placeholder="请输入参数名称"
          />
        </el-form-item>
        <el-form-item label="数值">
          <el-input v-model="parameterForm.value" placeholder="请输入数值" />
        </el-form-item>
        <el-form-item label="最小值">
          <el-input
            v-model="parameterForm.minValue"
            placeholder="请输入最小值"
          />
        </el-form-item>
        <el-form-item label="最大值">
          <el-input
            v-model="parameterForm.maxValue"
            placeholder="请输入最大值"
          />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="parameterForm.unit" placeholder="请输入单位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getAllCrafts,
  getParametersByCraftId,
  addParameter,
  updateParameter,
  deleteParameterById,
} from "../../../../api/paramater.js";

// 搜索表单
const searchForm = reactive({
  craftName: "",
});

// 工艺列表
const craftList = ref([]);

// 参数列表
const parameterList = ref([]);

// 当前选中的工艺和参数
const selectedCraft = ref(null);
const selectedParameter = ref(null);

// WebSocket连接和数据
let ws = null;
const trendData = ref({
  timeData: [],
  valueData: [],
});

// 对话框数据
const dialogVisible = ref(false);
const dialogTitle = ref("");
const parameterForm = reactive({
  parameterId: "",
  parameterName: "",
  value: "",
  minValue: "",
  maxValue: "",
  unit: "",
  craftId: "",
  createdTime: "",
  craftName: "",
});

// 格式化时间函数
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份从0开始，所以加1
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 这里包括了秒
};

// 定时器
let timer = null;

// 初始化趋势图
let chartInstance = null;
const initTrendChart = () => {
  const chartDom = document.getElementById("trendChart");
  chartInstance = echarts.init(chartDom);
  chartInstance.setOption({
    title: { text: "趋势分析", left: "center" },
    xAxis: { type: "category", data: [] },
    yAxis: { type: "value" },
    series: [
      {
        data: [],
        type: "line",
        smooth: true, // 设置为平滑折线
        itemStyle: {
          color: "blue", // 线条颜色
        },
        lineStyle: {
          width: 2, // 线条宽度
        },
        areaStyle: {
          color: "rgba(0, 153, 255, 0.2)", // 半透明的区域背景
        },
      },
    ],
  });
};

// 更新趋势图数据
const updateTrendChart = () => {
  if (!chartInstance) return;

  // 限制数据长度，防止数据量过大
  if (trendData.value.timeData.length > 20) {
    trendData.value.timeData.shift();
    trendData.value.valueData.shift();
  }

  chartInstance.setOption({
    xAxis: {
      data: trendData.value.timeData,
    },
    series: [
      {
        data: trendData.value.valueData,
        type: "line", // 折线图类型
        smooth: true, // 使折线平滑
        itemStyle: {
          color: "blue", // 设置线条颜色
        },
        lineStyle: {
          width: 2, // 线条宽度
        },
        areaStyle: {
          color: "rgba(0, 153, 255, 0.2)", // 半透明蓝色
        },
      },
    ],
  });
};

// WebSocket 数据接收
const connectWebSocket = () => {
  // 替换为后端提供的 WebSocket URL
  ws = new WebSocket("ws://localhost:8080/ws/parameter-realtime");

  ws.onopen = () => {
    console.log("WebSocket连接成功");
    if (selectedParameter.value && selectedParameter.value.parameterId) {
      ws.send(selectedParameter.value.parameterId.toString()); // 发送参数 ID 进行订阅
    }
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received data: ", data);

    if (data.parameterId === selectedParameter.value.parameterId) {
      const formattedTimestamp = formatDate(data.timestamp);
      // 将数据加入时间和数值数组
      trendData.value.timeData.push(data.timestamp);
      trendData.value.valueData.push(data.value);

      // 更新图表
      updateTrendChart();
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket发生错误:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket连接关闭");
  };
};

// 选择工艺
const onCraftSelect = (craft) => {
  selectedCraft.value = craft;
  if (!craft.craftId) {
    console.error("无效的工艺 ID:", craft.craftId);
    return;
  }
  getParametersByCraftId(craft.craftId)
    .then((response) => {
      console.log("获取参数列表成功:", response.data);
      if (response.data && Array.isArray(response.data)) {
        parameterList.value = response.data;
        parameterList.value.forEach((param) => {
          param.createdTimeFormatted = formatDate(param.createdTime);
        });
      } else {
        console.error("返回的数据格式不正确:", response.data);
      }
    })
    .catch((error) => {
      console.error("获取参数列表失败:", error);
    });
};

// 选择参数
const onParameterSelect = (parameter) => {
  selectedParameter.value = parameter;
  trendData.value = { timeData: [], valueData: [] }; // 清空之前的数据
  updateTrendChart(parameter);
  if (timer) clearInterval(timer); // 清除上一个定时器

  // 每隔1秒更新数据
  timer = setInterval(() => {
    // 获取当前时间并格式化
    const formattedTime = formatDate(new Date().toISOString()); // 格式化当前时间

    // 模拟每秒增加一个新数据点
    trendData.value.timeData.push(formattedTime);
    // 使用参数的 minValue 和 maxValue 作为范围
    const min = parseFloat(selectedParameter.value.minValue);
    const max = parseFloat(selectedParameter.value.maxValue);
    trendData.value.valueData.push(Math.random() * (max - min) + min);

    // 更新趋势图
    updateTrendChart();
  }, 1000);

  connectWebSocket(); // 连接 WebSocket,开始接收数据
};

// 搜索和重置
const onSearch = () => {
  getAllCrafts(searchForm.craftName).then((response) => {
    craftList.value = response.data;
  });
};
const onReset = () => {
  searchForm.craftName = "";
  getAllCrafts(searchForm.craftName).then((response) => {
    craftList.value = response.data;
  });
};

// 删除参数
const confirmDelete = (id) => {
  ElMessageBox.confirm("确认删除该参数吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteParameterById(id).then(() => {
      parameterList.value = parameterList.value.filter(
        (item) => item.id !== id
      );
      ElMessage.success("删除成功");
    });
  });
};

// 打开弹窗
const openDialog = (type, row) => {
  dialogTitle.value = type === "add" ? "新增参数" : "编辑参数";
  dialogVisible.value = true;
  if (type === "edit" && row) {
    Object.assign(parameterForm, row);
  } else {
    Object.keys(parameterForm).forEach((key) => (parameterForm[key] = ""));
    parameterForm.craftId = selectedCraft.value.craftId; // 设置当前选中的工艺 ID
    parameterForm.craftName = selectedCraft.value.craftName; // 设置当前选中的工艺名称
    parameterForm.createdTime = new Date().toISOString(); // 设置当前时间
  }
};

// 保存参数
const onSave = () => {
  if (!parameterForm.id) {
    parameterForm.craftId = selectedCraft.value.craftId; // 获取选中的工艺 ID
    parameterForm.craftName = selectedCraft.value.craftName; // 获取选中的工艺名称
    parameterForm.createdTime = new Date().toISOString(); // 当前时间，转换为 ISO 格式字符串
  }
  if (parameterForm.parameterId) {
    updateParameter(parameterForm).then(() => {
      ElMessage.success("更新成功");
      dialogVisible.value = false;
    });
  } else {
    addParameter(parameterForm).then(() => {
      ElMessage.success("新增成功");
      dialogVisible.value = false;
    });
  }
};

// 初始化
onMounted(() => {
  initTrendChart();
  connectWebSocket(); // 连接 WebSocket,开始接收数据
  getAllCrafts().then((response) => {
    console.log("获取工艺列表成功:", response.data);
    craftList.value = response.data; // 获取工艺列表
  });
});

onUnmounted(() => {
  if (ws) {
    ws.close(); // 组件销毁时关闭 WebSocket
  }
  if (timer) {
    clearInterval(timer); // 组件销毁时清除定时器
  }
});
</script>

<style scoped>
.craft-parameter-analysis {
  padding: 20px;
}

.craft-list-card {
  height: 100%;
}

.el-card {
  overflow: hidden;
}
</style>
