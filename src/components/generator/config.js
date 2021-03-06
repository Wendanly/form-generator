// 表单属性【右面板】
export const formConf = {
  formRef: 'elForm',
  formModel: 'formData',
  size: 'medium',
  labelPosition: 'right',
  labelWidth: 100,
  formRules: 'rules',
  gutter: 15,
  disabled: false,
  span: 24,
  formBtns: true
}

// 输入型组件 【左面板】
export const inputComponents = [{
    // 组件的自定义配置
    __config__: {
      label: '单行文本',
      labelWidth: null,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      changeTag: true,
      tag: 'el-input',
      tagIcon: 'input',
      defaultValue: undefined,
      required: true,
      layout: 'colFormItem',
      span: 24,
      document: 'https://element.eleme.cn/#/zh-CN/component/input',
      // 正则校验规则
      regList: []
    },
    // 组件的插槽属性
    __slot__: {
      prepend: '',
      append: ''
    },
    // 其余的为可直接写在组件标签上的属性
    placeholder: '请输入',
    style: {
      width: '100%'
    },
    clearable: true,
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    size: 'medium',
  },
  {
    __config__: {
      label: '多行文本',
      labelWidth: null,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      tag: 'el-input',
      tagIcon: 'textarea',
      defaultValue: undefined,
      required: true,
      layout: 'colFormItem',
      span: 24,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/input'
    },
    type: 'textarea',
    placeholder: '请输入',
    autosize: {
      minRows: 4,
      maxRows: 4
    },
    style: {
      width: '100%'
    },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false
  },
  {
    __config__: {
      label: '密码',
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      changeTag: true,
      tag: 'el-input',
      tagIcon: 'password',
      defaultValue: undefined,
      layout: 'colFormItem',
      span: 24,
      required: true,
      regList: [],
      document: 'https://element.eleme.cn/#/zh-CN/component/input'
    },
    __slot__: {
      prepend: '',
      append: ''
    },
    placeholder: '请输入',
    'show-password': true,
    style: {
      width: '100%'
    },
    clearable: true,
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    size: 'medium',
  },
  {
    __config__: {
      label: '计数器',
      showLabel: true,
      hideComponent: false, //是否影藏组件
      changeTag: true,
      labelWidth: null,
      tag: 'el-input-number',
      tagIcon: 'number',
      defaultValue: undefined,
      span: 24,
      layout: 'colFormItem',
      required: true,
      regList: [],
      document: 'https://element.eleme.cn/#/zh-CN/component/input-number'
    },
    placeholder: '',
    min: undefined,
    max: undefined,
    step: 1,
    'step-strictly': false,
    precision: undefined,
    'controls-position': '',
    disabled: false,
    size: 'medium',
  },
  {
    __config__: {
      label: '编辑器',
      showLabel: true,
      hideComponent: false, //是否影藏组件
      changeTag: true,
      labelWidth: null,
      tag: 'tinymce',
      tagIcon: 'rich-text',
      defaultValue: null,
      span: 24,
      layout: 'colFormItem',
      required: true,
      regList: [],
      document: 'http://tinymce.ax-z.cn'
    },
    placeholder: '请输入',
    height: 300, // 编辑器高度
    branding: false // 隐藏右下角品牌烙印
  }
]

// 选择型组件 【左面板】
export const selectComponents = [{
    __config__: {
      label: '下拉选择',
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      tag: 'el-select',
      tagIcon: 'select',
      layout: 'colFormItem',
      dataType: 'static',
      //取数配置
      method: 'get',
      url: 'https://www.fastmock.site/mock/f8d7a54fb1e60561e2f720d5a810009d/fg/tableData',
      dataPath: 'list', //数据位置，
      eventType: 'change', //默认是change事件类型,
      eventName: {
        //代码里控制是否要添加事件名称
      },
      associatedWord: [], //关联的字段list
      forData: {
        //用于在vue生命周期中data里展示的字段,这里要根据associatedWord里的配置项动态插入需要的变量
      },
      span: 24,
      required: true,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/select'
    },
    __slot__: {
      key: 'label', //键字段名，默认label
      value: 'value', //值字段名，默认value
      //触发选项表达式 ,
      equal: '==', //可选值为== 或 != ，默认值为==
      result: '', //不等于或者等于的具体值，配置时输入,如：value == 'C0001'
      options: [{
        label: '选项一',
        value: 1
      }, {
        label: '选项二',
        value: 2
      }]
    },
    placeholder: '请选择',
    style: {
      width: '100%'
    },
    clearable: true,
    disabled: false,
    filterable: false,
    multiple: false,
    size: 'medium',
  },
  {
    __config__: {
      label: '级联选择',
      url: 'https://www.fastmock.site/mock/f8d7a54fb1e60561e2f720d5a810009d/fg/cascaderList',
      method: 'get',
      dataPath: 'list', //规定后端返回的key名称，如此处 dataPath: 'list'，则后端返回应为：list:[{name:'wzf'}]
      dataConsumer: 'options', //规定本地数据接收的数据列表key值，与下面的options 要一致
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      tag: 'el-cascader',
      tagIcon: 'cascader',
      layout: 'colFormItem',
      defaultValue: [],
      dataType: 'dynamic',
      span: 24,
      required: true,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/cascader'
    },
    options: [{
      id: 1,
      value: 1,
      label: '选项1',
      children: [{
        id: 2,
        value: 2,
        label: '选项1-1'
      }]
    }],
    placeholder: '请选择',
    style: {
      width: '100%'
    },
    props: {
      props: {
        multiple: false,
        label: 'label',
        value: 'value',
        children: 'children'
      }
    },
    'show-all-levels': true,
    disabled: false,
    clearable: true,
    filterable: false,
    separator: '/',
    size: 'medium',
  },
  {
    __config__: {
      label: '单选框组',
      labelWidth: null,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      tag: 'el-radio-group',
      dataType: 'static',
      //取数配置
      method: 'get',
      url: 'https://www.fastmock.site/mock/f8d7a54fb1e60561e2f720d5a810009d/fg/tableData',
      dataPath: 'list', //数据位置，
      tagIcon: 'radio',
      changeTag: true,
      defaultValue: undefined,
      layout: 'colFormItem',
      span: 24,
      optionType: 'default',
      regList: [],
      required: true,
      border: false,
      document: 'https://element.eleme.cn/#/zh-CN/component/radio'
    },
    __slot__: {
      options: [{
        label: '选项一',
        value: 1
      }, {
        label: '选项二',
        value: 2
      }]
    },
    style: {},
    size: 'medium',
    disabled: false
  },
  {
    __config__: {
      label: '多选框组',
      tag: 'el-checkbox-group',
      tagIcon: 'checkbox',
      dataType: 'static',
      //取数配置
      method: 'get',
      url: 'https://www.fastmock.site/mock/f8d7a54fb1e60561e2f720d5a810009d/fg/tableData',
      dataPath: 'list', //数据位置，
      defaultValue: [],
      span: 24,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      layout: 'colFormItem',
      optionType: 'default', //该组件是否显示尺寸大小选项不能像其他组件那样通过tag来判断，因为当optionType: 'default'时无大小一说，只有当optionType: 'button'时才有大小一说，所以要通过optionType来判断该是否可以调整大小
      required: true,
      regList: [],
      changeTag: true,
      border: false,
      document: 'https://element.eleme.cn/#/zh-CN/component/checkbox'
    },
    __slot__: {
      options: [{
        label: '选项一',
        value: 1
      }, {
        label: '选项二',
        value: 2
      }]
    },
    style: {},
    size: 'medium',
    min: null,
    max: null,
    disabled: false
  },
  {
    __config__: {
      label: '开关',
      tag: 'el-switch',
      tagIcon: 'switch',
      defaultValue: false,
      span: 24,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      layout: 'colFormItem',
      required: true,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/switch'
    },
    style: {},
    disabled: false,
    'active-text': '',
    'inactive-text': '',
    'active-color': null,
    'inactive-color': null,
    'active-value': true,
    'inactive-value': false
  },
  {
    __config__: {
      label: '滑块',
      tag: 'el-slider',
      tagIcon: 'slider',
      defaultValue: null,
      span: 24,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      layout: 'colFormItem',
      labelWidth: null,
      required: true,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/slider'
    },
    disabled: false,
    min: 0,
    max: 100,
    step: 1,
    'show-stops': false,
    range: false
  },
  {
    __config__: {
      label: '时间选择',
      tag: 'el-time-picker',
      tagIcon: 'time',
      defaultValue: null,
      span: 24,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      layout: 'colFormItem',
      labelWidth: null,
      required: true,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/time-picker'
    },
    placeholder: '请选择',
    style: {
      width: '100%'
    },
    disabled: false,
    clearable: true,
    'picker-options': {
      selectableRange: '00:00:00-23:59:59'
    },
    format: 'HH:mm:ss',
    'value-format': 'HH:mm:ss',
    size: 'medium',
  },
  {
    __config__: {
      label: '时间范围',
      tag: 'el-time-picker',
      tagIcon: 'time-range',
      span: 24,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      layout: 'colFormItem',
      defaultValue: null,
      required: true,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/time-picker'
    },
    style: {
      width: '100%'
    },
    disabled: false,
    clearable: true,
    'is-range': true,
    'range-separator': '至',
    'start-placeholder': '开始时间',
    'end-placeholder': '结束时间',
    format: 'HH:mm:ss',
    'value-format': 'HH:mm:ss',
    size: 'medium',
  },
  {
    __config__: {
      label: '日期选择',
      tag: 'el-date-picker',
      tagIcon: 'date',
      defaultValue: null,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      span: 24,
      layout: 'colFormItem',
      required: true,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/date-picker'
    },
    placeholder: '请选择',
    type: 'date',
    style: {
      width: '100%'
    },
    disabled: false,
    clearable: true,
    format: 'yyyy-MM-dd',
    'value-format': 'yyyy-MM-dd',
    readonly: false,
    size: 'medium',
  },
  {
    __config__: {
      label: '日期范围',
      tag: 'el-date-picker',
      tagIcon: 'date-range',
      defaultValue: null,
      span: 24,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      required: true,
      layout: 'colFormItem',
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/date-picker'
    },
    style: {
      width: '100%'
    },
    type: 'daterange',
    'range-separator': '至',
    'start-placeholder': '开始日期',
    'end-placeholder': '结束日期',
    disabled: false,
    clearable: true,
    format: 'yyyy-MM-dd',
    'value-format': 'yyyy-MM-dd',
    readonly: false,
    size: 'medium',
  },
  {
    __config__: {
      label: '评分',
      tag: 'el-rate',
      tagIcon: 'rate',
      defaultValue: 0,
      span: 24,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      layout: 'colFormItem',
      required: true,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/rate'
    },
    style: {},
    max: 5,
    'allow-half': false,
    'show-text': false,
    'show-score': false,
    disabled: false
  },
  {
    __config__: {
      label: '颜色选择',
      tag: 'el-color-picker',
      tagIcon: 'color',
      span: 24,
      defaultValue: null,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      layout: 'colFormItem',
      required: true,
      regList: [],
      changeTag: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/color-picker'
    },
    'show-alpha': false,
    'color-format': '',
    disabled: false,
    size: 'medium'
  },
  {
    __config__: {
      label: '上传',
      tag: 'el-upload',
      tagIcon: 'upload',
      layout: 'colFormItem',
      defaultValue: null,
      showLabel: true,
      hideComponent: false, //是否影藏组件
      labelWidth: null,
      required: true,
      span: 24,
      showTip: false,
      buttonText: '点击上传',
      regList: [],
      changeTag: true,
      fileSize: 2,
      sizeUnit: 'MB',
      document: 'https://element.eleme.cn/#/zh-CN/component/upload'
    },
    __slot__: {
      'list-type': true
    },
    action: 'https://jsonplaceholder.typicode.com/posts/',
    disabled: false,
    accept: '',
    name: 'file',
    'auto-upload': true,
    'list-type': 'text',
    multiple: false
  }
]

// 布局型组件 【左面板】
export const layoutComponents = [{
    __config__: {
      layout: 'rowFormItemWrap',
      hideComponent: false, //是否影藏组件
      tagIcon: 'row',
      label: '行容器',
      layoutTree: true,
      document: 'https://element.eleme.cn/#/zh-CN/component/layout#row-attributes'
    },
    type: 'default',
    justify: 'start',
    align: 'top'
  },
  {
    __config__: {
      label: '按钮',
      showLabel: false,
      hideComponent: false, //是否影藏组件
      changeTag: true,
      labelWidth: null,
      eventType: 'click', //按钮默认是click事件类型,
      //取数配置
      method: 'get',
      url: 'https://www.fastmock.site/mock/f8d7a54fb1e60561e2f720d5a810009d/fg/tableData',
      dataPath: 'list', //数据位置，
      //
      tag: 'el-button',
      tagIcon: 'button',
      span: 24,
      layout: 'colFormItem',
      document: 'https://element.eleme.cn/#/zh-CN/component/button'
    },
    __slot__: {
      default: '主要按钮'
    },
    type: 'primary',
    icon: 'el-icon-search',
    round: false,
    size: 'medium',
    plain: false,
    circle: false,
    disabled: false
  },
  {
    __config__: {
      layout: 'colFormItem',
      tagIcon: 'table',
      tag: 'el-table',
      document: 'https://element.eleme.cn/#/zh-CN/component/table',
      span: 24,
      formId: 101,
      renderKey: 1595761764203,
      componentName: 'row101',
      showLabel: false,
      hideComponent: false, //是否影藏组件
      changeTag: true,
      labelWidth: null,
      label: '表格',
      dataType: 'dynamic',
      //取数配置
      method: 'get',
      url: 'https://www.fastmock.site/mock/f8d7a54fb1e60561e2f720d5a810009d/fg/tableData',
      dataPath: 'list', //数据位置，
      dataConsumer: 'data',
      defaultValue: [], //表格数据，默认为空
      forData: {
        //用于在vue生命周期中data里展示的字段
        tableData: 'tableData' + Math.floor(Math.random() * 20), //表格list名称
      },
      //添加方法:获取表格数据、单选、多选
      eventName: {
        getTableData: 'getTableData' + Math.floor(Math.random() * 20), //获取表格数据方法名
      },
      children: [{
          __config__: {
            layout: 'raw',
            tag: 'el-table-column',
            renderKey: 15957617660153,
            colType: '1', //默认是普通列
          },
          prop: 'date',
          label: '日期',
          'show-overflow-tooltip': true,
          width: '',
          align: 'left',
          fixed: false,
          sortable: false

        }, {
          __config__: {
            layout: 'raw',
            tag: 'el-table-column',
            renderKey: 15957617660152,
            colType: '1', //默认是普通列
          },
          prop: 'address',
          label: '地址',
          'show-overflow-tooltip': true,
          width: '',
          align: 'left',
          fixed: false,
          sortable: false
        }, {
          __config__: {
            layout: 'raw',
            tag: 'el-table-column',
            renderKey: 15957617660151,
            colType: '1', //默认是普通列
          },
          prop: 'name',
          label: '名称',
          'show-overflow-tooltip': true,
          width: '',
          align: 'left',
          fixed: false,
          sortable: false
        },
        {
          __config__: {
            layout: 'raw',
            tag: 'el-table-column',
            renderKey: 1595774496335,
            colType: '4', //操作列
            children: [{
              __config__: {
                label: '按钮',
                tag: 'el-button',
                tagIcon: 'button',
                layout: 'raw',
                eventName: 'eventName' + Math.floor(Math.random() * 20),
                renderKey: 1595779809901
              },
              __slot__: {
                default: '编辑'
              },
              type: 'primary',
              // icon: 'el-icon-search',
              round: false,
              size: 'mini'
            }]
          },
          width: '80px',
          label: '操作'
        }

      ]
    },
    data: [], //这个属性是是为了预览才设置的，真正生成代码时不用这个属性
    //directives 是为该组件添加一些动作指令，如：加载效果，后期可能还会增加其他动作
    directives: [{
      name: 'loading',
      value: true
    }],
    border: true,
    type: 'default',
    justify: 'start',
    align: 'top',
    style: "width: 100%",
    'v-loading': "table" + Math.floor(Math.random() * 20) + 'Loading',
    ref: "table" + Math.floor(Math.random() * 20),
  },
  {
    __config__: {
      label: '分页',
      changeTag: true,
      tag: 'el-pagination',
      tagIcon: 'pagination',
      showLabel: false, //
      hideComponent: false, //是否影藏组件
      labelWidth: null, //
      span: 24,
      layout: 'colFormItem', //
      document: 'https://element.eleme.cn/#/zh-CN/component/pagination',
      forData: {
        //用于在vue生命周期中data里展示的字段
        'pageSize': 10, //每页显示条目个数，支持 .sync 修饰符
        total: 0, //总条目数
        'currentPage': 1, //当前页码，支持 .sync 修饰符
        rowsKey: 'rows', //每页显示条目个数 key名称
        pageKey: 'page', //当前页码 key名称
        totalKey: 'total', //总条数 key名称
      },
      eventName: {
        sizeChange: 'sizeChange' + Math.floor(Math.random() * 20), //改变每页条数的事件名称
        currentChange: 'currentChange' + Math.floor(Math.random() * 20), //改变页码的事件名称
      },
    },
    small: false, //小型分页，间距会紧凑一点
    background: false, //是否为分页按钮添加背景色
    'page-size': 10, //每页显示条目个数，支持 .sync 修饰符
    // 'page-sizes': [10, 20, 50, 100], //每页显示个数选择器的选项设置
    total: 0, //总条目数
    'pager-count': 7, //页码按钮的数量，当总页数超过该值时会折叠,可选值：大于等于 5 且小于等于 21 的奇数；默认值： 7
    'current-page': 1, //当前页码，支持 .sync 修饰符
    layout: "sizes, prev, pager, next, jumper",
  },
]
