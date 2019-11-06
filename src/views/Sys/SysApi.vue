<template>
  <div class="page-container">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
				<kt-button :label="$t('action.search')" perms="sys:sysApi:view" type="primary" @click="findPage(null)"/>
			</el-form-item>
			<el-form-item>
				<kt-button :label="$t('action.add')" perms="sys:sysApi:add" type="primary" @click="handleAdd" />
			</el-form-item>
		</el-form>
	</div>
	<!--表格内容栏-->
	<kt-table permsEdit="sys:sysApi:edit" permsDelete="sys:sysApi:delete"
		:data="pageResult" :columns="columns"
		@findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
	</kt-table>
	<!--新增编辑界面-->
	<el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="editDialogVisible" :close-on-click-modal="false">
		<el-form :model="dataForm" label-width="100px" :rules="dataFormRules" ref="dataForm" :size="size">
			<el-form-item label="id" prop="id"  v-if="dataForm.isPrimaryKey">
				<el-input v-model="dataForm.id" auto-complete="off"></el-input>
			</el-form-item>
			<!--<el-form-item label="微服务主键" prop="serviceKey">
				<el-input v-model="dataForm.serviceKey" auto-complete="off"></el-input>
			</el-form-item>-->
      <el-form-item label="所属微服务" prop="serviceKey">
        <BaseSelector ref="serviceBaseSelector" v-model="dataForm.serviceKey" :isForbidden="!operation" :options="serviceList" @selectChangeEvent = "serviceSelectChanged"></BaseSelector>
      </el-form-item>
			<el-form-item label="接口名称" prop="name">
				<el-input v-model="dataForm.name" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="接口地址url" prop="url">
				<el-input v-model="dataForm.url" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="接口类型" prop="apiType">
				<el-input v-model="dataForm.apiType" auto-complete="off" placeholder="接口类型：R读 W写"></el-input>
			</el-form-item>
			<el-form-item label="权限类型" prop="authType" >
				<el-input v-model="dataForm.authType" auto-complete="off" placeholder="权限类型：N 无需控制；L 登录控制； R 权限控制"></el-input>
			</el-form-item>
			<el-form-item label="接口描述" prop="remark">
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
import BaseSelector from "@/components/BaseSelector"
import { format } from "@/utils/datetime"
export default {
	components:{
			KtTable,
			KtButton,
      BaseSelector
	},
	data() {
		return {
			size: 'small',
			filters: {
          name: ''
			},
			columns: [
				{prop:"id", label:"id", minWidth:100},
				/*{prop:"serviceKey", label:"微服务表主键", minWidth:100},*/
				{prop:"name", label:"接口名称", minWidth:100},
				{prop:"url", label:"接口地址url", minWidth:100},
				{prop:"apiType", label:"接口类型", minWidth:100},
				{prop:"authType", label:"权限类型", minWidth:100},
				{prop:"remark", label:"接口描述", minWidth:100},
			],
			pageRequest: { pageNum: 1, pageSize: 8 },
      servicePageRequest:{ pageNum: 1, pageSize: 999 },
			pageResult: {},

			operation: false, // true:新增, false:编辑
			editDialogVisible: false, // 新增编辑界面是否显示
			editLoading: false,
			dataFormRules: {
				label: [
					{ required: true, message: '请输入名称', trigger: 'blur' }
				]
			},
        serviceList:[],
			// 新增编辑界面数据
			dataForm: {
				id: null,
				serviceKey: null,
				name: null,
				url: null,
				apiType: null,
				authType: null,
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
			this.pageRequest.columnFilters = {name: {name:'name', value:this.filters.name}}
			this.$api.sysApi.findPage(this.pageRequest).then((res) => {
				this.pageResult = res.data
			}).then(data!=null?data.callback:'')
		},
      // 加载微服务信息
    findServices: function () {
        this.$api.sysService.findPage(this.servicePageRequest).then((res) => {
            this.serviceList = res.data.content
        })
      },
		// 批量删除
		handleDelete: function (data) {
			this.$api.sysApi.batchDelete(data.params).then(data!=null?data.callback:'')
		},
		// 显示新增界面
		handleAdd: function () {
			this.editDialogVisible = true
			this.operation = true
			this.dataForm = {
				id: '',
				serviceKey: '',
				name: '',
				url: '',
				apiType: '',
				authType: '',
				remark: '',
				createBy: '',
				createTime: '',
				lastUpdateBy: '',
				lastUpdateTime: '',
				delFlag: '',
			}
      if(this.$refs.serviceBaseSelector != null && this.$refs.serviceBaseSelector!='undefined'){
          this.$refs.serviceBaseSelector.setSelectOptionNum(this.dataForm.serviceKey)
      }
		},
		// 显示编辑界面
		handleEdit: function (params) {
			this.editDialogVisible = true
			this.operation = false
			this.dataForm = Object.assign({}, params.row)
      if(this.$refs.serviceBaseSelector != null && this.$refs.serviceBaseSelector!='undefined'){
          this.$refs.serviceBaseSelector.setSelectOptionNum(this.dataForm.serviceKey)
      }
		},
		// 编辑
		submitForm: function () {
			this.$refs.dataForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true
						let params = Object.assign({}, this.dataForm)
						this.$api.sysApi.save(params).then((res) => {
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
    },  
    serviceSelectChanged:function(serviceId){
        this.dataForm.serviceKey = serviceId
    }
	},
	mounted() {
	},
  created() {
      this.findServices()
  }
}
</script>

<style scoped>

</style>
