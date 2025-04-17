<template>
  <div style="margin: 10px 50px 0px 50px">
    <!--搜索栏-->
    <div class="search-container">
      <el-form :inline="true" :model="inventorySearch" class="demo-form-inline">
        <el-form-item label="名称：">
          <el-input v-model="inventorySearch.itemName" placeholder="名称：" clearable />
        </el-form-item>
        <el-form-item label="设备类型" style="width: 200px">
          <el-select v-model="inventorySearch.deviceType" placeholder="设备类型" clearable>
            <el-option label="还原炉 " value="1" />
            <el-option label="冷氢化流化床" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button type="info" icon="RefreshLeft" @click="clearAll">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--新增与批量删除按钮-->
    <el-button type="primary" plain icon="Plus" @click="handleAddInventory"> 新增库存 </el-button>
    <el-button type="danger" plain icon="Delete" @click="deleteByIds"> 批量删除 </el-button>
    <!--表格展示列表-->
    <el-table
      :data="inventoryData"
      style="width: 100%; margin-top: 10px; margin-bottom: 10px"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column fixed prop="id" label="序号" width="100" header-align="center" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="itemName" label="物品名称" width="180" header-align="center" align="center" />
      <el-table-column prop="deviceType" label="设备类型" width="180" header-align="center" align="center">
        <template #default="{ row }">
          <el-tag :type="row.deviceType == '1' ? 'primary' : 'warning'" style="width: 80px; margin-right: 10px">
            {{ row.deviceType == "1" ? "还原炉" : "冷氢化流化床" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="库存数量" width="100" header-align="center" align="center" />
      <el-table-column label="入库时间" width="300" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.entryTime ? row.entryTime.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column label="最后出库时间" width="300" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.lastExitTime ? row.lastExitTime.replace("T", " ") : "" }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="300" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" plain icon="Edit" @click="handleEdit(row.id)"> 编辑 </el-button>
          <el-button type="danger" size="small" plain icon="delete" @click="handleDelete(row.id)">删除</el-button>
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
    <el-dialog v-model="showAddInventory" title="新增库存">
      <el-form :model="inventory" ref="formRef" label-width="auto" style="max-width: 600px">
        <el-form-item label="物品名称">
          <el-input v-model="inventory.itemName" placeholder="请输入物品名称" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="inventory.deviceType" placeholder="请选择设备类型" clearable>
            <el-option v-for="item in deviceTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number v-model="inventory.quantity" :min="0" placeholder="请输入库存数量" />
        </el-form-item>
      </el-form>
      <el-form-item>
        <el-button type="primary" @click="submitAdd()">确定</el-button>
        <el-button @click="showAddInventory = false">取消</el-button>
      </el-form-item>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { page, add, update, deleteById, selectById } from "../../../../api/inventory";

interface Inventory {
  id: string | number;
  itemName: string;
  deviceType: string;
  quantity: number;
  entryTime?: string;
  lastExitTime?: string;
}

//展示添加库存表单变量
const showAddInventory = ref(false);

//分页参数
const background = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
//库存对象
const inventory = ref({
  id: "",
  itemName: "",
  deviceType: "",
  quantity: 0,
});
//查询库存参数
const inventorySearch = ref({
  itemName: "",
  deviceType: "",
});
//默认库存数据
const inventoryData = ref<Inventory[]>([]);

//
const formRef = ref<FormInstance | null>(null);

//设备类型映射集合
const deviceTypeList = [
  { value: "1", label: "还原炉" },
  { value: "2", label: "冷氢化流化床" },
];

//被选中的id数组
const selectedIds = ref<(string | number)[]>([]);

//复选框选中数据集合
const multipleSelection = ref<Inventory[]>([]);

//清空查询条件
const clearAll = () => {
  console.log("清空查询条件");
  inventorySearch.value = { itemName: "", deviceType: "" };
  searchInventory();
};
//查询分页数据
const searchInventory = () => {
  console.log("查询库存信息");
  page(inventorySearch.value.itemName, inventorySearch.value.deviceType, currentPage.value, pageSize.value).then(
    (res) => {
      totalCount.value = res.data.data.total;
      inventoryData.value = res.data.data.rows;
    }
  );
};
//查询方法
const onSubmit = () => {
  currentPage.value = 1;
  searchInventory();
};

// 复选框选中后执行的方法
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handleSizeChange = (val) => {
  // 重新设置每页显示的条数
  pageSize.value = val;
  searchInventory();
};

const handleCurrentChange = (val) => {
  // 重新设置当前页码
  currentPage.value = val;
  searchInventory();
};

//重置库存信息
const resetInventory = () => {
  inventory.value = {
    id: "",
    itemName: "",
    deviceType: "",
    quantity: 0,
  };
};
//新增库存按钮点击事件
const handleAddInventory = () => {
  resetInventory(); // 重置 inventory 对象属性为初始状态
  showAddInventory.value = true; // 打开新增库存对话框
};

//处理编辑请求
const handleEdit = async (id) => {
  //打开窗口
  showAddInventory.value = true;
  //发送请求
  const result = await selectById(id);
  if (result.data.code === 1) {
    inventory.value = result.data.data;
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
        searchInventory();
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
      // 点击确认按钮
      // 1. 创建id数组, 从 multipleSelection 获取即可
      selectedIds.value = multipleSelection.value.map((item) => item.id);

      // 2. 发送AJAX请求
      deleteById(selectedIds.value).then((resp) => {
        if (resp.data.code === 1) {
          // 删除成功
          ElMessage.success("恭喜你，删除成功");
          searchInventory();
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

// 提交添加
const submitAdd = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (valid) {
    let method;
    if (inventory.value.id) {
      method = update(inventory.value); // 修改
    } else {
      method = add(inventory.value); // 添加
    }
    const result = await method;
    if (result.data.code === 1) {
      ElMessage.success("保存成功");
      searchInventory();
      showAddInventory.value = false;
    } else {
      ElMessage.error(result.data.msg);
    }
  } else {
    ElMessage.error("请正确填写表单");
  }
};

onMounted(() => {
  searchInventory();
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
