import ELEMENT from 'element-ui'
import stroe from '@/store/index.js'

export function sortRule(a, b) {
  return a.id - b.id;
}
/**
 * 
 * @param {*} el 
 * @param {*} type 
 * @param {*} getAwConfig 
 *2个功能：
 1、 获取配置项对象
 2、获取指定属性
 */
export function handlerChangeEvent(el, type, getAwConfig) {
  //查找是否有下拉框，且该下拉框是否有change事件并关联了input组件
  let associatedWordList = []; //受哪些下拉框控制，一般只有一个
  stroe.state.confGlobal.fields.map(o => {
    //为真，说明这个下拉组件存在关联字段
    if (o.__config__.associatedWord && o.__config__.associatedWord.length) {
      //遍历关联字段
      o.__config__.associatedWord.filter(m => m.__config__.formId == el.__config__.formId ? associatedWordList.push(m) : '');
    }
  });
  // console.log(associatedWordList);
  if (!associatedWordList.length) return;
  let __config__ = associatedWordList[0].__config__;
  if (getAwConfig == 'getAwConfig') return __config__.associatedWordConfig; //是否获取配置项
  return type in __config__.associatedWordConfig ? __config__.associatedWordConfig[type] : false; //是否存在该配置项
}
