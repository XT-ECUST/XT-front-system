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
          {
            path: "/exp/ResultAna",
            component: () => import("../views/Main/exp/ResultAna.vue"),
            meta: { title: "结果分析", icon: "Histogram" },
          },

        ],
      },
      {
        path: "/equip",
        meta: { title: "设备管理", isShow: false, icon: "Position" },
        children: [
          {
            path: "/equip/RunManage",
            component: () => import("../views/Main/equip/RunManage.vue"),
            meta: { title: "设备运行管理", icon: 'promotion' },
          },
          {
            path: "/equip/OperVisual",
            component: () => import("../views/Main/equip/OperVisual.vue"),
            meta: { title: "设备运行可视化", icon: 'promotion' },
          },
          {
            path: "/equip/Mainten",
            component: () => import("../views/Main/equip/Mainten.vue"),
            meta: { title: "检维修管理", icon: 'promotion' },
          },
        ],
      },
      {
        path: "/create",
        meta: { title: "生产管理", isShow: false, icon: "Position" },
        children: [
          {
            path: "/create/LineDataAna",
            component: () => import("../views/Main/create/LineDataAna.vue"),
            meta: { title: "产线数据分析", icon: 'promotion' },
          },
          {
            path: "/create/Alarm",
            component: () => import("../views/Main/create/Alarm.vue"),
            meta: { title: "报警管理", icon: 'promotion' },
          },
          {
            path: "/create/Oper",
            component: () => import("../views/Main/create/OperRecordMan.vue"),
            meta: { title: "操作记录管理", icon: 'promotion' },
          },
          {
            path: "/create/EnergyMan",
            component: () => import("../views/Main/create/EnergyMan.vue"),
            meta: { title: "能源管理", icon: 'promotion' },
          },
          {
            path: "/create/MaterialMan",
            component: () => import("../views/Main/create/MaterialMan.vue"),
            meta: { title: "物料管理", icon: 'promotion' },
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
  // 假设除了登录页面都需要登录
  if (to.path === "/login" || to.path === "/register") {
    next();
  }else if(!sessionStorage.getItem('token')){
    next('/login');
  }else{
    next();
  }
});
export default router;