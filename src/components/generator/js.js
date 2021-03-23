import {
  isArray
} from 'util'
import {
  exportDefault,
  titleCase,
  deepClone,
} from '@/utils/index'
import stroe from '@/store/index.js'
import {
  handlerChangeEvent
} from '@/utils/commonFun.js'
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
  confGlobal = formConfig = deepClone(formConfig);
  stroe.commit('setConfGlobal', confGlobal); //存储
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
  //
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
  stroe.commit('setConfGlobal', {}); //清空
  confGlobal = null; //清空全局变量
  return script
}

// 构建组件属性
function buildAttributes(scheme, formDataList, commonDataList, ruleList, optionsList, methodList, propsList, uploadVarList, created) {
  const config = scheme.__config__
  const slot = scheme.__slot__
  buildData(scheme, formDataList); //构建formData
  buildcommonData(scheme, commonDataList, formDataList); //构建普通的data字段，非表单里的，如：分页、对话框的关闭、打开等字段
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
  //定制化，添加事件和方法
  switch (config.tag) {
    case 'el-pagination':
      buildPaginationMethod([config.eventName.currentChange, config.eventName.sizeChange], methodList, scheme); //构建分页组件的事件,如：页面改变、每页展示条数改变
      break;
    case 'el-table':
      buildTableMethod([config.eventName.getTableData], methodList, scheme); //构建表格组件的方法,如：获取数据
      break;
    case 'el-select':
      buildSelectMethod([config.eventName.changeName], methodList, scheme); //
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
  if (scheme.__vModel__ === undefined) return; //只要是列元素，都有此属性
  const defaultValue = JSON.stringify(config.defaultValue);
  // formData下面的字段不是每个都要传到后端的(不是每个都是可配的,如：表单下的tableData变量，他只是接受数据，但他得写在formData下面，因为表格被表单包裹着 )
  if (['el-table'].indexOf(config.tag) > -1) { //定制化，把那些不需要传到后端但要放在这里
    formDataList.push(`${config.forData['tableData']}:${defaultValue},`); //
  } else {
    //其余的直接放在对应的字段中
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
function buildcommonData(scheme, commonDataList, formDataList) {
  let tag = scheme.__config__.tag; //通过标签来定制字段
  //分页组件 ,scheme.__config__.forData 这是因为配置项的顶层没有这些参数，在里面写的
  if (scheme.__config__.forData) {
    switch (tag) {
      case 'el-pagination':
        commonDataList.push(`${scheme.__config__.forData.rowsKey}: ${scheme.__config__.forData.pageSize},`);
        commonDataList.push(`${scheme.__config__.forData.pageKey}: ${scheme.__config__.forData.currentPage},`);
        commonDataList.push(`${scheme.__config__.forData.totalKey}: ${scheme.__config__.forData.total},`);
        break;
      case 'el-input':

        break;
      default:
        break;
    }
  }
  //表格组件
  if (tag == 'el-table') {
    commonDataList.push(`${scheme['v-loading'] }:false,`); //表格加载效果标志位
  }
  //受控关联字段处理,即 该组件是否受某个下拉框控制
  let getAwConfig = handlerChangeEvent(scheme, '', 'getAwConfig'); //获取此组件受影响的属性，如：readonly 等
  if (JSON.stringify(getAwConfig) != '{}') {
    for (let i in getAwConfig) {
      //受控关联字段初始值处理
      //组件配置根目录中是否有初始值
      if (i in scheme) {
        commonDataList.push(`${getAwConfig[i]}: ${scheme[i]},`);
      } else {
        //排除输入框， 因为输入框的值 __vModel__在上面已经处理好了，
        if (!['editVModel'].includes(i)) {
          //获取非根目录的初始值
          if (['hideComponent'].includes(i)) {
            //如果配置项中设置了true,则说明不显示，所以目标值要设置成fasle
            if (scheme.__config__.hideComponent == true) {
              commonDataList.push(`${getAwConfig[i]}: false,`);
            } else {
              commonDataList.push(`${getAwConfig[i]}: true,`); //排除取反的,如隐藏功能，此时要显示true，结果为v-show='true',即初始时是显示的
            }
          } else {
            commonDataList.push(`${getAwConfig[i]}: false,`); //其他初始值则一律为非
          }
        }
      }
      //受控关联字段目标值处理，把目标值存到changeEventTargetConfig里，即 下拉框选择某一项时把目标值赋值给某个组件
      //如果是修改默认值，则要排除，用修改后的值
      //由于commonDataList里的变量本来是放在data根部的，但有的需要用对象包一层，所以按需加了标记，此标记最后要剔除到
      if (['editVModel'].includes(i)) {
        let VModelArr = getAwConfig[i].split('@@');
        commonDataList.push(`changeEventTargetConfig.'${VModelArr[0]}': '${VModelArr[1]}@@${VModelArr[2]}',`);
      } else {
        //其他要分情况判断
        //排除输入框， 因为输入框的值 __vModel__在上面已经处理好了，
        if (['hideComponent'].includes(i)) {
          commonDataList.push(`changeEventTargetConfig.${getAwConfig[i]}: false,`); //排除取反的,如隐藏功能，此时要显示false，结果为v-show='false',即目标值是隐藏的
        } else {
          commonDataList.push(`changeEventTargetConfig.${getAwConfig[i]}: true,`); //其他初始值则一律为真
        }
      }
    }
  }
  console.log(commonDataList);
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
  //遍历组件，判断是否有分页组件
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
//定义下拉框组件所涉及的方法或事件  
function buildSelectMethod(methodNameList, methodList, scheme) {
  let slot = scheme.__slot__;
  let equal = slot.equal != 'all' ? slot.equal : '';
  let result = '';
  if (slot.result != '') {
    result = slot.result
  } else {
    equal = '';
  }
  const str = `${methodNameList[0]}(val) {
    // change事件
    let aWconfig = this.changeEventTargetConfig;
    if('${slot.equal}' == 'all' ||  '${slot.result}' == '' || (val ${equal} ${result})){
      for (let i in  aWconfig) {
        if (String(aWconfig[i]).indexOf('@@') > -1) {
          this.${confGlobal.formModel}[i] = aWconfig[i].split('@@')[1];
        }else{
          //目标值，是啥就是啥，不用再转了，因为上面设置时已经转好了
          this[i] = aWconfig[i];
        }
        
      }
    }else {
      //选项不满足时，则恢复，但这里有个问题，对于输入框的恢复无法做到，因为已经被修改了，此时不知道它之前的值，所以只能清空
      for (let i in  aWconfig) {
        if (String(aWconfig[i]).indexOf('@@') > -1) {
          this.${confGlobal.formModel}[i] = '';
        }else{
          //排除取反的
          if (i.indexOf('hideComponent') > -1) {
            this[i] = true;
          } else {
            this[i] = false;
          }
        }
       
      }
    }
  },`
  methodList.push(str); //往已有的方法里添加

}

// js整体拼接
/**
 * 
 * @param {*} conf 全量的:组件属性和表单属性
 * @param {*} type 页面类型
 * @param {*} formData 表单数据
 * @param {*} commonDataList 放在data根目录的数据，如：page total等字段
 * @param {*} rules 表单校验规则
 * @param {*} selectOptions 下拉选项
 * @param {*} uploadVar 文件上传相关
 * @param {*} props 组件传过来的数据
 * @param {*} methods 方法list
 * @param {*} created 
 */
function buildexport(conf, type, formData, commonDataList, rules, selectOptions, uploadVar, props, methods, created) {

  let changeEventTargetConfig = []; //下拉框事件配置项相关
  let commonData = [];
  commonDataList.split(',').map(o => {
    //这里专门处理多级对象，进行判断
    if (o.indexOf('changeEventTargetConfig') > -1) {
      let arr = o.split('.');
      changeEventTargetConfig.push(arr[1]);
    } else {
      //根目录的在这里
      commonData.push(o);
    }
  });
  let rootCommonData = `
  //下拉框事件触发时目标配置项,放在changeEventTargetConfig里
  changeEventTargetConfig: {
  ${changeEventTargetConfig}
  },
  //普通属性，放在根目录的，如，模态框关闭的标志位
  ${commonData}
  `
  console.log(rootCommonData);
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
      ${rootCommonData}
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
