<template>
  <div class="page-container">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
				<kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:menu:view" type="primary" @click="findTreeData(null)"/>
			</el-form-item>
			<el-form-item>
				<kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:menu:add" type="primary" @click="handleAdd"/>
			</el-form-item>
		</el-form>
	</div>
	<!--表格树内容栏-->
    <el-table :data="tableTreeDdata" stripe size="mini" style="width: 100%;"
      rowKey="id" v-loading="loading" element-loading-text="$t('action.loading')">
      <el-table-column
        prop="id" header-align="center" align="center" width="80" label="ID">
      </el-table-column>
      <table-tree-column
        prop="name" header-align="center" treeKey="id" width="150" label="菜单名称">
      </table-tree-column>
      <table-tree-column
        prop="infoName" header-align="center" width="150" label="系统名称">
      </table-tree-column>
      <el-table-column header-align="center" align="center" label="图标">
        <template slot-scope="scope">
          <i :class="scope.row.icon || ''"></i>
        </template>
      </el-table-column>
      <el-table-column prop="type" header-align="center" align="center" label="类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 0" size="small">目录</el-tag>
          <el-tag v-else-if="scope.row.type === 1" size="small" type="success">菜单</el-tag>
          <el-tag v-else-if="scope.row.type === 2" size="small" type="info">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="parentName" header-align="center" align="center" width="120" label="上级菜单">
      </el-table-column>
      <el-table-column
        prop="url" header-align="center" align="center" width="150"
        :show-overflow-tooltip="true" label="菜单URL">
      </el-table-column>
      <el-table-column
        prop="perms" header-align="center" align="center" width="150"
        :show-overflow-tooltip="true" label="授权标识">
      </el-table-column>
      <el-table-column
        prop="orderNum" header-align="center" align="center" label="排序">
      </el-table-column>
      <el-table-column
        fixed="right" header-align="center" align="center" width="300" :label="$t('action.operation')">
        <template slot-scope="scope">
          <kt-button v-show="scope.row.type===1" icon="fa fa-edit" :label="$t('action.bindSysApi')" perms="sys:menu:edit" @click="handleBindApi(scope.row)"/>
          <kt-button icon="fa fa-edit" :label="$t('action.edit')" perms="sys:menu:edit" @click="handleEdit(scope.row)"/>
          <kt-button icon="fa fa-trash" :label="$t('action.delete')" perms="sys:menu:delete" type="danger" @click="handleDelete(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增修改界面 -->
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="submitForm()"
        label-width="80px" :size="size" style="text-align:left;">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="dataForm.type">
            <el-radio v-for="(type, index) in menuTypeList" :label="index" :key="index">{{ type }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="menuTypeList[dataForm.type] + '名称'" prop="name">
          <el-input v-model="dataForm.name" :placeholder="menuTypeList[dataForm.type] + '名称'"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentName">
            <popup-tree-input
              :data="popupTreeData" :props="popupTreeProps" :prop="dataForm.parentName==null||dataForm.parentName==''?'顶级菜单':dataForm.parentName"
              :nodeKey="''+dataForm.parentId" :currentChangeHandle="handleTreeSelectChange">
            </popup-tree-input>
        </el-form-item>
        <el-form-item v-if="dataForm.type !== 0" label="授权标识" prop="perms">
          <el-input v-model="dataForm.perms" placeholder="如: sys:user:add, sys:user:edit, sys:user:delete"></el-input>
        </el-form-item>
        <el-form-item v-if="dataForm.type === 1" label="菜单路由" prop="url">
          <el-row>
            <el-col :span="22">
                <el-input v-model="dataForm.url" placeholder="菜单路由"></el-input>
            </el-col>
            <el-col :span="2" class="icon-list__tips">
                <el-tooltip placement="top" effect="light" style="padding: 10px;">
                  <div slot="content">
                    <p>URL格式：</p>
                    <p>1.常规业务开发的功能URL，如用户管理，Views目录下页面路径为 /Sys/User, 此处填写 /sys/user。</p>
                    <p>2.嵌套外部网页，如通过菜单打开百度网页，此处填写 http://www.baidu.com，http:// 不可省略。</p>
                    <p>示例：用户管理：/sys/user 嵌套百度：http://www.baidu.com 嵌套网页：http://127.0.0.1:8000</p></div>
                  <i class="el-icon-warning"></i>
                </el-tooltip>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item v-if="dataForm.type !== 2" label="排序编号" prop="orderNum">
          <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序编号"></el-input-number>
        </el-form-item>
        <el-form-item v-if="dataForm.type !== 2" label="菜单图标" prop="icon">
          <el-row>template
            <el-col :span="22">
              <el-input v-model="dataForm.icon" v-popover:iconListPopover :readonly="false" placeholder="菜单图标名称（如：fa fa-home fa-lg）" class="icon-list__input"></el-input>
            </el-col>
            <el-col :span="2" class="icon-list__tips">
              <fa-icon-tooltip />
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :size="size"  @click="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size"  type="primary" @click="submitForm()">{{$t('action.comfirm')}}</el-button>
      </span>
    </el-dialog>

    <!-- 绑定api界面 -->
    <el-dialog :title="'接口绑定'" width="40%" :visible.sync="bindApidialogVisible" :close-on-click-modal="false">
      <el-form :model="bindApiDataForm" :rules="dataRule" ref="bindApiDataForm"
               label-width="80px" :size="size" style="text-align:left;">
        <el-form-item label="服务" prop="serviceKeyQuery">
          <BaseSelector ref="serviceBaseSelector"
                        v-model="bindApiDataForm.serviceKeyQuery" :options="bindApiDataForm.serviceList"
                        @selectChangeEvent = "serviceSelectChanged"></BaseSelector>
        </el-form-item>
        <el-form-item label="接口名称" prop="sysApiNameQuery">
          <el-input v-model="bindApiDataForm.sysApiNameQuery" placeholder="按接口名称模糊查询接口列表"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="sysApiQueryClick">查询</el-button>
          <!--<el-button @click="addApiBindClick">新增</el-button>-->
         <!-- <el-button @click="deleteApiClick">删除</el-button>-->
          <el-button :size="size"  @click="bindApidialogVisible = false">{{$t('action.cancel')}}</el-button>
        </el-form-item>
        <el-divider>未绑定列表--<el-button @click="addApiBindClick">绑定所选接口</el-button></el-divider>
        <!--未绑定的api列表-->
        <kt-table permsEdit="sys:menu:edit" permsDelete="sys:menu:delete"
                  :data="bindApiDataForm.unBindApiList" :columns="apiListColumns" :showPagination="false" :showOperation="false"
                  :showSelection="true" @selectionChange="bindApiSelectionChange"
                  @findPage="findApiList" >
        </kt-table>
        <!--已绑定的api列表-->
        <el-divider>已绑定列表--<el-button @click="deleteApiClick">解绑所选接口</el-button></el-divider>
        <kt-table permsEdit="sys:menu:edit" permsDelete="sys:menu:delete"
                  :data="bindApiDataForm.bindApiList" :columns="apiListColumns" :showPagination="false" :showOperation="false"
                  :showSelection="true" @selectionChange="unBindApiSelectionChange"
                  @findPage="findApiList" >
        </kt-table>
      </el-form>


    </el-dialog>
  </div>
</template>

<script>
import KtTable from "@/views/Core/KtTable";
import KtButton from "@/views/Core/KtButton";
import TableTreeColumn from "@/views/Core/TableTreeColumn";
import PopupTreeInput from "@/components/PopupTreeInput";
import FaIconTooltip from "@/components/FaIconTooltip";
import BaseSelector from "@/components/BaseSelector";
export default {
  components: {
    KtTable,
    PopupTreeInput,
    KtButton,
    TableTreeColumn,
    FaIconTooltip,
    BaseSelector
  },
  data() {
    return {
      size: "small",
      loading: false,
      filters: {
        name: ""
      },
      tableTreeDdata: [],
      dialogVisible: false,
      bindApidialogVisible: false,
      menuTypeList: ["目录", "菜单", "按钮"],
      dataForm: {
        id: 0,
        type: 1,
        name: "",
        sysKey: "",
        parentId: 0,
        parentName: "",
        url: "",
        perms: "",
        orderNum: 0,
        icon: "",
        iconList: []
      },
      bindApiDataForm: {
        id: 0,
        sysKey: "",
        serviceKeyQuery: "",
        sysApiNameQuery:"",
        serviceList:[],
        unBindApiList:{content:[]},
        bindApiList:{content:[]},
        bindApiSelections:[],
        unBindApiSelections:[]
     },
      apiListColumns: [
        {prop:"id", label:"id", minWidth:100},
        {prop:"name", label:"接口名称", minWidth:100},
      ],
      dataRule: {
        name: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }]
      },
      popupTreeData: [],
      popupTreeProps: {
        label: "name",
        children: "children"
      }
    };
  },
  methods: {
    // 获取数据
    findTreeData: function(data) {
      this.loading = true;
      let infoName = this.filters.name;
      this.$api.menu.findMenuTree({"infoName": this.filters.name}).then(res => {
        this.tableTreeDdata = res.data;

        this.$api.menu.findInfoMenuTree().then(infoRes => {
            this.popupTreeData = infoRes.data;
            //this.getParentMenuTree(infoRes.data);
        });
        this.loading = false;
      });
    },
    // 获取上级菜单树
    getParentMenuTree: function(tableTreeDdata) {
      let parent = {
        parentId: 0,
        name: "请选择系统",
        children: tableTreeDdata
      };
      return [parent];
    },
    // 显示新增界面
    handleAdd: function() {
      this.dialogVisible = true;
      this.dataForm = {
        id: 0,
        type: 1,
        typeList: ["目录", "菜单", "按钮"],
        name: "",
        parentId: 0,
        parentName: "",
        syskey: "",
        url: "",
        perms: "",
        orderNum: 0,
        icon: "",
        iconList: []
      };
    },
    // 显示编辑界面
    handleEdit: function(row) {
      this.dialogVisible = true;
      Object.assign(this.dataForm, row);
    },
    //显示绑定api界面
    handleBindApi: function(row) {
        //服务下拉列表绑定
        this.$api.menu.findServicesBySysKey({"sysKey": row.sysKey}).then(res => {
            this.bindApidialogVisible = true;
            Object.assign(this.bindApiDataForm, row);
            this.bindApiDataForm.serviceKeyQuery = row.sysKey;
            this.bindApiDataForm.serviceList = res.data.content
        });

    },
    bindApiSelectionChange:function(selections){
      this.bindApiDataForm.bindApiSelections = selections;
    },
    unBindApiSelectionChange:function(selections){
        this.bindApiDataForm.unBindApiSelections = selections;
    },
    // 添加api绑定
    addApiBindClick: function () {
        let ids = this.bindApiDataForm.bindApiSelections.selections.map(item => item.id).toString()
        this.$confirm("确定添加绑定吗？", '提示：', {
            type: 'warning'
        }).then(
            ()=>{
                let params = {"bindList":[]};
                for(var i=0; i<ids.length; i++) {
                    params.bindList.push({'menuKey':this.bindApiDataForm.id,'apiKey':ids[i]})
                }
                this.$api.menu.bindApi(params).then(
                    res => {
                        if (res.code == 200) {
                            this.$message({message: '操作成功', type: 'success'})
                            sysApiQueryClick();
                        } else {
                            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                        }
                    }
                )
            }
        ).catch(() => {
        })
    },
    // 删除api绑定
    deleteApiClick: function () {
        debugger;
        let ids = this.bindApiDataForm.unBindApiSelections.selections.map(item => item.id).toString()
        this.$confirm("确定删除绑定吗？", '提示：', {
            type: 'warning'
        }).then(
            ()=>{
                let params = {"bindList":[]};
                for(var i=0; i<ids.length; i++) {
                    params.bindList.push({'menuKey':this.bindApiDataForm.id,'apiKey':ids[i]})
                }
                this.$api.menu.unbindApi(params).then(
                    res => {
                        if (res.code == 200) {
                            this.$message({message: '操作成功', type: 'success'})
                            sysApiQueryClick();
                        } else {
                            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                        }
                    }
                )
            }
        ).catch(() => {
        })
    },
    //查询api列表
    sysApiQueryClick: function(){
        this.findApiList()
    },
    findApiList: function(data){
        //api列表,包括绑定的和未绑定的
        let params = {
            "serviceKey": this.bindApiDataForm.serviceKeyQuery,
            "menuKey": this.bindApiDataForm.id,
            "name": this.bindApiDataForm.sysApiNameQuery
        }
        this.$api.menu.findApiList(params).then(res => {
            if(res.data!=null){
                this.bindApiDataForm.bindApiList.content = res.data.bindList;
                this.bindApiDataForm.unBindApiList.content = res.data.bindingList;
            }
        }).then(data!=null?data.callback:'');
    },
    serviceSelectChanged:function(serviceId){
      this.bindApiDataForm.serviceKeyQuery = serviceId
  },
    // 删除
    handleDelete(row) {
      this.$confirm("确认删除选中记录吗？", "提示", {
        type: "warning"
      }).then(() => {
        let params = this.getDeleteIds([], row);
        this.$api.menu.batchDelete(params).then(res => {
          this.findTreeData();
          this.$message({ message: "删除成功", type: "success" });
        });
      });
    },
    // 获取删除的包含子菜单的id列表
    getDeleteIds(ids, row) {
      ids.push({ id: row.id });
      if (row.children != null) {
        for (let i = 0, len = row.children.length; i < len; i++) {
          this.getDeleteIds(ids, row.children[i]);
        }
      }
      return ids;
    },
    // 菜单树选中
    handleTreeSelectChange(data, node) {
      this.dataForm.sysKey = data.sysKey;
      this.dataForm.parentId = data.id;
      this.dataForm.parentName = data.name;
    },
    // 图标选中
    iconActiveHandle(iconName) {
      this.dataForm.icon = iconName;
    },
    // 表单提交
    submitForm() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            let params = Object.assign({}, this.dataForm);
            this.$api.menu.save(params).then(res => {
              this.editLoading = false;
              if (res.code == 200) {
                this.$message({ message: "操作成功", type: "success" });
                this.$refs["dataForm"].resetFields();
                this.dialogVisible = false;
              } else {
                this.$message({
                  message: "操作失败, " + res.msg,
                  type: "error"
                });
              }
              this.findTreeData();
            });
          });
        }
      });
    }
  },
  mounted() {
    this.findTreeData();
  }
};
</script>

<style scoped>
</style>
