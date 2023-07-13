<script setup>
import { computed, reactive, watch } from "vue"
import DataGroup from "./components/DataGroup.vue"
import { PlusOutlined } from "@ant-design/icons-vue"
import { useForm } from "ant-design-vue/lib/form"
import { message } from "ant-design-vue"

const emits = defineEmits(["openUploadModal", "openFilterDraw", "update:groups", "update:groupsName"])
const props = defineProps(["groups", "groupsName", "chartType"])

const state = reactive({
	title: "",
	visible: false,
	form: {
		newName: "",
	},
	// data: cloneDeep(props.dataSource),
	rules: {
		newName: [{ required: true, message: "组名不能为空" }],
	},
})

const { validate, validateInfos, resetFields } = useForm(state.form, state.rules)

const groups = computed({
	get: () => props.groups,
	set: val => {
		emits("update:groups", val)
	},
})
const groupsName = computed({
	get: () => props.groupsName,
	set: val => {
		emits("update:groupsName", val)
	},
})

function openUploadModal() {
	state.form.newName = `组别${groups.value.length + 1}`
	state.visible = true
}

function addGroup(newName) {
	if (groupsName.value.indexOf(newName) > -1) {
		message.info("组名不能重复")
		return
	}
	validate().then(() => {
		groups.value.push([{ name: "", value: "" }])
		groupsName.value.push(newName)
		resetFields()
	})
	state.visible = false
}

function handleGroupChange(val, index) {
	groups.value.splice(index, 1, val)
}
</script>

<template>
	<div class="data-area">
		<a-input placeholder="输入图表标题" v-model="state.title"></a-input>
		<a-space direction="vertical" class="mt15" style="width: 100%">
			<a-button style="width: 100%" type="primary" @click="emits('openUploadModal')">导入数据</a-button>
			<a-button style="width: 100%" @click="emits('openFilterDraw')">过滤数据</a-button>
		</a-space>

		<div class="manual-data">
			<template v-for="(group, index) in groups" :key="index">
				<!-- 饼图只展示第一组数据 -->
				<div v-show="chartType !== 'pie' || index == 0">
					<data-group :data="{ name: groupsName[index], group, index }" @change="handleGroupChange"> </data-group>
				</div>
			</template>
			<a-button @click="openUploadModal" size="mini" type="primary" shape="circle" class="addGroup-btn">
				<template #icon><PlusOutlined /></template>
			</a-button>
		</div>

		<a-modal v-model:visible="state.visible" title="新建组" @ok="addGroup(state.form.newName)">
			<a-form>
				<a-form-item name="数据组名称" label="数据组名称：" :="validateInfos.newName">
					<a-input v-model:value="state.form.newName"></a-input>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<style scoped lang="scss">
.data-area {
	min-height: 100vh;
	width: 260px;
	padding: 16px;
	border-right: 1px solid #ddd;
	max-height: 100vh;
	overflow: auto;

	.manual-data {
		margin-top: 15px;
		border-top: 1px solid #333;
		.second-title {
			color: #ddd;
		}
		.addGroup-btn {
			margin-top: 15px;
			float: right;
		}
	}
}
</style>
