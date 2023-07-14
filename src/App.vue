<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from "vue"
import { CHART_TYPES, AXIS_TYPE } from "@/static/const"
import ControlArea from "./components/ControlArea.vue"
import { InboxOutlined } from "@ant-design/icons-vue"
import DataArea from "./components/DataArea.vue"
import { message } from "ant-design-vue"
import * as echarts from "echarts"
import * as xlsx from "xlsx"
import { markRaw } from "vue"
import Big from "big.js"
import MonthlyBill from "./components/MonthlyBill.vue"

const modalContainer = ref(null)
const state = reactive({
	echart: null,
	dataSource: {
		groups: [],
		groupsName: [],
		chartType: CHART_TYPES.BAR,
	},
	fileData: [],
	options: {
		xAxis: {},
		series: [],
		yAxis: {},
		pieRadius: 50,
	},
	visible: false,
	filterDrawVisible: false,
	billVisible: false,
	filterOptions: {
		minValueLt: {
			value: 1000,
			use: false,
		},
	},
	currentCustomer: "",
})

const tableConf = computed(() => {
	let data = state.fileData[0] || []
	const tableHeader = Object.keys(data)
	const tableData = state.fileData.map(item => Object.values(item))
	return { tableHeader, tableData }
})

const customerMonthlyBills = computed(() => {
	return state.fileData.filter(item => item["客户名"] === state.currentCustomer)
})
const monthlyCustomers = computed(() => {
	let result = [],
		data = state.fileData
	for (let i = 0, len = data.length; i < len; i++) {
		const cus = data[i]["客户名"]
		if (cus && result.indexOf(cus) < 0) {
			result.push(cus)
		}
	}
	return result
})

watch(
	() => state.filterOptions,
	() => {
		updateChart(state.dataSource.groups)
	},
	{ deep: true }
)

watch(
	() => state.dataSource.groups,
	val => {
		if (val) {
			updateChart(val)
		}
	},
	{ deep: true }
)

function downloadImg() {
	const a = document.createElement("a")
	a.download = "图表"
	a.href = state.echart.getDataURL()
	a.click()
	a.remove()
}

function getBarOrLineOptions(val, type) {
	let series = []
	let xAxisData = []
	// 遍历每组数据
	for (let i = 0; i < val.length; i++) {
		let seriesItem = {
			data: [],
			type: type === CHART_TYPES.BAR ? CHART_TYPES.BAR : CHART_TYPES.LINE,
			showBackground: true,
			name: state.dataSource.groupsName[i],
			label: state.options.label,
		}

		// 遍历组数据中每行
		let groupData = val[i]
		for (let j = 0; j < groupData.length; j++) {
			let { name, value } = groupData[j]
			if (value) {
				seriesItem.data.push(value)
				// 取第一组数据中的name为xAxisData
				!i && xAxisData.push(name)
			}
		}

		series.push(seriesItem)
	}
	return { series, xAxis: { ...state.options.xAxis, data: xAxisData } }
}

/**
 * @param {Array<Array<{ name: string, value: string }>>} groups 数据源
 * @param { {[key:string]: { use: boolean, value: number }} } options 筛选项
 */
function filterData(groups, options = {}) {
	let filterMinVal = groups => {
		const minLtOption = options.minValueLt
		if (minLtOption && minLtOption.use) {
			groups = groups.map(g => g.filter(i => i.value >= minLtOption.value))
		}
		return groups
	}
	groups = filterMinVal(groups)
	return groups
}

function getPieOptions(val) {
	let pieData = val[0] // 饼图只取第一组数据
	let series = [
		{
			type: CHART_TYPES.PIE,
			data: pieData,
			radius: state.options.pieRadius + "%",
			top: state.options.pieTop + "%",
			left: state.options.pieLeft + "%",
			label: {
				formatter: "{b} {c} \n {d}%",
			},
		},
	]
	return { series, xAxis: { show: false }, yAxis: { show: false } }
}

function handleChangeOption(val) {
	state.dataSource.chartType = val.chartType
	let options = state.options
	state.options = {
		...options,
		...val,
		xAxis: {
			...options.xAxis,
			...val.xAxis,
		},
		yAxis: {
			...options.yAxis,
			...val.yAxis,
		},
	}

	updateChart(state.dataSource.groups)
}

function getOptions(val) {
	const cType = state.dataSource.chartType
	let options = state.options
	val = filterData(val, state.filterOptions)
	let newOpt = {}
	switch (cType) {
		case CHART_TYPES.BAR:
			newOpt = getBarOrLineOptions(val, CHART_TYPES.BAR)
			break
		case CHART_TYPES.LINE:
			newOpt = getBarOrLineOptions(val, CHART_TYPES.LINE)
			break
		case CHART_TYPES.PIE:
			newOpt = getPieOptions(val, CHART_TYPES.LINE)
			break
		case CHART_TYPES.BARORLINE:
			let barOpt = getBarOrLineOptions(val, CHART_TYPES.BAR)
			let lineOpt = getBarOrLineOptions(val, CHART_TYPES.LINE)

			newOpt = {
				...barOpt,
				...lineOpt,
				series: barOpt.series.concat(lineOpt.series),
			}
			break
		default:
			break
	}

	return {
		...options,
		...newOpt,
	}
}

/**
 * @param {Array<Array<{ name: string, value: string }>>} data 数据源 groups
 */
function updateChart(data) {
	const options = getOptions(data)
	if (!options.series.length) return
	state.echart && state.echart.setOption(options, { notMerge: true })
	state.options = options
}

function handleUploadChange({ file }) {
	if (file) {
		state.file = file
		const reader = new FileReader()
		reader.readAsArrayBuffer(file)
		reader.onload = () => {
			const wb = xlsx.read(reader.result)
			const sheet = wb.Sheets[wb.SheetNames[0]]
			const jsonData = xlsx.utils.sheet_to_json(sheet, { blankrows: false, defval: "" })
			state.fileData = filterFileData(jsonData)
		}
	}
}

function getCustomerBill(cutomerName) {
	state.currentCustomer = cutomerName
	state.billVisible = true
}

const billTime = computed(() => {
	if (props.bills && props.bills.length) {
		const time = props.bills[0]["日期"].split(".")
		return time.length === 3 ? time.slice(0, 2).join(".") : time
	}
	return ""
})
function exportMonthlyBill() {
	let time = state.fileData[0]["日期"].split(".").slice(0, 2).join(".")
	let billEl = document.querySelector("#customer-monthly-bill")
	const worksheet = xlsx.utils.table_to_book(billEl, { raw: false })
	xlsx.writeFileXLSX(worksheet, `${state.currentCustomer}${time}对账单.xlsx`)
}

function importMonthlyCustomerWeight() {
	const result = {}
	const data = state.fileData
	if (!data || !data.length) {
		message.info("请先导入数据")
		return
	}
	for (let i = 0, len = data.length; i < len; i++) {
		let row = data[i]
		const customer = row["客户名"] || row["客户"]
		const weight = new Big(+row["重量KG"])
		if (result[customer]) {
			result[customer] = result[customer].plus(weight)
		} else if (customer && !result[customer]) {
			result[customer] = weight
		} else {
			result["现金VIP"] = result["现金VIP"] ? result["现金VIP"].plus(weight) : weight
		}
	}
	big2NumberObj(result)

	importData(result)

	state.visible = false
}

function importMonthlySaleCate() {
	const result = {}
	const data = state.fileData
	if (!data || !data.length) {
		message.info("请先导入数据")
		return
	}
	for (let i = 0, len = data.length; i < len; i++) {
		let row = data[i]
		const cate = row["类别"]
		const weight = new Big(+row["重量KG"])
		if (cate && result[cate]) {
			result[cate] = result[cate].plus(weight)
		} else if (cate && !weight.eq(0)) {
			result[cate] = weight
		}
	}

	big2NumberObj(result)

	importData(result)

	state.visible = false
}

/**
 * @param {*} result [ { key: '', value } ] => [[{ name: '', value: '' }]] 转换成groups的结构并赋值
 */
let importData = (result, seriesname) => {
	state.dataSource.groups = [
		Object.keys(result).map(key => {
			return { name: key, value: result[key] }
		}),
	]
	state.dataSource.groupsName.push(seriesname || "组别1")
}
let big2NumberObj = obj => {
	for (let key in obj) {
		obj[key] = obj[key].toNumber()
	}
	return obj
}
let filterFileData = arr => {
	const res = []
	for (let i = 0, len = arr.length; i < len; i++) {
		let item = arr[i]
		const obj = {}
		if (item["单号"]) {
			for (let key in item) {
				// 重量列被解析成单价了
				if (key === "单价") {
					obj["重量KG"] = item[key]
				}
				// 由于合并单元格，单价列名解析为EMPTY
				else if (key === "__EMPTY") {
					obj["单价"] = item[key]
				}
				// 去除多余列
				else if (key && (!key.startsWith("__EMPTY") || item[key])) {
					obj[key] = item[key]
				}
			}
			res.push(obj)
		}
	}
	return res
}
let listener = () => {
	state.echart && state.echart.resize()
}

onMounted(() => {
	let el = document.getElementById("chart-container")
	state.echart = markRaw(echarts.init(el))
	window.addEventListener("resize", listener)
})
onUnmounted(() => {
	window.removeEventListener("resize", listener)
})
</script>

<template>
	<div class="container" ref="modalContainer">
		<data-area
			v-model:groups="state.dataSource.groups"
			v-model:chartType="state.dataSource.chartType"
			v-model:groupsName="state.dataSource.groupsName"
			@openUploadModal="state.visible = true"
			@openFilterDraw="state.filterDrawVisible = true"
		></data-area>

		<div class="chart-view" id="chart-container"></div>

		<control-area @change="handleChangeOption" @download="downloadImg" :chartType="state.dataSource.chartType"></control-area>

		<a-modal v-model:visible="state.visible" style="top: 30px" :getContainer="modalContainer" :footer="null" title="导入数据" width="80%">
			<a-upload-dragger
				name="file"
				@change="handleUploadChange"
				:maxCount="1"
				:showUploadList="false"
				:beforeUpload="() => false"
				accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
			>
				<p class="ant-upload-drag-icon">
					<inbox-outlined></inbox-outlined>
				</p>
				<p class="ant-upload-text">点击或拖拽文件到此位置</p>
				<p class="ant-upload-hint">支持表格类型文件</p>
			</a-upload-dragger>

			<div class="table-wrapper mt20">
				<table class="sell-table">
					<thead>
						<tr>
							<th v-for="item in tableConf.tableHeader">
								{{ item }}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in tableConf.tableData">
							<td v-for="cell in item">
								{{ typeof cell === "number" ? cell.toFixed(2) : cell }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<a-space class="mt15">
				<a-button @click="importMonthlyCustomerWeight" type="primary">导入月度客户购买重量数据</a-button>
				<a-button type="primary" @click="importMonthlySaleCate">导入月度销售品种数据</a-button>
				<a-button type="primary">导入月度销售额数据</a-button>
				<a-popover title="选择客户" trigger="click" :transitionName="{}">
					<template #content>
						<div
							:style="{
								display: 'flex',
								flexWrap: 'wrap',
								width: '600px',
							}"
						>
							<a-button v-for="cus in monthlyCustomers" @click="getCustomerBill(cus)" :style="{ marginLeft: '5px', marginBottom: '5px' }">
								{{ cus }}
							</a-button>
						</div>
					</template>
					<a-button type="primary">生成客户对账单</a-button>
				</a-popover>
			</a-space>
		</a-modal>
		<a-modal
			v-model:visible="state.billVisible"
			style="top: 30px"
			:getContainer="modalContainer"
			@ok="exportMonthlyBill"
			okText="导出"
			width="80%"
			:title="`${state.currentCustomer}对账单`"
			:zIndex="10000"
		>
			<MonthlyBill v-if="state.currentCustomer" :bills="customerMonthlyBills"> </MonthlyBill>
		</a-modal>
		<a-drawer v-model:visible="state.filterDrawVisible" title="筛选数据" placement="right">
			<div class="option-item">
				<div>
					<span>最小显示值</span>
					<a-checkbox class="ml8" v-model:checked="state.filterOptions.minValueLt.use">启用</a-checkbox>
				</div>
				<a-slider v-model:value="state.filterOptions.minValueLt.value" :disabled="!state.filterOptions.minValueLt.use" :step="50" :max="10000" />
			</div>
		</a-drawer>
	</div>
</template>

<style lang="scss">
.container {
	display: flex;
	width: 100%;
	.chart-view {
		flex: 1;
	}
	.table-wrapper {
		max-height: 400px;
		overflow: auto;
		.sell-table {
			font-family: Arial, Helvetica, sans-serif;
			border-collapse: collapse;
			width: 100%;
			td,
			th {
				border: 1px solid #ddd;
				padding: 8px;
			}

			tr:nth-child(even) {
				background-color: #f2f2f2;
			}

			tr:hover {
				background-color: #ddd;
			}

			th {
				padding-top: 12px;
				padding-bottom: 12px;
				text-align: left;
				background-color: #04aa6d;
				color: white;
			}
		}
	}
}
</style>
