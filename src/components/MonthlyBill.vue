<script setup>
import { computed, reactive } from "vue"
import Big from "big.js"
const props = defineProps(["bills"])
const state = reactive({
	beforeOwe: 0, //前期尚欠
	prePay: 0, //累计预付金
	offsetPay: 0, //已冲账款

	people: "付丽芳",
})
const customer = computed(() => {
	if (props.bills && props.bills.length) {
		return props.bills[0]["客户名"]
	}
	return ""
})
const billTime = computed(() => {
	if (props.bills && props.bills.length) {
		const time = props.bills[0]["日期"].split(".")
		return time.length === 3 ? time.slice(0, 2).join(".") : time
	}
	return ""
})
const sumPrice = computed(() => {
	// 账单总额
	if (!props.bills) return
	let res = new Big(0)
	for (let i of props.bills) {
		res = res.plus(i["销售金额"])
	}
	return res.toFixed(2)
})
const amount = computed(() => {
	const { prePay, offsetPay, beforeOwe } = state
	let base = new Big(sumPrice.value)
	return base
		.plus(beforeOwe || 0)
		.minus(offsetPay || 0)
		.minus(prePay || 0)
		.toNumber()
})
</script>
<template>
	<!-- 10 columns,  n rows -->
	<table id="customer-monthly-bill" class="bill-table">
		<thead>
			<tr>
				<th colspan="10" class="table-title">东莞市莞泰工业铝材（石排公司）</th>
			</tr>
			<tr>
				<th colspan="10">地址：东莞市石排镇下沙村石横大道216号</th>
			</tr>
			<tr>
				<th colspan="10">全国销售热线：400-888-4176</th>
			</tr>
			<tr>
				<th colspan="10">对账单</th>
			</tr>
			<tr>
				<th colspan="5">客户：{{ customer }}</th>
				<th colspan="5">付款方式：{{}}</th>
			</tr>
			<tr>
				<th colspan="5">电话：</th>
				<th colspan="5">是否含税：</th>
			</tr>
			<tr>
				<th colspan="5">传真：</th>
				<th colspan="5">账单时间：{{ billTime }}</th>
			</tr>
			<tr class="table-header">
				<th>送货日期</th>
				<th>送货单号</th>
				<th>合金型号</th>
				<th>类别</th>
				<th>规格</th>
				<th>数量</th>
				<th>重量KG</th>
				<th>单价</th>
				<th>金额</th>
				<th>备注</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="order in bills">
				<td>{{ order["日期"] }}</td>
				<td>{{ order["单号"] }}</td>
				<td>{{ order["类型"] }}</td>
				<td>{{ order["类别"] }}</td>
				<td>{{ order["品名规格"] }}</td>
				<td>{{ order["数量"] }}</td>
				<td>{{ order["重量KG"] }}</td>
				<td>{{ order["单价"] }}</td>
				<td>{{ order["销售金额"].toFixed(2) }}</td>
				<td>{{ order["备注"] }}</td>
			</tr>
			<tr>
				<td colspan="2">本期未税: <a-input size="small" class="ml5 w150"></a-input></td>
				<td colspan="2">本期税金: <a-input size="small" class="ml5 w150"></a-input></td>
				<td colspan="4">本期帐款合计: {{ sumPrice }}</td>
				<td colspan="2">已冲账款: <a-input size="small" v-model:value="state.offsetPay" class="ml5 w100"></a-input></td>
			</tr>
			<tr>
				<td colspan="2">已开发票: <a-input size="small" class="ml5 w150"></a-input></td>
				<td colspan="2">前期尚欠: <a-input size="small" class="ml5 w150" v-model:value="state.beforeOwe"></a-input></td>
				<td colspan="3">累计预付金: <a-input size="small" class="ml5 w150" v-model:value="state.prePay"></a-input></td>
				<td colspan="3">累计应付: {{ amount }}</td>
			</tr>
			<tr>
				<td rowspan="3">备注</td>
				<td colspan="9">1.帐单如有异议,请三天内回传或电话沟通,逾期默认正确无误。</td>
			</tr>
			<tr>
				<td colspan="9">2．付款方式：转公帐</td>
			</tr>
			<tr>
				<td colspan="9">3.迟延付款每天按对帐金额2%计算违约金.</td>
			</tr>
			<tr>
				<td colspan="10" style="border: none">
					<p class="bottom">
						<span>客户确认回签: <a-input class="ml3" size="small"></a-input></span>
						<span>制单: <a-input value="付丽芳" class="ml3" size="small" v-model:value="state.people"></a-input></span>
						<span>日期: <a-input class="ml3" size="small"></a-input></span>
					</p>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<style lang="scss" scoped>
.bill-table {
	width: 100%;
	text-align: left;

	.table-header {
		text-align: center;
		& th {
			border: 1px solid;
		}
	}
	th {
		&.table-title {
			font-size: 20px;
			text-align: center;
		}
		font-size: 16px;
		border-bottom: 1px solid #000;
	}
	tbody {
		td {
			font-weight: normal;
			border: 1px solid #000;
			white-space: nowrap;
			height: 40px;
			& .bottom {
				display: flex;
				justify-content: space-between;
				margin-top: 10px;
				border: none;
				span {
					display: flex;
					white-space: nowrap;
					align-items: center;
				}
			}
		}
	}
}
</style>
