<script setup>
import { CHART_TYPES, AXIS_TYPE } from "@/static/const"
import { reactive, watch } from "vue"

const props = defineProps({
	chartType: {
		default: "bar",
		type: String,
	},
})
const emits = defineEmits(["change", "download"])
const state = reactive({
	axisSettingStatus: 0, // 0 => x轴， 1 => y轴
	options: {
		chartType: props.chartType,
		yAxis: {
			show: true,
			type: AXIS_TYPE.VALUE,
			axisLine: { show: true },
			name: "",
		},
		xAxis: {
			show: true,
			type: AXIS_TYPE.CATE,
			name: "",
			axisLabel: { interval: 0 },
		},
		legend: {
			show: true,
			orient: "horizontal", // horizontal | vertical
			left: "center",
			top: "30%",
		},
		grid: {
			width: "auto",
			height: "auto",
			left: "10%",
			top: "35%",
		},
		label: {
			show: true,
			position: "top",
			formatter: '{c}'
		},
		pieRadius: 50, // 不是Echart的配置项，先放在这里
		barWidth: 0, // 不是Echart的配置项，先放在这里
		pieTop: "auto", // 不是Echart的配置项，先放在这里
		pieLeft: "auto", // 不是Echart的配置项，先放在这里
	},
})
function sliderChange(num, direction) {
	const getPercent = n => `${n}%`

	const val = getPercent(num)
	switch (direction) {
		case "legendTop":
			state.options.legend.top = val
			break
		case "legendLeft":
			state.options.legend.left = val
			break
		case "gridHeight":
			state.options.grid.height = val
			break
		case "gridWidth":
			state.options.grid.width = val
			break
		case "gridTop":
			state.options.grid.top = val
			break
		case "gridLeft":
			state.options.grid.left = val
			break
		default:
			break
	}
}
watch(
	() => state.options,
	val => {
		emits("change", val)
	},
	{ deep: true, immediate: true }
)
</script>

<template>
	<div class="control-area">
		<div class="options-item">
			<span>图表类型</span>
			<div class="options-item-option">
				<a-radio-group v-model:value="state.options.chartType" button-style="solid">
					<a-radio-button value="bar">柱状图</a-radio-button>
					<a-radio-button value="line">折线图</a-radio-button>
					<a-radio-button value="pie">饼图</a-radio-button>
					<a-radio-button value="bar&line">组合图</a-radio-button>
				</a-radio-group>
			</div>
		</div>
		<div class="options-item">
			<span>宽高设置</span>
			<div class="mt-5" v-if="state.options.chartType === CHART_TYPES.PIE">
				<span>大小</span>
				<a-slider v-model:value="state.options.pieRadius" />
				<span>左侧距离</span>
				<a-slider v-model:value="state.options.pieLeft" />
				<span>顶部距离</span>
				<a-slider v-model:value="state.options.pieTop" />
			</div>
			<div class="mt-5" v-else>
				<span>宽度</span>
				<a-slider @change="args => sliderChange(args, 'gridWidth')" />
				<span>高度</span>
				<a-slider @change="args => sliderChange(args, 'gridHeight')" />
				<span>左侧距离</span>
				<a-slider @change="args => sliderChange(args, 'gridLeft')" />
				<span>顶部距离</span>
				<a-slider @change="args => sliderChange(args, 'gridTop')" />
			</div>
		</div>
		<div class="options-item">
			<span>标签设置</span>
			<div>
				<a-checkbox v-model:checked="state.options.label.show">显示</a-checkbox>
			</div>
		</div>
		<div class="options-item">
			<span>图例设置</span>
			<div>
				<a-checkbox v-model:checked="state.options.legend.show">显示</a-checkbox>
				<div class="mt5">
					方向：
					<a-radio-group v-model:value="state.options.legend.orient">
						<a-radio value="horizontal">水平</a-radio>
						<a-radio value="vertical">垂直</a-radio>
					</a-radio-group>
					<div>左侧距离</div>
					<a-slider v-model:value="state.legendLeft" @change="args => sliderChange(args, 'legendLeft')" />
					<span>顶部距离</span>
					<a-slider v-model:value="state.legendTop" @change="args => sliderChange(args, 'legendTop')" />
				</div>
			</div>
		</div>
		<div class="options-item">
			<span>坐标轴设置</span>
			<div>
				<a-radio-group v-model:value="state.axisSettingStatus" class="mt5">
					<a-radio :value="0"> 横轴</a-radio>
					<a-radio :value="1">纵轴</a-radio>
				</a-radio-group>
				<div v-show="state.axisSettingStatus" class="mt5">
					<a-checkbox v-model:checked="state.options.yAxis.show">显示</a-checkbox>
					<a-input class="mt3" v-model:value="state.options.yAxis.name" placeholder="坐标轴名称"></a-input>
				</div>
				<div v-show="!state.axisSettingStatus" class="mt5">
					<a-checkbox v-model:checked="state.options.xAxis.show">显示</a-checkbox>
					<a-input class="mt3" v-model:value="state.options.xAxis.name" placeholder="坐标轴名称"></a-input>
				</div>
			</div>
		</div>

		<a-button @click="emits('download')" type="primary" class="mt15" style="width: 100%">下载图表</a-button>
	</div>
</template>

<style lang="scss" scoped>
.control-area {
	width: 260px;
	height: 100vh;
	overflow: auto;
	padding: 0 16px 20px;
	border-left: 1px solid #ddd;
	.options-item {
		margin-top: 15px;
		&-option {
			margin-top: 8px;
		}
	}
}
</style>
