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
          <div id="deviceStatusChart" class="chart"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">设备类型分布</div>
          <div id="deviceTypeChart" class="chart"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">运行数据监控</div>
          <div id="realTimeChart" class="chart"></div>
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
        <div class="chart-box">
          <div class="chart-title">设备运行时长统计</div>
          <div id="runningTimeChart" class="chart"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">设备运行数据</div>
          <!-- 设备选择下拉框 -->
          <div class="device-select-container">
            <el-select
              v-model="selectedDeviceId"
              placeholder="选择设备"
              @change="LoadOperationData(selectedDeviceId)"
              class="custom-select"
            >
              <el-option v-for="device in deviceList" :key="device.value" :label="device.label" :value="device.value" />
            </el-select>
          </div>
          <div id="equipmentParamsChart" class="chart"></div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="chart-box">
          <div class="chart-title">设备能耗趋势</div>
          <div id="energyChart" class="chart"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">故障类型分布</div>
          <div id="faultTypeChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 实时数据展示 -->
    <div class="real-time-chart">
      <h3>实时数据展示</h3>
      <div>振动: {{ realTimeData.vibration }}</div>
      <div>温度: {{ realTimeData.temperature }}</div>
      <div>压力: {{ realTimeData.pressure }}</div>
      <div>氢气浓度: {{ realTimeData.hydrogenConcentration }}</div>
      <div>能耗: {{ realTimeData.powerConsumption }}</div>
      <div>时间: {{ realTimeData.timestamp }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { read } from "xlsx";
import { page } from "../../../../api/device.js";
import { selectByDeviceId } from "../../../../api/operation.js";

// 时间显示
const currentTime = ref("");
let timer = null;

// 实时数据
const realTimeData = ref({
  vibration: 0,
  temperature: 0,
  pressure: 0,
  hydrogenConcentration: 0,
  powerConsumption: 0,
  timestamp: "",
});

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

// WebSocket connection
let socket;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString();
};

const initWebSocket = () => {
  socket = new WebSocket("ws://localhost:8080/websocket/monitoring-data/2");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    realTimeData.value.vibration = data.vibration;
    realTimeData.value.temperature = data.temperature;
    realTimeData.value.pressure = data.pressure;
    realTimeData.value.hydrogenConcentration = data.hydrogenConcentration;
    realTimeData.value.powerConsumption = data.powerConsumption;
    realTimeData.value.timestamp = data.timestamp;
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };
};

// 图表实例
let deviceStatusChart = null;
let deviceTypeChart = null;
let runningTimeChart = null;
let energyChart = null;
let faultTypeChart = null;
let realTimeChart = null;

const selectedDeviceId = ref("");
const deviceList = ref([]);

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

// 初始化设备实时数据表
const initRealTimeDataChart = () => {
  deviceTypeChart = echarts.init(document.getElementById("realTimeChart"));
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

// 初始化运行时长统计图表
const initRunningTimeChart = () => {
  runningTimeChart = echarts.init(document.getElementById("runningTimeChart"));
  runningTimeChart.setOption({
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLabel: {
        color: "#fff",
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#fff",
      },
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: "line",
        areaStyle: {},
      },
    ],
  });
};

// 初始化能耗趋势图表
const initEnergyChart = () => {
  energyChart = echarts.init(document.getElementById("energyChart"));
  energyChart.setOption({
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLabel: {
        color: "#fff",
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#fff",
      },
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
        smooth: true,
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
  const equipmentParamsChart = echarts.init(document.getElementById("equipmentParamsChart"));
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
    console.log("设备列表", devices);
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
  console.log("设备列表", deviceList);
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
// 窗口大小改变时重置图表大小
const handleResize = () => {
  deviceStatusChart?.resize();
  deviceTypeChart?.resize();
  runningTimeChart?.resize();
  energyChart?.resize();
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
  initDeviceTypeChart();
  initRunningTimeChart();
  initEnergyChart();
  initFaultTypeChart();
  initEquipmentParamsChart();
  initRealTimeDataChart();

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
  runningTimeChart?.dispose();
  energyChart?.dispose();
  faultTypeChart?.dispose();

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
  background-color: #0f1c3c;
  color: #fff;
  padding: 15px;
  box-sizing: border-box;
  min-width: 1260px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;

    .title {
      font-size: 25px;
      font-weight: bold;
      margin: 0px auto;
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
      height: 90%;
    }

    .chart-box {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 15px;
      height: calc(50% - 8px);

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
</style>
