<template>
	<view class="supply-chain-wrapper">
		<view v-if="show" class="supply-chain-container" style="margin-top: var(--status-bar-height);">
			<!-- 头部 -->
			<view class="header">
				<view class="back-icon" @tap="closePage">
					<u-icon name="arrow-left" color="#333" size="26"></u-icon>
				</view>
				<view class="title">供应链采购</view>
				<view class="close-icon" @tap="closePage">
					<u-icon name="close" color="#333" size="24"></u-icon>
				</view>
			</view>
			
			<!-- 套餐卡片区域 -->
			<view class="package-list">
				<view 
					v-for="item in packages" 
					:key="item.id" 
					class="package-card"
					@tap="openPackageDetail(item)"
				>
					<view class="package-content">
						<view class="cart-icon">
							<text class="cart-text">
                            <u-icon name="shopping-cart" size='35px' color='#CA8A04'></u-icon>
                            </text>
						</view>
						<view class="package-info">
							<view class="package-name">
								{{item.name}}
								<text v-if="item.specialTag" class="special-tag">{{item.specialTag}}</text>
							</view>
							<view class="package-price">
								<text class="price-value">¥{{item.price}}</text>
								<text class="original-price" v-if="item.originalPrice !== item.price">¥{{item.originalPrice}}</text>
							</view>
							<view class="advance-payment" v-if="item.advancePayment">预付款: ¥{{item.advancePayment}}</view>
						</view>
						<view class="discount-tag" v-if="item.discount">{{item.discount}}</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 套餐详情页面 -->
		<supply-item-detail 
			:show="showPackageDetail" 
			:package-data="currentPackage" 
			@close="closePackageDetail"
		></supply-item-detail>
	</view>
</template>

<script>
	import SupplyItemDetail from './SupplyItemDetail.vue';
	
	export default {
		name: 'SupplyChainPurchase',
		components: {
			'supply-item-detail': SupplyItemDetail
		},
		props: {
			show: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				// 套餐数据
				packages: [
					{
						id: 1,
						name: '基础套餐',
						price: '2980',
						originalPrice: '3725',
						discount: '8折',
						specialTag: '',
						advancePayment: '745',
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
						],
						details: [
							{ label: '采购额度', value: '3000元' },
							{ label: '套餐时长', value: '30天' },
							{ label: '采购种类', value: '标准品类' }
						],
						privileges: [
							'标准采购价格',
							'7天内发货',
							'基础供应商渠道'
						]
					},
					{
						id: 2,
						name: '进级套餐',
						price: '6980',
						originalPrice: '9971',
						discount: '7折',
						specialTag: '',
						advancePayment: '',
						services: [
							{
								name: '进阶头部护理SPA',
								price: '898',
								originalPrice: '1218',
								duration: '90分钟',
								image: '/static/spa1.png'
							},
							{
								name: '全身SPA',
								price: '1618',
								originalPrice: '2138',
								duration: '120分钟',
								image: '/static/spa2.png'
							},
							{
								name: '高级LAWF型颜度护理',
								price: '2880',
								originalPrice: '3596',
								duration: '150分钟',
								image: '/static/spa3.png'
							},
							{
								name: '肌肤管理',
								price: '1290',
								originalPrice: '1590',
								duration: '60分钟',
								image: '/static/spa4.png'
							}
						],
						details: [
							{ label: '采购额度', value: '7000元' },
							{ label: '套餐时长', value: '30天' },
							{ label: '采购种类', value: '全部品类' }
						],
						privileges: [
							'优惠采购价格',
							'3天内发货',
							'优质供应商渠道',
							'专属采购顾问'
						]
					},
					{
						id: 3,
						name: '尊享套餐',
						price: '19800',
						originalPrice: '33000',
						discount: '6折',
						specialTag: '品优惠',
						advancePayment: '',
						services: [
							{
								name: '尊享头部护理SPA',
								price: '1298',
								originalPrice: '1818',
								duration: '120分钟',
								image: '/static/spa1.png'
							},
							{
								name: '尊享全身SPA',
								price: '2618',
								originalPrice: '3738',
								duration: '180分钟',
								image: '/static/spa2.png'
							},
							{
								name: '奢华LAWF型颜度护理',
								price: '4880',
								originalPrice: '6996',
								duration: '210分钟',
								image: '/static/spa3.png'
							},
							{
								name: '尊享肌肤管理',
								price: '2490',
								originalPrice: '3290',
								duration: '90分钟',
								image: '/static/spa4.png'
							},
							{
								name: '私人定制美容方案',
								price: '5990',
								originalPrice: '8990',
								duration: '全天候',
								image: '/static/spa5.png'
							}
						],
						details: [
							{ label: '采购额度', value: '20000元' },
							{ label: '套餐时长', value: '30天' },
							{ label: '采购种类', value: '全部品类(含限定)' }
						],
						privileges: [
							'最优采购价格',
							'24小时内发货',
							'顶级供应商渠道',
							'一对一专属顾问',
							'供应链优化方案',
							'库存管理系统'
						]
					}
				],
				// 套餐详情页面
				showPackageDetail: false,
				// 当前选中的套餐
				currentPackage: null
			}
		},
		methods: {
			closePage() {
				this.$emit('close');
			},
			// 打开套餐详情
			openPackageDetail(packageData) {
				this.currentPackage = packageData;
				this.showPackageDetail = true;
			},
			// 关闭套餐详情
			closePackageDetail() {
				this.showPackageDetail = false;
			}
		}
	}
</script>

<style lang="scss">
	.supply-chain-container {
		position: fixed;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
		background-color: #fff;
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
	
	.package-list {
		padding: 15px;
	}
	
	.package-card {
		margin-bottom: 15px;
		background-color: #fff;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
		border: 1px solid #FFEDA0;
	}

	.package-card:hover {
		background-color: #FFFEF0;
	}

	
	.package-content {
		padding: 18px 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
	}


	
	.cart-icon {
		position: relative;
		left: 0;
		top: 0;
		width: 50px;
		height: 50px;
		background-color: #FFFDD0;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 15px;
	}
	
	.cart-text {
		font-size: 20px;
		color: #E8A317;
	}
	
	.package-info {
		flex: 1;
		padding-left: 0;
		margin-right: 45px;
	}
	
	.package-name {
		font-size: 16px;
		font-weight: 500;
		color: #333;
		margin-bottom: 5px;
		display: flex;
		align-items: center;
	}
	
	.package-price {
		display: flex;
		align-items: baseline;
		margin-bottom: 5px;
	}
	
	.price-value {
		font-size: 22px;
		font-weight: bold;
		color: #E8A317;
	}
	
	.original-price {
		font-size: 15px;
		color: #999;
		text-decoration: line-through;
		margin-left: 8px;
	}
	
	.advance-payment {
		font-size: 14px;
		color: #666;
		margin-top: 5px;
	}
	
	.discount-tag {
		position: absolute;
		right: 15px;
		top: 50%;
		transform: translateY(-50%);
		padding:0 20px;
		height: 30px;
		background-color: #FFE55A;
		color: #c35300;
		border-radius: 30px;
		font-size: 16px;
		font-weight: 500;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.special-tag {
		position: relative;
		display: inline-block;
		margin-left: 8px;
		padding: 2px 6px;
		background-color: #FFDF32;
		color: #333;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		line-height: 1;
	}
	
	.supply-chain-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style> 