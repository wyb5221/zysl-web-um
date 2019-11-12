import axios from '../axios'

/*
 * 菜单管理模块
 */

 // 保存
export const save = (data) => {
    return axios({
        url: '/menu/save',
        method: 'post',
        data
    })
}
// 删除
export const batchDelete = (data) => {
    return axios({
        url: '/menu/delete',
        method: 'post',
        data
    })
}
// 查找导航菜单树
export const findNavTree = (params) => {
    return axios({
        url: '/menu/findNavTree',
        method: 'get',
        params
    })
}
// 查找导航菜单树
export const findMenuTree = (params) => {
    return axios({
        url: '/menu/findMenuTree',
        method: 'get',
        params
    })
}

// 查找全部系统导航菜单树
export const findInfoMenuTree = () => {
  return axios({
    url: '/menu/findInfoMenuTree',
    method: 'get'
  })
}

// 查找系统下的服务
export const findServicesBySysKey = (params) => {
  return axios({
    url: '/sysService/findBySysKey',
    method: 'get',
    params
  })
}

// 查找菜单对应的apiList
export const findApiList = (params) => {
  return axios({
    url: '/sysApi/findByKey',
    method: 'get',
    params
  })
}

// 添加菜单绑定api
export const bindApi = (data) => {
  return axios({
    url: '/sysMenuApi/bindApi',
    method: 'post',
    data
  })
}

// 删除菜单绑定api
export const unbindApi = (data) => {
  return axios({
    url: '/sysMenuApi/unbindApi',
    method: 'post',
    data
  })
}

