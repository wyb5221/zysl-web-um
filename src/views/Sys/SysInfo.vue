<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.search')" perms="sys:sysInfo:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.add')" perms="sys:sysInfo:add" type="primary" @click="handleAdd" />
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table permsEdit="sys:sysInfo:edit" permsDelete="sys:sysInfo:delete"
              :data="pageResult" :columns="columns"
              @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="editDialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size" label-position="right">
        <el-form-item label="id" prop="id"  v-if="dataForm.isPrimaryKey">
          <el-input v-model="dataForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="系统编码" prop="code" v-if="operation">
          <el-input v-model="dataForm.code" auto-complete="off" placeholder="系统编码，唯一"></el-input>
        </el-form-item>
        <el-form-item label="系统名称" prop="name" >
          <el-input v-model="dataForm.name" auto-complete="off" placeholder="系统名称"></el-input>
        </el-form-item>
        <el-form-item label="系统描述" prop="remark">
          <el-input v-model="dataForm.remark" auto-complete="off" placeholder="系统描述"></el-input>
        </el-form-item>
        <el-form-item label="创建人" prop="createBy" v-if="false">
          <el-input v-model="dataForm.createBy" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime" v-if="false">
          <el-input v-model="dataForm.createTime" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="更新人" prop="lastUpdateBy" v-if="false">
          <el-input v-model="dataForm.lastUpdateBy" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="更新时间" prop="lastUpdateTime" v-if="false">
          <el-input v-model="dataForm.lastUpdateTime" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="是否删除  -1：已删除  0：正常" prop="delFlag" v-if="false">
          <el-input v-model="dataForm.delFlag" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="editDialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import KtTable from "@/views/Core/KtTable"
    import KtButton from "@/views/Core/KtButton"
    import { format } from "@/utils/datetime"
    export default {
        components:{
            KtTable,
            KtButton
        },
        data() {
            return {
                size: 'small',
                filters: {
                    name: ''
                },
                columns: [
                    {prop:"id", label:"id", minWidth:100},
                    {prop:"code", label:"系统编码", minWidth:100},
                    {prop:"name", label:"系统名称", minWidth:100},
                    {prop:"remark", label:"系统描述", minWidth:100},
                ],
                pageRequest: { pageNum: 1, pageSize: 8 },
                pageResult: {},

                operation: false, // true:新增, false:编辑
                editDialogVisible: false, // 新增编辑界面是否显示
                editLoading: false,
                dataFormRules: {
                    label: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ]
                },
                // 新增编辑界面数据
                dataForm: {
                    id: 0,
                    code: '',
                    name: '',
                    remark: '',
                    createBy: '',
                    createTime: '',
                    lastUpdateBy: '',
                    lastUpdateTime: '',
                    delFlag: '',
                }
            }
        },
        methods: {
            // 获取分页数据
            findPage: function (data) {
                if(data !== null) {
                    this.pageRequest = data.pageRequest
                }
                this.pageRequest.columnFilters = {name: {name:'name', value:this.filters.name}}
                this.$api.sysInfo.findPage(this.pageRequest).then((res) => {
                    this.pageResult = res.data
                }).then(data!=null?data.callback:'')
            },
            // 批量删除
            handleDelete: function (data) {
                this.$api.sysInfo.batchDelete(data.params).then(data!=null?data.callback:'')
            },
            // 显示新增界面
            handleAdd: function () {
                this.editDialogVisible = true
                this.operation = true
                this.dataForm = {
                    id: 0,
                    code: '',
                    name: '',
                    remark: '',
                    createBy: '',
                    createTime: '',
                    lastUpdateBy: '',
                    lastUpdateTime: '',
                    delFlag: ''
                }
            },
            // 显示编辑界面
            handleEdit: function (params) {
                this.editDialogVisible = true
                this.operation = false
                this.dataForm = Object.assign({}, params.row)

                /* let sysInfos = []
                 for(let i=0,len=params.row.userRoles.length; i<len; i++) {
                     userRoles.push(params.row.userRoles[i].roleId)
                 }
                 this.dataForm.userRoles = userRoles*/
            },
            // 编辑
            submitForm: function () {
                this.$refs.dataForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true
                            let params = Object.assign({}, this.dataForm)
                            this.$api.sysInfo.save(params).then((res) => {
                                if(res.code == 200) {
                                    this.$message({ message: '操作成功', type: 'success' })
                                } else {
                                    this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                                }
                                this.editLoading = false
                                this.$refs['dataForm'].resetFields()
                                this.editDialogVisible = false
                                this.findPage(null)
                            })
                        })
                    }
                })
            },
            // 时间格式化
            dateFormat: function (row, column, cellValue, index){
                return format(row[column.property])
            }
        },
        mounted() {
        }
    }
</script>

<style scoped>

</style>
