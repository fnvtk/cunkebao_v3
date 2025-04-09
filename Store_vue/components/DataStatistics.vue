<template>
	<view class="data-statistics-wrapper" >
		<view v-if="show" class="data-statistics-container" style="margin-top: var(--status-bar-height);">
			<!-- 头部 -->
			<view class="header">
				<view class="back-icon" @tap="closePage">
					<u-icon name="arrow-left" color="#333" size="26"></u-icon>
				</view>
				<view class="title">数据统计</view>
				<view class="close-icon" @tap="closePage">
					<u-icon name="close" color="#333" size="24"></u-icon>
				</view>
			</view>
			
			<!-- 概览标题和时间选择 -->
			<view class="overview-header">
				<view class="overview-title">数据概览</view>
				<view class="overview-actions">
					<view class="time-selector">
						<view class="selector-content" @tap="showDateSelector">
							<text>{{ dateRange }}</text>
							<u-icon name="arrow-down-fill" size="14" color="#666"></u-icon>
						</view>
					</view>
					<view class="custom-date-btn" @tap="showCustomDatePicker" v-if="false">
						<u-icon name="calendar" size="14" color="#666" style="margin-right: 4px;"></u-icon>
						<text>自定义</text>
					</view>
				</view>
			</view>
			
			<!-- 概览卡片 -->
			<view class="overview-grid">
				<view class="overview-item">
					<view class="overview-item-content">
						<view class="item-header">
							<text class="item-label">总客户数</text>
							<view class="item-icon blue">
								<text class="iconfont icon-yonghuqun" style="color: #0080ff; font-size: 20px;"></text>
							</view>
						</view>
						<view class="item-value">{{ overviewData.totalCustomers.toLocaleString() }}</view>
						<view class="item-change" :class="overviewData.totalCustomersChange >= 0 ? 'up' : 'down'">
							{{ (overviewData.totalCustomersChange >= 0 ? '+' : '') + overviewData.totalCustomersChange.toFixed(1) }}% 较上期
						</view>
					</view>
				</view>
				<view class="overview-item">
					<view class="overview-item-content">
						<view class="item-header">
							<text class="item-label">新增客户</text>
							<view class="item-icon green">
								<text class="iconfont icon-shuju-xinzengyonghu" style="color: #18b566; font-size: 20px;"></text>
							</view>
						</view>
						<view class="item-value">{{ overviewData.newCustomers.toLocaleString() }}</view>
						<view class="item-change" :class="overviewData.newCustomersChange >= 0 ? 'up' : 'down'">
							{{ (overviewData.newCustomersChange >= 0 ? '+' : '') + overviewData.newCustomersChange.toFixed(1) }}% 较上期
						</view>
					</view>
				</view>
				<view class="overview-item">
					<view class="overview-item-content">
						<view class="item-header">
							<text class="item-label">互动次数</text>
							<view class="item-icon orange">
								<text class="iconfont icon-xiaoxi" style="color: #ff9900; font-size: 20px;"></text>
							</view>
						</view>
						<view class="item-value">{{ overviewData.interactions.toLocaleString() }}</view>
						<view class="item-change" :class="overviewData.interactionsChange >= 0 ? 'up' : 'down'">
							{{ (overviewData.interactionsChange >= 0 ? '+' : '') + overviewData.interactionsChange.toFixed(1) }}% 较上期
						</view>
					</view>
				</view>
				<view class="overview-item">
					<view class="overview-item-content">
						<view class="item-header">
							<text class="item-label">转化率</text>
							<view class="item-icon blue">
								<text class="iconfont icon-shejihuan" style="color: #0080ff; font-size: 20px;"></text>
							</view>
						</view>
						<view class="item-value">{{ overviewData.conversionRate.toFixed(1) }}%</view>
						<view class="item-change" :class="overviewData.conversionRateChange >= 0 ? 'up' : 'down'">
							{{ (overviewData.conversionRateChange >= 0 ? '+' : '') + overviewData.conversionRateChange.toFixed(1) }}% 较上期
						</view>
					</view>
				</view>
			</view>
			
			<!-- 分段器 -->
			<view class="subsection-container">
				<u-subsection 
					:list="subsectionList" 
					:current="currentSubsection"
					@change="changeSubsection"
					mode="button"
					:activeColor="'#2979ff'"
					bgColor="#f5f7fa"
					fontSize="14"
					itemStyle="padding-left: 15px; padding-right: 15px;"
				></u-subsection>
			</view>
			
			<!-- 客户分析区域 -->
			<view v-if="currentSubsection === 0" class="analysis-content">
				<view class="analysis-grid">
					<!-- 客户增长趋势卡片 -->
					<view class="analysis-card">
						<view class="card-header">
							<text class="card-title">客户增长趋势</text>
							<text class="card-subtitle">近期客户增长数据</text>
						</view>
						<view class="card-content">
							<view class="chart-placeholder">
								<view class="trend-icon">
									<text class="iconfont icon-shuju1" style="color: #999; font-size: 50px;"></text>
								</view>
								<text class="chart-text">客户增长趋势图表</text>
							</view>
							
							<!-- 客户统计数据 -->
							<view class="customer-stats">
								<view class="customer-item">
									<view class="customer-dot" style="background-color: #0080ff;"></view>
									<text class="customer-label">总客户</text>
									<text class="customer-value">{{ customerAnalysis.trend.total.toLocaleString() }}</text>
								</view>
								<view class="customer-item">
									<view class="customer-dot" style="background-color: #19be6b;"></view>
									<text class="customer-label">新增客户</text>
									<text class="customer-value">{{ customerAnalysis.trend.new.toLocaleString() }}</text>
								</view>
								<view class="customer-item">
									<view class="customer-dot" style="background-color: #fa3534;"></view>
									<text class="customer-label">流失客户</text>
									<text class="customer-value">{{ customerAnalysis.trend.lost.toLocaleString() }}</text>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 客户来源分布卡片 -->
					<view class="analysis-card">
						<view class="card-header">
							<text class="card-title">客户来源分布</text>
							<text class="card-subtitle">不同渠道客户占比</text>
						</view>
						<view class="card-content">
							<view class="chart-placeholder">
								<view class="pie-icon">
									<text class="iconfont icon-bingtu" style="color: #999; font-size: 50px;"></text>
								</view>
								<text class="chart-text">客户来源分布图表</text>
							</view>
							
							<!-- 来源分布数据 -->
							<view class="source-distribution">
								<view v-for="(source, index) in customerAnalysis.sourceDistribution" 
									:key="index" 
									class="source-item"
								>
									<view class="source-dot" :style="{ backgroundColor: getSourceColor(index) }"></view>
									<text class="source-name">{{ source.name }}</text>
									<text class="source-value">{{ source.value }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 其他分析区域 -->
			<view v-if="currentSubsection > 0" class="analysis-content">
				<!-- 互动分析区域 -->
				<view v-if="currentSubsection === 1" class="analysis-grid">
					<!-- 互动频率分析卡片 -->
					<view class="analysis-card">
						<view class="card-header">
							<text class="card-title">互动频率分析</text>
							<text class="card-subtitle">客户互动频次统计</text>
						</view>
						<view class="card-content">
							<view class="chart-placeholder">
								<view class="chart-icon">
									<text class="iconfont icon-shujucanmou" style="color: #999; font-size: 50px;"></text>
								</view>
								<text class="chart-text">互动频率分析图表</text>
							</view>
							
							<!-- 互动频率统计 -->
							<view class="interaction-stats">
								<view class="interaction-row">
									<view class="interaction-item">
										<text class="interaction-label">高频互动</text>
										<text class="interaction-value">{{ interactionAnalysis.frequencyAnalysis.highFrequency.toLocaleString() }}</text>
									</view>
									<view class="interaction-item">
										<text class="interaction-label">中频互动</text>
										<text class="interaction-value">{{ interactionAnalysis.frequencyAnalysis.midFrequency.toLocaleString() }}</text>
									</view>
									<view class="interaction-item">
										<text class="interaction-label">低频互动</text>
										<text class="interaction-value">{{ interactionAnalysis.frequencyAnalysis.lowFrequency.toLocaleString() }}</text>
									</view>
								</view>
								<view class="interaction-row">
									<view class="interaction-item">
										<text class="interaction-label-small">每周多次互动</text>
									</view>
									<view class="interaction-item">
										<text class="interaction-label-small">每月多次互动</text>
									</view>
									<view class="interaction-item">
										<text class="interaction-label-small">偶尔互动</text>
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 互动内容分析卡片 -->
					<view class="analysis-card">
						<view class="card-header">
							<text class="card-title">互动内容分析</text>
							<text class="card-subtitle">客户互动内容类型占比</text>
						</view>
						<view class="card-content">
							<view class="chart-placeholder">
								<view class="chart-icon">
									<text class="iconfont icon-bingtu" style="color: #999; font-size: 50px;"></text>
								</view>
								<text class="chart-text">互动内容分析图表</text>
							</view>
							
							<!-- 互动内容类型分布 -->
							<view class="content-distribution">
								<view class="content-item">
									<view class="content-icon blue">
										<text class="iconfont icon-xiaoxi" style="color: #2979ff; font-size: 15px;"></text>
									</view>
									<text class="content-name">文字互动</text>
									<text class="content-value">{{ interactionAnalysis.contentAnalysis.textMessages.toLocaleString() }}</text>
								</view>
								<view class="content-item">
									<view class="content-icon green">
										<text class="iconfont icon-tupian" style="color: #19be6b; font-size: 15px;"></text>
									</view>
									<text class="content-name">图片互动</text>
									<text class="content-value">{{ interactionAnalysis.contentAnalysis.imgInteractions.toLocaleString() }}</text>
								</view>
								<view class="content-item">
									<view class="content-icon purple">
										<text class="iconfont icon-yonghuqun" style="color: #9c26b0; font-size: 15px;"></text>
									</view>
									<text class="content-name">群聊互动</text>
									<text class="content-value">{{ interactionAnalysis.contentAnalysis.groupInteractions.toLocaleString() }}</text>
								</view>
								<view class="content-item">
									<view class="content-icon orange">
										<text class="iconfont icon-shujucanmou" style="color: #ff9900; font-size: 15px;"></text>
									</view>
									<text class="content-name">产品咨询</text>
									<text class="content-value">{{ interactionAnalysis.contentAnalysis.productInquiries.toLocaleString() }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 转化分析区域 -->
				<view v-if="currentSubsection === 2" class="analysis-grid">
					<!-- 转化漏斗卡片 -->
					<view class="analysis-card">
						<view class="card-header">
							<text class="card-title">转化漏斗</text>
							<text class="card-subtitle">客户转化路径分析</text>
						</view>
						<view class="card-content">
							<view class="chart-placeholder">
								<view class="chart-icon">
									<text class="iconfont icon-shujucanmou" style="color: #999; font-size: 50px;"></text>
								</view>
								<text class="chart-text">转化漏斗图表</text>
							</view>
							
							<!-- 转化漏斗数据 -->
							<view class="funnel-stats">
								<view class="funnel-item">
									<view class="funnel-label">互动</view>
									<view class="funnel-value">3,256</view>
									<view class="funnel-percent">100%</view>
								</view>
								<view class="funnel-item">
									<view class="funnel-label">咨询</view>
									<view class="funnel-value">1,856</view>
									<view class="funnel-percent">57%</view>
								</view>
								<view class="funnel-item">
									<view class="funnel-label">意向</view>
									<view class="funnel-value">845</view>
									<view class="funnel-percent">26%</view>
								</view>
								<view class="funnel-item">
									<view class="funnel-label">成交</view>
									<view class="funnel-value">386</view>
									<view class="funnel-percent">12%</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 转化效率卡片 -->
					<view class="analysis-card">
						<view class="card-header">
							<text class="card-title">转化效率</text>
							<text class="card-subtitle">各阶段转化率分析</text>
						</view>
						<view class="card-content">
							<view class="chart-placeholder">
								<view class="chart-icon">
									<text class="iconfont icon-bingtu" style="color: #999; font-size: 50px;"></text>
								</view>
								<text class="chart-text">转化效率图表</text>
							</view>
							
							<!-- 转化效率数据 -->
							<view class="efficiency-stats">
								<view class="efficiency-item">
									<view class="efficiency-row">
										<view class="efficiency-label">互动→咨询</view>
										<view class="efficiency-value">57%</view>
									</view>
									<view class="efficiency-percent">
										<text class="percent-change up">+5.2% 较上期</text>
									</view>
								</view>
								<view class="efficiency-item">
									<view class="efficiency-row">
										<view class="efficiency-label">咨询→意向</view>
										<view class="efficiency-value">45.5%</view>
									</view>
									<view class="efficiency-percent">
										<text class="percent-change up">+3.8% 较上期</text>
									</view>
								</view>
								<view class="efficiency-item">
									<view class="efficiency-row">
										<view class="efficiency-label">意向→成交</view>
										<view class="efficiency-value">45.7%</view>
									</view>
									<view class="efficiency-percent">
										<text class="percent-change up">+4.2% 较上期</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 收入分析区域 -->
				<view v-if="currentSubsection === 3" class="analysis-grid">
					<!-- 收入趋势卡片 -->
					<view class="analysis-card">
						<view class="card-header">
							<text class="card-title">收入趋势</text>
							<text class="card-subtitle">近期销售额和趋势</text>
						</view>
						<view class="card-content">
							<view class="chart-placeholder">
								<view class="chart-icon">
									<text class="iconfont icon-shuju1" style="color: #999; font-size: 50px;"></text>
								</view>
								<text class="chart-text">收入趋势图表</text>
							</view>
							
							<!-- 收入统计数据 -->
							<view class="income-stats">
								<view class="income-stat-item">
									<view class="income-label">总收入</view>
									<view class="income-main-value">¥258,386</view>
									<view class="income-change up">+22.5% 较上期</view>
								</view>
								
								<view class="income-stat-item" style="margin-top: 15px;">
									<view class="income-label">客单价</view>
									<view class="income-main-value">¥843</view>
									<view class="income-change up">+5.8% 较上期</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 产品销售分布卡片 -->
					<view class="analysis-card">
						<view class="card-header">
							<text class="card-title">产品销售分布</text>
							<text class="card-subtitle">各产品系列销售占比</text>
						</view>
						<view class="card-content">
							<view class="chart-placeholder">
								<view class="chart-icon">
									<text class="iconfont icon-bingtu" style="color: #999; font-size: 50px;"></text>
								</view>
								<text class="chart-text">产品销售分布图表</text>
							</view>
							
							<!-- 产品销售分布数据 -->
							<view class="product-distribution">
								<view class="product-item">
									<view class="product-dot" style="background-color: #2979ff;"></view>
									<text class="product-name">法儿曼胶原修复系列</text>
									<text class="product-percent">42%</text>
								</view>
								<view class="product-value">¥108,551</view>
								
								<view class="product-item" style="margin-top: 12px;">
									<view class="product-dot" style="background-color: #19be6b;"></view>
									<text class="product-name">安格安睛眼部系列</text>
									<text class="product-percent">23%</text>
								</view>
								<view class="product-value">¥59,444</view>
								
								<view class="product-item" style="margin-top: 12px;">
									<view class="product-dot" style="background-color: #9c26b0;"></view>
									<text class="product-name">色仕莱诺胸部系列</text>
									<text class="product-percent">18%</text>
								</view>
								<view class="product-value">¥46,522</view>
								
								<view class="product-item" style="margin-top: 12px;">
									<view class="product-dot" style="background-color: #ff9900;"></view>
									<text class="product-name">头部疗愈SPA系列</text>
									<text class="product-percent">17%</text>
								</view>
								<view class="product-value">¥43,939</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 其他暂无数据区域 -->
				<view v-else-if="currentSubsection > 3" class="empty-data">
					<text class="iconfont icon-kong" style="color: #c0c4cc; font-size: 50px;"></text>
					<text class="empty-text">{{ subsectionList[currentSubsection] }}暂无数据</text>
				</view>
			</view>
			
		
			
			<!-- 日期选择弹窗 -->
			<u-popup :show="showDatePopup" mode="bottom" @close="showDatePopup = false">
				<view class="date-selector-popup">
					<view class="date-selector-header">
						<text>选择时间范围</text>
						<view class="date-close-btn" @tap="showDatePopup = false">
							<text class="iconfont icon-guanbi" style="color: #999; font-size: 16px;"></text>
						</view>
					</view>
					<view class="date-selector-list">
						<view 
							v-for="(option, index) in dateOptions" 
							:key="index"
							class="date-option" 
							@tap="selectDateRange(option.label)"
						>
							<text class="date-option-text">{{ option.label }}</text>
							<view class="date-option-check" v-if="dateRange === option.label">
								<text class="iconfont icon-duigou" style="color: #0080ff; font-size: 16px;"></text>
							</view>
						</view>
					</view>
				</view>
			</u-popup>
			
			<!-- 自定义日期选择弹窗 -->
			<u-popup :show="showCustomDatePopup" mode="bottom" @close="showCustomDatePopup = false">
				<view class="custom-date-popup">
					<view class="date-selector-header">
						<text>选择日期范围</text>
						<view class="date-close-btn" @tap="showCustomDatePopup = false">
							<text class="iconfont icon-guanbi" style="color: #999; font-size: 16px;"></text>
						</view>
					</view>
					<view class="custom-date-content">
						<view class="date-range-item">
							<text class="date-range-label">开始日期</text>
							<view class="date-picker-trigger" @tap="openStartDatePicker">
								<text>{{ startDate || '请选择' }}</text>
								<text class="iconfont icon-rili" style="color: #666; font-size: 14px;"></text>
							</view>
						</view>
						<view class="date-range-item">
							<text class="date-range-label">结束日期</text>
							<view class="date-picker-trigger" @tap="openEndDatePicker">
								<text>{{ endDate || '请选择' }}</text>
								<text class="iconfont icon-rili" style="color: #666; font-size: 14px;"></text>
							</view>
						</view>
						<view class="date-action-btns">
							<u-button text="取消" type="info" plain size="medium" @click="showCustomDatePopup = false"></u-button>
							<u-button text="确定" type="primary" size="medium" @click="confirmCustomDateRange"></u-button>
						</view>
					</view>
				</view>
			</u-popup>
			
			<!-- 日期选择器 - 开始日期 -->
			<u-datetime-picker
				:show="showStartDatePicker"
				v-model="tempStartDate"
				mode="date"
				:min-date="minDate"
				:max-date="maxDate"
				@confirm="confirmStartDate"
				@cancel="showStartDatePicker = false"
			></u-datetime-picker>
			
			<!-- 日期选择器 - 结束日期 -->
			<u-datetime-picker
				:show="showEndDatePicker"
				v-model="tempEndDate"
				mode="date"
				:min-date="minDate"
				:max-date="maxDate"
				@confirm="confirmEndDate"
				@cancel="showEndDatePicker = false"
			></u-datetime-picker>
		</view>
	</view>
</template>

<script>
	import { request } from '@/api/config';
	
	export default {
		name: 'DataStatistics',
		props: {
			show: {
				type: Boolean,
				default: false
			}
		},
		data() {
			const today = new Date();
			return {
				dateRange: '本周',
				timeType: 'this_week',
				showDatePopup: false,
				showCustomDatePopup: false,
				showStartDatePicker: false,
				showEndDatePicker: false,
				startDate: '',
				endDate: '',
				tempStartDate: parseInt(today.getTime()),
				tempEndDate: parseInt(today.getTime()),
				minDate: parseInt(new Date(new Date().getFullYear() - 1, 0, 1).getTime()),
				maxDate: parseInt(new Date().getTime()),
				subsectionList: ['客户分析', '互动分析', '转化分析', '收入分析'],
				currentSubsection: 0,
				overviewData: {
					totalCustomers: 0,
					newCustomers: 0,
					totalCustomersChange: 0,
					newCustomersChange: 0,
					interactions: 0,
					interactionsChange: 0,
					conversionRate: 28.6,
					conversionRateChange: 3.2
				},
				dateOptions: [
					{ label: '今日', value: 'today' },
					{ label: '昨日', value: 'yesterday' },
					{ label: '本周', value: 'this_week' },
					{ label: '上周', value: 'last_week' },
					{ label: '本月', value: 'this_month' },
					{ label: '本季度', value: 'this_quarter' },
					{ label: '本年度', value: 'this_year' }
				],
				customerAnalysis: {
					trend: {
						total: 0,
						new: 0,
						lost: 0
					},
					sourceDistribution: []
				},
				interactionAnalysis: {
					frequencyAnalysis: {
						highFrequency: 0,
						midFrequency: 0,
						lowFrequency: 0,
						chartData: []
					},
					contentAnalysis: {
						textMessages: 0,
						imgInteractions: 0,
						groupInteractions: 0,
						productInquiries: 0,
						chartData: []
					}
				}
			}
		},
		mounted() {
			this.fetchOverviewData();
			this.fetchCustomerAnalysis();
		},
		methods: {
			async fetchOverviewData() {
				try {
					const res = await request({
						url: '/v1/store/statistics/overview',
						method: 'GET',
						data: {
							time_type: this.timeType
						}
					});
					
					if (res.code === 200 && res.data) {
						this.overviewData = {
							...this.overviewData,
							totalCustomers: res.data.total_customers.value || 0,
							totalCustomersChange: res.data.total_customers.growth || 0,
							newCustomers: res.data.new_customers.value || 0,
							newCustomersChange: res.data.new_customers.growth || 0,
							interactions: res.data.interaction_count.value || 0,
							interactionsChange: res.data.interaction_count.growth || 0
						};
					} else {
						uni.showToast({
							title: res.msg || '获取数据失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取概览数据失败:', error);
					uni.showToast({
						title: '网络异常，请稍后重试',
						icon: 'none'
					});
				}
			},
			async fetchCustomerAnalysis() {
				try {
					const res = await request({
						url: '/v1/store/statistics/customer-analysis',
						method: 'GET',
						data: {
							time_type: this.timeType
						}
					});
					
					if (res.code === 200 && res.data) {
						// 更新趋势数据
						this.customerAnalysis.trend = {
							total: res.data.trend.total || 0,
							new: res.data.trend.new || 0,
							lost: res.data.trend.lost || 0
						};
						
						// 更新来源分布数据
						this.customerAnalysis.sourceDistribution = res.data.source_distribution || [];
					} else {
						uni.showToast({
							title: res.msg || '获取客户分析数据失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取客户分析数据失败:', error);
					uni.showToast({
						title: '网络异常，请稍后重试',
						icon: 'none'
					});
				}
			},
			async fetchInteractionAnalysis() {
				try {
					const res = await request({
						url: '/v1/store/statistics/interaction-analysis',
						method: 'GET',
						data: {
							time_type: this.timeType
						}
					});
					
					if (res.code === 200 && res.data) {
						// 更新频率分析数据
						this.interactionAnalysis.frequencyAnalysis = {
							highFrequency: res.data.frequency_analysis.high_frequency || 0,
							midFrequency: res.data.frequency_analysis.mid_frequency || 0,
							lowFrequency: res.data.frequency_analysis.low_frequency || 0,
							chartData: res.data.frequency_analysis.chart_data || []
						};
						
						// 更新内容分析数据
						this.interactionAnalysis.contentAnalysis = {
							textMessages: res.data.content_analysis.text_messages || 0,
							imgInteractions: res.data.content_analysis.img_interactions || 0,
							groupInteractions: res.data.content_analysis.group_interactions || 0,
							productInquiries: res.data.content_analysis.product_inquiries || 0,
							chartData: res.data.content_analysis.chart_data || []
						};
					} else {
						uni.showToast({
							title: res.msg || '获取互动分析数据失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取互动分析数据失败:', error);
					uni.showToast({
						title: '网络异常，请稍后重试',
						icon: 'none'
					});
				}
			},
			async changeSubsection(index) {
				this.currentSubsection = index;
				
				// 根据不同的分段加载不同的数据
				if (index === 0) {
					await this.fetchCustomerAnalysis();
				} else if (index === 1) {
					await this.fetchInteractionAnalysis();
				}
			},
			closePage() {
				this.$emit('close');
			},
			showDateSelector() {
				this.showDatePopup = true;
			},
			async selectDateRange(range) {
				const option = this.dateOptions.find(opt => opt.label === range);
				if (option) {
					this.timeType = option.value;
					this.dateRange = range;
					this.showDatePopup = false;
					
					// 重新获取数据
					await this.fetchOverviewData();
					
					// 根据当前选中的分段重新加载对应数据
					if (this.currentSubsection === 0) {
						await this.fetchCustomerAnalysis();
					} else if (this.currentSubsection === 1) {
						await this.fetchInteractionAnalysis();
					}
				}
			},
			showCustomDatePicker() {
				this.showCustomDatePopup = true;
			},
			openStartDatePicker() {
				if (!this.tempStartDate) {
					this.tempStartDate = parseInt(new Date().getTime());
				}
				this.showStartDatePicker = true;
			},
			openEndDatePicker() {
				if (!this.tempEndDate) {
					this.tempEndDate = parseInt(new Date().getTime());
				}
				this.showEndDatePicker = true;
			},
			confirmStartDate(value) {
				console.log('确认开始日期', value);
				
				if (!value) {
					uni.showToast({
						title: '请选择有效日期',
						icon: 'none'
					});
					return;
				}
				
				try {
					let timestamp;
					if (typeof value === 'object' && value.value !== undefined) {
						timestamp = parseInt(value.value);
					} else {
						timestamp = parseInt(value);
					}
					
					const date = new Date(timestamp);
					
					if (isNaN(date.getTime())) {
						throw new Error('无效日期');
					}
					
					this.startDate = this.formatDate(date);
					this.tempStartDate = timestamp;
					this.showStartDatePicker = false;
					
					if (this.endDate && new Date(this.endDate) < date) {
						this.endDate = '';
						this.tempEndDate = timestamp;
					}
				} catch (error) {
					console.error('处理开始日期错误:', error, value);
					uni.showToast({
						title: '日期选择出错，请重试',
						icon: 'none'
					});
				}
			},
			confirmEndDate(value) {
				console.log('确认结束日期', value);
				
				if (!value) {
					uni.showToast({
						title: '请选择有效日期',
						icon: 'none'
					});
					return;
				}
				
				try {
					let timestamp;
					if (typeof value === 'object' && value.value !== undefined) {
						timestamp = parseInt(value.value);
					} else {
						timestamp = parseInt(value);
					}
					
					const date = new Date(timestamp);
					
					if (isNaN(date.getTime())) {
						throw new Error('无效日期');
					}
					
					this.endDate = this.formatDate(date);
					this.tempEndDate = timestamp;
					this.showEndDatePicker = false;
				} catch (error) {
					console.error('处理结束日期错误:', error, value);
					uni.showToast({
						title: '日期选择出错，请重试',
						icon: 'none'
					});
				}
			},
			confirmCustomDateRange() {
				if (!this.startDate || !this.endDate) {
					uni.showToast({
						title: '请选择开始和结束日期',
						icon: 'none'
					});
					return;
				}
				
				if (new Date(this.endDate) < new Date(this.startDate)) {
					uni.showToast({
						title: '结束日期必须大于等于开始日期',
						icon: 'none'
					});
					return;
				}
				
				this.dateRange = '自定义';
				this.showCustomDatePopup = false;
				
				uni.showToast({
					title: `已设置日期范围`,
					icon: 'none'
				});
			},
			formatDate(date) {
				if (!(date instanceof Date) || isNaN(date.getTime())) {
					console.error('formatDate 收到无效的日期对象:', date);
					return '请选择';
				}
				
				try {
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					return `${year}-${month}-${day}`;
				} catch (error) {
					console.error('日期格式化错误:', error);
					return '请选择';
				}
			},
			exportReport() {
				uni.showLoading({
					title: '正在导出...'
				});
				
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '报表已导出',
						icon: 'success'
					});
				}, 1500);
			},
			// 获取来源颜色
			getSourceColor(index) {
				const colors = ['#2979ff', '#19be6b', '#9c26b0', '#ff9900'];
				return colors[index % colors.length];
			}
		}
	}
</script>

<style lang="scss">
	.data-statistics-container {
		position: fixed;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
		background-color: #f5f7fa;
		z-index: 10000;
		overflow-y: auto;
		transform-origin: right;
		animation: slideInFromRight 0.3s ease;
	}
	
	@keyframes slideInFromRight {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}
	
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 15px;
		background-color: #fff;
		border-bottom: 1px solid #eee;
		position: sticky;
		top: 0;
		z-index: 1;
	}
	
	.back-icon {
		width: 60px;
		font-size: 15px;
		color: #333;
	}
	
	.title {
		font-size: 17px;
		font-weight: 500;
		flex: 1;
		text-align: center;
	}
	
	.close-icon {
		width: 60px;
		text-align: right;
		display: flex;
		justify-content: flex-end;
		padding-right: 10px;
	}
	
	.overview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 15px 5px;
	}
	
	.overview-title {
		font-size: 16px;
		font-weight: 600;
		color: #333;
	}
	
	.overview-actions {
		display: flex;
		align-items: center;
	}
	
	.time-selector {
		margin-right: 10px;
	}
	
	.selector-content {
		height: 32px;
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 16px;
		padding: 0 12px;
		font-size: 14px;
		color: #333;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}
	
	.selector-content text {
		margin-right: 4px;
	}
	
	.custom-date-btn {
		height: 32px;
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 16px;
		padding: 0 12px;
		font-size: 14px;
		color: #333;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}
	
	.overview-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 10px;
		margin: 0 5px;
	}
	
	.overview-item {
		width: 50%;
		padding: 5px;
		box-sizing: border-box;
	}
	
	.overview-item-content {
		background-color: #fff;
		border-radius: 8px;
		padding: 15px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
	}
	
	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	
	.item-label {
		font-size: 14px;
		color: #333;
	}
	
	.item-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.item-value {
		font-size: 22px;
		font-weight: 600;
		color: #333;
		margin-bottom: 5px;
	}
	
	.item-change {
		font-size: 12px;
	}
	
	.up {
		color: #18b566;
	}
	
	.down {
		color: #fa3534;
	}
	
	.blue {
		background-color: #ecf5ff;
	}
	
	.green {
		background-color: #e5fff2;
	}
	
	.orange {
		background-color: #fff7ec;
	}
	
	.red {
		background-color: #ffecec;
	}
	
	/* 日期选择弹窗样式 */
	.date-selector-popup {
		background-color: #fff;
		padding-bottom: 10px;
	}
	
	.date-selector-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #eee;
	}
	
	.date-close-btn {
		padding: 5px;
	}
	
	.date-selector-list {
		padding: 5px 0;
	}
	
	.date-option {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.date-option:last-child {
		border-bottom: none;
	}
	
	.date-option-text {
		font-size: 15px;
		color: #333;
	}
	
	.date-option-check {
		color: #0080ff;
	}
	
	.section-card {
		margin: 15px;
		padding: 15px;
		background-color: #fff;
		border-radius: 10px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}
	
	.section-title {
		font-size: 16px;
		font-weight: 500;
		color: #333;
	}
	
	.section-action {
		display: flex;
		align-items: center;
		font-size: 14px;
		color: #999;
	}
	
	.chart-container {
		height: 200px;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #f9f9f9;
		border-radius: 8px;
	}
	
	.chart-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
	}
	
	.chart-desc {
		font-size: 12px;
		margin-top: 5px;
	}
	
	.data-list {
		margin-top: 10px;
	}
	
	.data-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 0;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.data-item:last-child {
		border-bottom: none;
	}
	
	.data-item-left {
		display: flex;
		align-items: center;
	}
	
	.data-icon {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 10px;
	}
	
	.data-info {
		display: flex;
		flex-direction: column;
	}
	
	.data-name {
		font-size: 14px;
		color: #333;
		margin-bottom: 5px;
	}
	
	.data-value {
		font-size: 16px;
		font-weight: 500;
		color: #333;
	}
	
	.change {
		font-size: 12px;
		margin-left: 5px;
	}
	
	.sales-container {
		margin-top: 10px;
	}
	
	.sales-progress {
		margin-bottom: 20px;
	}
	
	.progress-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
		font-size: 14px;
	}
	
	.progress-bar {
		height: 10px;
		background-color: #f0f0f0;
		border-radius: 5px;
		margin-bottom: 10px;
		overflow: hidden;
	}
	
	.progress-inner {
		height: 100%;
		background-color: #0080ff;
		border-radius: 5px;
	}
	
	.progress-footer {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: #999;
	}
	
	.sales-ranking {
		padding-top: 10px;
	}
	
	.ranking-title {
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 10px;
	}
	
	.ranking-list {
		
	}
	
	.ranking-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.ranking-item:last-child {
		border-bottom: none;
	}
	
	.ranking-info {
		display: flex;
		align-items: center;
	}
	
	.ranking-num {
		width: 20px;
		height: 20px;
		background-color: #f0f0f0;
		border-radius: 50%;
		text-align: center;
		line-height: 20px;
		font-size: 12px;
		margin-right: 10px;
	}
	
	.ranking-name {
		font-size: 14px;
	}
	
	.ranking-value {
		font-size: 14px;
		font-weight: 500;
	}
	
	.export-section {
		padding: 15px 30px 30px;
	}
	
	.data-statistics-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}
	
	/* 自定义日期选择弹窗样式 */
	.custom-date-popup {
		background-color: #fff;
		padding-bottom: 20px;
	}
	
	.custom-date-content {
		padding: 15px;
	}
	
	.date-range-item {
		margin-bottom: 20px;
	}
	
	.date-range-label {
		display: block;
		font-size: 15px;
		color: #333;
		margin-bottom: 8px;
	}
	
	.date-picker-trigger {
		height: 44px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 12px;
		background-color: #f5f7fa;
		border-radius: 4px;
		border: 1px solid #eee;
	}
	
	.date-action-btns {
		display: flex;
		justify-content: space-between;
		margin-top: 30px;
	}
	
	.date-action-btns .u-button {
		flex: 1;
		margin: 0 10px;
	}
	
	/* 分段器样式 */
	.subsection-container {
		padding: 15px 15px 10px;
		background-color: #fff;
	}
	
	/* 分析内容区域样式 */
	.analysis-content {
		padding: 10px;
	}
	
	.analysis-grid {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	
	.analysis-card {
		width: 48.5%;
		margin-bottom: 10px;
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
		overflow: hidden;
	}
	
	.card-header {
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.card-title {
		font-size: 16px;
		font-weight: 500;
		color: #333;
		display: block;
	}
	
	.card-subtitle {
		font-size: 12px;
		color: #999;
		margin-top: 4px;
		display: block;
	}
	
	.card-content {
		padding: 15px;
	}
	
	.chart-placeholder {
		height: 150px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #f9f9f9;
		border-radius: 8px;
		margin-bottom: 15px;
	}
	
	.chart-text {
		font-size: 14px;
		color: #999;
		margin-top: 10px;
	}
	
	/* 客户统计样式 */
	.customer-stats {
		padding: 5px 0;
	}
	
	.customer-item {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}
	
	.customer-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-right: 8px;
	}
	
	.customer-label {
		font-size: 14px;
		color: #666;
		flex: 1;
	}
	
	.customer-value {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}
	
	/* 来源分布样式 */
	.source-distribution {
		padding: 5px 0;
	}
	
	.source-item {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}
	
	.source-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-right: 8px;
	}
	
	.source-name {
		font-size: 14px;
		color: #666;
		flex: 1;
	}
	
	.source-value {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}
	
	/* 空数据样式 */
	.empty-data {
		height: 320px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #fff;
		border-radius: 8px;
		margin-bottom: 15px;
	}
	
	.empty-text {
		font-size: 14px;
		color: #909399;
		margin-top: 10px;
	}
	
	/* 互动频率分析样式 */
	.interaction-stats {
		padding: 5px 0;
	}
	
	.interaction-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
	}
	
	.interaction-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}
	
	.interaction-label {
		font-size: 14px;
		color: #333;
		margin-bottom: 5px;
	}
	
	.interaction-value {
		font-size: 18px;
		font-weight: 500;
		color: #333;
	}
	
	.interaction-label-small {
		font-size: 12px;
		color: #999;
	}
	
	/* 互动内容分析样式 */
	.content-distribution {
		padding: 5px 0;
	}
	
	.content-item {
		display: flex;
		align-items: center;
		margin-bottom: 12px;
	}
	
	.content-icon {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 8px;
	}
	
	.content-name {
		font-size: 14px;
		color: #666;
		flex: 1;
	}
	
	.content-value {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}
	
	.blue {
		background-color: #ecf5ff;
	}
	
	.green {
		background-color: #e5fff2;
	}
	
	.purple {
		background-color: #f5e8ff;
	}
	
	.orange {
		background-color: #fff7ec;
	}
	
	/* 转化漏斗样式 */
	.funnel-stats {
		padding: 5px 0;
	}
	
	.funnel-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}
	
	.funnel-label {
		font-size: 14px;
		color: #333;
		width: 40px;
	}
	
	.funnel-value {
		font-size: 14px;
		font-weight: 500;
		color: #333;
		flex: 1;
		padding-left: 10px;
	}
	
	.funnel-percent {
		font-size: 14px;
		color: #666;
		width: 50px;
		text-align: right;
	}
	
	/* 转化效率样式 */
	.efficiency-stats {
		padding: 5px 0;
	}
	
	.efficiency-item {
		margin-bottom: 15px;
	}
	
	.efficiency-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 5px;
	}
	
	.efficiency-label {
		font-size: 14px;
		color: #333;
	}
	
	.efficiency-value {
		font-size: 16px;
		font-weight: 500;
		color: #333;
	}
	
	.efficiency-percent {
		display: flex;
		justify-content: flex-end;
	}
	
	.percent-change {
		font-size: 12px;
	}
	
	/* 收入趋势样式 */
	.income-stats {
		padding: 5px 0;
	}
	
	.income-stat-item {
		display: flex;
		flex-direction: column;
	}
	
	.income-label {
		font-size: 14px;
		color: #333;
		margin-bottom: 4px;
	}
	
	.income-main-value {
		font-size: 20px;
		font-weight: bold;
		color: #333;
		margin-bottom: 2px;
	}
	
	.income-change {
		font-size: 12px;
	}
	
	.income-change.up {
		color: #18b566;
	}
	
	/* 产品销售分布样式 */
	.product-distribution {
		padding: 5px 0;
	}
	
	.product-item {
		display: flex;
		align-items: center;
	}
	
	.product-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		margin-right: 8px;
	}
	
	.product-name {
		font-size: 14px;
		color: #333;
		flex: 1;
	}
	
	.product-percent {
		font-size: 14px;
		color: #333;
		margin-left: 5px;
	}
	
	.product-value {
		font-size: 14px;
		color: #666;
		padding-left: 16px;
		margin-top: 4px;
		margin-bottom: 8px;
	}
</style> 