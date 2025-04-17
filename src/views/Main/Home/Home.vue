<template>
  <div class="home">
    <div id="titleContainer">
      <img id="titleImg" src="../../../assets/images/5G工业互联网 .png" />
      <h2 id="cnTitle">多晶硅工业互联网系统平台</h2>
      <h2 id="engTitle">Polycrystalline Silicon Industrial Internet System Platform</h2>
    </div>
    <div class="slide-box">
      <div class="banner-box">
        <div
          class="banner-item"
          v-for="(banner, index) in banners"
          :key="index"
          :class="{
            left: index === leftIndex,
            middle: index === currentIndex,
            right: index === rightIndex,
          }"
          @click="$router.push(banner.link)"
        >
          <img :src="banner.url" />
          <h3>{{ banner.name }}</h3>
          <p>{{ banner.enName }}</p>
        </div>
      </div>
      <button class="slide-left-btn material-icons" @click="prev">arrow_back_ios</button>
      <button class="slide-right-btn material-icons" @click="next">arrow_forward_ios</button>
      <div class="pagination-box">
        <span
          v-for="(banner, index) in banners"
          :key="index"
          :class="{ chose: index === currentIndex }"
          @mouseover="setCurrentIndex(index)"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const currentIndex = ref(0);
const leftIndex = ref(0);
const rightIndex = ref(0);
const banners = ref([
  {
    url: "/images/lunbo-1.png",
    name: "设备运行大屏",
    enName: "Device Running Screen",
    link: "/equip/OperVisual",
  },
  {
    url: "/images/lunbo-2.png",
    name: "报警监控大屏",
    enName: "Alarm Monitoring Screen",
    link: "/equip/Mainten",
  },
  { url: "/images/lunbo-3.png", name: "产线数据大屏", enName: "Line Data Screen", link: "/exp/QA" },
]);

// const timer = ref(null);

const bannersLength = computed(() => banners.value.length);

const updateIndices = () => {
  leftIndex.value = (currentIndex.value - 1 + bannersLength.value) % bannersLength.value;
  rightIndex.value = (currentIndex.value + 1) % bannersLength.value;
};

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % bannersLength.value;
  updateIndices();
};

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + bannersLength.value) % bannersLength.value;
  updateIndices();
};

const setCurrentIndex = (index) => {
  currentIndex.value = index;
  updateIndices();
};

// const startTimer = () => {
//   timer.value = setInterval(next, 3000);
// };

// const stopTimer = () => {
//   clearInterval(timer.value);
// };

onMounted(() => {
  updateIndices();
  // startTimer();
});

// onBeforeUnmount(() => {
//   stopTimer();
// });
</script>

<style scoped>
@import url(https://fonts.googleapis.com/icon?family=Material+Icons);

* {
  margin: 0;
  padding: 0;
}
.home {
  width: 100%;
  height: 100%;
  background-image: url(/src/assets/images/背景.jpg);
  background-size: cover;
  background-position: center;
}

.slide-box {
  position: relative;
  top: 50%;
  margin: 0px auto;
  padding: 0 5px;
  height: 300px;
  max-width: 1200px;
  min-width: 700px;
}

.banner-box {
  position: relative;
  height: 100%;
  width: 100%;
}

.banner-item {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 90%;
  background-color: #000;
  box-sizing: border-box;
  /* border-radius: 10px; */
  overflow: hidden;
  transition: all 0.5s;
  z-index: 0;
}

.banner-item > img {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  object-fit: cover;
  cursor: pointer; /* 添加此行以更改鼠标指针 */
}

.banner-item.left {
  left: 0;
  transform: translateX(0);
  z-index: 50;
}

.banner-item.right {
  left: 100%;
  transform: translateX(-100%);
  z-index: 50;
}

.banner-item.middle {
  width: 550px;
  height: 100%;
  z-index: 100;
}

.banner-item.middle > img {
  opacity: 1;
}

.slide-left-btn,
.slide-right-btn {
  position: absolute;
  top: 50%;
  z-index: 200;
  width: 40px;
  height: 40px;
  font-size: 30px;
  font-weight: 900;
  color: #b4b4b4;
  border: none;
  background: none;
}

.slide-left-btn:hover,
.slide-right-btn:hover {
  color: #fff;
}

.slide-left-btn {
  left: 1%;
}

.slide-right-btn {
  right: 1%;
}

.pagination-box {
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.pagination-box > span {
  width: 20px;
  height: 6px;
  border-radius: 3px;
  margin: 0 4px;
  background-color: #b4b4b4;
}

.pagination-box > span.chose {
  background-color: #ff4444;
}

h3 {
  position: absolute;
  top: 30px;
  left: 30px;
  color: white;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 2px;
}

p {
  position: absolute;
  top: 60px;
  left: 30px;
  color: white;
  width: 250px;
}

#titleContainer {
  width: 780px;
  height: 100px;
  left: 0;
  right: 0;
  margin-left: 32%;
  top: 20%;
  position: absolute;
  /* background-color: gray; */
}

#titleImg {
  height: 80%;
  position: absolute;
  float: left;
}

h2 {
  color: white;
  position: absolute;
  float: right;
  right: 0px;
}

#cnTitle {
  font-size: 53px;
  letter-spacing: 2px;
  font-weight: 600;
  margin-top: -5px;
}
#engTitle {
  font-size: 24px;
  margin-top: 65px;
}
</style>
