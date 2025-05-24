import { createRouter, createWebHashHistory } from "vue-router";


const routes = [
  {
    path: "/login",
    component: () => import("../views/pages/login.vue"),
    meta: { title: "用户登录" },
  },
  {
    path: "/register",
    component: () => import("../views/pages/register.vue"),
    meta: { title: "用户注册" },
  },
  {
    path: "/",
    component: () => import("../views/Main/Main.vue"),
    redirect: "/home",
    children: [
      {
        path: "/home",
        component: () => import("../views/Main/Home/Home.vue"),
        meta: { title: "首页", isShow: true, icon: "House" },
      },
      {
        path: "/exp",
        meta: { title: "实验面板", isShow: false, icon: "Position" },
        children: [
          {
            path: "/exp/CanvasExp",
            component: () => import("../views/Main/exp/CanvasExp.vue"),
            meta: { title: "操作面板", icon: "Filter" },
          },
          // {
          //   path: "/exp/ResultAna",
          //   component: () => import("../views/Main/exp/ResultAna.vue"),
          //   meta: { title: "结果分析", icon: "Histogram" },
          // },
          {
            path: "/exp/QA",
            component: () => import("../views/Main/exp/QA.vue"),
            meta: { title: "SiGPT", icon: "Monitor" },
          },

        ],
      },
      {
        path: "/equip",
        meta: { title: "设备管理", isShow: false, icon: "Position" },
        children: [
          {
            path: "/equip/EquipManage",
            component: () => import("../views/Main/equip/DeviceManage.vue"),
            meta: { title: "设备管理", icon: 'promotion' },
          },
          {
            path: "/equip/OperationData",
            component: () => import("../views/Main/equip/OperationManage.vue"),
            meta: { title: "运行数据管理", icon: 'promotion' },
          },
          {
            path: "/equip/OperVisual",
            component: () => import("../views/Main/equip/DeviceScreen.vue"),
            meta: { title: "设备运行大屏", icon: 'promotion' },
          },
          {
            path: "/equip/Mainten",
            component: () => import("../views/Main/equip/AlarmScreen.vue"),
            meta: { title: "报警显示大屏", icon: 'promotion' },
          },
        ],
      },
      {
        path: "/create",
        meta: { title: "生产管理", isShow: false, icon: "Position" },
        children: [
          {
            path: "/create/ProcessManage",
            component: () => import("../views/Main/create/ProcessManage.vue"),
            meta: { title: "工艺管理", icon: 'promotion' },
          },
          {
            path: "/create/Process",
            component: () => import("../views/Main/create/Process.vue"),
            meta: { title: "参数分析", icon: 'promotion' },
          },
          {
            path: "/create/EnergyManagement",
            component: () => import("../views/Main/create/EnergyManagement.vue"),
            meta: { title: "能源管理", icon: 'promotion' },
          },
          {
            path: "/create/LineMan",
            component: () => import("../views/Main/create/LineMan.vue"),
            meta: { title: "产线管理", icon: 'promotion' },
          },
          // {
          //   path: "/create/inventory",
          //   component: () => import("../views/Main/create/InventoryManagement.vue"),
          //   meta: { title: "库存管理", icon: 'promotion' },
          // },
          {
            path: "/create/inventoryInOut",
            component: () => import("../views/Main/create/InventoryInOutMan.vue"),
            meta: { title: "库存管理", icon: 'promotion' },
          },
          // {
          //   path: "/create/Oper",
          //   component: () => import("../views/Main/create/OperRecordMan.vue"),
          //   meta: { title: "操作记录管理", icon: 'promotion' },
          // },
          {
            path: "/create/MaterialMan",
            component: () => import("../views/Main/create/MaterialMan.vue"),
            meta: { title: "物料管理", icon: 'promotion' },
          },
          
        ],
      },
      {
        path: "/users",
        meta: { title: "人员管理", isShow: false, icon: "Position" },
        children: [
          {
            path: "/users/userManage",
            component: () => import("../views/Main/User/UserManage.vue"),
            meta: { title: "用户管理", icon: 'promotion' },
          },
          {
            path: "/users/deptManage",
            component: () => import("../views/Main/User/deptManage.vue"),
            meta: { title: "部门管理", icon: 'promotion' },
          },
        ],
      },
    ],
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  // 除了登录页面都需要登录
  if (to.path === "/login" || to.path === "/register") {
    next();
  }else if(!sessionStorage.getItem('token')){
    next('/login');
  }else{
    next();
  }
});
export default router;