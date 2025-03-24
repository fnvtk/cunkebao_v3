<script>
	export default {
		onLaunch: function() {
			console.log('App Launch');
			// 注释掉登录状态检查，取消登录拦截
			// this.checkLoginStatus();
			
			// 设置全局主题色
			uni.$u.setConfig({
				// 修改uView默认主题色为我们的主题色
				config: {
					color: {
						"u-primary": "#2563eb",
						"u-warning": "#ff9900",
						"u-success": "#07c160",
						"u-error": "#fa5151",
						"u-info": "#909399"
					}
				}
			})
		},
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide');
		},
		methods: {
			// 检查登录状态（已禁用）
			checkLoginStatus() {
				// 从本地获取token
				const token = uni.getStorageSync('token');
				if (!token) {
					// 如果没有token，跳转到登录页
					uni.reLaunch({
						url: '/pages/login/index'
					});
				}
			}
		}
	}
</script>

<style lang="scss">
	/* 导入全局样式变量 */
	@import "./uni.scss";
	
	/* 全局样式 */
	page {
		background-color: $bg-color;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 
					 Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 
					 'Microsoft Yahei', sans-serif;
		font-size: $font-size-base;
		color: $text-color-main;
		line-height: 1.8;
	}
	
	/* 统一边距 */
	.container {
		padding: $spacing-base;
	}
	
	/* 引入uView基础样式 */
	@import "uview-ui/index.scss";
</style> 