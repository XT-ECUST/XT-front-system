<template>
  <div class="dashboard-container">
    <div class="header">
      <div class="title">报警管理</div>
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
        <div class="data-overview"> </div>
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
import { ref, onMounted, onUnmounted } from "vue";
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

let vibrationChart = null;
let temperatureChart = null;
let pressureChart = null;
let powerConsumptionChart = null;

const realTimeArray = ref([]);

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

    // 更新图表
    if (vibrationChart) {
      vibrationChart.setOption({
        series: [
          {
            data: [{ value: realTimeData.value.vibration, name: "振动" }],
          },
        ],
      });
    }
    if (temperatureChart) {
      temperatureChart.setOption({
        series: [
          {
            data: [{ value: realTimeData.value.temperature, name: "温度" }],
          },
        ],
      });
    }
    if (pressureChart) {
      pressureChart.setOption({
        series: [
          {
            data: [{ value: realTimeData.value.pressure, name: "压力" }],
          },
        ],
      });
    }
    if (powerConsumptionChart) {
      powerConsumptionChart.setOption({
        series: [
          {
            data: [{ value: realTimeData.value.powerConsumption, name: "能耗" }],
          },
        ],
      });
    }
  };

  realTimeArray.value = ref([]);

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

// 初始化实时数据仪表盘
const initRealTimeDataChart = () => {
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
        data: [{ value: realTimeData.value.vibration, name: "振动" }],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, "#67C23A"],
              [0.8, "#E6A23C"],
              [1, "#F56C6C"],
            ],
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
        data: [{ value: realTimeData.value.temperature, name: "温度" }],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, "#67C23A"],
              [0.8, "#E6A23C"],
              [1, "#F56C6C"],
            ],
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
        data: [{ value: realTimeData.value.pressure, name: "压力" }],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, "#67C23A"],
              [0.8, "#E6A23C"],
              [1, "#F56C6C"],
            ],
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
        detail: { formatter: "{value} W" },
        data: [{ value: realTimeData.value.powerConsumption, name: "能耗" }],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, "#67C23A"],
              [0.8, "#E6A23C"],
              [1, "#F56C6C"],
            ],
          },
        },
      },
    ],
  });
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
  timer = setInterval(updateTime, 1000);
  initWebSocket();

  initRealTimeDataChart();
  handleResize(); // 确保第一次渲染时触发 resize
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  // 清除定时器
  if (timer) {
    clearInterval(timer);
  }

  // 销毁图表实例

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
</style>
