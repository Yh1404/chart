<script setup>
import { reactive, watch } from "vue"
import cloneDeep from "lodash/cloneDeep"
const emits = defineEmits(["change"])
const props = defineProps({
	data: {
		type: Object,
	},
})
const state = reactive({
	group: cloneDeep(props.data.group),
	index: props.data.index,
	name: props.data.name,
})

watch(
	() => state.group,
	val => {
		emits("change", val, state.index)
	},
	{ deep: true }
)

function addRow() {
	state.group.push({ name: "", value: "" })
}
</script>
<template>
	<div class="data-group">
		<div class="group-name">{{ state.name }}</div>
		<div class="data-group-inner">
			<div class="data-group-row" v-for="(row, index) in state.group" :key="index">
				<a-input v-model:value="row.name" placeholder="名称" v-focus v-if="state.index === 0"></a-input>
				<a-input v-model:value="row.value" placeholder="值" @pressEnter="addRow" v-focus></a-input>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.data-group {
	.group-name {
		color: #ccc;
		font-size: 12px;
		margin: 10px 0;
		&::before {
			content: "——";
		}
		&::after {
			content: "——";
		}
	}
	&-inner {
		margin-top: 5px;
	}
	&-row {
		display: flex;
		margin-bottom: 5px;
		& input[placeholder="名称"] {
			width: 40%;
			margin-right: 5px;
		}
	}
}
</style>
