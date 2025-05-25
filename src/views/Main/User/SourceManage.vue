<template>
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
    <el-table :data="fileData" style="margin: 10px 0" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column fixed prop="id" label="序号" width="300px" header-align="center" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" width="300px" header-align="center" align="center" />
      <el-table-column label="上传时间" width="300px" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.createTime ? row.createTime.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="340px" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" plain icon="Download">
            <a :href="row.path" style="text-decoration: none; color: inherit">下载</a>
          </el-button>
          <el-button type="danger" size="small" plain icon="delete" @click="deleFile(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页工具条 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :background="background"
      :current-page="currentPage"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount"
    ></el-pagination>
    <!-- 上传文件对话框 -->
    <el-dialog v-model="showFileForm" title="上传文件" width="500px">
      <el-form :model="fileMeta" label-width="auto" style="max-width: 600px">
        <el-form-item label="文件名">
          <el-input v-model="fileMeta.name" placeholder="请输入文件名" />
        </el-form-item>
        <el-upload
          class="upload-demo"
          drag
          action="http://localhost:8060/upload"
          multiple
          limit="1"
          :on-success="dataDirectUpload"
        >
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
</template>

<script setup lang="ts">
//数据库参数
import { page, deleteById, selectById, add } from "../../../../api/file.js";
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const fileSearch = ref({
  name: "",
});

const fileMeta = ref({
  id: null,
  name: "",
  path: "",
});

const fileData = ref([]);

const showFileForm = ref(false);

// 分页参数
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(5);
const totalCount = ref(0);

// 复选框选中数据集合
const multipleSelection = ref<{ id: string | number }[]>([]);

//被选中的id数组
const selectedIds = ref<(string | number)[]>([]);

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
  fileSearch.value.name = "";
  searchfile();
};

// 复选框选中后执行的方法
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

//根据id删除
const deleFile = (id) => {
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
};

//上传成功函数
const dataDirectUpload = (res) => {
  if (res && res.url) {
    // 通过 res.filepath 访问后端返回的路径

    fileMeta.value.path = res.url;
  } else {
    console.error("Invalid response format from server:", res);
  }
};

//批量删除函数
const deleteByIds = () => {
  ElMessageBox.confirm("此操作将删除该数据, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 点击确认按钮
      // 1. 创建id数组, 从 multipleSelection 获取即可
      selectedIds.value = multipleSelection.value.map((item) => item.id);

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
  fileMeta.value.name = "";
  fileMeta.value.path = "";
  showFileForm.value = true;
};

const submitUpload = async () => {
  const result = await add(fileMeta.value);
  if (result.data.code === 1) {
    ElMessage.success("保存成功");
    searchfile();
    showFileForm.value = false;
  } else {
    ElMessage.error(result.data.msg);
  }
};

onMounted(() => {
  searchfile();
});
</script>
