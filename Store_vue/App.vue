<script>
	import { hasValidToken, redirectToLogin } from './api/utils/auth';
	
	export default {
		onLaunch: function() {
			console.log('App Launch');
			// 全局检查token
			this.checkToken();
		},
		onShow: function() {
			console.log('App Show');
			// 应用恢复时再次检查token
			this.checkToken();
		},
		onHide: function() {
			console.log('App Hide');
		},
		methods: {
			// 检查token是否有效并处理跳转
			checkToken() {
				// 获取当前页面
				const pages = getCurrentPages();
				const currentPage = pages.length ? pages[pages.length - 1] : null;
				
				// 如果token无效且不在登录页面，则跳转到登录页面
				if (!hasValidToken() && currentPage && currentPage.route !== 'pages/login/index') {
					redirectToLogin();
				}
			}
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import 'uview-ui/index.scss';
	/* 引入阿里图标库 */
	@import '/static/iconfont/iconfont.css';

	/* 页面通用样式 */
	page {
		font-size: 28rpx;
		color: #333;
		background-color: #fff;
	}

	/* 安全区适配 */
	.safe-area-inset-bottom {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}
	
	/* 字体图标支持 */
	@font-face {
		font-family: "SF Pro Display";
		src: url("https://sf.abarba.me/SF-Pro-Display-Regular.otf");
	}
</style>
