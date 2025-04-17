<template>
  <div class="dashboard-container">
    <div class="header">
      <div class="title">报警监控大屏</div>
      <div class="time">{{ currentTime }}</div>
    </div>

    <div class="content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <div class="chart-box">
          <div class="chart-title">振动</div>
          <div id="vibrationChart" class="chart"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">温度</div>
          <div id="temperatureChart" class="chart"></div>
        </div>
      </div>

      <!-- 中间面板 -->
      <div class="center-panel">
        <div class="chart-box" style="height: 120px">
          <div class="chart-title">设备状态预警</div>
          <div class="chart">
            <el-result
              v-if="status === 'success'"
              :icon="status"
              title="设备运行正常"
              class="custom-result"
            ></el-result>
            <el-result v-else :icon="status" title="设备运行异常" class="custom-result"></el-result>
          </div>
        </div>
        <div class="chart-box" style="height: 330px">
          <div class="chart-title">设备运行数据监控</div>
          <div class="device-select-container">
            <el-select
              v-model="selectedDeviceId"
              placeholder="选择设备"
              @change="handleDeviceChange(selectedDeviceId)"
              class="custom-select"
              size="small"
            >
              <el-option v-for="device in deviceList" :key="device.value" :label="device.label" :value="device.value" />
            </el-select>
          </div>
          <div id="TimerSeriesChart" class="chart"></div>
        </div>

        <div class="chart-box alarm-box" style="height: 220px; background-color: rgba(214, 52, 52, 0.1)">
          <div class="chart-title">报警信息</div>
          <ul class="alarm-info">
            <li v-for="(info, index) in alarmInfo" :key="index">{{ info }}</li>
          </ul>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="chart-box">
          <div class="chart-title">压力</div>
          <div id="pressureChart" class="chart"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">能耗</div>
          <div id="powerConsumptionChart" class="chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from "vue";
import * as echarts from "echarts";
import { read } from "xlsx";
import { page } from "../../../../api/device.js";

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
// 图表实例
let vibrationChart = null;
let temperatureChart = null;
let pressureChart = null;
let powerConsumptionChart = null;
let TimerSeriesChart = null;
// 设备选择
const selectedDeviceId = ref("");
let deviceList = ref([]);
// 设备状态
const status = ref("success");
// 设备数据
let temperatureArray = [];
let pressureArray = [];
let powerConsumptionArray = [];
let vibrationArray = [];

//报警信息
const alarmInfo = ref([]);
// WebSocket connection
let socket;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString();
};

const initWebSocket = (id = 1) => {
  socket = new WebSocket(`ws://localhost:8080/websocket/monitoring-data/${id}`);

  socket.onmessage = (event) => {
    realTimeData.value = JSON.parse(event.data);
    // 将数据放进参数数组中
    temperatureArray.push(realTimeData.value.temperature);
    pressureArray.push(realTimeData.value.pressure);
    powerConsumptionArray.push(realTimeData.value.powerConsumption);
    vibrationArray.push(realTimeData.value.vibration);
    //判断数组长度是否大于100
    if (temperatureArray.length > 100) {
      temperatureArray.shift();
      pressureArray.shift();
      powerConsumptionArray.shift();
      vibrationArray.shift();
    }
    //监测异常
    if (
      realTimeData.value.vibration > 0.5 ||
      realTimeData.value.temperature > 1180 ||
      realTimeData.value.pressure > 1.3 ||
      realTimeData.value.powerConsumption > 1000
    ) {
      status.value = "warning";
      alarmInfo.value.push(
        `【${currentTime.value}】设备${selectedDeviceId.value}出现异常，振动 ${realTimeData.value.vibration} V, 温度 ${realTimeData.value.temperature}℃ , 压力 ${realTimeData.value.pressure} Pa, 能耗 ${realTimeData.value.powerConsumption} kw,请及时查看设备运行状态`
      );
      if (alarmInfo.value.length > 3) {
        alarmInfo.value.shift();
      }
    } else {
      status.value = "success";
    }
    // 更新仪表盘
    initRealTimeDataChart(
      realTimeData.value.vibration,
      realTimeData.value.temperature,
      realTimeData.value.pressure,
      realTimeData.value.powerConsumption
    );

    // 更新时间序列图
    initTimerSeriesChart(temperatureArray, pressureArray, vibrationArray, powerConsumptionArray);
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  socket.onopen = () => {
    console.log("WebSocket connection opened");
  };

  socket.onerror = (error) => {
    console.log("WebSocket error:", error);
  };
};

// 图表实例
const initRealTimeDataChart = (vibration = 0, temperature = 0, pressure = 0, powerConsumption = 0) => {
  // 振动仪表盘
  vibrationChart = echarts.init(document.getElementById("vibrationChart"));
  vibrationChart.setOption({
    tooltip: {
      formatter: "{a} <br/>{b} : {c} ",
    },
    series: [
      {
        name: "振动",
        type: "gauge",
        detail: { formatter: "{value} V" },
        min: 0,
        max: 1,
        data: [{ value: vibration, name: "振动" }],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.1, "#67C23A"],
              [0.9, "#2528cd"],
              [1, "#995218"],
            ],
          },
        },
        title: {
          show: true,
          offsetCenter: [0, "70%"], // x, y
          textStyle: {
            fontSize: 20,
            color: "#fff", // 标题颜色
          },
        },
        detail: {
          formatter: "{value} V",
          textStyle: {
            fontSize: 30,
            color: "#fff", // 数值颜色
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#fff", // 刻度线颜色
            width: 2,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#fff", // 刻度线颜色
            width: 2,
          },
        },
      },
    ],
  });

  // 温度仪表盘
  temperatureChart = echarts.init(document.getElementById("temperatureChart"));
  temperatureChart.setOption({
    tooltip: {
      formatter: "{a} <br/>{b} : {c}°C",
    },
    series: [
      {
        name: "温度",
        type: "gauge",
        detail: { formatter: "{value}°C" },
        min: 0,
        max: 1500,
        data: [{ value: temperature, name: "温度" }],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.1, "#67C23A"],
              [0.9, "#2528cd"],
              [1, "#995218"],
            ],
          },
        },
        title: {
          show: true,
          offsetCenter: [0, "70%"],
          textStyle: {
            fontSize: 20,
            color: "#fff",
          },
        },
        detail: {
          formatter: "{value}°C",
          textStyle: {
            fontSize: 30,
            color: "#fff",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#fff",
            width: 2,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#fff",
            width: 2,
          },
        },
      },
    ],
  });

  // 压力仪表盘
  pressureChart = echarts.init(document.getElementById("pressureChart"));
  pressureChart.setOption({
    tooltip: {
      formatter: "{a} <br/>{b} : {c} Pa",
    },
    series: [
      {
        name: "压力",
        type: "gauge",
        detail: { formatter: "{value} Pa" },
        min: 0,
        max: 1.6,
        data: [{ value: pressure, name: "压力" }],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.1, "#67C23A"],
              [0.9, "#2528cd"],
              [1, "#995218"],
            ],
          },
        },
        title: {
          show: true,
          offsetCenter: [0, "70%"],
          textStyle: {
            fontSize: 20,
            color: "#fff",
          },
        },
        detail: {
          formatter: "{value} Pa",
          textStyle: {
            fontSize: 30,
            color: "#fff",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#fff",
            width: 2,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#fff",
            width: 2,
          },
        },
      },
    ],
  });

  // 能耗仪表盘
  powerConsumptionChart = echarts.init(document.getElementById("powerConsumptionChart"));
  powerConsumptionChart.setOption({
    tooltip: {
      formatter: "{a} <br/>{b} : {c} W",
    },
    series: [
      {
        name: "能耗",
        type: "gauge",
        detail: { formatter: "{value} KW" },
        min: 0,
        max: 1500,
        data: [{ value: powerConsumption, name: "能耗" }],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.1, "#67C23A"],
              [0.9, "#2528cd"],
              [1, "#995218"],
            ],
          },
        },
        title: {
          show: true,
          offsetCenter: [0, "70%"],
          textStyle: {
            fontSize: 20,
            color: "#fff",
          },
        },
        detail: {
          formatter: "{value} KW",
          textStyle: {
            fontSize: 30,
            color: "#fff",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#fff",
            width: 2,
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#fff",
            width: 2,
          },
        },
      },
    ],
  });
};

const initTimerSeriesChart = (temperatureData, pressureData, vibrationData, powerConsumptionData) => {
  TimerSeriesChart = echarts.init(document.getElementById("TimerSeriesChart"), { width: "80%", height: "50%" });
  TimerSeriesChart.setOption({
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["温度", "压力", "振动", "能耗"],
      textStyle: { color: "#fff" },
    },
    xAxis: {
      type: "category",
      name: "时间:s",
      data: Array.from({ length: temperatureData.length }, (_, i) => `${i}s`),
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
        name: "振动",
        type: "line",
        data: vibrationData,
      },
      {
        name: "能耗",
        type: "line",
        data: powerConsumptionData,
      },
    ],
  });
};

const loadDeviceList = () => {
  let deviceName = "";
  let deviceType = "";
  page(deviceName, deviceType, 1, 1000)
    .then((res) => {
      if (res.data.code === 1) {
        let deviceData = res.data.data.rows;
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

const handleDeviceChange = (deviceId) => {
  if (socket) {
    socket.close();
  }
  temperatureArray = [];
  pressureArray = [];
  powerConsumptionArray = [];
  vibrationArray = [];
  initWebSocket(deviceId);
};

// 窗口大小改变时重置图表大小
const handleResize = () => {
  vibrationChart.resize();
  temperatureChart.resize();
  pressureChart.resize();
  powerConsumptionChart.resize();
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 2000);
  loadDeviceList();
  initWebSocket();

  initRealTimeDataChart();
  initTimerSeriesChart(temperatureArray, pressureArray, vibrationArray, powerConsumptionArray);
  handleResize(); // 确保第一次渲染时触发 resize
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  // 清除定时器
  if (timer) {
    clearInterval(timer);
  }

  // 销毁图表实例
  if (vibrationChart) {
    vibrationChart.dispose();
  }
  if (temperatureChart) {
    temperatureChart.dispose();
  }
  if (pressureChart) {
    pressureChart.dispose();
  }
  if (powerConsumptionChart) {
    powerConsumptionChart.dispose();
  }
  if (TimerSeriesChart) {
    TimerSeriesChart.dispose();
  }

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
      margin-left: 44.5%;
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
    align-items: space-between;
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
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
        text-align: center;
        white-space: nowrap;
        // border-left: #0f1c3c solid 5px;
      }

      .chart {
        height: calc(100% - 15px);
        width: 100%;
      }
    }
  }
}

.real-time-data {
  margin-top: 20px;
  color: #fff;
}

.custom-result {
  padding: 0px;
  height: 100px;
}
:deep(.el-result) {
  --el-result-title-margin-top: 6px;
}
:deep(.el-result__title p) {
  color: #d8e4e0;
  font-size: 16px;
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

.alarm-info {
  // background-color: rgba(255, 0, 0, 0.1);
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
  color: rgba(244, 91, 91, 0.7);
  font-weight: bold;
  list-style-type: none;
}

.alarm-info li {
  margin: 5px 0;
}

:deep(.el-select__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 0.5px #4dadff inset;
}
</style>
