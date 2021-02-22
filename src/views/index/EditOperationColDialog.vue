<template>
  <div class="icon-dialog">
    <el-dialog
      v-bind="$attrs"
      width="980px"
      :modal-append-to-body="false"
      v-on="$listeners"
      @open="onOpen"
      @close="onClose"
    >
      <div slot="title">编辑按钮</div>
      <div class="icon-ul">
        <el-form :rules="rules" :model="ruleForm" ref="ruleForm">
          <el-form-item label="按钮风格">
            <el-radio-group v-model="model">
              <el-radio label="1">文字按钮</el-radio>
              <el-radio label="2">普通按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-table
            :data="ruleForm.tableData"
            height="calc(100vh - 190px)"
            style="width: 100%"
            ref="table"
          >
            <el-table-column label="按钮名称">
              <template slot-scope="scope">
                <el-form-item :prop="'tableData.' + scope.$index + '.name'">
                  <el-input size="mini" v-model="scope.row.name" placeholder></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="事件名称">
              <template slot-scope="scope">
                <el-form-item :prop="'tableData.' + scope.$index + '.eventName'">
                  <el-input size="mini" v-model="scope.row.eventName" placeholder></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="按钮类型">
              <template slot-scope="scope">
                <el-form-item :prop="'tableData.' + scope.$index + '.type'">
                  <el-select size="mini" v-model="scope.row.type" placeholder>
                    <el-option
                      v-for="(item,index) in typeList"
                      :key="index"
                      :label="item.type"
                      :value="item.type"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button
                  class="table-btn"
                  size="mini"
                  type="primary"
                  v-show="ruleForm.tableData.length > 1"
                  @click="del(scope)"
                >删除</el-button>
                <el-button
                  size="mini"
                  class="table-btn"
                  v-show="ruleForm.tableData.length - 1 == scope.$index"
                  @click="add(scope.row)"
                  type="primary"
                >增加</el-button>
              </template>
            </el-table-column>
          </el-table>
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
import iconList from "@/utils/icon.json";

const originList = iconList.map(name => `el-icon-${name}`);

export default {
  inheritAttrs: false,
  props: ["current"],
  data() {
    return {
      iconList: originList,
      active: null,
      key: "",
      rules: {},
      model: "1",
      ruleForm: {
        tableData: []
      },
      typeList: [
        {
          type: "primary"
        },
        {
          type: "success"
        },
        {
          type: "info"
        },
        {
          type: "warning"
        },
        {
          type: "danger"
        }
      ]
    };
  },
  watch: {
    key(val) {
      if (val) {
        this.iconList = originList.filter(name => name.indexOf(val) > -1);
      } else {
        this.iconList = originList;
      }
    }
  },
  mounted() {},
  methods: {
    bulidTableModel() {},
    del(scope) {
      this.ruleForm.tableData.splice(scope.$index, 1);
    },

    add(row) {
      let _this = this;
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          this.ruleForm.tableData.push({
            name: "按钮", //
            eventName: "eventName" + Math.floor(Math.random() * 10), //
            type: "primary" //
          });
        } else {
          this.$message.warning("校验未通过");
          return false;
        }
      });
    },
    onOpen() {
      let arr = JSON.parse(JSON.stringify(this.current)); //回显时高亮
      console.log(arr);
      this.ruleForm.tableData = [];
      this.ruleForm.tableData = arr.map(item => {
        return {
          name: item.__slot__.default,
          eventName: item.__config__.eventName,
          type: item.type
        };
      });
    },
    onClose() {},
    submit(icon) {
      // this.active = icon;
      this.$emit("select", JSON.parse(JSON.stringify(this.ruleForm.tableData)));
      this.$emit("update:visible", false); //关闭模态框
    }
  }
};
</script>
<style lang="scss" scoped>
.icon-ul {
  margin: 0;
  padding: 0;
  font-size: 0;
  li {
    list-style-type: none;
    text-align: center;
    font-size: 14px;
    display: inline-block;
    width: 16.66%;
    box-sizing: border-box;
    height: 108px;
    padding: 15px 6px 6px 6px;
    cursor: pointer;
    overflow: hidden;
    &:hover {
      background: #f2f2f2;
    }
    &.active-item {
      background: #e1f3fb;
      color: #7a6df0;
    }
    > i {
      font-size: 30px;
      line-height: 50px;
    }
  }
}
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
</style>
