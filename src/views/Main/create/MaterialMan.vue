<template>
  <div style="margin: 10px 50px 0px 50px">
    <!--搜索栏-->
    <div class="search-container">
      <el-form :inline="true" :model="materialSearch" class="demo-form-inline">
        <el-form-item label="编号：">
          <el-input v-model="materialSearch.code" placeholder="物料编号" clearable />
        </el-form-item>
        <el-form-item label="名称：">
          <el-input v-model="materialSearch.name" placeholder="物料名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button type="info" icon="RefreshLeft" @click="clearAll">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--新增与批量删除按钮-->
    <el-button type="primary" plain icon="Plus" @click="handleAddMaterial"> 新增物料 </el-button>
    <el-button type="danger" plain icon="Delete" @click="deleteByIds"> 批量删除 </el-button>
    <!--表格展示列表-->
    <el-table
      :data="materialData"
      style="width: 100%; margin-top: 10px; margin-bottom: 10px"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column fixed prop="materialId" label="序号" width="80" header-align="center" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="code" label="物料编号" width="120" header-align="center" align="center" />
      <el-table-column prop="name" label="物料名称" width="150" header-align="center" align="center" />
      <el-table-column prop="specification" label="规格型号" width="150" header-align="center" align="center" />
      <el-table-column prop="unit" label="单位" width="100" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.unit === "kg" ? "千克" : row.unit === "ton" ? "吨" : "个" }}
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="库存数量" width="120" header-align="center" align="center" />
      <el-table-column prop="supplier" label="供应商" width="150" header-align="center" align="center" />
      <el-table-column prop="status" label="状态" width="100" header-align="center" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.createdAt ? row.createdAt.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.updatedAt ? row.updatedAt.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" plain icon="Edit" @click="handleEdit(row.materialId)">编辑</el-button>
          <el-button type="danger" size="small" plain icon="Delete" @click="handleDelete(row.materialId)"
            >删除</el-button
          >
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
    <el-dialog v-model="showAddMaterial" :title="dialogTitle">
      <el-form :model="material" ref="formRef" label-width="100px" style="max-width: 500px">
        <el-form-item label="物料编号" prop="code">
          <el-input v-model="material.code" placeholder="请输入物料编号" />
        </el-form-item>
        <el-form-item label="物料名称" prop="name">
          <el-input v-model="material.name" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="规格型号" prop="specification">
          <el-input v-model="material.specification" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="material.unit" placeholder="请选择单位">
            <el-option label="千克" value="kg" />
            <el-option label="吨" value="ton" />
            <el-option label="个" value="piece" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存数量" prop="quantity">
          <el-input-number v-model="material.quantity" :min="0" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="material.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="material.status" placeholder="请选择状态">
            <el-option label="正常" value="正常" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddMaterial = false">取消</el-button>
          <el-button type="primary" @click="submitAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { page, add, update, deleteById, selectById } from "../../../../api/material";

interface Material {
  materialId: string | number;
  code: string;
  name: string;
  specification: string;
  unit: string;
  quantity: number;
  supplier: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

const showAddMaterial = ref(false);
const dialogTitle = ref("新增物料");
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const formRef = ref<FormInstance>();
const materialData = ref<Material[]>([]);
const multipleSelection = ref<Material[]>([]);
const selectedIds = ref<(string | number)[]>([]);

const material = ref({
  materialId: "",
  code: "",
  name: "",
  specification: "",
  unit: "",
  quantity: 0,
  supplier: "",
  status: "正常",
});

const materialSearch = ref({
  code: "",
  name: "",
});

const clearAll = () => {
  materialSearch.value = { code: "", name: "" };
  searchMaterial();
};

const searchMaterial = () => {
  page(materialSearch.value.code, materialSearch.value.name, currentPage.value, pageSize.value).then((res) => {
    totalCount.value = res.data.data.total;
    materialData.value = res.data.data.rows;
  });
};

const onSubmit = () => {
  currentPage.value = 1;
  searchMaterial();
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  searchMaterial();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  searchMaterial();
};

const resetMaterial = () => {
  material.value = {
    materialId: "",
    code: "",
    name: "",
    specification: "",
    unit: "",
    quantity: 0,
    supplier: "",
    status: "正常",
  };
};

const handleAddMaterial = () => {
  resetMaterial();
  dialogTitle.value = "新增物料";
  showAddMaterial.value = true;
};

const handleEdit = async (id) => {
  dialogTitle.value = "编辑物料";
  showAddMaterial.value = true;
  const result = await selectById(id);
  if (result.data.code === 1) {
    material.value = result.data.data;
  } else {
    ElMessage.error(result.data.msg);
  }
};

const handleDelete = (id) => {
  ElMessageBox.confirm("确认删除该物料吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const result = await deleteById(id);
      if (result.data.code === 1) {
        ElMessage.success("删除成功");
        searchMaterial();
      } else {
        ElMessage.error(result.data.msg);
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

const deleteByIds = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning("请选择要删除的物料");
    return;
  }

  ElMessageBox.confirm("确认批量删除选中的物料吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      selectedIds.value = multipleSelection.value.map((item) => item.materialId);
      deleteById(selectedIds.value).then((resp) => {
        if (resp.data.code === 1) {
          ElMessage.success("删除成功");
          searchMaterial();
        } else {
          ElMessage.error(resp.data.msg);
        }
      });
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

const submitAdd = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (valid) {
    const method = material.value.materialId ? update(material.value) : add(material.value);
    const result = await method;
    if (result.data.code === 1) {
      ElMessage.success("保存成功");
      searchMaterial();
      showAddMaterial.value = false;
    } else {
      ElMessage.error(result.data.msg);
    }
  }
};

onMounted(() => {
  searchMaterial();
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
