<template>
  <div class="dashboard-container">
    <div class="antvBox">
      <div class="menu-list">
        <div>
          <h4>选择节点</h4>
        </div>
        <div v-for="item in moduleList" :key="item.id" draggable="true" @dragend="handleDragEnd($event, item)"
          class="nodeSelector">
          <img :src="item.image" alt="" />
          <p>{{ item.name }}</p>
        </div>
      </div>
      <div>
        <div class="canvas-menu">
          <el-tooltip effect="light" content="刷新画布" placement="top">
            <el-button size="small" icon="Refresh" circle style="margin-left: 12px;" @click="handleClean" />
          </el-tooltip>
          <el-tooltip effect="light" content="数据库" placement="top">
            <el-button size="small" :icon="Coin" circle style="margin-left: 25px;" @click="showDrawer = true" />
          </el-tooltip>

        </div>
        <div class="canvas-card">
          <div id="container" style="position: relative;">
          </div>
        </div>
      </div>
    </div>
    <el-drawer v-model="showDrawer" title="资源管理" :direction="direction" size="80%">
      <div style="margin: 10px 80px 0px 80px">
        <!-- 文件查询 -->
        <div class="search-container">
          <el-form :inline="true" :model="fileSearch">
            <el-form-item label="文件名：">
              <el-input v-model="fileSearch.name" placeholder="请输入文件名" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="onsubmitSearch">查询</el-button>
              <el-button type="info" icon="RefreshLeft" @click="resetFind">清空</el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 文件上传与批量上传按钮 -->
        <div>
          <el-button type="primary" plain icon="Promotion" @click="handleUploadFile">上传文件</el-button>
          <el-button type="danger" plain icon="Delete" @click="deleteByIds">批量删除</el-button>
        </div>
        <!-- 表格展示数据 -->
        <el-table :data="fileData" style="width: 85%; margin:10px 0" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column fixed prop="id" label="序号" width="140" header-align="center" align="center">
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" width="250px" header-align="center" align="center" />
          <el-table-column label="上传时间" width="300px" header-align="center" align="center">
            <template #default="{ row }">
              {{ row.createTime ? row.createTime.replace('T', ' ') : '' }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="250px" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" plain icon="Download">
                <a :href="row.path" style="text-decoration: none; color: inherit;">下载</a>
              </el-button>
              <el-button type="danger" size="small" plain icon="delete" @click="deleFile(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页工具条 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :background="background"
          :current-page="currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="totalCount"></el-pagination>
        <!-- 上传文件对话框 -->
        <el-dialog v-model="showFileForm" title="上传文件" width="500px">
          <el-form :model="fileMeta" label-width="auto" style="max-width: 600px">
            <el-form-item label="文件名">
              <el-input v-model="fileMeta.name" placeholder="请输入文件名" />
            </el-form-item>
            <el-upload class="upload-demo" drag action="http://localhost:8060/upload" multiple limit="1"
              :on-success="dataDirectUpload">
              <el-icon class="el-icon--upload">
                <UploadFilled />
              </el-icon>
              <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
              <template #tip>
                <div class="el-upload__tip">仅限上传一个文件</div>
              </template>
            </el-upload>
            <el-form-item>
              <el-button type="primary" @click="submitUpload">确定</el-button>
              <el-button @click="showFileForm = false">取消</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
    </el-drawer>
    <!--算法选择表单-->
    <el-dialog v-model="showAlgForm" width="600px">
      <el-form :model="algForm" label-width="auto">
        <el-form-item label="请选择算法">
          <el-select v-model="algForm.region" placeholder="请选择算法">
            <el-option label="差分进化算法" value="DE" />
            <el-option label="粒子群算法" value="PSO" />
            <el-option label="萤火虫算法" value="FLY" />
            <el-option label="蚁群算法" value="ACA" />
            <el-option label="模拟退火算法" value="SA" />
            <el-option label="遗传算法" value="GA" />
            <el-option label="鲸鱼优化算法" value="WOA" />
            <el-option label="北方苍鹰优化算法" value="NOGO" />
          </el-select>
          <el-button type="primary" @click="onSubmitAlgForm">确定</el-button>
          <!-- <el-button @click="showAlgForm = false">取消</el-button> -->
        </el-form-item>
      </el-form>
      <el-form :model="parForm" label-width="auto">
        <el-form-item v-if="algorithmType === 'FLY'" label="D">
          <el-input v-model="parForm.D" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'FLY'" label="N">
          <el-input v-model="parForm.N" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'FLY'" label="Beta0">
          <el-input v-model="parForm.Beta0" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'FLY'" label="gama">
          <el-input v-model="parForm.gama_FLY" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'FLY'" label="alpha">
          <el-input v-model="parForm.alpha_FLY" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'FLY'" label="T">
          <el-input v-model="parForm.T" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'FLY'" label="bound">
          <el-input v-model="parForm.bound" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'PSO'" label="size">
          <el-input v-model="parForm.size" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'PSO'" label="iter_num">
          <el-input v-model="parForm.iter_num" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'PSO'" label="min_values">
          <el-input v-model="parForm.min_values" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'PSO'" label="max_values">
          <el-input v-model="parForm.max_values" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'PSO'" label="w">
          <el-input v-model="parForm.w" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'PSO'" label="c1">
          <el-input v-model="parForm.c1" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'PSO'" label="c2">
          <el-input v-model="parForm.c2" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'PSO'" label="dimension">
          <el-input v-model="parForm.dimension" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'DE'" label="bounds">
          <el-input v-model="parForm.bounds" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'DE'" label="dimensions">
          <el-input v-model="parForm.dimensions" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'DE'" label="population_size">
          <el-input v-model="parForm.population_size" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'DE'" label="max_generations">
          <el-input v-model="parForm.max_generations" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'DE'" label="crossover_rate">
          <el-input v-model="parForm.crossover_rate_DE" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'DE'" label="differential_weight">
          <el-input v-model="parForm.differential_weight" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'ACA'" label="num_dimensions">
          <el-input v-model="parForm.num_dimensions" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'ACA'" label="num_ants">
          <el-input v-model="parForm.num_ants" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'ACA'" label="num_iterations">
          <el-input v-model="parForm.num_iterations" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'ACA'" label="alpha">
          <el-input v-model="parForm.alpha_ACA" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'ACA'" label="beta">
          <el-input v-model="parForm.beta_ACA" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'ACA'" label="rho">
          <el-input v-model="parForm.rho" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'ACA'" label="interval">
          <el-input v-model="parForm.interval" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'SA'" label="initial_solution">
          <el-input v-model="parForm.initial_solution" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'SA'" label="bounds">
          <el-input v-model="parForm.bounds_SA" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'SA'" label="dimensions">
          <el-input v-model="parForm.dimensions_SA" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'SA'" label="initial_temperature">
          <el-input v-model="parForm.initial_temperature" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'SA'" label="cooling_rate">
          <el-input v-model="parForm.cooling_rate" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'SA'" label="max_iterations">
          <el-input v-model="parForm.max_iterations" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'GA'" label="dna_size">
          <el-input v-model="parForm.dna_size" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'GA'" label="pop_size">
          <el-input v-model="parForm.pop_size" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'GA'" label="crossover_rate">
          <el-input v-model="parForm.crossover_rate_GA" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'GA'" label="mutation_rate">
          <el-input v-model="parForm.mutation_rate" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'GA'" label="n_generations">
          <el-input v-model="parForm.n_generations" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'GA'" label="x_bound">
          <el-input v-model="parForm.x_bound" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'GA'" label="y_bound">
          <el-input v-model="parForm.y_bound" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'WOA'" label="bounds">
          <el-input v-model="parForm.bounds_WOA" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'WOA'" label="dimensions">
          <el-input v-model="parForm.dimensions_WOA" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'WOA'" label="whales_size">
          <el-input v-model="parForm.whales_size" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'WOA'" label="max_Iterations">
          <el-input v-model="parForm.maxIterations_WOA" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'WOA'" label="a_decrease">
          <el-input v-model="parForm.a_decrease" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'NOGO'" label="bounds">
          <el-input v-model="parForm.bounds_NOGO" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'NOGO'" label="dimensions">
          <el-input v-model="parForm.dimensions_NOGO" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'NOGO'" label="eagle_size">
          <el-input v-model="parForm.eagle_size" />
        </el-form-item>
        <el-form-item v-if="algorithmType === 'NOGO'" label="max_Iterations">
          <el-input v-model="parForm.maxIterations_NOGO" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitParForm">提交</el-button>
          <el-button @click="showAlgForm = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--模型选择表单-->
    <el-dialog v-model="showModForm">
      <el-form :model="modelForm" label-width="auto">
        <el-form-item label="请选择模型">
          <el-select v-model="algForm.region" placeholder="请选择模型">
            <el-option label="RF" value="RF" />
            <el-option label="RBF" value="RBF" />
            <el-option label="MLP" value="MLP" />
            <el-option label="CNN-LSTM" value="CNN-LSTM" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitModForm">确定</el-button>
          <el-button @click="showModForm = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--问题选择表单-->
    <el-dialog v-model="showQueForm" width="600px">
      <el-form :model="QueForm" label-width="auto">
        <el-form-item label="选择要优化的问题">
          <el-select v-model="QueForm.region" placeholder="请选择要优化的问题">
            <el-option label="Sphere函数" value="Sphere" />
            <el-option label="Schwefel函数" value="Schwefel" />
            <el-option label="Rosenbrock函数" value="Rosenbrock" />
            <el-option label="Ackley函数" value="Ackley" />
            <el-option label="Griewank函数" value="Griewank" />
            <el-option label="Rastragin函数" value="Rastragin" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitQueForm">确定</el-button>
          <el-button @click="showQueForm = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--结果显示模块-->
    <el-dialog v-model="showReDialog" title="实验结果：" width="600px">
      <h4 style="text-align: center;">运行进度：</h4>
      <div class="demo-progress">
        <el-progress type="dashboard" :percentage="percentage" :color="colors" width="80" />
      </div>
      <!-- <span>{{ resultData }}</span> -->
      <el-button @click="initChart" style="margin-left: 43%;">显示图表</el-button>
      <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showReDialog = false">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <!--数据处理算法模块-->
    <el-dialog v-model="showCleanDialog" title="数据处理算法" width="600px">
      <el-upload class="upload-demo" drag action="http://localhost:8060/localUpload" limit="1"
        :on-success="handleUpload">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            请上传要处理的原始数据
          </div>
        </template>
      </el-upload>
      <el-form :model="cleanForm" label-width="auto">
        <el-form-item label="请选择算法类型">
          <el-cascader v-model="selectedAlgorithm" :options="algorithmOptions" @change="handleAlgorithmChange"
            placeholder="请选择算法类型和具体算法" />
        </el-form-item>

        <!-- 根据选中的算法类型动态显示参数输入框 -->
        <el-form-item
          v-if="selectedAlgorithm[1] === 'PCA' || selectedAlgorithm[1] === 'KPCA' || selectedAlgorithm[1] === 'LDA' || selectedAlgorithm[1] === 'LLE' || selectedAlgorithm[1] === 't-SNE'"
          label="n_components">
          <el-input v-model="cleanForm.reduc.n_components" />
        </el-form-item>
        <el-form-item v-if="selectedAlgorithm[1] === 'LLE'" label="n_neighbors">
          <el-input v-model="cleanForm.reduc.n_neighbors" />
        </el-form-item>
        <el-form-item v-if="selectedAlgorithm[1] === 't-SNE'" label="perplexity">
          <el-input v-model="cleanForm.reduc.perplexity" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onsubmitcleanForm">
            {{ loading ? 'Submitting ...' : '提交' }}
          </el-button>
          <el-button @click="showCleanDialog = false">取消</el-button>
        </el-form-item>
        <!-- 可以继续为其他清洗算法添加参数输入框 -->
      </el-form>
    </el-dialog>
    <!--文件下载模块-->
    <el-dialog v-model="showDownloadDialog" title="数据处理后文件下载" width="600px">
      <el-button type="primary" size="small" plain icon="Download">
        <a :href="oss_url" style="text-decoration: none; color: inherit;">下载</a>
      </el-button>
      <el-button type="primary" size="small" plain icon="Upload" @click="showDownloadDialog = false; show2database = true">
        上传至资源管理
      </el-button>
    </el-dialog>
    <!--数据处理后上传至资源管理对话框-->
    <el-dialog v-model="show2database" title="上传至资源管理" width="600px">
          <el-form :model="fileMeta" label-width="auto" style="max-width: 600px">
            <el-form-item label="文件名">
              <el-input v-model="fileMeta.name" placeholder="请输入文件名" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitUpload">确定</el-button>
              <el-button @click="show2database = false">取消</el-button>
            </el-form-item>
          </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Graph } from "@antv/x6";
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios';
import * as echarts from 'echarts';
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Check,
  Delete,
  Edit,
  Message,
  Search,
  Star,
  Coin,
} from '@element-plus/icons-vue'
import type { DrawerProps } from 'element-plus'

const percentage = ref(0);
const cleanFilePath = ref('');
const oss_url = ref('');
const colors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
];

const QueForm = reactive({
  region: '',
});
const algForm = reactive({
  region: '',
});
const modelForm = reactive({
  region: '',
});
const cleanForm = reactive({
  reduc: {
    n_components: '',
    n_neighbors: '',
    perplexity: '',
  }
});
const selectedAlgorithm = ref([]);
const algorithmOptions = [
  {
    value: 'dimensionality_reduction',
    label: '数据降维算法',
    children: [
      { value: 'PCA', label: 'PCA' },
      { value: 'KPCA', label: 'KPCA' },
      { value: 'LDA', label: 'LDA' },
      { value: 'LLE', label: 'LLE' },
      { value: 't-SNE', label: 't-SNE' },
    ],
  },
  {
    value: 'data_cleaning',
    label: '数据清洗算法',
    children: [
      { value: 'Z-Score', label: 'Z-Score' },
      { value: 'Min-Max', label: 'Min-Max' },
      { value: 'IQR', label: 'IQR' },
      { value: 'MEAN', label: 'MEAN' },
      { value: 'MEDIAN', label: 'MEDIAN' },
      { value: 'MODE', label: 'MODE' },
      { value: '3sigma', label: '3sigma' },
    ],
  },
  {
    value: 'data_convert',
    label: '数据转换算法',
    children: [
      { value: 'Standard', label: 'Standard' },
      { value: 'Norm', label: 'Norm' },
      { value: 'One-Hot', label: 'One-Hot' },
    ],
  },
]

const parForm = reactive({
  //萤火虫算法参数(FLY)
  D: '',
  N: '',
  Beta0: '',
  gama_FLY: '',
  alpha_FLY: '',
  T: '',
  bound: '',
  //粒子群算法参数(PSO)
  size: '',
  iter_num: '',
  min_values: '',
  max_values: '',
  w: '',
  c1: '',
  c2: '',
  dimension: '',
  //差分进化算法参数(DE)
  bounds: '',
  dimensions: '',
  population_size: '',
  max_generations: '',
  crossover_rate_DE: '',
  differential_weight: '',
  //蚁群算法参数(ASA)
  num_dimensions: '',
  num_ants: '',
  num_iterations: '',
  alpha_ACA: '',
  beta_ACA: '',
  rho: '',
  interval: '',
  //模拟退火算法参数：(SA)
  initial_solution: '',
  bounds_SA: '',
  dimensions_SA: '',
  initial_temperature: '',
  cooling_rate: '',
  max_iterations: '',
  //遗传算法(GA)
  dna_size: '',
  pop_size: '',
  crossover_rate_GA: '',
  mutation_rate: '',
  n_generations: '',
  x_bound: '',
  y_bound: '',
  //鲸鱼优化算法(WOA)
  bounds_WOA: '',
  dimensions_WOA: '',
  whales_size: '',
  maxIterations_WOA: '',
  a_decrease: '',
  //北方苍鹰优化算法
  bounds_NOGO: '',
  dimensions_NOGO: '',
  eagle_size: '',
  maxIterations_NOGO: ''
})
const showDownloadDialog = ref(false)
const showAlgForm = ref(false);
const showParForm = ref(false);
const showModForm = ref(false);
const showReDialog = ref(false);
const showQueForm = ref(false);
const showCleanDialog = ref(false);
const loading = ref(false)
const showDrawer = ref(false);
const direction = ref<DrawerProps['direction']>('rtl')
const show2database = ref(false);
let curSelectNode = null;
const algorithmType = ref('');
const testFunction = ref('');
const resultData = ref([]);
const iteration_records = ref([]);
const chartContainer = ref(null);
const moduleList = [
  {
    id: 1,
    name: "优化问题选择模块",
    image: 'https://cdn.pixabay.com/photo/2016/10/08/18/35/help-1724292_640.png'
  },
  {
    id: 2,
    name: "算法与参数配置模块",
    image: 'https://cdn.pixabay.com/photo/2023/04/19/19/26/cpu-7938434_1280.png'
  },
  {
    id: 3,
    name: "优化模型模块",
    image: 'https://cdn.pixabay.com/photo/2020/11/07/10/25/machine-learning-5720531_1280.png'
  },
  {
    id: 4,
    name: "结果显示模块",
    image: 'https://cdn.pixabay.com/photo/2017/03/08/14/20/flat-2126880_1280.png'
  },
  {
    id: 5,
    name: "数据处理算法模块",
    image: 'https://cdn.pixabay.com/photo/2019/12/31/18/53/chart-4732546_640.png'
  },

];

let graph = null;

//数据库参数
import { page, deleteById, selectById, add } from "../../../../api/file.js";

const fileSearch = ref({
  name: ''
});

const fileMeta = ref({
  id: null,
  name: '',
  path: ''
});

const fileData = ref([]);

const showFileForm = ref(false);

// 分页参数
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(5);
const totalCount = ref(0);

// 复选框选中数据集合
const multipleSelection = ref([]);

//被选中的id数组
const selectedIds = ref([]);

const searchfile = () => {
  page(fileSearch.value.name, currentPage.value, pageSize.value).then((res) => {
    totalCount.value = res.data.data.total;
    fileData.value = res.data.data.rows;
  });
};

// 查询文件函数
const onsubmitSearch = () => {
  currentPage.value = 1;
  searchfile();
};

// 清空查询条件
const resetFind = () => {
  fileSearch.value.name = '';
  searchfile();
};

// 复选框选中后执行的方法
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

//根据id删除
const deleFile = (id: number) => {
  ElMessageBox.confirm("确认删除?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const result = await deleteById(id);
      if (result.data.code === 1) {
        ElMessage.success("删除成功");
        searchfile();
      } else {
        ElMessage.error(result.data.msg);
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
}

//上传成功函数
const dataDirectUpload = (res) => {
  if (res && res.url) { // 通过 res.filepath 访问后端返回的路径
    oss_url.value = res.url;
    fileMeta.value.path = res.url;
    console.log(oss_url.value);
  } else {
    console.error('Invalid response format from server:', res);
  }
}

//批量删除函数
const deleteByIds = () => {
  ElMessageBox.confirm(
    "此操作将删除该数据, 是否继续?",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      // 点击确认按钮
      // 1. 创建id数组, 从 multipleSelection 获取即可
      selectedIds.value = multipleSelection.value.map(item => item.id);

      // 2. 发送AJAX请求
      deleteById(selectedIds.value).then((resp) => {
        if (resp.data.code === 1) {
          // 删除成功
          ElMessage.success("恭喜你，删除成功");
          searchfile();
        } else {
          ElMessage.error(resp.data.msg);
        }
      });
    })
    .catch(() => {
      // 点击取消按钮
      ElMessage.info("已取消删除");
    });
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  searchfile();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  searchfile();
};

const handleUploadFile = () => {
  fileMeta.value.name = '';
  fileMeta.value.path = '';
  showFileForm.value = true;
};

const submitUpload = async () => {
  const result = await add(fileMeta.value);
  if (result.data.code === 1) {
    ElMessage.success("保存成功");
    searchfile();
    showFileForm.value = false;
    show2database.value = false;
  } else {
    ElMessage.error(result.data.msg);
  }
};
//数据库相关参数ending

const initChart = () => {
  const iterations = iteration_records.value.map(item => item[0]);
  const values = iteration_records.value.map(item => item[1]);

  const container = chartContainer.value;
  if (!container) {
    console.error('DOM element "chartContainer" not found.');
    return;
  }

  const myChart = echarts.init(container);

  const option = {
    tooltip: {
      trigger: 'axis',

      formatter: function (params) {
        return `迭代次数: ${params[0].axisValue}<br/>值: ${params[0].data}`;
      }
    },
    xAxis: { type: 'category', name: 'iters', data: iterations },
    yAxis: { type: 'value', name: 'value' },
    series: [{ type: 'line', data: values }]
  };

  myChart.setOption(option);
};

const handleUpload = (res) => {
  if (res && res.filepath) { // 通过 res.filepath 访问后端返回的路径
    cleanFilePath.value = res.filepath;
    console.log(cleanFilePath.value);
  } else {
    console.error('Invalid response format from server:', res);
  }
};
const handleClean = () => {
  graph.clearCells();
  ElMessage.success("刷新画布成功")
}

const handleAlgorithmChange = (selectedAlgorithm) => {
  console.log(selectedAlgorithm);

}

const onsubmitcleanForm = () => {
  loading.value = true;
  let parameters = {};

  if (selectedAlgorithm.value[1] === 'PCA' || selectedAlgorithm.value[1] === 'KPCA' || selectedAlgorithm.value[1] === 'LDA') {
    parameters = {
      n_components: parseInt(cleanForm.reduc.n_components),
    };
  } else if (selectedAlgorithm.value[1] === 'LLE') {
    parameters = {
      n_components: parseInt(cleanForm.reduc.n_components),
      n_neighbors: parseInt(cleanForm.reduc.n_neighbors),
    };
  } else if (selectedAlgorithm.value[1] === 't-SNE') {
    parameters = {
      n_components: parseInt(cleanForm.reduc.n_components),
      perplexity: parseInt(cleanForm.reduc.perplexity),
    };
  }

  const data = {
    clean_type: selectedAlgorithm.value[1],
    filepath: cleanFilePath.value,
    parameters: parameters,
  };

  // 发送POST请求到后端
  axios.post('http://localhost:8060/cleanData', data)
    .then(response => {
      console.log(response.data.result);
      // 处理后端返回的结果
      oss_url.value = response.data.result.oss_url
      console.log(oss_url);
      fileMeta.value.path = oss_url.value;
      loading.value = false;
      showCleanDialog.value = false;
      showDownloadDialog.value = true;
      ElMessage.success("数据处理成功");

    })
    .catch(error => {
      console.error('Error:', error);
      ElMessage.error(error)
      showCleanDialog.value = false;
      loading.value = false;
      // 处理请求失败的情况
    });

}

const onSubmitQueForm = () => {
  console.log('submit--Que!')
  showQueForm.value = false;
  testFunction.value = QueForm.region;
};


const onSubmitAlgForm = () => {
  console.log('submit--Alg!')
  algorithmType.value = algForm.region
};

const onSubmitModForm = () => {
  console.log('submit!')
  showModForm.value = false;
};

const onSubmitParForm = () => {
  console.log('submit!');
  showParForm.value = false;
  showAlgForm.value = false;

  // 根据算法类型从表单中提取相应的参数
  let parameters = {};

  if (algorithmType.value === 'FLY') {
    parameters = {
      D: parseInt(parForm.D),
      N: parseInt(parForm.N),
      Beta0: parseFloat(parForm.Beta0),
      gama: parseFloat(parForm.gama_FLY),
      alpha: parseFloat(parForm.alpha_FLY),
      T: parseInt(parForm.T),
      bound: JSON.parse(parForm.bound), // 解析字符串为数组
    };
  } else if (algorithmType.value === 'PSO') {
    parameters = {
      size: parseInt(parForm.size),
      iter_num: parseInt(parForm.iter_num),
      min_values: JSON.parse(parForm.min_values), // 解析字符串为数组
      max_values: JSON.parse(parForm.max_values), // 解析字符串为数组
      w: parseFloat(parForm.w),
      c1: parseFloat(parForm.c1),
      c2: parseFloat(parForm.c2),
      dimension: parseInt(parForm.dimension),
    };
  } else if (algorithmType.value === 'DE') {
    parameters = {
      bounds: JSON.parse(parForm.bounds), // 解析字符串为数组
      dimensions: parseInt(parForm.dimensions),
      population_size: parseInt(parForm.population_size),
      max_generations: parseInt(parForm.max_generations),
      crossover_rate: parseFloat(parForm.crossover_rate_DE),
      differential_weight: parseFloat(parForm.differential_weight),
    };
  } else if (algorithmType.value === 'ACA') {
    parameters = {
      num_dimensions: parseInt(parForm.num_dimensions), // 解析字符串为数组
      num_ants: parseInt(parForm.num_ants),
      num_iterations: parseInt(parForm.num_iterations),
      alpha: parseInt(parForm.alpha_ACA),
      beta: parseInt(parForm.beta_ACA),
      rho: parseFloat(parForm.rho),
      interval: JSON.parse(parForm.interval),
    };
  } else if (algorithmType.value === 'SA') {
    parameters = {
      initial_solution: JSON.parse(parForm.initial_solution), // 解析字符串为数组
      bounds: JSON.parse(parForm.bounds_SA),
      dimensions: parseInt(parForm.dimensions_SA),
      initial_temperature: parseInt(parForm.initial_temperature),
      cooling_rate: parseFloat(parForm.cooling_rate),
      max_iterations: parseInt(parForm.max_iterations)
    };
  } else if (algorithmType.value === 'GA') {
    parameters = {
      dna_size: parseInt(parForm.dna_size),
      pop_size: parseInt(parForm.pop_size),
      crossover_rate: parseFloat(parForm.crossover_rate_GA), // 解析字符串为数组
      mutation_rate: parseInt(parForm.mutation_rate),
      n_generations: parseInt(parForm.n_generations),
      x_bound: JSON.parse(parForm.x_bound),
      y_bound: JSON.parse(parForm.y_bound),
    };
  } else if (algorithmType.value === 'WOA') {
    parameters = {
      bounds: JSON.parse(parForm.bounds_WOA),
      dimensions: parseInt(parForm.dimensions_WOA),
      whales_size: parseInt(parForm.whales_size),
      max_genarations: parseInt(parForm.maxIterations_WOA),
      a_decrease: parseInt(parForm.a_decrease),
    };
  } else if (algorithmType.value === 'NOGO') {
    parameters = {
      bounds: JSON.parse(parForm.bounds_NOGO),
      dimensions: parseInt(parForm.dimensions_NOGO),
      population_size: parseInt(parForm.eagle_size),
      max_genarations: parseInt(parForm.maxIterations_NOGO),
    };
  }

  // 构建包含所选算法和参数的数据对象
  const data = {
    test_function: testFunction.value,
    algorithm_type: algorithmType.value,
    parameters: parameters,
  };

  // 发送POST请求到后端
  axios.post('http://localhost:8060/calculate', data)
    .then(response => {
      ElMessage.success("算法运算成功");
      console.log(response.data.result);
      // 处理后端返回的结果
      resultData.value = response.data.result; // 更新 resultData 变量
      iteration_records.value = resultData.value['iteration_records']
      console.log(iteration_records.value);
      percentage.value = 100;

    })
    .catch(error => {
      console.error('Error:', error);
      ElMessage.error(error)
      // 处理请求失败的情况
    });
};


const handleDragEnd = (e, item) => {
  console.log(e, item); // 可以获取到最后拖动后松开鼠标时的坐标和拖动的节点相关信息
  addHandleNode(
    e.pageX - 390,
    e.pageY - 140,
    new Date().getTime(),
    item.image,
    item.name
  );
};

const nodeAddEvent = () => {
  const container = document.getElementById("container");
  const changePortsVisible = (visible) => {
    const ports = container.querySelectorAll(".x6-port-body");
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
      ports[i].style.visibility = visible ? "visible" : "hidden";
    }
  };

  graph.on("node:mouseenter", () => {
    changePortsVisible(true);
  });

  graph.on("node:mouseleave", () => {
    changePortsVisible(false);
  });

  // 连线绑定悬浮事件
  graph.on("cell:mouseenter", ({ cell }) => {
    if (cell.shape == "edge") {
      cell.addTools([
        {
          name: "button-remove",
          args: {
            x: "100%",
            y: 0,
            offset: {
              x: 0,
              y: 0,
            },
          },
        },
      ]);
      cell.setAttrs({
        line: {
          stroke: "#409EFF",
        },
      });
      cell.zIndex = 99; // 保证当前悬停的线在最上层，不会被遮挡
    }
  });

  graph.on('cell:dblclick', ({ e, x, y, cell, view }) => {
    if (cell.shape === 'image') {
      if (cell.attrs.label.textWrap.text === '算法与参数配置模块') {
        showAlgForm.value = true;

      } else if (cell.attrs.label.textWrap.text === '优化模型模块') {
        showModForm.value = true;

      } else if (cell.attrs.label.textWrap.text === '结果显示模块') {
        showReDialog.value = true;

      } else if (cell.attrs.label.textWrap.text === '优化问题选择模块') {
        showQueForm.value = true;

      } else if (cell.attrs.label.textWrap.text === '数据处理算法模块') {
        showCleanDialog.value = true;
      } else {
        // 其他节点类型，隐藏所有表单
        showAlgForm.value = false;
        showParForm.value = false;
        showModForm.value = false;
        showReDialog.value = false;
        showQueForm.value = false;
        showCleanDialog.value = false;
      }
    }
  });

  graph.on("cell:mouseleave", ({ cell }) => {
    if (cell.shape === "edge") {
      cell.removeTools();
      cell.setAttrs({
        line: {
          stroke: "black",
        },
      });
      cell.zIndex = 1; // 保证未悬停的线在下层，不会遮挡悬停的线
    }
  });

  // 节点绑定点击事件
  graph.on("node:click", ({ e, x, y, node, view }) => {
    console.log("点击！！！", node);
    // 判断是否有选中过节点
    if (curSelectNode) {
      // 移除选中状态
      curSelectNode.removeTools();
      // 判断两次选中节点是否相同
      if (curSelectNode !== node) {
        node.addTools([
          {
            name: "boundary",
            args: {
              attrs: {
                fill: "#16B8AA",
                stroke: "#2F80EB",
                strokeWidth: 1,
                fillOpacity: 0.1,
              },
            },
          },
          {
            name: "button-remove",
            args: {
              x: "100%",
              y: 0,
              offset: {
                x: 0,
                y: 0,
              },
            },
          },
        ]);
        curSelectNode = node;
      } else {
        curSelectNode = null;
      }
    } else {
      curSelectNode = node;
      node.addTools([
        {
          name: "boundary",
          args: {
            attrs: {
              fill: "#16B8AA",
              stroke: "#2F80EB",
              strokeWidth: 1,
              fillOpacity: 0.1,
            },
          },
        },
        {
          name: "button-remove",
          args: {
            x: "100%",
            y: 0,
            offset: {
              x: 0,
              y: 0,
            },
          },
        },
      ]);
    }
  });
};

//添加节点到画布
const addHandleNode = (x, y, id, image, name) => {
  graph.addNode({
    id: id,
    shape: 'image', // 指定使用何种图形，默认值为 'rect'
    x: x,
    y: y,
    width: 60,
    height: 50,
    imageUrl: image,
    attrs: {
      body: {
        stroke: "gray",
        fill: "skyblue",
        rx: 10,
        ry: 10,
      },
      label: {
        textWrap: {
          width: 120,
          text: name,
        },
        fill: "black",
        fontSize: 16,
        refX: 0.5,
        refY: "100%",
        refY2: 4,
        textAnchor: "middle",
        textVerticalAnchor: "top",
      },
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              magnet: true,
              stroke: '#8f8f8f',
              r: 5,
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              magnet: true,
              stroke: '#8f8f8f',
              r: 5,
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              magnet: true,
              stroke: '#8f8f8f',
              r: 5,
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              magnet: true,
              stroke: '#8f8f8f',
              r: 5,
            },
          },
        },
      },
      items: [
        {
          group: "top",
          id: "port1",
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: "#ffffff",
              strokeWidth: 2,
              fill: "#5F95FF",
            },
          },
        },
        {
          group: "bottom",
          id: "port2",
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: "#ffffff",
              strokeWidth: 2,
              fill: "#5F95FF",
            },
          },
        },
        {
          group: "left",
          id: "port3",
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: "#ffffff",
              strokeWidth: 2,
              fill: "#5F95FF",
            },
          },
        },
        {
          group: "right",
          id: "port4",
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: "#ffffff",
              strokeWidth: 2,
              fill: "#5F95FF",
            },
          },
        },
      ],
    },
    zIndex: 10,
  });
  ElMessage.success("添加节点成功");
};

const initGraph = () => {
  const container = document.getElementById("container");
  graph = new Graph({
    container: container, // 画布容器
    width: container.offsetWidth, // 画布宽
    height: container.offsetHeight, // 画布高
    background: false, // 背景（透明）
    snapline: true, // 对齐线

    // 配置连线规则
    connecting: {
      snap: true, // 自动吸附
      allowBlank: false, // 是否允许连接到画布空白位置的点
      allowMulti: true, // 是否允许在相同的起始节点和终止之间创建多条边
      allowLoop: true, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点
      highlight: true, // 拖动边时，是否高亮显示所有可用的节点
      highlighting: {
        magnetAdsorbed: {
          name: "stroke",
          args: {
            attrs: {
              fill: "#5F95FF",
              stroke: "#5F95FF",
            },
          },
        },
      },
      router: {
        // 对路径添加额外的点
        name: "manhattan",
        args: {
          padding: 10,
        },
      },
      connector: {
        // 边渲染到画布后的样式
        name: "rounded",
        args: {
          radius: 4,
        },
      },
    },
    panning: {
      enabled: true,
    },
    mousewheel: {
      enabled: true, // 支持滚动放大缩小
      zoomAtMousePosition: true,
      modifiers: "ctrl",
      minScale: 0.5,
      maxScale: 3,
    },
    grid: {
      type: 'mesh',
      size: 20,      // 网格大小 10px
      visible: true, // 渲染网格背景
      args: {
        color: '#eeeeee', // 网格线/点颜色
        thickness: 2,     // 网格线宽度/网格点大小
      },
    },
  });
  nodeAddEvent();
};

onMounted(() => {
  initGraph();
  searchfile();
  // initchart();
});

const save = () => {
  console.log(graph.toJSON(), "graph");
  console.log(graph.getNodes(), "node");
};
</script>

<style lang="scss" scoped>
.search-container {
  width: 80%;
  padding: 20px 30px 0;
  background-color: #fff;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px
}

.el-dialog {
  width: 200px;
}

.demo-progress {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.demo-progress .el-progress--line {
  margin-bottom: 15px;
}

.demo-progress .el-progress--circle {
  margin-right: 15px;
  margin-top: 20px;
}

.nodeSelector {
  border-bottom: 1px dashed black;

}

.dashboard-container {
  .antvBox {
    display: flex;
    width: 100%;
    height: 100%;
    color: black;
    padding-top: 20px;

    .menu-list {
      height: 100%;
      width: 150px;
      padding: 0 10px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-content: flex-start;
      flex-wrap: wrap;

      >div {
        margin-bottom: 10px;
        border-radius: 5px;
        padding: 0 10px;
        box-sizing: border-box;
        cursor: pointer;
        color: black;
        width: 105px;
        display: flex;
        flex-wrap: wrap;

        justify-content: center;

        img {
          height: 50px;
          width: 50px;
        }

        P {
          width: 90px;
          text-align: center;
        }
      }
    }

    .canvas-card {
      display: flex;
      width: 1300px;
      height: 800px;
      box-sizing: border-box;

      >div {
        display: flex;
        width: 1200px;
        height: 700px;
        border: 3px solid #404e7b; // Change border style to solid and adjust color
        position: relative;
        border-radius: 10px; // Add border radius for a rounded look
        overflow: hidden; // Hide overflow content to keep the border visible
      }
    }

    .canvas-menu {
      height: 32px;
      width: 1210px;
      background-color: #b9babd;
      margin-bottom: 0.5%;
      border-radius: 16px;
      display: flex;
      align-items: center;
    }
  }
}
</style>