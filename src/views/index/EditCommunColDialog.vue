<template>
  <div class="icon-dialog">
    <el-dialog
      v-bind="$attrs"
      width="900px"
      :modal-append-to-body="false"
      v-on="$listeners"
      @open="onOpen"
      @close="onClose"
    >
      <div slot="title">设计列</div>
      <div class="content">
        <div class="left">
          <el-tree
            ref="tree"
            highlight-current
            :data="treeData"
            node-key="renderKey"
            default-expand-all
            :expand-on-click-node="false"
            :render-content="renderContent"
            @node-click="nodeClick"
          ></el-tree>
        </div>
        <el-form class="right" :rules="rules" label-width="120px" :model="ruleForm" ref="ruleForm">
          <div class="form-cell">
            <el-form-item label="列名称">
              <el-input size="mini" clearable v-model="ruleForm.label" placeholder="请输入列名称"></el-input>
            </el-form-item>

            <el-form-item label="列字段" v-if="!hasChild">
              <el-input size="mini" clearable v-model="ruleForm.prop" placeholder="请输入列字段"></el-input>
            </el-form-item>
            <el-form-item label="列宽度">
              <el-input size="mini" clearable v-model="ruleForm.width" placeholder="请输入列宽度"></el-input>
            </el-form-item>
            <el-form-item label="对齐方式">
              <el-select size="mini" clearable v-model="ruleForm.align" placeholder="请选择">
                <el-option
                  v-for="(item,index) in alignList"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否固定列" v-if="!hasChild">
              <el-select size="mini" clearable v-model="ruleForm.fixed" placeholder="请选择">
                <el-option
                  v-for="(item,index) in fixedList"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否排序" v-if="!hasChild">
              <el-select size="mini" clearable v-model="ruleForm.sortable" placeholder="请选择">
                <el-option
                  v-for="(item,index) in sortableList"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="onClose">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  inheritAttrs: false,
  props: ["current"],
  data() {
    return {
      treeData: [],
      rules: {},
      model: "1",
      ruleForm: {
        label: "",
        prop: "",
        width: "",
        align: "left",
        fixed: false,
        sortable: false
      },
      alignList: [
        {
          label: "居左",
          value: "left"
        },
        {
          label: "居中",
          value: "center"
        },
        {
          label: "居右",
          value: "right"
        }
      ],
      fixedList: [
        {
          label: "是",
          value: "left"
        },
        {
          label: "否",
          value: false
        }
      ],
      sortableList: [
        {
          label: "是",
          value: true
        },
        {
          label: "否",
          value: false
        }
      ],
      hasChild: true //是否是最后一层
    };
  },
  watch: {},

  mounted() {},
  methods: {
    nodeClick(data) {
      this.ruleForm = data; //赋值给表单
      this.currentObj = JSON.parse(JSON.stringify(data)); //深拷贝
      this.hasChild = data.children && data.children.length ? true : false;
    },
    renderContent(h, { node, data, store }) {
      // console.log(data);
      let disbaled = node.parent.id == 0 ? true : false;
      return (
        <span class="custom-tree-node">
          <span style="display: inline-block;width: 100px;">{node.label}</span>
          <span>
            <el-button
              size="mini"
              type="text"
              on-click={e => {
                this.append(data);
                e.stopPropagation();
              }}
            >
              添加子节点
            </el-button>
            <el-button
              disabled={(disbaled = node.parent.id == 0 ? true : false)}
              size="mini"
              type="text"
              on-click={e => {
                this.remove(node, data);
                e.stopPropagation();
              }}
            >
              删除
            </el-button>
          </span>
        </span>
      );
    },
    append(data) {
      let baseConfig = this.$parent.initConfig();
      baseConfig.renderKey = this.initConfig(); //添加renderKey和children
      if (!data.children) {
        this.$set(data, "children", []);
      }
      data.children.push(baseConfig);
      // console.log(JSON.parse(JSON.stringify(data)));
      //添加子节点时当前节点会变成父节点，此时要改变标志位
      if (this.currentObj.label == data.label && data.children.length)
        this.hasChild = true;
    },
    //添加renderKey ,树形渲染需要唯一标识
    initConfig() {
      return String(Math.random()).split(".")[1];
    },
    remove(node, data) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex(d => d.renderKey === data.renderKey);
      children.splice(index, 1);
    },
    //构造树形数据结构
    buildTreeData(item) {
      let i = "__config__";
      item.renderKey = this.initConfig();
      if (item[i].children && item[i].children.length) {
        item.children = item[i].children; //把__config__ 下的children提到上面来
        item.children.map(o => this.buildTreeData(o));
      }
    },
    onOpen() {
      let item = this.current.__config__.children[this.$attrs.currentColIndex]; //找到当前列的对象
      this.buildTreeData(item); //添加renderKey和children
      this.treeData = [item]; //赋值给树形
      this.$nextTick(() => {
        let arr = document.querySelectorAll(".custom-tree-node");
        if (!arr.length) return;
        console.log(arr);
        arr[0].click(); //默认选中第一个节点
      });
    },
    onClose() {
      this.$emit("update:visible", false); //关闭模态框
    },
    submit(icon) {
      this.$emit("select", JSON.parse(JSON.stringify(this.treeData)));
      this.$emit("update:visible", false); //关闭模态框
    }
  }
};
</script>
<style lang="scss" scoped>
.icon-dialog {
  ::v-deep .el-dialog {
    border-radius: 8px;
    margin-bottom: 0;
    margin-top: 4vh !important;
    display: flex;
    flex-direction: column;
    max-height: 92vh;
    overflow: hidden;
    box-sizing: border-box;
    .el-dialog__header {
      padding-top: 14px;
    }
    .el-dialog__body {
      margin: 0 20px 20px 20px;
      padding: 0;
      overflow: auto;
    }
  }
}

.content {
  display: flex;
  .left {
    width: 30%;
  }
  .right {
    flex: 1;
    border-left: 1px solid #dcd9d9;
    margin-left: 20px;
    .form-cell {
      height: 400px;
      overflow: auto;
      ::v-deep .el-form-item__content {
        width: 320px;
      }
      ::v-deep .el-select {
        width: 320px;
      }
    }
  }
}
::v-deep .el-form-item {
  margin-bottom: 10px;
}
</style>
