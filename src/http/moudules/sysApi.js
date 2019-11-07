import axios from '../axios'

/*
 * 系统api管理模块
 */

// 保存
export const save = (data) => {
    return axios({
        url: '/sysApi/save',
        method: 'post',
        data
    })
}
// 删除
export const batchDelete = (data) => {
    return axios({
        url: '/sysApi/delete',
        method: 'post',
        data
    })
}
// 分页查询
export const findPage = (data) => {
    return axios({
        url: '/sysApi/findPage',
        method: 'post',
        data
    })
}
