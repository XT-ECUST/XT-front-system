<template>
  <div class="dashboard-container">
    <div class="header">
      <div class="title">设备运行监控大屏</div>
      <div class="time">{{ currentTime }}</div>
    </div>

    <div class="content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <div class="chart-box">
          <div class="chart-title">设备运行状态分布</div>
          <div id="deviceStatusChart" class="chart" style="height: 300px"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">设备类型分布</div>
          <div id="deviceTypeChart" class="chart" style="height: 300px"></div>
        </div>
      </div>

      <!-- 中间面板 -->
      <div class="center-panel">
        <div class="data-overview">
          <div class="overview-item">
            <div class="item-title">设备总数</div>
            <div class="item-value">{{ devicesCountData.totalCount }}</div>
          </div>
          <div class="overview-item">
            <div class="item-title">运行设备</div>
            <div class="item-value">{{ devicesCountData.runningCount }}</div>
          </div>
          <div class="overview-item">
            <div class="item-title">维护设备</div>
            <div class="item-value">{{ devicesCountData.maintenanceCount }}</div>
          </div>
        </div>
        <div class="chart-box" style="height: 235px">
          <div class="chart-title">设备运行参数实时监控</div>
          <!-- 设备选择下拉框 -->
          <div class="device-select-container">
            <el-select
              v-model="selectedDeviceId"
              placeholder="选择设备"
              @change="handleDeviceChange(MonitoringSelectedDeviceId)"
              class="custom-select"
              size="small"
            >
              <el-option v-for="device in deviceList" :key="device.value" :label="device.label" :value="device.value" />
            </el-select>
          </div>
          <div class="real-time-chart">
            <table class="real-time-table">
              <thead>
                <tr>
                  <th>温度</th>
                  <th>压力</th>
                  <th>氢气浓度</th>
                  <th>能耗</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(data, index) in realTimeDataList" :key="index">
                  <td>{{ data.temperature }}</td>
                  <td>{{ data.pressure }}</td>
                  <td>{{ data.hydrogenConcentration }}</td>
                  <td>{{ data.powerConsumption }}</td>
                  <td>{{ data.timestamp.replace("T", " ").substring(0, 19) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="chart-box" style="height: 400px">
          <div class="chart-title">设备运行数据</div>
          <!-- 设备选择下拉框 -->
          <div class="device-select-container">
            <el-select
              v-model="selectedDeviceId"
              placeholder="选择设备"
              @change="LoadOperationData(selectedDeviceId)"
              class="custom-select"
              size="small"
            >
              <el-option v-for="device in deviceList" :key="device.value" :label="device.label" :value="device.value" />
            </el-select>
          </div>
          <div id="equipmentParamsChart" class="chart"></div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="chart-box" style="height: 310px">
          <div class="chart-title">生产展示</div>
          <div class="chart">
            <div class="production">
              <div class="production-item">
                <img src="../../../assets/images/production-logo.png" alt="" class="production-logo" />
                <div class="production-data">当月产量: {{ Production.monthlyProduction }} 吨</div>
              </div>
              <div class="production-item">
                <img src="../../../assets/images/production-logo.png" alt="" class="production-logo" />
                <div class="production-data">当日产量: {{ Production.dailyProduction }} 吨</div>
              </div>
            </div>
          </div>
        </div>
        <div class="chart-box" style="height: 350px">
          <div class="chart-title">投入产出监控</div>
          <div class="real-time-chart">
            <table class="real-time-table">
              <thead>
                <tr>
                  <th>部门</th>
                  <th>投入</th>
                  <th>产出</th>
                  <th>投入产出率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(production, index) in productionLineData" :key="index">
                  <td>{{ production.department }}</td>
                  <td>{{ production.putInto }}</td>
                  <td>{{ production.putOut }}</td>
                  <td>{{ production.IntoOutRatio }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时数据展示 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { read } from "xlsx";
import { page } from "../../../../api/device.js";
import { selectByDeviceId } from "../../../../api/operation.js";

let socket = null;

// 时间显示
const currentTime = ref("");
let timer = null;

const devicesCountData = ref({
  totalCount: 0,
  runningCount: 0,
  stoppedCount: 0,
  maintenanceCount: 0,
});

const devicesTypeData = ref({
  restorationBoilerCount: 0,
  coldHydrogenation: 0,
  otherDevices: 0,
});

const Production = ref({
  monthlyProduction: 3619,
  dailyProduction: 136,
});

const realTimeDataList = ref([]);

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString();
};

const initWebSocket = (id = 1) => {
  socket = new WebSocket(`ws://localhost:8080/websocket/monitoring-data/${id}`);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // 将新数据添加到实时数据列表
    realTimeDataList.value.push({
      vibration: data.vibration,
      temperature: data.temperature,
      pressure: data.pressure,
      hydrogenConcentration: data.hydrogenConcentration,
      powerConsumption: data.powerConsumption,
      timestamp: data.timestamp,
    });
    // 限制列表长度，保持最新的3条数据
    if (realTimeDataList.value.length > 3) {
      realTimeDataList.value.shift();
    }
  };
  socket.onopen = () => {
    console.log("WebSocket connection opened");
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  socket.onerror = (error) => {
    console.log("WebSocket error:", error);
  };
};

// 图表实例
let deviceStatusChart = null;
let deviceTypeChart = null;
let faultTypeChart = null;
let realTimeChart = null;

const selectedDeviceId = ref("");
const MonitoringSelectedDeviceId = ref("");
const deviceList = ref([]);

const productionLineData = ref([
  { department: 1, putInto: 138754, putOut: 98754, IntoOutRatio: 0.71 },
  { department: 2, putInto: 73892, putOut: 87987, IntoOutRatio: 1.19 },
  { department: 3, putInto: 123456, putOut: 654321, IntoOutRatio: 0.56 },
  { department: 4, putInto: 98765, putOut: 59876, IntoOutRatio: 0.6 },
]);

// 初始化设备状态分布图表
const initDeviceStatusChart = (data) => {
  deviceStatusChart = echarts.init(document.getElementById("deviceStatusChart"));
  deviceStatusChart.setOption({
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
      textStyle: {
        color: "#fff",
      },
    },
    series: [
      {
        type: "pie",
        color: ["#409EFF", "#E6A23C", "#67C23A"],
        radius: ["40%", "60%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold",
          },
        },
        data: data,
      },
    ],
  });
};

// 初始化设备类型分布图表
const initDeviceTypeChart = (data) => {
  deviceTypeChart = echarts.init(document.getElementById("deviceTypeChart"));
  deviceTypeChart.setOption({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "5%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: ["还原炉", "冷氢化流化床", "其它"],
        axisLabel: {
          color: "#fff",
          rotate: 30,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          color: "#fff",
        },
      },
    ],
    series: [
      {
        type: "bar",
        barWidth: "60%",
        data: data,
        itemStyle: {
          color: function (params) {
            const colors = ["#409EFF", "#67C23A", "#E6A23C"];
            return colors[params.dataIndex];
          },
        },
      },
    ],
  });
};

// 初始化故障类型分布图表
const initFaultTypeChart = () => {
  faultTypeChart = echarts.init(document.getElementById("faultTypeChart"));
  faultTypeChart.setOption({
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
      textStyle: {
        color: "#fff",
      },
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold",
          },
        },
        data: [
          { value: 2, name: "机械故障" },
          { value: 1, name: "电气故障" },
          { value: 1, name: "传感器故障" },
          { value: 1, name: "其他" },
        ],
      },
    ],
  });
};

// 初始化设备运行数据监控图表
const initEquipmentParamsChart = (
  runningTimeData,
  temperatureData,
  pressureData,
  hydrogenConcentrationData,
  powerConsumptionData
) => {
  const equipmentParamsChart = echarts.init(document.getElementById("equipmentParamsChart"), {
    width: "80%",
    height: "50%",
  });
  equipmentParamsChart.setOption({
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["温度", "压力", "氢气浓度", "能耗"],
      textStyle: { color: "#fff" },
    },
    xAxis: {
      type: "category",
      name: "时间:h",
      data: runningTimeData,
      axisLabel: { color: "#fff" },
    },
    yAxis: [
      {
        type: "value",
        name: "value",
        axisLabel: { color: "#fff" },
      },
    ],
    series: [
      {
        name: "温度",
        type: "line",
        data: temperatureData,
      },
      {
        name: "压力",
        type: "line",
        data: pressureData,
      },
      {
        name: "氢气浓度",
        type: "line",
        data: hydrogenConcentrationData,
      },
      {
        name: "能耗",
        type: "line",
        data: powerConsumptionData,
      },
    ],
  });
};

const loadStatusData = async () => {
  const deviceSearch = {
    deviceType: "",
    deviceName: "",
  };
  const response = await page(deviceSearch.deviceName, deviceSearch.deviceType, 1, 100);
  if (response.data.code === 1) {
    const devices = response.data.data.rows;
    deviceList.value = getDeviceList(devices);
    devicesCountData.value.totalCount = response.data.data.total;
    devices.forEach((device) => {
      //读取设备状态信息
      if (device.status === 1) {
        devicesCountData.value.runningCount += 1;
      } else if (device.status === 2) {
        devicesCountData.value.stoppedCount += 1;
      } else {
        devicesCountData.value.maintenanceCount += 1;
      }
      //读取设备类型信息
      if (device.deviceType === 1) {
        devicesTypeData.value.restorationBoilerCount += 1;
      } else if (device.deviceType === 2) {
        devicesTypeData.value.coldHydrogenation += 1;
      } else {
        devicesTypeData.value.otherDevices += 1;
      }
    });
    const statusData = [
      { value: devicesCountData.value.runningCount, name: "运行" },
      { value: devicesCountData.value.stoppedCount, name: "停止" },
      { value: devicesCountData.value.maintenanceCount, name: "维护" },
    ];

    const typeData = [
      devicesTypeData.value.restorationBoilerCount,
      devicesTypeData.value.coldHydrogenation,
      devicesTypeData.value.otherDevices,
    ];
    initDeviceStatusChart(statusData);
    initDeviceTypeChart(typeData);
  } else {
    console.log("读取状态列表和初始化图标失败", result.data.msg);
  }
};
const getDeviceList = (deviceData) => {
  let deviceList = deviceData.map((item) => {
    return {
      label: item.deviceName,
      value: item.deviceId,
    };
  });
  return deviceList;
};

const LoadOperationData = async (id = 1) => {
  const response = await selectByDeviceId(id);
  if (response.data.code === 1) {
    const operationData = response.data.data;
    console.log("操作数据", operationData);
    const runningTimeData = [];
    const temperatureData = [];
    const pressureData = [];
    const hydrogenConcentrationData = [];
    const powerConsumptionData = [];
    let runningTime = 0;
    operationData.forEach((item) => {
      runningTimeData.push(runningTime);
      temperatureData.push(item.temperature);
      pressureData.push(item.pressure);
      hydrogenConcentrationData.push(item.hydrogenConcentration);
      powerConsumptionData.push(item.powerConsumption);
      runningTime += 0.5;
    });
    console.log("运行时长", runningTimeData);
    console.log("压力", pressureData);
    console.log("氢气浓度", hydrogenConcentrationData);
    console.log("能耗", powerConsumptionData);
    initEquipmentParamsChart(
      runningTimeData,
      temperatureData,
      pressureData,
      hydrogenConcentrationData,
      powerConsumptionData
    );
  } else {
    console.log("读取操作数据失败", response.data.msg);
    ElMessage.error(response.data.msg);
  }
};

const handleDeviceChange = (id) => {
  realTimeDataList.value = [];
  initWebSocket(id);
};
// 窗口大小改变时重置图表大小
const handleResize = () => {
  deviceStatusChart?.resize();
  deviceTypeChart?.resize();
  faultTypeChart?.resize();
};

onMounted(async () => {
  // 初始化时间显示
  updateTime();
  timer = setInterval(updateTime, 1000);
  initWebSocket();

  // 初始化所有图表
  loadStatusData();
  LoadOperationData(1);
  // initRealTimeChart();
  // initFaultTypeChart();
  initEquipmentParamsChart();

  // 添加窗口大小改变监听
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  // 清除定时器
  if (timer) {
    clearInterval(timer);
  }

  // 销毁图表实例
  deviceStatusChart?.dispose();
  deviceTypeChart?.dispose();
  realTimeChart?.dispose();
  // energyChart?.dispose();
  // faultTypeChart?.dispose();

  // 移除窗口大小改变监听
  window.removeEventListener("resize", handleResize);

  // 关闭WebSocket连接
  if (socket) {
    socket.close();
  }
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 100%;
  height: 120vh;
  background: url(../../../assets/images/windowBG.png) center/cover no-repeat;
  background-color: #0f1c3c;
  color: #fff;
  padding: 15px;
  box-sizing: border-box;
  min-width: 1260px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 90px;

    .title {
      font-size: 25px;
      font-weight: bold;
      margin-left: 42%;
      line-height: 50px;
    }

    .time {
      border: 1px solid #ededed;
      border-radius: 5px;
      padding: 0px 5px;
      font-size: 14px;
      font-weight: bold;
      line-height: 50px;
    }
  }

  .content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    height: calc(90% - 65px);
    margin-top: 15px;
    gap: 15px;

    .left-panel,
    .right-panel {
      width: 28%;
      height: 80%;
    }

    .center-panel {
      width: 44%;
      height: 80%;
    }

    .chart-box {
      background-color: rgba(255, 255, 255, 0.03);
      border-radius: 5px;
      padding: 12px;
      margin-bottom: 15px;

      .chart-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 8px;
        text-align: center;
        white-space: nowrap;
      }

      .chart {
        height: calc(100% - 15px);
        width: 100%;
      }
    }

    .data-overview {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;

      .overview-item {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 12px;
        width: 30%;
        text-align: center;

        .item-title {
          font-size: 13px;
          margin-bottom: 8px;
        }

        .item-value {
          font-size: 22px;
          font-weight: bold;
          color: #409eff;
        }
      }
    }
  }
}

.real-time-data {
  margin-top: 20px;
  color: #fff;
}

.device-select-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.custom-select {
  background-color: #030d27;
  width: 220px;
  color: #ffffff;
}

.real-time-chart {
  margin-top: 20px;
  color: #fff;

  .real-time-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      border: 1px solid #fff;
      padding: 8px;
      text-align: center;
    }

    th {
      background-color: #172b5f;
    }
  }
}

.production {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
  justify-content: space-between;
  .production-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .production-logo {
      width: 50px;
    }
    .production-data {
      font-size: 16px;
      font-weight: bold;
      color: #499df0;
    }
  }
}

:deep(.el-select__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 0.5px #4dadff inset;
}

// :deep(.el-table) {
//   --el-table-tr-bg-color: #7e7d7d;

//   th.el-table__cell {
//     background-color: #131934;
//   }

//   .el-table__cell {
//     padding: 5px 0;
//   }
// }
</style>
