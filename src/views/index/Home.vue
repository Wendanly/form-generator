<template>
  <div class="container">
    <div class="left-board">
      <div class="logo-wrapper">
        <div class="logo">
          <img :src="logo" alt="logo" /> Form Generator
          <a
            class="github"
            href="https://github.com/JakHuang/form-generator"
            target="_blank"
          >
            <img src="https://github.githubassets.com/pinned-octocat.svg" alt />
          </a>
        </div>
      </div>
      <el-scrollbar class="left-scrollbar">
        <div class="components-list">
          <div v-for="(item, listIndex) in leftComponents" :key="listIndex">
            <div class="components-title">
              <svg-icon icon-class="component" />
              {{ item.title }}
            </div>
            <draggable
              class="components-draggable"
              :list="item.list"
              :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
              :clone="cloneComponent"
              draggable=".components-item"
              :sort="false"
              @end="onEnd"
            >
              <div
                v-for="(element, index) in item.list"
                :key="index"
                class="components-item"
                @click="addComponent(element)"
              >
                <div class="components-body">
                  <svg-icon :icon-class="element.__config__.tagIcon" />
                  {{ element.__config__.label }}
                </div>
              </div>
            </draggable>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <div class="center-board">
      <div class="action-bar">
        <el-button icon="el-icon-video-play" type="text" @click="run">运行</el-button>
        <el-button icon="el-icon-view" type="text" @click="showJson">查看json</el-button>
        <el-button icon="el-icon-download" type="text" @click="download">导出vue文件</el-button>
        <el-button class="copy-btn-main" icon="el-icon-document-copy" type="text" @click="copy">复制代码</el-button>
        <el-button class="delete-btn" icon="el-icon-delete" type="text" @click="empty">清空</el-button>
      </div>
      <el-scrollbar class="center-scrollbar">
        <el-row class="center-board-row" :gutter="formConf.gutter">
          <el-form
            :size="formConf.size"
            :label-position="formConf.labelPosition"
            :disabled="formConf.disabled"
            :label-width="formConf.labelWidth + 'px'"
          >
            <draggable
              class="drawing-board"
              :list="drawingList"
              :animation="340"
              group="componentsGroup"
            >
              <DraggableItem
                v-for="(item, index) in drawingList"
                :key="item.renderKey"
                :drawing-list="drawingList"
                :current-item="item"
                :index="index"
                :active-id="activeId"
                :form-conf="formConf"
                @activeItem="activeFormItem"
                @copyItem="drawingItemCopy"
                @deleteItem="drawingItemDelete"
              />
            </draggable>
            <div v-show="!drawingList.length" class="empty-info">从左侧拖入或点选组件进行表单设计</div>
          </el-form>
        </el-row>
      </el-scrollbar>
    </div>

    <right-panel
      :active-data="activeData"
      :form-conf="formConf"
      :show-field="!!drawingList.length"
      :form-data='getFormData'
      @tag-change="tagChange"
      @fetch-data="fetchData"
    />
    <!-- 运行 -->
    <form-drawer
      :visible.sync="drawerVisible"
      :form-data="formData"
      size="100%"
      :generate-conf="generateConf"
    />
    <!-- 查看json -->
    <json-drawer
      size="60%"
      :visible.sync="jsonDrawerVisible"
      :json-str="JSON.stringify(formData)"
      @refresh="refreshJson"
    />
    <!-- 点击运行、导出文件都会弹出这个选择框 -->
    <!-- 生成类型弹出框 -->
    <code-type-dialog
      :visible.sync="dialogVisible"
      title="选择生成类型"
      :show-file-name="showFileName"
      @confirm="generate"
    />
    <input id="copyNode" type="hidden" />
  </div>
</template>

<script>
import draggable from "vuedraggable";
import { debounce } from "throttle-debounce"; //去抖动函数
import { saveAs } from "file-saver";
import ClipboardJS from "clipboard";
// import render from "@/components/render/render";
import FormDrawer from "./FormDrawer";
import JsonDrawer from "./JsonDrawer";
import RightPanel from "./RightPanel";
//左侧可选元素配置项 以及右侧formConf 配置项
import {
  inputComponents,
  selectComponents,
  layoutComponents,
  formConf
} from "@/components/generator/config";
import {
  exportDefault,
  beautifierConf,
  isNumberStr,
  titleCase,
  deepClone
} from "@/utils/index";
//html,js,css模板
import {
  makeUpHtml,
  vueTemplate,
  vueScript,
  cssStyle
} from "@/components/generator/html";
import { makeUpJs } from "@/components/generator/js";
import { makeUpCss } from "@/components/generator/css";
import drawingDefalut from "@/components/generator/drawingDefalut"; //初始化右侧表单组件
import logo from "@/assets/logo.png";
import CodeTypeDialog from "./CodeTypeDialog";
import DraggableItem from "./DraggableItem";
//本地储存，供刷新初始化使用，刷新时优先从这里获取数据进行初始化，若没有数据则从本地文件中获取
import {
  getDrawingList,
  saveDrawingList,
  getIdGlobal,
  saveIdGlobal,
  getFormConf
} from "@/utils/db";
import loadBeautifier from "@/utils/loadBeautifier"; //js,html,css美化工具，里面有三个方法 html(), css(),js()

let beautifier; //获取美化工具
const emptyActiveData = { style: {}, autosize: {} };
let oldActiveId;
let tempActiveData;
const drawingListInDB = getDrawingList(); //获取本地存储右侧组件
const formConfInDB = getFormConf(); //获取本地存储右侧面板配置对象
const idGlobal = getIdGlobal(); //获取本地存储获取右侧组件索引

export default {
  components: {
    draggable,
    // render,
    FormDrawer,
    JsonDrawer,
    RightPanel,
    CodeTypeDialog,
    DraggableItem
  },
  data() {
    return {
      logo,
      idGlobal, //
      formConf,
      // inputComponents,
      // selectComponents,
      // layoutComponents,
      labelWidth: 100,
      drawingList: drawingDefalut, //初始化右侧组件
      drawingData: {},
      activeId: drawingDefalut[0].formId, //初始化组件索引
      drawerVisible: false, //打开‘运行’的模态框
      formData: {}, //组件属性与表单属性的合并
      dialogVisible: false,
      jsonDrawerVisible: false, //查看json 模态框显隐
      generateConf: null, //选择页面或者弹窗的模态框里的配置项
      showFileName: false, //控制选择页面或者弹窗的模态框里是否有文件名
      activeData: drawingDefalut[0], //初始化右侧组件高亮组件,默认选中第一个
      saveDrawingListDebounce: debounce(340, saveDrawingList), //去抖动,获取本地已有的组件list
      saveIdGlobalDebounce: debounce(340, saveIdGlobal), //去抖动,储存本地当前组件索引
      leftComponents: [
        {
          title: "输入型组件",
          list: inputComponents
        },
        {
          title: "选择型组件",
          list: selectComponents
        },
        {
          title: "布局型组件",
          list: layoutComponents
        }
      ]
    };
  },
  computed: {
     getFormData(){
       this.AssembleFormData();
       console.log(this.formData);
        return this.formData;
     },
  },
  watch: {
    // 如果activeData.__config__.label 与activeId 连续被更改，则他们在watch里的响应顺序是按照他们在watch里的排序来的，而不是按照他们被更改时的顺序确定的
    //activeData对象内容改变，label会被触发，但此时不能改变placeholder的值，因为此时没有在右侧配置面版中改变label的值,所以要加判断过滤掉此种情况
    // 实时改变placeholder的值
    "activeData.__config__.label"(val, oldVal) {
      console.log(val);
      //因为左侧点击元素、拖动或者点击右侧组件都会先触发activeData.__config__.label，而此时oldActiveId还是老的值，所以此时下面的判断为假；当在右侧配置面版中改变label时则下面的判断则为真，因为此时oldActiveId 已经更新了
      if (
        this.activeData.placeholder === undefined ||
        !this.activeData.__config__.tag ||
        oldActiveId !== this.activeId
      ) {
        return;
      }
      this.activeData.placeholder =
        this.activeData.placeholder.replace(oldVal, "") + val;
    },
    activeId: {
      handler(val) {
        //存下老值为了给"activeData.__config__.label" 监听做判断
        oldActiveId = val;
      },
      immediate: true
    },
    drawingList: {
      handler(val) {
        this.saveDrawingListDebounce(val); //固化右侧组件配置项
        if (val.length === 0) this.idGlobal = 100;
      },
      deep: true
    },
    idGlobal: {
      handler(val) {
        this.saveIdGlobalDebounce(val); //固化idGlobal ，初始值100
      },
      immediate: true
    },
    activeData: {
      handler(val) {
        console.log(val);
      },
      deep: true
    },
   
  },
  mounted() {
    console.log(tempActiveData);
    //初始化或者刷新页面时 先看本地存储是否有组件，没有则获取初始化的组件
    if (Array.isArray(drawingListInDB) && drawingListInDB.length > 0) {
      this.drawingList = drawingListInDB;
    }
    //初始化或者刷新页面时 先看本地存储是否有formConf，没有则获取初始化的formConf
    if (formConfInDB) {
      this.formConf = formConfInDB;
    }
    this.activeFormItem(this.drawingList[0]); //初始化或者刷新页面时使第一个高亮
    //加载美化工具
    loadBeautifier(btf => {
      beautifier = btf; //beautifier里有三个方法
    });
    const clipboard = new ClipboardJS("#copyNode", {
      text: trigger => {
        const codeStr = this.generateCode();
        this.$notify({
          title: "成功",
          message: "代码已复制到剪切板，可粘贴。",
          type: "success"
        });
        return codeStr;
      }
    });
    clipboard.on("error", e => {
      this.$message.error("代码复制失败");
    });
  },
  methods: {
    setObjectValueByStringKeys(obj, strKeys, val) {
      //strKeys 大部分情况下只有一个，
      const arr = strKeys.split(".");
      arr.reduce((pre, item, i) => {
        //这里没看懂，感觉不需要判断，直接赋值即可
        if (arr.length === i + 1) {
          pre[item] = val;
        } else if (
          Object.prototype.toString.call(pre[item]) !== "[object Object]"
        ) {
          //这种情况没有遇见过，应该用不到
          pre[item] = {};
        }
        return pre[item]; //返回赋值好的本地数据属性，obj 与pre 是浅拷贝，所以他们是同一个对象
      }, obj);
    },
    //给组件灌值--锁定后端及本地的key值
    setRespData(component, respData) {
      const { dataPath, renderKey, dataConsumer } = component.__config__;
      //dataPath规定后端返回的key名称，若dataType:'list'，则后端返回应为：list:[{name:'wzf'}]
      if (!dataPath || !dataConsumer) return; //dataConsumer 目前的值只有options与data
      const data = dataPath
        .split(".")
        .reduce((pre, item) => pre[item], respData);
      this.setObjectValueByStringKeys(component, dataConsumer, data); //给组件灌值--
      const i = this.drawingList.findIndex(
        item => item.__config__.renderKey === renderKey
      );
      i > -1 && this.$set(this.drawingList, i, component); //在drawingList里使当前被添加的组件下拉元素能够双向绑定
    },
    //获取后端数据，这里特指级联与表格元素，这几个需要从后端获取数据
    fetchData(component) {
      const { dataType, method, url } = component.__config__;
      if (dataType === "dynamic" && method && url) {
        this.setLoading(component, true);
        this.$axios({
          method,
          url
        }).then(resp => {
          this.setLoading(component, false);
          this.setRespData(component, resp.data); //给组件灌值
        });
      }
    },
    //开启加载效果
    setLoading(component, val) {
      const { directives } = component; //获取该组件的动作指令，可能没有，也可能有
      if (Array.isArray(directives)) {
        //获取动作中指令的加载效果
        const t = directives.find(d => d.name === "loading");
        if (t) t.value = val;
        //此处未完待续，因为没有触发真正的加载组件
      }
    },
    //使当前组件在右侧高亮（高亮也叫"被选中"，其效果为：有边框且显示复制与删除按钮）
    //左侧点击元素、拖动或者点击右侧组件 都会触发此方法
    activeFormItem(currentItem) {
      console.log(currentItem);
      this.activeData = currentItem; //存下当前元素配置项
      this.activeId = currentItem.__config__.formId; //存下当前元素的formId
    },
    //此方法只有在左侧往右侧拖动完成时触发,因为此方法只绑定在左侧
    onEnd(obj) {
      console.log(obj);
      //此判断是过滤左侧内部元素之间的拖动
      if (obj.from !== obj.to) {
        this.fetchData(tempActiveData);
        //下面两句话可能要优化去掉
        this.activeData = tempActiveData;
        this.activeId = this.idGlobal;
      }
    },
    addComponent(item) {
      //点击或拖动左面元素，但尽量采用点击，
      console.log(item);
      const clone = this.cloneComponent(item); //配置部分属性
      this.fetchData(clone); //从后端获取数据，是否需要获取后面后判断
      this.drawingList.push(clone); //把左侧点击的元素添加到右侧数组里，此动作就会在右侧自动渲染组件
      this.activeFormItem(clone); //使当前组件在右侧高亮，这句话可能要放到 cloneComponent方法里
    },
    //配置部分属性，如 占的列宽，给组件增加唯一标识
    cloneComponent(origin) {
      console.log(origin);
      const clone = deepClone(origin);
      const config = clone.__config__;
      config.span = this.formConf.span; // 生成代码时，会根据页面输入的span做精简判断，重新赋值
      this.createIdAndKey(clone); //给组件打上唯一标识
      clone.placeholder !== undefined && (clone.placeholder += config.label); //判断，设置placeholder
      tempActiveData = clone; //这句可能要优化掉，不要了，因为它和this.activeData 是一样的
      return tempActiveData;
    },
    createIdAndKey(item) {
      const config = item.__config__;
      config.formId = ++this.idGlobal; //表单ID，自增
      config.renderKey = `${config.formId}${+new Date()}`; // 改变renderKey后可以实现强制更新组件
      console.log(config.renderKey);
      //组件配置项分为两种，元素与容器，元素的layout为colFormItem，容器的layout为rowFormItemWrap
      if (config.layout === "colFormItem" && config.showLabel != undefined) {
        item.__vModel__ = `field${this.idGlobal}`;
      } else if (config.layout === "rowFormItemWrap") {
        //行容器就是个盒子
        config.componentName = `row${this.idGlobal}`;
        !Array.isArray(config.children) && (config.children = []); //判断是否有children 字段，有则通过，无则添加次字段并赋值空数组
        delete config.label; // rowFormItemWrap无需配置label属性
      }
      //如果children不为空 ，则为其每一个子元素都设置 id与key
      if (Array.isArray(config.children)) {
        config.children = config.children.map(childItem =>
          this.createIdAndKey(childItem)
        );
      }
      return item;
    },
    //合并参数
    AssembleFormData() {
      console.log(65);
      this.formData = {
        fields: deepClone(this.drawingList),
        ...this.formConf
      };
    },
    generate(data) {
      console.log(data);
      const func = this[`exec${titleCase(this.operationType)}`];
      this.generateConf = data; //页面 or 弹窗
      func && func(data);
    },
    execRun(data) {
      this.AssembleFormData();
      this.drawerVisible = true;
    },
    execDownload(data) {
      const codeStr = this.generateCode();
      const blob = new Blob([codeStr], { type: "text/plain;charset=utf-8" });
      saveAs(blob, data.fileName);
    },
    execCopy(data) {
      document.getElementById("copyNode").click();
    },
    empty() {
      this.$confirm("确定要清空所有组件吗？", "提示", { type: "warning" }).then(
        () => {
          this.drawingList = [];
          this.idGlobal = 100;
        }
      );
    },
    drawingItemCopy(item, list) {
      let clone = deepClone(item);
      clone = this.createIdAndKey(clone);
      list.push(clone);
      this.activeFormItem(clone);
    },
    drawingItemDelete(index, list) {
      console.log(index, list);
      list.splice(index, 1);
      this.$nextTick(() => {
        const len = this.drawingList.length;
        if (len) {
          this.activeFormItem(this.drawingList[len - 1]);
        }
      });
    },
    generateCode() {
      console.log(this.generateConf);
      const { type } = this.generateConf;
      this.AssembleFormData();
      const script = vueScript(makeUpJs(this.formData, type));
      const html = vueTemplate(makeUpHtml(this.formData, type));
      const css = cssStyle(makeUpCss(this.formData));
      return beautifier.html(html + script + css, beautifierConf.html);
    },
    //查看json
    showJson() {
      this.AssembleFormData();
      this.jsonDrawerVisible = true;
    },
    download() {
      this.dialogVisible = true;
      this.showFileName = true;
      this.operationType = "download";
    },
    // 运行的点击按钮
    run() {
      this.dialogVisible = true;
      this.showFileName = false;
      this.operationType = "run";
    },
    copy() {
      this.dialogVisible = true;
      this.showFileName = false;
      this.operationType = "copy";
    },
    // 右侧面板切换组件类型
    tagChange(newTag) {
      newTag = this.cloneComponent(newTag);
      const config = newTag.__config__;
      newTag.__vModel__ = this.activeData.__vModel__; //只有layout === "colFormItem"才会有__vModel__ ，所以切换组件时不用改变此值
      config.formId = this.activeId; //不需要变动
      config.span = this.activeData.__config__.span; //不需要变动
      this.activeData.__config__.tag = config.tag; //需要变动
      this.activeData.__config__.tagIcon = config.tagIcon; //需要变动
      this.activeData.__config__.document = config.document; //需要变动
      if (
        typeof this.activeData.__config__.defaultValue ===
        typeof config.defaultValue
      ) {
        config.defaultValue = this.activeData.__config__.defaultValue; //不需要变动
      }
      Object.keys(newTag).forEach(key => {
        if (this.activeData[key] !== undefined) {
          newTag[key] = this.activeData[key]; //这边直接覆盖会有点问题，因为有的字段还是沿用之前的值
        }
      });
      console.log(JSON.parse(JSON.stringify(this.activeData)));
      this.activeData = newTag;
      this.updateDrawingList(newTag, this.drawingList);
    },
    updateDrawingList(newTag, list) {
      const index = list.findIndex(
        item => item.__config__.formId === this.activeId // 通过id找
      );
      if (index > -1) {
        list.splice(index, 1, newTag); //更新，会驱动drawingList 重新渲染
      } else {
        list.forEach(item => {
          if (Array.isArray(item.__config__.children))
            this.updateDrawingList(newTag, item.__config__.children);
        });
      }
    },
    refreshJson(data) {
      this.drawingList = deepClone(data.fields);
      delete data.fields;
      this.formConf = data;
    }
  }
};
</script>

<style lang='scss'>
@import "@/styles/home";
</style>
