<template>
	<view class="supply-detail-wrapper">
		<view v-if="show" class="supply-detail-container" style="margin-top: var(--status-bar-height);">
			<!-- 头部 -->
			<view class="header">
				<view class="back-icon" @tap="closePage">
					<u-icon name="arrow-left" color="#333" size="26"></u-icon>
				</view>
				<view class="title">{{packageData.name}}</view>
				<view class="close-icon" @tap="closePage">
					<u-icon name="close" color="#333" size="24"></u-icon>
				</view>
			</view>
			
			<!-- 套餐价格信息 -->
			<view class="price-card">
				<view class="price-title">套餐价格</view>
				<view class="price-info">
					<view class="current-price">
						<text class="price-symbol">¥</text>
						<text class="price-value">{{packageData.price}}</text>
					</view>
					<view class="original-price" v-if="packageData.originalPrice !== packageData.price">¥{{packageData.originalPrice}}</view>
				</view>
				<view class="advance-info" v-if="packageData.advancePayment">
					预付款: ¥{{packageData.advancePayment}}
				</view>
			</view>
			
			<!-- 套餐内容 -->
			<view class="service-section">
				<view class="section-title">套餐内容</view>
				<view class="service-count">共{{packageData.services ? packageData.services.length : 0}}服务</view>
				
				<!-- 服务列表 -->
				<view class="service-list">
					<view 
						v-for="(service, index) in packageData.services" 
						:key="index"
						class="service-item"
					>
						<view class="service-left">
							<view class="service-icon">
								<u-icon name="heart" color="#FF6600" size="24"></u-icon>
							</view>
						</view>
						<view class="service-right">
							<view class="service-name">{{service.name}}</view>
							<view class="service-price">
								<text class="price-symbol">¥</text>
								<text class="service-price-value">{{service.price}}</text>
								<text class="service-original-price" v-if="service.originalPrice">¥{{service.originalPrice}}</text>
							</view>
							<view class="service-duration">{{service.duration}}</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 购买按钮 -->
			<view class="buy-button-container">
				<button class="buy-button" @tap="handleBuy">立即购买</button>
			</view>
			
			<!-- 购买说明 -->
			<view class="buy-notice">
				<text class="notice-text">订单将由操作人处理，详情请联系客服</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'SupplyItemDetail',
		props: {
			show: {
				type: Boolean,
				default: false
			},
			packageData: {
				type: Object,
				default: () => ({
					id: 1,
					name: '基础套餐',
					price: '2980',
					originalPrice: '3725',
					advancePayment: '745',
					discount: '8折',
					services: [
						{
							name: '头部护理SPA',
							price: '598',
							originalPrice: '718',
							duration: '60分钟',
							image: '/static/spa1.png'
						},
						{
							name: '臂油SPA',
							price: '618',
							originalPrice: '838',
							duration: '90分钟',
							image: '/static/spa2.png'
						},
						{
							name: '法/LAWF型颜度护理',
							price: '1580',
							originalPrice: '1896',
							duration: '120分钟',
							image: '/static/spa3.png'
						}
					]
				})
			}
		},
		methods: {
			closePage() {
				this.$emit('close');
			},
			handleBuy() {
				uni.showLoading({
					title: '处理中...'
				});
				
				// 模拟购买流程
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '购买成功',
						icon: 'success'
					});
					
					// 延迟关闭页面
					setTimeout(() => {
						this.closePage();
					}, 1500);
				}, 2000);
			}
		}
	}
</script>

<style lang="scss">
	.supply-detail-container {
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
		display: flex;
		align-items: center;
	}
	
	.title {
		font-size: 17px;
		font-weight: 500;
		flex: 1;
		text-align: center;
	}
	
	.close-icon {
		width: 60px;
		display: flex;
		justify-content: flex-end;
	}
	
	.price-card {
		margin: 15px;
		padding: 15px;
		background-color: #FFFBE6;
		border-radius: 10px;
	}
	
	.price-title {
		font-size: 14px;
		color: #333;
		margin-bottom: 10px;
	}
	
	.price-info {
		display: flex;
		align-items: baseline;
	}
	
	.current-price {
		display: flex;
		align-items: baseline;
	}
	
	.price-symbol {
		font-size: 16px;
		font-weight: bold;
		color: #FF6600;
	}
	
	.price-value {
		font-size: 28px;
		font-weight: bold;
		color: #FF6600;
	}
	
	.original-price {
		margin-left: 10px;
		font-size: 16px;
		color: #999;
		text-decoration: line-through;
	}
	
	.advance-info {
		margin-top: 8px;
		font-size: 14px;
		color: #666;
	}
	
	.service-section {
		margin: 15px;
		background-color: #fff;
		border-radius: 10px;
		overflow: hidden;
	}
	
	.section-title {
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
		font-size: 16px;
		font-weight: 500;
	}
	
	.service-count {
		position: absolute;
		right: 30px;
		top: 15px;
		font-size: 12px;
		color: #666;
		background-color: #f5f5f5;
		padding: 2px 8px;
		border-radius: 10px;
	}
	
	.service-list {
		padding: 0 15px;
	}
	
	.service-item {
		display: flex;
		padding: 15px 0;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.service-item:last-child {
		border-bottom: none;
	}
	
	.service-left {
		width: 60px;
		height: 60px;
		border-radius: 8px;
		overflow: hidden;
		margin-right: 15px;
		background-color: #f5f5f5;
	}
	
	.service-icon {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.service-right {
		flex: 1;
	}
	
	.service-name {
		font-size: 15px;
		font-weight: 500;
		color: #333;
		margin-bottom: 5px;
	}
	
	.service-price {
		display: flex;
		align-items: baseline;
		margin-bottom: 5px;
	}
	
	.service-price-value {
		font-size: 16px;
		font-weight: bold;
		color: #FF6600;
	}
	
	.service-original-price {
		font-size: 14px;
		color: #999;
		text-decoration: line-through;
		margin-left: 5px;
	}
	
	.service-duration {
		font-size: 12px;
		color: #999;
	}
	
	.buy-button-container {
		margin: 20px 15px;
	}
	
	.buy-button {
		width: 100%;
		height: 45px;
		line-height: 45px;
		text-align: center;
		background-color: #FFBE00;
		color: #ffffff;
		font-size: 16px;
		font-weight: 500;
		border-radius: 25px;
		border: none;
	}
	
	.buy-notice {
		text-align: center;
		margin-bottom: 30px;
	}
	
	.notice-text {
		font-size: 12px;
		color: #999;
	}
	
	.supply-detail-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style> 