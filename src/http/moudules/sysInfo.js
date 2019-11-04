import axios from '../axios'

/*
 * 子系统管理模块
 */

// 保存
export const save = (data) => {
    return axios({
        url: '/sysInfo/save',
        method: 'post',
        data
    })
}
// 删除
export const batchDelete = (data) => {
    return axios({
        url: '/sysInfo/delete',
        method: 'post',
        data
    })
}
// 分页查询
export const findPage = (data) => {
    return axios({
        url: '/sysInfo/findPage',
        method: 'post',
        data
    })
}
// 查找用户的菜单权限标识集合
export const findPermissions = (params) => {
    return axios({
        url: '/sysInfo/findPermissions',
        method: 'get',
        params
    })
}
