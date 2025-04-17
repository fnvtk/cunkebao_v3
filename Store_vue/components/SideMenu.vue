<template>
	<view v-if="show" class="side-menu-container" style="margin-top: var(--status-bar-height);">
		<view class="side-menu-mask" @tap="closeSideMenu"></view>
		<view class="side-menu">
			<view class="side-menu-header">
				<text class="side-menu-title">美业赋能</text>
				<text class="close-icon" @tap="closeSideMenu">
					<u-icon name="close" color="#333" size="24"></u-icon>
				</text>
			</view>
			
		
			
			<!-- 功能模块 -->
			<view class="function-module">
				<view class="function-grid">
					<!-- 第一行 -->
					<view class="function-row">
						<view class="function-item pink" :class="{'function-item-disabled': !functionStatus['autoLike']}" @tap="handleFunctionClick('autoLike')">
							<text class="iconfont icon-dianzan function-icon" style="color: #ff6699; font-size: 26px;"></text>
							<text class="function-name">自动点赞</text>
							<text class="function-status" :style="functionStatus['autoLike'] ? 'color: #ff6699; font-size: 12px;' : 'color: #999; font-size: 12px;'">
								{{ functionStatus['autoLike'] ? '已启用' : '已禁用' }}
							</text>
						</view>
						<view class="function-item purple" :class="{'function-item-disabled': !functionStatus['momentsSync']}" @tap="handleFunctionClick('momentsSync')">
							<text class="iconfont icon-tupian function-icon" style="color: #9966ff; font-size: 26px;"></text>
							<text class="function-name">朋友圈同步</text>
							<text class="function-status" :style="functionStatus['momentsSync'] ? 'color: #9966ff; font-size: 12px;' : 'color: #999; font-size: 12px;'">
								{{ functionStatus['momentsSync'] ? '已启用' : '已禁用' }}
							</text>
						</view>
						<view class="function-item green" :class="{'function-item-disabled': !functionStatus['autoCustomerDev']}" @tap="handleFunctionClick('autoCustomerDev')">
							<text class="iconfont icon-yonghu function-icon" style="color: #33cc99; font-size: 26px;"></text>
							<text class="function-name">自动开发客户</text>
							<text class="function-status" :style="functionStatus['autoCustomerDev'] ? 'color: #33cc99; font-size: 12px;' : 'color: #999; font-size: 12px;'">
								{{ functionStatus['autoCustomerDev'] ? '已启用' : '已禁用' }}
							</text>
						</view>
					</view>
					<!-- 第二行 -->
					<view class="function-row">
						<view class="function-item orange" :class="{'function-item-disabled': !functionStatus['groupMessageDeliver']}" @tap="handleFunctionClick('groupMessageDeliver')">
							<text class="iconfont icon-xiaoxi function-icon" style="color: #ff9966; font-size: 26px;"></text>
							<text class="function-name">群消息推送</text>
							<text class="function-status" :style="functionStatus['groupMessageDeliver'] ? 'color: #ff9966; font-size: 12px;' : 'color: #999; font-size: 12px;'">
								{{ functionStatus['groupMessageDeliver'] ? '已启用' : '已禁用' }}
							</text>
						</view>
						<view class="function-item blue" :class="{'function-item-disabled': !functionStatus['autoGroup']}" @tap="handleFunctionClick('autoGroup')">
							<text class="iconfont icon-yonghuqun function-icon" style="color: #6699ff; font-size: 26px;"></text>
							<text class="function-name">自动建群</text>
							<text class="function-status" :style="functionStatus['autoGroup'] ? 'color: #6699ff; font-size: 12px;' : 'color: #999; font-size: 12px;'">
								{{ functionStatus['autoGroup'] ? '已启用' : '已禁用' }}
							</text>
						</view>
						<view class="function-item" style="visibility: hidden;">
							<!-- 空白占位 -->
						</view>
					</view>
				</view>
			</view>
			
			<!-- 采购中心 -->
			<view class="module-section">
				<view class="module-title">采购中心</view>
				<view class="module-list">
					<view class="module-item" @tap="showTrafficPurchase">
						<view class="module-left">
							<view class="module-icon blue">
								<text class="iconfont icon-shangsheng" style="color: #5096ff; font-size: 24px;"></text>
							</view>
							<view class="module-info">
								<text class="module-name">流量采购</text>
								<text class="module-desc">自动导入流量到微信</text>
							</view>
						</view>
					</view>
					<view class="module-item" @tap="showSupplyChainPurchase">
						<view class="module-left">
							<view class="module-icon yellow">
								<text class="iconfont icon-gouwuchekong" style="color: #ffc107; font-size: 24px;"></text>
							</view>
							<view class="module-info">
								<text class="module-name">供应链采购</text>
								<text class="module-desc">管理供应链业务</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 数据中心 -->
			<view class="module-section">
				<view class="module-title">数据中心</view>
				<view class="module-list">
					<view class="module-item" @tap="showDataStatistics">
						<view class="module-left">
							<view class="module-icon blue">
								<text class="iconfont icon-shujutongji" style="color: #5096ff; font-size: 24px;"></text>
							</view>
							<view class="module-info">
								<text class="module-name">数据统计</text>
								<text class="module-desc">查看业务数据统计</text>
							</view>
						</view>
					</view>
					<view class="module-item" @tap="showCustomerManagement">
						<view class="module-left">
							<view class="module-icon blue">
								<text class="iconfont icon-yonghuqun" style="color: #5096ff; font-size: 24px;"></text>
							</view>
							<view class="module-info">
								<text class="module-name">客户管理</text>
								<text class="module-desc">管理客户资料信息</text>
							</view>
						</view>
					</view>
					<view class="module-item" @tap="showSettings">
						<view class="module-left">
							<view class="module-icon gray">
								<text class="iconfont icon-shezhi" style="color: #888; font-size: 24px;"></text>
							</view>
							<view class="module-info">
								<text class="module-name">系统设置</text>
								<text class="module-desc">配置系统参数</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部登录按钮 -->
			<view class="bottom-button" @tap="isLoggedIn ? logout() : showLoginPage()">
				<text class="iconfont" :class="isLoggedIn ? 'icon-tuichu' : 'icon-denglu'" :style="isLoggedIn ? 'color: #333; font-size: 18px;' : 'color: #333; font-size: 18px;'"></text>
				<text class="login-text">{{ isLoggedIn ? '退出登录' : '登录/注册' }}</text>
			</view>
		</view>
		
		<!-- 流量采购页面 -->
		<traffic-purchase :show="showTrafficPage" @close="closeTrafficPurchase"></traffic-purchase>
		
		<!-- 供应链采购页面 -->
		<supply-chain-purchase :show="showSupplyChainPage" @close="closeSupplyChainPurchase"></supply-chain-purchase>
		
		<!-- 系统设置页面 -->
		<system-settings :show="showSystemSettingsPage" @close="closeSystemSettings"></system-settings>
		
		<!-- 数据统计页面 -->
		<data-statistics :show="showDataStatisticsPage" @close="closeDataStatistics"></data-statistics>
		
		<!-- 客户管理页面 -->
		<customer-management :show="showCustomerManagementPage" @close="closeCustomerManagement"></customer-management>
		
		<!-- 登录注册页面 -->
		<login-register 
			:show="showLoginPageFlag" 
			@close="closeLoginPage"
			@login-success="handleLoginSuccess"
		></login-register>
	</view>
</template>

<script>
	import TrafficPurchase from './TrafficPurchase.vue';
	import SupplyChainPurchase from './SupplyChainPurchase.vue';
	import SystemSettings from './SystemSettings.vue';
	import LoginRegister from './LoginRegister.vue';
	import DataStatistics from './DataStatistics.vue';
	import CustomerManagement from './CustomerManagement.vue';
	import { hasValidToken, clearToken, redirectToLogin } from '../api/utils/auth';
	import { request } from '../api/config';
	
	export default {
		name: "SideMenu",
		components: {
			TrafficPurchase,
			SupplyChainPurchase,
			SystemSettings,
			LoginRegister,
			DataStatistics,
			CustomerManagement
		},
		props: {
			show: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				functionStatus: {
					'autoLike': false,
					'momentsSync': false,
					'autoCustomerDev': false,
					'groupMessageDeliver': false,
					'autoGroup': false
				},
				showTrafficPage: false,
				showSupplyChainPage: false,
				showSystemSettingsPage: false,
				showDataStatisticsPage: false,
				showCustomerManagementPage: false,
				showLoginPageFlag: false,
				isLoggedIn: false, // 用户登录状态
				userInfo: null // 用户信息
			}
		},
		watch: {
			// 侧边栏显示时检查登录状态
			show(newVal) {
				if (newVal) {
					this.checkLoginStatus();
				}
			}
		},
		onShow() {
			// 获取用户登录状态
			this.checkLoginStatus();
			// 获取功能开关状态
			this.getFunctionStatus();
		},
		created() {
			// 获取用户登录状态
			this.checkLoginStatus();
			// 获取功能开关状态
			this.getFunctionStatus();
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				// 使用token判断登录状态
				this.isLoggedIn = hasValidToken();
				
				// 如果已登录，尝试获取用户信息
				if (this.isLoggedIn) {
					try {
						const memberStr = uni.getStorageSync('member');
						if (memberStr) {
							this.userInfo = JSON.parse(memberStr);
						}
					} catch (e) {
						console.error('获取用户信息失败', e);
						this.userInfo = null;
					}
				} else {
					this.userInfo = null;
				}

				console.log(this.userInfo);
			},
			
			// 退出登录
			logout() {
				// 清除token和用户信息
				clearToken();
				
				// 清除旧的userInfo（兼容）
				try {
					uni.removeStorageSync('userInfo');
				} catch(e) {
					console.error('清除用户信息失败', e);
				}
				
				// 重置登录状态
				this.userInfo = null;
				this.isLoggedIn = false;
				
				// 关闭侧边栏
				this.closeSideMenu();
				
				// 提示退出成功
				uni.showToast({
					title: '已退出登录',
					icon: 'success',
					duration: 1500
				});
				
				// 跳转到登录页
				setTimeout(() => {
					redirectToLogin();
				}, 1000);
			},
			closeSideMenu() {
				this.$emit('close');
			},
			// 获取功能开关状态
			async getFunctionStatus() {
				try {
					const res = await request({
						url: '/v1/store/system-config/switch-status',
						method: 'GET'
					});
					
					if (res.code === 200 && res.data) {
						// 更新功能状态
						this.functionStatus = {
							'autoLike': res.data.autoLike || false,
							'momentsSync': res.data.momentsSync || false,
							'autoCustomerDev': res.data.autoCustomerDev || false,
							'groupMessageDeliver': res.data.groupMessageDeliver || false,
							'autoGroup': res.data.autoGroup || false
						};
						
						console.log('功能状态已更新:', this.functionStatus);
					} else {
						console.error('获取功能状态失败:', res.msg);
					}
				} catch (err) {
					console.error('获取功能状态异常:', err);
				}
			},
			handleFunctionClick(name) {
				// 切换功能状态
				this.functionStatus[name] = !this.functionStatus[name];
				
				// 显示提示的中文名称映射
				const nameMap = {
					'autoLike': '自动点赞',
					'momentsSync': '朋友圈同步',
					'autoCustomerDev': '自动开发客户',
					'groupMessageDeliver': '群消息推送',
					'autoGroup': '自动建群'
				};
				
			
				
				// 准备更新状态
				const newStatus = this.functionStatus[name];
				
				// 调用接口更新状态
				request({
					url: '/v1/store/system-config/update-switch-status',
					method: 'POST',
					data: {
						switchName: name,
					}
				}).then(res => {
					if (res.code === 200) {
						// 更新本地状态
						this.functionStatus[name] = newStatus;
						
						// 显示提示
						uni.showToast({
							title: newStatus ? `${nameMap[name]}已启用` : `${nameMap[name]}已禁用`,
							icon: 'none'
						});
						
						// 重新获取所有功能状态
						this.getFunctionStatus();
					} else {
						// 显示错误提示
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						});
					}
				}).catch(err => {
					console.error('更新功能状态失败:', err);
					uni.showToast({
						title: '网络异常，请稍后重试',
						icon: 'none'
					});
				});
			},
			handleModuleClick(name) {
				if (name === '供应链采购') {
					this.showSupplyChainPage = true;
				} else if (name === '数据统计') {
					this.showDataStatistics();
				} else if (name === '客户管理') {
					this.showCustomerManagement();
				} else {
					uni.showToast({
						title: `访问${name}`,
						icon: 'none'
					});
				}
			},
			showTrafficPurchase() {
				// 显示流量采购页面
				this.showTrafficPage = true;
			},
			closeTrafficPurchase() {
				// 只关闭流量采购页面，保持侧边菜单打开
				this.showTrafficPage = false;
			},
			showSupplyChainPurchase() {
				// 显示供应链采购页面
				this.showSupplyChainPage = true;
			},
			closeSupplyChainPurchase() {
				// 只关闭供应链采购页面，保持侧边菜单打开
				this.showSupplyChainPage = false;
			},
			showSystemSettings() {
				// 显示系统设置页面
				this.showSystemSettingsPage = true;
			},
			closeSystemSettings() {
				// 关闭系统设置页面
				this.showSystemSettingsPage = false;
			},
			showDataStatistics() {
				// 显示数据统计页面
				this.showDataStatisticsPage = true;
			},
			closeDataStatistics() {
				// 关闭数据统计页面
				this.showDataStatisticsPage = false;
			},
			showCustomerManagement() {
				// 显示客户管理页面
				this.showCustomerManagementPage = true;
			},
			closeCustomerManagement() {
				// 关闭客户管理页面
				this.showCustomerManagementPage = false;
			},
			showLoginPage() {
				// 关闭侧边菜单
				this.closeSideMenu();
				
				// 跳转到登录页面
				redirectToLogin();
			},
			closeLoginPage() {
				// 关闭登录/注册页面
				this.showLoginPageFlag = false;
			},
			handleLoginSuccess(userInfo) {
				// 处理登录成功事件
				this.isLoggedIn = true;
				this.userInfo = userInfo;
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				});
			},
			handleLogin() {
				// 修改原有方法，调用显示登录页面
				this.showLoginPage();
			},
			goToUserCenter() {
				// 跳转到用户中心页面
				uni.navigateTo({
					url: '/pages/login/user'
				});
				
				// 关闭侧边栏
				this.closeSideMenu();
			},
			showSettings() {
				// 显示系统设置页面
				this.showSystemSettingsPage = true;
			}
		}
	}
</script>

<style lang="scss">
	.side-menu-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
	}
	
	.side-menu-mask {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
	}
	
	.side-menu {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #fff;
		z-index: 2;
		display: flex;
		flex-direction: column;
	}
	
	.side-menu-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 15px;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.side-menu-title {
		font-size: 18px;
		font-weight: 500;
	}
	
	.close-icon {
		font-size: 24px;
		color: #666;
		padding: 0 10px;
	}
	
	.function-module {
		padding: 15px;
	}
	
	.function-grid {
		display: flex;
		flex-direction: column;
		margin: 0 -5px;
	}
	
	.function-row {
		display: flex;
		width: 100%;
		margin-bottom: 10px;
	}
	
	.function-item {
		flex: 1;
		margin: 0 5px;
		border-radius: 10px;
		padding: 15px 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(0, 0, 0, 0.05);
	}
	
	.function-icon {
		font-size: 24px;
		margin-bottom: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.iconfont.function-icon {
		font-size: 28px;
		color: inherit;
		height: 28px;
		width: 28px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.function-name {
		font-size: 12px;
		color: #333;
		margin-bottom: 5px;
		font-weight: 500;
	}
	
	.function-status {
		font-size: 12px;
		color: #666;
		padding: 2px 0;
	}
	
	.function-item-disabled {
		opacity: 0.7;
		background-color: #f5f5f5 !important;
	}
	
	.pink {
		background-color: #ffecf1;
	}
	
	.purple {
		background-color: #f5ecff;
	}
	
	.green {
		background-color: #e5fff2;
	}
	
	.orange {
		background-color: #fff7ec;
	}
	
	.blue {
		background-color: #ecf5ff;
	}
	
	.yellow {
		background-color: #fffcec;
	}
	
	.gray {
		background-color: #f5f5f5;
	}
	
	.module-section {
		padding: 10px 15px;
	}
	
	.module-title {
		font-size: 16px;
		font-weight: 500;
		margin-bottom: 10px;
	}
	
	.module-list {
		border-radius: 10px;
		background-color: #fff;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}
	
	.module-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.module-item:last-child {
		border-bottom: none;
	}
	
	.module-left {
		display: flex;
		align-items: center;
	}
	
	.module-icon {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 10px;
		font-size: 20px;
	}
	
	.module-info {
		display: flex;
		flex-direction: column;
	}
	
	.module-name {
		font-size: 16px;
		color: #333;
		margin-bottom: 3px;
	}
	
	.module-desc {
		font-size: 12px;
		color: #999;
	}
	
	.bottom-button {
		margin-top: auto;
		margin: 20px 15px;
		padding: 12px 0;
		border-radius: 5px;
		background-color: #fff;
		border: 1px solid #e5e5e5;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.login-icon {
		font-size: 16px;
		margin-right: 5px;
	}
	
	.login-text {
		font-size: 15px;
		color: #333;
	}
	
	.user-info {
		display: flex;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin-right: 10px;
	}
	
	.user-details {
		flex: 1;
	}
	
	.nickname {
		font-size: 16px;
		color: #333;
		margin-bottom: 5px;
	}
	
	.member-info {
		font-size: 12px;
		color: #999;
	}
	
	.level-tag {
		padding: 2px 5px;
		border-radius: 5px;
		background-color: #e5e5e5;
		margin-right: 5px;
	}
	
	.vip {
		background-color: #ffd700;
	}
	
	.points {
		font-size: 12px;
		color: #999;
	}
	
	.not-logged-in {
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.login-tip {
		font-size: 12px;
		color: #999;
	}
</style> 