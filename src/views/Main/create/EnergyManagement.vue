<template>
  <div class="energy-calculation">
    <!-- 工段详情部分 -->
    <el-card class="section">
      <div class="section-title">工段详情</div>
      <el-row :gutter="30">
        <el-col :span="12">
          <el-select
            v-model="selectedProcess"
            placeholder="选择工艺"
            @change="onProcessChange"
            style="width: 450px"
          >
            <el-option
              v-for="process in processes"
              :key="process.craftId"
              :label="process.craftName"
              :value="process.craftId"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="12" class="details-text">
          <div><strong>工艺名称:</strong> {{ selectedProcessInfo.name }}</div>
          <div><strong>工艺编码:</strong> {{ selectedProcessInfo.code }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="30">
        <el-col :span="12" class="details-text">
          <div>
            <strong>所需设备:</strong> {{ selectedProcessInfo.equipment }}
          </div>
        </el-col>
        <el-col :span="12" class="details-text">
          <div><strong>运行状态:</strong> {{ selectedProcessInfo.status }}</div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 单位能耗部分 -->
    <el-card class="section">
      <div class="section-title">
        单位能耗
        <el-radio-group v-model="selectedPeriod" class="time-period-selector">
          <el-radio-button :value="'daily'">日</el-radio-button>
          <el-radio-button :value="'monthly'">月</el-radio-button>
          <el-radio-button :value="'yearly'">年</el-radio-button>
        </el-radio-group>
      </div>

      <el-row :gutter="20" class="energy-cards">
        <!-- 蒸汽 -->
        <el-col :span="8">
          <el-card class="energy-card" style="padding: 12px">
            <div class="energy-card-title">蒸汽</div>
            <hr class="divider" />
            <div class="energy-content">
              <div class="energy-value">
                {{ energyData.steam.avgUnitConsumption }}
              </div>
              <div class="energy-label">平均单位能耗</div>
              <div class="divider1"></div>
            </div>
            <div class="energy-content">
              <div class="energy-value">
                {{ energyData.steam.peakUnitConsumption }}
              </div>
              <div class="energy-label">单位能耗峰值</div>
              <div class="divider1"></div>
            </div>
            <div class="energy-content">
              <div class="energy-value">{{ energyData.steam.peakTime }}</div>
              <div class="energy-label">峰值时间</div>
            </div>
          </el-card>
        </el-col>

        <!-- 电 -->
        <el-col :span="8">
          <el-card class="energy-card">
            <div class="energy-card-title">电</div>
            <hr class="divider" />
            <div class="energy-content">
              <div class="energy-value">
                {{ energyData.electricity.avgUnitConsumption }}
              </div>
              <div class="energy-label">平均单位能耗</div>
              <div class="divider1"></div>
            </div>
            <div class="energy-content">
              <div class="energy-value">
                {{ energyData.electricity.peakUnitConsumption }}
              </div>
              <div class="energy-label">单位能耗峰值</div>
              <div class="divider1"></div>
            </div>
            <div class="energy-content">
              <div class="energy-value">
                {{ energyData.electricity.peakTime }}
              </div>
              <div class="energy-label">峰值时间</div>
            </div>
          </el-card>
        </el-col>

        <!-- 水 -->
        <el-col :span="8">
          <el-card class="energy-card">
            <div class="energy-card-title">水</div>
            <hr class="divider" />
            <div class="energy-content">
              <div class="energy-value">
                {{ energyData.water.avgUnitConsumption }}
              </div>
              <div class="energy-label">平均单位能耗</div>
              <div class="divider1"></div>
            </div>
            <div class="energy-content">
              <div class="energy-value">
                {{ energyData.water.peakUnitConsumption }}
              </div>
              <div class="energy-label">单位能耗峰值</div>
              <div class="divider1"></div>
            </div>
            <div class="energy-content">
              <div class="energy-value">{{ energyData.water.peakTime }}</div>
              <div class="energy-label">峰值时间</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 历史数据部分 -->
    <el-card class="section">
      <div class="section-title">历史数据</div>
      <el-row :gutter="20">
        <!-- 数据展示部分 -->
        <el-col :span="6">
          <div class="data-display">
            <div class="data-item">
              <strong>气耗:</strong> {{ consumeData.gasConsumption }} m³
            </div>
            <div class="data-item">
              <strong>水耗:</strong> {{ consumeData.waterConsumption }} t
            </div>
            <div class="data-item">
              <strong>电耗:</strong>
              {{ consumeData.electricityConsumption }} kWh
            </div>
            <div class="data-item">
              <strong>累计折标煤:</strong> {{ consumeData.consum }} kg
            </div>
            <el-button
              @click="downloadFile"
              type="primary"
              style="margin-top: 10px"
              >下载文件</el-button
            >
          </div>
        </el-col>

        <!-- 折线图部分 -->
        <el-col :span="18">
          <div ref="echartsContainer" class="chart-container"></div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from "vue";
import * as echarts from "echarts";
import {
  ElCard,
  ElRow,
  ElCol,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElRadioButton,
  ElButton,
} from "element-plus";
import { getAllCrafts, calculateEnergyData } from "../../../../api/energy.js";
import request from "../../../utils/request";

export default defineComponent({
  name: "EnergyCalculation",
  setup() {
    const selectedProcess = ref(null); // 选择的工艺
    const selectedPeriod = ref("daily"); // 选择时间周期
    const processes = ref([]); // 用于存储所有工艺数据
    const selectedProcessInfo = ref({
      name: "",
      code: "",
      equipment: "",
      status: "",
    }); // 当前工艺详情
    const fileUrl = ref();

    const energyData = ref({
      steam: { avgUnitConsumption: 0, peakUnitConsumption: 0, peakTime: "-" },
      electricity: {
        avgUnitConsumption: 0,
        peakUnitConsumption: 0,
        peakTime: "-",
      },
      water: { avgUnitConsumption: 0, peakUnitConsumption: 0, peakTime: "-" },
    });

    const chartData = ref({
      labels: [],
      datasets: [],
    });

    // 监听时间周期的变化，重新获取数据
    watch(selectedPeriod, (newPeriod) => {
      fetchEnergyData(newPeriod);
    });

    const consumeData = ref({
      gasConsumption: 0, // 模拟气耗
      waterConsumption: 0, // 模拟水耗
      electricityConsumption: 0, // 模拟电耗
      consum: 0,
    }); // 能源消耗数据

    const fetchEnergyData = async () => {
      try {
        // 检查工段是否已选择
        if (!selectedSection.value) {
          console.error("请先选择工段！");
          return;
        }
        // 传递工段参数给后端
        const response = await calculateEnergyData(selectedSection.value); // 假设传递时间周期给后端
        console.log("查询到的能耗数据：", response);

        // 获取文件下载地址
        fileUrl.value = response.data.fileUrl;

        consumeData.value = {
          gasConsumption: response.data.totalSteam,
          waterConsumption: response.data.totalWater,
          electricityConsumption: response.data.totalElectricity,
          consum: response.data.totalCoalEquivalent,
        };

        // 根据时间周期更新能耗数据
        const periodData = response.data[selectedPeriod.value + "Stats"]; // 动态选择数据（日/月/年）

        if (periodData) {
          energyData.value.steam = {
            avgUnitConsumption: periodData.averageSteam,
            peakUnitConsumption: periodData.peakSteam,
            peakTime: periodData.peakSteamTime,
          };
          energyData.value.electricity = {
            avgUnitConsumption: periodData.averageElectricity,
            peakUnitConsumption: periodData.peakElectricity,
            peakTime: periodData.peakElectricityTime,
          };
          energyData.value.water = {
            avgUnitConsumption: periodData.averageWater,
            peakUnitConsumption: periodData.peakWater,
            peakTime: periodData.peakWaterTime,
          };
        } else {
          console.error("没有找到该时间周期的数据！");
        }

        // 更新图表数据
        if (response.data.timeSeriesData) {
          updateChartData(response.data.timeSeriesData);
        }
      } catch (error) {
        console.error("获取能耗数据失败:", error);
      }
    };

    // 查询所有工艺
    const fetchCrafts = async () => {
      try {
        const response = await getAllCrafts();
        console.log("查询到的工艺数据：", response);
        processes.value = response.data;
      } catch (error) {
        console.error("获取工艺数据失败:", error);
      }
    };
    const selectedSection = ref("");
    // 选择工艺时的回调
    const onProcessChange = (processId) => {
      // 使用正确的字段名 craftId 来匹配选中的工艺
      const selected = processes.value.find((p) => p.craftId === processId);
      if (selected) {
        selectedProcessInfo.value = {
          name: selected.craftName, // 对应的工艺名称字段
          code: selected.craftCode, // 对应的工艺编码字段
          equipment: selected.equipment || "流化床反应器", // 对应的设备字段
          status: selected.status || "运行中", // 对应的状态字段
        };

        selectedSection.value = selected.craftId;
        fetchEnergyData(); // 选择新工艺后自动刷新数据
      }
    };

    //下载文件
    // 使用 Axios 携带 Token
    const downloadFile = async () => {
      try {
        if (fileUrl.value) {
          // 通过 Axios 请求文件流
          const response = await request({
            url: fileUrl.value,
            method: "get",
            responseType: "blob", // 关键：指定响应类型为二进制流
          });

          // 创建 Blob 并触发下载
          const blob = new Blob([response.data]);
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = fileUrl.value.split("/").pop(); // 设置文件名
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
        }
      } catch (error) {
        console.error("下载失败:", error);
      }
    };

    const fileList = ref([]); // 上传的文件列表

    // 上传成功的回调
    const handleUploadSuccess = (response, file) => {
      console.log("上传成功", response);
      fileList.value.push(file);
    };

    // 上传失败的回调
    const handleUploadError = (error, file) => {
      console.error("上传失败", error);
    };

    // 文件上传前的钩子
    const beforeUpload = (file) => {
      return file.size < 10 * 1024 * 1024; // 限制文件大小
    };

    // 动态更新图表数据
    const updateChartData = (timeSeriesData) => {
      // 按时间排序
      const sortedData = timeSeriesData.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // 提取标签和数据
      const labels = sortedData.map((item) =>
        new Date(item.date).toLocaleDateString("zh-CN")
      );

      chartData.value = {
        labels: labels,
        datasets: [
          {
            label: "蒸汽消耗",
            data: sortedData.map((item) => item.steam),
            borderColor: "rgba(255, 159, 64, 1)",
            tension: 0.1,
          },
          {
            label: "水消耗",
            data: sortedData.map((item) => item.water),
            borderColor: "rgba(75, 192, 192, 1)",
            tension: 0.1,
          },
          {
            label: "电消耗",
            data: sortedData.map((item) => item.electricity),
            borderColor: "rgba(153, 102, 255, 1)",
            tension: 0.1,
          },
          {
            label: "折算标煤",
            data: sortedData.map((item) => item.coalEquivalent),
            borderColor: "rgba(255, 99, 132, 1)",
            tension: 0.1,
            type: "line",
            lineStyle: { type: "dashed" },
          },
        ],
      };

      // 重新渲染图表
      renderChart();
    };

    const renderChart = () => {
      const chart = echarts.init(document.querySelector(".chart-container"));
      const options = {
        title: {
          text: "能源消耗趋势图",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: chartData.value.datasets.map((d) => d.label),
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: chartData.value.labels,
        },
        yAxis: {
          type: "value",
        },
        series: chartData.value.datasets.map((dataset) => ({
          name: dataset.label,
          type: "line",
          data: dataset.data,
          smooth: true,
          lineStyle: dataset.lineStyle || {},
          itemStyle: { color: dataset.borderColor },
        })),
      };
      chart.setOption(options);
    };

    // 组件挂载后初始化图表
    onMounted(() => {
      fetchCrafts();
      fetchEnergyData();
      renderChart();
    });

    return {
      selectedProcess,
      selectedPeriod,
      processes,
      selectedProcessInfo,
      energyData,
      consumeData,
      fileList,
      chartData,
      onProcessChange,
      handleUploadSuccess,
      handleUploadError,
      beforeUpload,
      downloadFile,
    };
  },
});
</script>

<style scoped>
.energy-calculation {
  padding: 20px;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.details-text {
  color: gray; /* 设置文字颜色为灰色 */
  font-weight: normal;
}

.time-period-selector {
  float: right;
  margin-top: -10px;
}

.energy-cards {
  margin-top: 20px;
}

.energy-card {
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.energy-card-title {
  font-size: 16px; /* 设置卡片标题字体大小 */
  font-weight: bold;
  margin-bottom: 12px; /* 设置标题和内容之间的间距 */
  color: #333;
  display: flex;
  align-items: center;
}

.energy-content {
  margin-bottom: 8px;
  text-align: center;
}
.energy-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.energy-label {
  font-size: 12px;
  color: #999;
}

.divider {
  border: none;
  height: 1px;
  background-color: rgb(208, 207, 207);
  margin: 5px 0;
}

.divider1 {
  border-top: 1px dashed #e0e0e0; /* 设置虚线分割线 */
  margin: 2px 0;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
}

.chart-container {
  width: 100%;
  height: 300px;
  border: 2px dashed #ccc;
}

.data-display {
  height: 260px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 2px dashed #ccc;
}

.data-display div {
  font-size: 14px;
  margin-bottom: 10px;
  color: #333;
}

.data-item {
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #ffffff;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.data-item strong {
  font-size: 16px; /* 强调的文字稍大 */
  color: #409eff;
}

.el-button {
  width: 100%;
  padding: 8px 0;
  font-size: 14px;
  border-radius: 4px;
}
</style>
