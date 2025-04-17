<template>
  <div style="margin: 10px 50px 0px 50px">
    <!--搜索栏-->
    <div class="search-container">
      <el-form :inline="true" :model="productionLineSearch" class="demo-form-inline">
        <el-form-item label="名称：">
          <el-input v-model="productionLineSearch.lineName" placeholder="名称：" clearable />
        </el-form-item>
        <el-form-item label="产线类型" style="width: 200px">
          <el-select v-model="productionLineSearch.lineType" placeholder="产线类型" clearable>
            <el-option label="还原炉产线" value="1" />
            <el-option label="冷氢化产线" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button type="info" icon="RefreshLeft" @click="clearAll">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--新增与批量删除按钮-->
    <el-button type="primary" plain icon="Plus" @click="handleAddProductionLine"> 新增产线 </el-button>
    <el-button type="danger" plain icon="Delete" @click="deleteByIds"> 批量删除 </el-button>
    <!--表格展示列表-->
    <el-table
      :data="productionLineData"
      style="width: 100%; margin-top: 10px; margin-bottom: 10px"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column fixed prop="lineId" label="序号" width="100" header-align="center" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="lineName" label="产线名称" width="180" header-align="center" align="center" />
      <el-table-column prop="lineType" label="产线类型" width="180" header-align="center" align="center">
        <template #default="{ row }">
          <el-tag :type="row.lineType == '1' ? 'primary' : 'warning'" style="width: 80px; margin-right: 10px">
            {{ row.lineType == "1" ? "还原炉产线" : "冷氢化产线" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="产线运行状态" width="200" header-align="center" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status == '1' ? 'success' : row.status == '2' ? 'danger' : 'info'"
            style="width: 70px; margin-right: 10px"
          >
            {{ row.status == "1" ? "运行" : row.status == "2" ? "停止" : "维护" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="300" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.createdAt ? row.createdAt.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column label="最后操作时间" width="300" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.updatedAt ? row.updatedAt.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="300" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" plain icon="Edit" @click="handleEdit(row.lineId)"> 编辑 </el-button>
          <el-button type="danger" size="small" plain icon="delete" @click="handleDelete(row.lineId)">删除</el-button>
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
    <el-dialog v-model="showAddProductionLine" title="新增产线">
      <el-form :model="productionLine" ref="formRef" label-width="auto" style="max-width: 600px">
        <el-form-item label="产线名称">
          <el-input v-model="productionLine.lineName" placeholder="请输入产线名称" />
        </el-form-item>
        <el-form-item label="产线类型">
          <el-select v-model="productionLine.lineType" placeholder="请选择产线类型" clearable>
            <el-option v-for="item in lineTypeList" :key="item.lineType" :label="item.tag" :value="item.lineType" />
          </el-select>
        </el-form-item>
        <el-form-item label="产线状态">
          <el-select v-model="productionLine.status" placeholder="请选择产线状态" clearable>
            <el-option v-for="item in statusList" :key="item.status" :label="item.tag" :value="item.status" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form-item>
        <el-button type="primary" @click="submitAdd()">确定</el-button>
        <el-button @click="showAddProductionLine = false">取消</el-button>
      </el-form-item>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { page, add, update, deleteById, selectById } from "../../../../api/productionLine.js";

interface ProductionLine {
  lineId: string | number;
  lineName: string;
  lineType: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

//展示添加产线表单变量
const showAddProductionLine = ref(false);

//分页参数
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
//产线对象
const productionLine = ref({
  lineId: "",
  lineName: "",
  lineType: "",
  status: "",
});
//查询产线参数
const productionLineSearch = ref({
  lineName: "",
  lineType: "",
});
//默认产线数据
const productionLineData = ref<ProductionLine[]>([]);

//
const formRef = ref<FormInstance | null>(null);

//产线类型映射集合
const lineTypeList = [
  { lineType: 1, tag: "还原炉产线" },
  { lineType: 2, tag: "冷氢化产线" },
];

//产线状态映射集合
const statusList = [
  { status: 1, tag: "运行" },
  { status: 2, tag: "停止" },
  { status: 3, tag: "维护" },
];
//被选中的id数组
const selectedIds = ref<(string | number)[]>([]);

//复选框选中数据集合
const multipleSelection = ref<ProductionLine[]>([]);

//清空查询条件
const clearAll = () => {
  console.log("清空查询条件");
  productionLineSearch.value = { lineName: "", lineType: "" };
  searchProductionLine();
};
//查询分页数据
const searchProductionLine = () => {
  console.log("查询产线信息");
  page(
    productionLineSearch.value.lineName,
    productionLineSearch.value.lineType,
    currentPage.value,
    pageSize.value
  ).then((res) => {
    totalCount.value = res.data.data.total;
    productionLineData.value = res.data.data.rows;
  });
};
//查询方法
const onSubmit = () => {
  currentPage.value = 1;
  searchProductionLine();
};

// 复选框选中后执行的方法
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handleSizeChange = (val) => {
  // 重新设置每页显示的条数
  pageSize.value = val;
  searchProductionLine();
};

const handleCurrentChange = (val) => {
  // 重新设置当前页码
  currentPage.value = val;
  searchProductionLine();
};

//重置产线信息
const resetProductionLine = () => {
  productionLine.value = {
    lineId: "",
    lineName: "",
    lineType: "",
    status: "",
  };
};
//新增产线按钮点击事件
const handleAddProductionLine = () => {
  resetProductionLine(); // 重置 productionLine 对象属性为初始状态
  showAddProductionLine.value = true; // 打开新增产线对话框
};

//处理编辑请求
const handleEdit = async (id) => {
  //打开窗口
  showAddProductionLine.value = true;
  //发送请求
  const result = await selectById(id);
  if (result.data.code === 1) {
    productionLine.value = result.data.data;
  } else {
    ElMessage.error(result.data.msg);
  }
};

//处理删除请求
const handleDelete = (id) => {
  ElMessageBox.confirm("确认删除?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const result = await deleteById(id);
      if (result.data.code === 1) {
        ElMessage.success("删除成功");
        searchProductionLine();
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
      selectedIds.value = multipleSelection.value.map((item) => item.lineId);

      // 2. 发送AJAX请求
      deleteById(selectedIds.value).then((resp) => {
        if (resp.data.code === 1) {
          // 删除成功
          ElMessage.success("恭喜你，删除成功");
          searchProductionLine();
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
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (valid) {
    let method;
    if (productionLine.value.lineId) {
      method = update(productionLine.value); // 修改
    } else {
      method = add(productionLine.value); // 添加
    }
    const result = await method;
    if (result.data.code === 1) {
      ElMessage.success("保存成功");
      searchProductionLine();
      showAddProductionLine.value = false;
    } else {
      ElMessage.error(result.data.msg);
    }
  } else {
    ElMessage.error("请正确填写表单");
  }
};

onMounted(() => {
  searchProductionLine();
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
