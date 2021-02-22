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
      <div slot="title">设计列</div>
      <div class="icon-ul">
        <el-form :rules="rules" :model="ruleForm" ref="ruleForm">
          <el-table
            :data="ruleForm.tableData"
            height="calc(100vh - 400px)"
            style="width: 100%"
            ref="table"
          >
            <el-table-column label="列名称">
              <template slot-scope="scope">
                <el-form-item :prop="'tableData.' + scope.$index + '.label'">
                  <el-input size="mini" clearable v-model="scope.row.label" placeholder="请输入列名称"></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="列字段">
              <template slot-scope="scope">
                <el-form-item :prop="'tableData.' + scope.$index + '.prop'">
                  <el-input size="mini" clearable v-model="scope.row.prop" placeholder="请输入列字段"></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="列宽度">
              <template slot-scope="scope">
                <el-form-item :prop="'tableData.' + scope.$index + '.width'">
                  <el-input size="mini" clearable v-model="scope.row.width" placeholder="请输入列宽度"></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="对齐方式">
              <template slot-scope="scope">
                <el-form-item :prop="'tableData.' + scope.$index + '.align'">
                  <el-select size="mini" clearable v-model="scope.row.align" placeholder="请选择">
                    <el-option
                      v-for="(item,index) in alignList"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="是否固定列">
              <template slot-scope="scope">
                <el-form-item :prop="'tableData.' + scope.$index + '.fixed'">
                  <el-select size="mini" clearable v-model="scope.row.fixed" placeholder="请选择">
                    <el-option
                      v-for="(item,index) in fixedList"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="是否排序">
              <template slot-scope="scope">
                <el-form-item :prop="'tableData.' + scope.$index + '.sortable'">
                  <el-select size="mini" clearable v-model="scope.row.sortable" placeholder="请选择">
                    <el-option
                      v-for="(item,index) in sortableList"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
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

    onOpen() {
      this.ruleForm.tableData = [];
      let item = this.current.__config__.children[this.$attrs.currentColIndex];
      this.ruleForm.tableData.push({
        label: item.label,
        prop: item.prop,
        width: item.width,
        align: item.align,
        fixed: item.fixed ? item.fixed : false,
        sortable: item.sortable ? item.sortable : false
      });
      console.log(JSON.parse(JSON.stringify(this.ruleForm.tableData)));
    },
    onClose() {
      this.$emit("update:visible", false); //关闭模态框
    },
    submit(icon) {
      // this.active = icon;
      console.log(JSON.parse(JSON.stringify(this.ruleForm.tableData)));
      this.$emit("select", JSON.parse(JSON.stringify(this.ruleForm.tableData)));
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
</style>
