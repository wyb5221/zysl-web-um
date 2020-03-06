import axios from '../axios'

/*
 * 微服务管理模块
 */

// 保存
export const save = (data) => {
    return axios({
        url: '/sysService/save',
        method: 'post',
        data
    })
}
// 删除
export const batchDelete = (data) => {
    return axios({
        url: '/sysService/delete',
        method: 'post',
        data
    })
}
// 分页查询
export const findPage = (data) => {
    return axios({
        url: '/sysService/findPage',
        method: 'post',
        data
    })
}

// 生成jwt
export const createJwt = (data) => {
  return axios({
    url: '/sysService/getJwt',
    method: 'post',
    data
  })
}
