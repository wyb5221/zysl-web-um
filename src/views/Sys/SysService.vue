<template>
  <div class="container" style="width:99%;margin-top:-25px;">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.label" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.search')" perms="sys:sysService:view" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button :label="$t('action.add')" perms="sys:sysService:add" type="primary" @click="handleAdd" />
        </el-form-item>
      </el-form>
    </div>
    <!--表格内容栏-->
    <kt-table permsEdit="sys:sysService:edit" permsDelete="sys:sysService:delete"
              :data="pageResult" :columns="columns"
              @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
    </kt-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="editDialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="100px" :rules="dataFormRules" ref="dataForm" :size="size">
        <el-form-item label="id" prop="id"  v-if="dataForm.isPrimaryKey">
          <el-input v-model="dataForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="系统表主键" prop="sysKey">
          <el-input v-model="dataForm.sysKey" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="微服务编号" prop="code">
          <el-input v-model="dataForm.code" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="微服务名称" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="网关编号" prop="gateCode">
          <el-input v-model="dataForm.gateCode" auto-complete="off" placeholder="网关编号，比如/gate/01,则编号为01"></el-input>
        </el-form-item>
        <el-form-item label="开发负责人" prop="developer">
          <el-input v-model="dataForm.developer" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="微服务描述" prop="remark">
          <el-input v-model="dataForm.remark" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="创建人" prop="createBy"  v-if="false">
          <el-input v-model="dataForm.createBy" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime"  v-if="false">
          <el-input v-model="dataForm.createTime" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="更新人" prop="lastUpdateBy"  v-if="false">
          <el-input v-model="dataForm.lastUpdateBy" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="更新时间" prop="lastUpdateTime"  v-if="false">
          <el-input v-model="dataForm.lastUpdateTime" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="是否删除  -1：已删除  0：正常" prop="delFlag"  v-if="false">
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
                    label: ''
                },
                columns: [
                    {prop:"id", label:"id", minWidth:100},
                    {prop:"sysKey", label:"系统表主键", minWidth:100},
                    {prop:"code", label:"微服务编号", minWidth:100},
                    {prop:"name", label:"微服务名称", minWidth:100},
                    {prop:"gateCode", label:"网关编号，比如/gate/01,则编号为01", minWidth:100},
                    {prop:"developer", label:"开发负责人", minWidth:100},
                    {prop:"remark", label:"微服务描述", minWidth:100},
                    {prop:"createBy", label:"创建人", minWidth:100},
                    {prop:"createTime", label:"创建时间", minWidth:100},
                    {prop:"lastUpdateBy", label:"更新人", minWidth:100},
                    {prop:"lastUpdateTime", label:"更新时间", minWidth:100},
                    {prop:"delFlag", label:"是否删除  -1：已删除  0：正常", minWidth:100},
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
                    id: null,
                    sysKey: null,
                    code: null,
                    name: null,
                    gateCode: null,
                    developer: null,
                    remark: null,
                    createBy: null,
                    createTime: null,
                    lastUpdateBy: null,
                    lastUpdateTime: null,
                    delFlag: null,
                }
            }
        },
        methods: {
            // 获取分页数据
            findPage: function (data) {
                if(data !== null) {
                    this.pageRequest = data.pageRequest
                }
                this.pageRequest.columnFilters = {label: {name:'label', value:this.filters.label}}
                this.$api.sysService.findPage(this.pageRequest).then((res) => {
                    this.pageResult = res.data
                }).then(data!=null?data.callback:'')
            },
            // 批量删除
            handleDelete: function (data) {
                this.$api.sysService.batchDelete(data.params).then(data!=null?data.callback:'')
            },
            // 显示新增界面
            handleAdd: function () {
                this.editDialogVisible = true
                this.operation = true
                this.dataForm = {
                    id: null,
                    sysKey:null,
                    code: null,
                    name: null,
                    gateCode: null,
                    developer: null,
                    remark: null,
                    createBy: null,
                    createTime: null,
                    lastUpdateBy: null,
                    lastUpdateTime: null,
                    delFlag: null,
                }
            },
            // 显示编辑界面
            handleEdit: function (params) {
                this.editDialogVisible = true
                this.operation = false
                this.dataForm = Object.assign({}, params.row)
            },
            // 编辑
            submitForm: function () {
                this.$refs.dataForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true
                            let params = Object.assign({}, this.dataForm)
                            this.$api.sysService.save(params).then((res) => {
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
