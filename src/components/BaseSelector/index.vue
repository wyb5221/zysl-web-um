<template>
    <el-select :disabled="isForbidden" v-model="selectItemValue" @change="selectChangedFn" placeholder="请选择" class="el-input el-input--small">
      <el-option
        v-for="item in options"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      >
      </el-option>
    </el-select>
</template>

<script>
    export default {
        name: 'BaseSelector',
        props: {
            options: {
                type: Array,
                default: () => [{
                    id: '1',
                    name: 'test1'
                }, {
                    id: '2',
                    name: 'test2'
                }]
            },
            isForbidden:{
                type:Boolean,
                default:false
            }
        },
        data() {
            return {
                selectItemValue: '',
                bindItems: []
            }
        },
        methods: {
            initData() {
                this.bindItems = this.options
                this.$emit('selectChangeEvent', this.selectItemValue)
            },
            selectChangedFn(){
                this.$emit('selectChangeEvent',this.selectItemValue)
            },
            setSelectOptionNum(sNum) {
                this.selectItemValue = sNum;
            },

        },
        created() {
            this.initData()
        }
    }
</script>

<style scoped>

</style>
