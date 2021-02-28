import {
  isArray
} from 'util'
import {
  exportDefault,
  titleCase,
  deepClone
} from '@/utils/index'
import ruleTrigger from './ruleTrigger'

const units = {
  KB: '1024',
  MB: '1024 / 1024',
  GB: '1024 / 1024 / 1024'
}


let confGlobal
const inheritAttrs = {
  file: '',
  dialog: 'inheritAttrs: false,'
}

/**
 * 组装js 【入口函数】
 * @param {Object} formConfig 整个表单配置
 * @param {String} type 生成类型，文件或弹窗等
 */
export function makeUpJs(formConfig, type) {
  confGlobal = formConfig = deepClone(formConfig)
  console.log(confGlobal);
  const formDataList = []
  const ruleList = []
  const optionsList = []
  const propsList = []
  const commonDataList = []
  const methodList = mixinMethod(type); //基础方法
  const uploadVarList = []
  const created = []
  //遍历每个表单，取出每个表单的相关属性放到vue生命周期里
  formConfig.fields.forEach(el => {
    buildAttributes(el, formDataList, commonDataList, ruleList, optionsList, methodList, propsList, uploadVarList, created);
  })

  const script = buildexport(
    formConfig,
    type,
    formDataList.join('\n'),
    commonDataList.join('\n'),
    ruleList.join('\n'),
    optionsList.join('\n'),
    uploadVarList.join('\n'),
    propsList.join('\n'),
    methodList.join('\n'),
    created.join('\n')
  )
  confGlobal = null; //清空全局变量
  return script
}

// 构建组件属性
function buildAttributes(scheme, formDataList, commonDataList, ruleList, optionsList, methodList, propsList, uploadVarList, created) {
  const config = scheme.__config__
  const slot = scheme.__slot__
  buildData(scheme, formDataList); //构建formData
  buildcommonData(scheme, commonDataList); //构建普通的data字段，非表单里的，如：分页、对话框的关闭、打开等字段
  buildRules(scheme, ruleList); //构建校验规则

  // 特殊处理options属性
  //scheme.options级联，slot.options 单选下拉、多选下拉
  if (scheme.options || (slot && slot.options && slot.options.length)) {
    buildOptions(scheme, optionsList); //
    if (config.dataType === 'dynamic') { //级联、表格
      const model = `${scheme.__vModel__}Options`
      const options = titleCase(model); //首字母大写
      const methodName = `get${options}`; //定义获取下拉列表的方法名称
      buildOptionMethod(methodName, model, methodList, scheme); //构建获取下拉列表的方法,之后会把构建好的方法合并到methodList里
      callInCreated(methodName, created); //把该方法放到created里调用
    }
  }
  //添加事件和方法
  switch (config.tag) {
    case 'el-pagination':
      buildPaginationMethod([config.eventName.currentChange, config.eventName.sizeChange], methodList, scheme); //构建分页组件的事件,如：页面改变、每页展示条数改变
      break;
    case 'el-table':
      buildTableMethod([config.eventName.getTableData], methodList, scheme); //构建表格组件的方法,如：获取数据
      break;

    default:
      break;
  }

  // 处理props
  if (scheme.props && scheme.props.props) {
    buildProps(scheme, propsList)
  }

  // 处理el-upload的action
  if (scheme.action && config.tag === 'el-upload') {
    uploadVarList.push(
      `${scheme.__vModel__}Action: '${scheme.action}',
      ${scheme.__vModel__}fileList: [],`
    )
    methodList.push(buildBeforeUpload(scheme))
    // 非自动上传时，生成手动上传的函数
    if (!scheme['auto-upload']) {
      methodList.push(buildSubmitUpload(scheme))
    }
  }

  // 构建子级组件属性
  if (config.children) {
    //再次遍历
    config.children.forEach(item => {
      buildAttributes(item, formDataList, commonDataList, ruleList, optionsList, methodList, propsList, uploadVarList, created)
    })
  }
}

// 在Created调用的函数
function callInCreated(methodName, created) {
  created.push(`this.${methodName}()`)
}

// 混入处理函数
function mixinMethod(type) {
  const list = [];
  const
    minxins = {
      file: confGlobal.formBtns ? {
        submitForm: `submitForm() {
        this.$refs['${confGlobal.formRef}'].validate(valid => {
          if(!valid) return
          // TODO 提交表单
        })
      },`,
        resetForm: `resetForm() {
        this.$refs['${confGlobal.formRef}'].resetFields()
      },`
      } : null,
      dialog: {
        onOpen: 'onOpen() {},',
        onClose: `onClose() {
        this.$refs['${confGlobal.formRef}'].resetFields()
      },`,
        close: `close() {
        this.$emit('update:visible', false)
      },`,
        handelConfirm: `handelConfirm() {
        this.$refs['${confGlobal.formRef}'].validate(valid => {
          if(!valid) return
          this.close()
        })
      },`
      }
    }

  const methods = minxins[type]
  if (methods) {
    Object.keys(methods).forEach(key => {
      list.push(methods[key]); //把已有的方法添加到list里
    })
  }

  return list
}

// 构建data 取出vModel,
function buildData(scheme, formDataList) {
  const config = scheme.__config__
  if (scheme.__vModel__ === undefined) return;
  const defaultValue = JSON.stringify(config.defaultValue);
  // formData下面的字段不是每个都要传到后端的(不是每个都是可配的,如：表单下的tableData变量，他只是接受数据，但他得写在formData下面，因为表格被表单包裹着 )
  if (['el-table'].indexOf(config.tag) > -1) {
    formDataList.push(`${config.forData['tableData']}:${defaultValue},`); //
  } else {
    formDataList.push(`${scheme.__vModel__}: ${defaultValue},`);
  }

}

// 构建校验规则
function buildRules(scheme, ruleList) {
  const config = scheme.__config__
  if (scheme.__vModel__ === undefined) return; //如果连vModel都没有那么要规则也没有用
  const rules = []
  if (ruleTrigger[config.tag]) { //ruleTrigger配置规则中是否包含当前的表单类型
    if (config.required) { //且当前表单是必填
      const type = isArray(config.defaultValue) ? 'type: \'array\',' : ''; //当前表单的值是否是数组
      let message = isArray(config.defaultValue) ? `请至少选择一个${config.label}` : scheme.placeholder; //设置提示信息
      if (message === undefined) message = `${config.label}不能为空`
      rules.push(`{ required: true, ${type} message: '${message}', trigger: '${ruleTrigger[config.tag]}' }`)
    }
    //若有正则，需分外校验
    if (config.regList && isArray(config.regList)) {
      config.regList.forEach(item => {
        if (item.pattern) { //有pattern字段
          rules.push(
            `{ pattern: ${eval(item.pattern)}, message: '${item.message}', trigger: '${ruleTrigger[config.tag]}' }`
          )
        }
      })
    }
    ruleList.push(`${scheme.__vModel__}: [${rules.join(',')}],`)
  }
}
// 构建options
function buildOptions(scheme, optionsList) {
  if (scheme.__vModel__ === undefined) return;
  // el-cascader直接有options属性，其他组件都是定义在slot中，所以有两处判断
  let {
    options
  } = scheme; //先当做级联表单来取
  if (!options) options = scheme.__slot__.options; //若为假，则不是级联，再当做普通下拉来取
  if (scheme.__config__.dataType === 'dynamic') { //如果是级联或者表格，则清空，为啥要清空没搞懂！！
    options = []
  }
  const str = `${scheme.__vModel__}Options: ${JSON.stringify(options)},`
  optionsList.push(str)
}
// 构建Props
function buildProps(scheme, propsList) {
  const str = `${scheme.__vModel__}Props: ${JSON.stringify(scheme.props.props)},`
  propsList.push(str)
}
// 构建普通data数据，如：打开、关闭模态框的标志位、分页组件必须参数等
function buildcommonData(scheme, commonDataList) {
  let tag = scheme.__config__.tag; //通过标签来定制字段
  //分页组件 ,scheme.__config__.forData 这是因为配置项的顶层没有这些参数，在里面写的
  if (scheme.__config__.forData) {
    switch (tag) {
      case 'el-pagination':
        commonDataList.push(`${scheme.__config__.forData.rowsKey}: ${scheme.__config__.forData.pageSize},`);
        commonDataList.push(`${scheme.__config__.forData.pageKey}: ${scheme.__config__.forData.currentPage},`);
        commonDataList.push(`${scheme.__config__.forData.totalKey}: ${scheme.__config__.forData.total},`);
        break;
      default:
        break;
    }

  }
  //表格组件
  if (tag == 'el-table') {
    commonDataList.push(`${scheme['v-loading'] }:false,`); //表格加载效果标志位
  }

}

// el-upload的BeforeUpload
function buildBeforeUpload(scheme) {
  const config = scheme.__config__
  const unitNum = units[config.sizeUnit];
  let rightSizeCode = '';
  let acceptCode = '';
  const
    returnList = []
  if (config.fileSize) {
    rightSizeCode = `let isRightSize = file.size / ${unitNum} < ${config.fileSize}
    if(!isRightSize){
      this.$message.error('文件大小超过 ${config.fileSize}${config.sizeUnit}')
    }`
    returnList.push('isRightSize')
  }
  if (scheme.accept) {
    acceptCode = `let isAccept = new RegExp('${scheme.accept}').test(file.type)
    if(!isAccept){
      this.$message.error('应该选择${scheme.accept}类型的文件')
    }`
    returnList.push('isAccept')
  }
  const str = `${scheme.__vModel__}BeforeUpload(file) {
    ${rightSizeCode}
    ${acceptCode}
    return ${returnList.join('&&')}
  },`
  return returnList.length ? str : ''
}

// el-upload的submit
function buildSubmitUpload(scheme) {
  const str = `submitUpload() {
    this.$refs['${scheme.__vModel__}'].submit()
  },`
  return str
}
//定义下拉组件获取数据的方法
function buildOptionMethod(methodName, model, methodList, scheme) {
  const config = scheme.__config__; //取出表单配置项
  const str = `${methodName}() {
    // 注意：this.$axios是通过Vue.prototype.$axios = axios挂载产生的
    this.$axios({
      method: '${config.method}',
      url: '${config.url}'
    }).then(resp => {
      var { data } = resp
      this.${model} = data.${config.dataPath}
    })
  },`
  methodList.push(str); //往已有的方法里添加
}
//定义分页组件的事件
function buildPaginationMethod(methodNameList, methodList, scheme) {
  const config = scheme.__config__; //取出表单配置项
  //改变页码事件
  const str1 = `${methodNameList[0]}(val) {
    this['${config.forData.pageKey}'] = val;
    this.getTableData();
  },`
  methodList.push(str1); //往已有的方法里添加
  //改变条数事件
  const str2 = `${methodNameList[1]}(val) {
    this['${config.forData.rowsKey}'] = val;
    this.getTableData();
  },`
  methodList.push(str2); //往已有的方法里添加

}
//定义表格组件所涉及的方法或事件
function buildTableMethod(methodNameList, methodList, scheme) {
  const config = scheme.__config__; //取出表单配置项
  let totalKey = '';
  let totalKeyExpression = '';
  confGlobal.fields.filter(item => {
    item.__config__.tag == 'el-pagination' ? totalKey = item.__config__.forData.totalKey : '';
  });
  totalKey ? totalKeyExpression = `this.${totalKey}=data.${totalKey}` : '';

  //获取表格数据
  const str = `${methodNameList[0]}() {
    // 注意：this.$axios是通过Vue.prototype.$axios = axios挂载产生的
    this.$axios({
      method: '${config.method}',
      url: '${config.url}'
    }).then(resp => {
      var { data } = resp;
      this.${confGlobal.formModel}.${config.forData.tableData}= data.${config.dataPath};
      //给分页组件的total灌值，但当前还没有渲染到分页组件，如何取得total的名称？ 答案：遍历所有组件找
      //总条数
      ${totalKeyExpression}
    })
  },`
  methodList.push(str); //往已有的方法里添加

}

// js整体拼接
function buildexport(conf, type, formData, commonDataList, rules, selectOptions, uploadVar, props, methods, created) {
  const str = `${exportDefault}{
  ${inheritAttrs[type]}
  components: {},
  props: [],
  data () {
    return {
      ${conf.formModel}: {
        ${formData}
      },
      ${conf.formRules}: {
        ${rules}
      },
      ${uploadVar}
      ${selectOptions}
      ${props}
      ${commonDataList}
    }
  },
  computed: {},
  watch: {},
  created () {
    ${created}
  },
  mounted () {},
  methods: {
    ${methods}
  }
}`
  return str
}
