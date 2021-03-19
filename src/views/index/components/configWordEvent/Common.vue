<template>
  <div class="icon-dialog">
    <el-dialog v-bind="$attrs" width="600px" v-on="$listeners" @open="onOpen" @close="onClose">
      <div slot="title">关联字段事件配置</div>
      <div class="content">
        <el-form class="right" :rules="rules" label-width="90px" :model="ruleForm" ref="ruleForm">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item v-if="eventHandleItem['__vModel__'] != undefined" label="清空内容">
                <el-switch v-model="ruleForm.clearVModel" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item v-if="eventHandleItem['__vModel__'] != undefined" label="修改内容">
                <el-input size="mini" v-model="ruleForm.editVModel" placeholder="修改内容"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item v-if="eventHandleItem['readonly'] != undefined" label="只读">
                <el-switch v-model="ruleForm.readonly" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item v-if="eventHandleItem['disabled'] != undefined" label="禁用">
                <el-switch v-model="ruleForm.disabled" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                v-if="eventHandleItem.__config__&&eventHandleItem.__config__['hideComponent'] != undefined"
                label="影藏组件"
              >
                <el-switch v-model="ruleForm.hideComponent" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <!-- <el-button @click="onClose">取 消</el-button> -->
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  inheritAttrs: false,
  props: ["current", "eventHandleItem"],
  data() {
    return {
      rules: {},
      ruleForm: {
        readonly: false,
        editVModel: "",
        disabled: false,
        hideComponent: false,
        clearVModel: false //
      }
    };
  },
  watch: {
    ruleForm: {
      handler(val) {},
      immediate: true,
      deep: true
    }
  },

  mounted() {},
  methods: {
    onOpen() {
      // console.log(this.current);
      // console.log(this.eventHandleItem);
      let associatedWordConfig = this.eventHandleItem.__config__
        .associatedWordConfig;
      if (
        associatedWordConfig &&
        JSON.stringify(associatedWordConfig) != "{}"
      ) {
        //associatedWordConfig里的值都为真
        for (let i in associatedWordConfig) {
          if (["editVModel"].includes(i)) {
            this.ruleForm[i] = associatedWordConfig[i].split("@@")[2]; //取，显示
          } else {
            this.ruleForm[i] = true;
          }
        }
      }
    },
    onClose(from) {
      let ruleForm = JSON.parse(JSON.stringify(this.ruleForm));
      //获取随机数
      function getRandom() {
        return Math.floor(Math.random() * 1000);
      }

      let params = {};
      for (let i in ruleForm) {
        if (["editVModel"].includes(i)) {
          params[i] =
            this.eventHandleItem.__vModel__ +
            "@@" +
            this.eventHandleItem.__config__.formId +
            "" +
            `@@${ruleForm[i]}`; //存
        } else if (ruleForm[i]) {
          //为真时构造变量名
          params[i] = i + getRandom();
        }
      }
      console.log(params);
      //生成change事件名称
      let changeName = "change" + getRandom();
      this.$set(this.current.__config__.eventName, "changeName", changeName);
      this.$set(
        this.eventHandleItem.__config__,
        "associatedWordConfig",
        params
      );
      // console.log(JSON.parse(JSON.stringify(this.eventHandleItem)));

      // for (let i in this.ruleForm) {
      //   this.ruleForm[i] = false;
      // }
      this.ruleForm = {
        readonly: false,
        editVModel: "",
        disabled: false,
        hideComponent: false,
        clearVModel: false //
      };
      this.$emit("update:visible", false); //关闭模态框
    },
    submit(icon) {
      this.$emit("update:visible", false); //关闭模态框
    }
  }
};
</script>
<style lang="scss" scoped>
.content {
}
</style>
