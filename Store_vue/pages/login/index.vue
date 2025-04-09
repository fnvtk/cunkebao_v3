<template>
	<view class="login-page">
		<!-- 页面顶部导航 -->
		<view class="page-header">
			<view class="back-btn"></view>
			<view class="page-title">登录/注册</view>
		</view>
		
		<!-- 内容区域 -->
		<view class="content-area">
			<!-- 登录方式选项卡 -->
			<view class="tab-container" v-if="false">
				<view 
					class="tab-item" 
					:class="{ active: loginType === 'code' }" 
					@tap="loginType = 'code'"
				>
					验证码登录
				</view>
				<view 
					class="tab-item" 
					:class="{ active: loginType === 'password' }" 
					@tap="loginType = 'password'"
				>
					密码登录
				</view>
			</view>
			
			<!-- 地区提示 -->
			<view class="tip-text u-line-1">
				您所在地区仅支持 手机号 <!-- / 微信 / Apple 登录 -->
			</view>
			
			<!-- 验证码登录 -->
			<block v-if="loginType === 'code'">
				<view class="form-item">
					<view class="input-item">
						<view class="input-prefix">+86</view>
						<u-input 
							type="number" 
							v-model="phone" 
							maxlength="11" 
							placeholder="手机号"
							class="input-field"
							border="0"
						/>
					</view>
				</view>
				<view class="form-item">
					<view class="input-item code-input-box">
						<u-input 
							type="number" 
							v-model="code" 
							maxlength="6" 
							placeholder="验证码"
							class="input-field"
							border="0"
						/>
						<view 
							class="send-code-btn" 
							:class="{ disabled: codeSending || !isPhoneValid }"
							@tap="sendCode"
						>
							{{ codeText }}
						</view>
					</view>
				</view>
			</block>
			
			<!-- 密码登录 -->
			<block v-else>
				<view class="form-item">
					<view class="input-item">
						<view class="input-prefix">+86</view>
						<u-input
							type="number" 
							v-model="phone" 
							maxlength="11" 
							placeholder="手机号"
							class="input-field"
							border="0"
						/>
					</view>
				</view>
				<view class="form-item">
					<view class="input-item">
						<u-input
							:type="passwordVisible ? 'text' : 'password'" 
							v-model="password" 
							placeholder="密码"
							class="input-field"
							border="0"
						/>
						<view class="password-icon" @tap="passwordVisible = !passwordVisible">
							<u-icon :name="passwordVisible ? 'eye' : 'eye-off'" size="20" color="#999"></u-icon>
						</view>
					</view>
				</view>
			</block>
			
			<!-- 用户协议 -->
			<view class="agreement-container">
				<checkbox-group  @change="checkboxChange">
					<checkbox :value="agreement" :checked="agreement" class="agreement-checkbox" color="#4080ff" />
				</checkbox-group>
				<text class="agreement-text">已阅读并同意</text>
				<text class="agreement-link" @tap="openAgreement('user')">用户协议</text>
				<text class="agreement-text">与</text>
				<text class="agreement-link" @tap="openAgreement('privacy')">隐私政策</text>
			</view>
			
			<!-- 登录按钮 -->
			<view 
				class="login-btn" 
				:class="{ active: canLogin }" 
				@tap="handleLogin"
			>
				登录
			</view>
			
			<!-- 分隔线 -->
			<view class="divider" v-if="false">
				<view class="divider-line"></view>
				<text class="divider-text">或</text>
				<view class="divider-line"></view>
			</view>
			
			<!-- 第三方登录 -->
			<view class="third-party-login" v-if="false">
				<u-button
					text="使用微信登录"
					:custom-style="{backgroundColor: '#07c160', color: '#ffffff', marginBottom: '15px'}"
					shape="circle"
					@click="handleThirdLogin('wechat')"
					:ripple="true"
				>
					<template slot="icon">
						<u-icon name="weixin-fill" color="#ffffff" size="18" style="margin-right: 5px;"></u-icon>
					</template>
				</u-button>
				
				<u-button
					text="使用 Apple 登录"
					:custom-style="{backgroundColor: '#000000', color: '#ffffff'}"
					shape="circle"
					@click="handleThirdLogin('apple')"
					:ripple="true"
				>
					<template slot="icon">
						<u-icon name="apple-fill" color="#ffffff" size="18" style="margin-right: 5px;"></u-icon>
					</template>
				</u-button>
			</view>
			
			<!-- 联系我们 -->
			<view class="contact-us" @tap="contactUs">
				联系我们
			</view>
		</view>
	</view>
</template>

<script>
	// 引入API
	import { authApi } from '../../api/modules/auth';
	import { hasValidToken, redirectToChat } from '../../api/utils/auth';
	
	export default {
		data() {
			return {
				loginType: 'password',     // 默认密码登录
				phone: '',                // 手机号
				code: '',                 // 验证码
				password: '',             // 密码
				passwordVisible: false,   // 密码是否可见
				agreement: true,         // 是否同意协议
				codeSending: false,       // 是否正在发送验证码
				countdown: 60,            // 倒计时
				codeText: '发送验证码'      // 验证码按钮文本
			}
		},
		// 页面加载时检查token
		onLoad() {
			this.checkTokenStatus();
		},
		// 页面显示时检查token
		onShow() {
			this.checkTokenStatus();
		},
		computed: {
			// 验证手机号是否有效
			isPhoneValid() {
				return this.phone && this.phone.length === 11;
			},
			// 验证是否可以登录
			canLogin() {
				if (!this.phone || !this.agreement) {
					return false;
				}
				
				if (this.loginType === 'code') {
					return this.isPhoneValid && this.code && this.code.length === 6;
				} else {
					return this.password && this.password.length >= 6;
				}
			}
		},
		methods: {
			// 检查token状态
			checkTokenStatus() {
				// 如果token有效，则跳转到聊天页面
				if (hasValidToken()) {
					redirectToChat();
				}
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 切换登录类型
			switchLoginType(type) {
				this.loginType = type;
			},
			
			// 发送验证码
			sendCode() {
				if (this.codeSending || !this.isPhoneValid) return;
				
				this.codeSending = true;
				this.countdown = 60;
				this.codeText = `${this.countdown}秒后重发`;
				
				// 模拟发送验证码
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				});
				
				const timer = setInterval(() => {
					this.countdown--;
					this.codeText = `${this.countdown}秒后重发`;
					
					if (this.countdown <= 0) {
						clearInterval(timer);
						this.codeSending = false;
						this.codeText = '发送验证码';
					}
				}, 1000);
			},
			
			checkboxChange(){
				this.agreement = !this.agreement
			},
			
			
			// 处理登录
			async handleLogin() {
				// 检查是否同意协议
				console.log(this.agreement)
				if (!this.agreement) {
					uni.showToast({
						title: '请阅读并同意用户协议和隐私政策',
						icon: 'none',
						duration: 2000
					});
					return;
				}
				
				if (!this.canLogin) {
					// 显示错误原因
					if (!this.isPhoneValid) {
						uni.showToast({
							title: '请输入正确的手机号',
							icon: 'none'
						});
					} else if (this.loginType === 'code' && (!this.code || this.code.length !== 6)) {
						uni.showToast({
							title: '请输入6位验证码',
							icon: 'none'
						});
					} else if (this.loginType === 'password' && (!this.password || this.password.length < 6)) {
						uni.showToast({
							title: '密码不能少于6位',
							icon: 'none'
						});
					}
					return;
				}
				
				uni.showLoading({
					title: '登录中...',
					mask: true
				});
				
				try {
					// 调用登录API
					const loginPassword = this.loginType === 'password' ? this.password : this.code;
					const response = await authApi.login(this.phone, loginPassword);
				
					console.log(response);

					if (response.code === 200) { // 成功code是200
						// 登录成功，缓存token信息
						const { token, member, token_expired } = response.data;
						
						// 存储token信息
						uni.setStorageSync('token', token);
						uni.setStorageSync('member', JSON.stringify(member));
						uni.setStorageSync('token_expired', token_expired);

						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});
						
						// 登录成功后跳转到对话页面
						setTimeout(() => {
							redirectToChat();
						}, 1500);
					} else {
						// 登录失败，显示错误信息
						uni.showToast({
							title: response.msg || '登录失败，请重试',
							icon: 'none'
						});
					}
				} catch (err) {
					console.error('登录失败:', err);
					uni.showToast({
						title: '网络异常，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			// 第三方登录
			handleThirdLogin(platform) {
				uni.showToast({
					title: `${platform === 'wechat' ? '微信' : 'Apple'}登录功能暂未实现`,
					icon: 'none'
				});
			},
			
			// 打开协议
			openAgreement(type) {
				uni.showToast({
					title: `打开${type === 'user' ? '用户协议' : '隐私政策'}`,
					icon: 'none'
				});
			},
			
			// 联系我们
			contactUs() {
				uni.showToast({
					title: '联系方式: support@example.com',
					icon: 'none',
					duration: 3000
				});
			}
		}
	}
</script>

<style lang="scss">
	.login-page {
		min-height: 100vh;
		background-color: #fff;
		display: flex;
		flex-direction: column;
		padding-top: 40px; /* 为状态栏预留空间 */
	}
	
	.page-header {
		display: flex;
		align-items: center;
		position: relative;
		padding: 10px 0;
		margin-bottom: 10px;
	}
	
	.back-btn {
		position: absolute;
		left: 15px;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		z-index: 2;
	}
	
	.page-title {
		text-align: center;
		font-size: 18px;
		font-weight: bold;
		width: 100%;
	}
	
	.content-area {
		flex: 1;
		padding: 0 30px;
	}
	
	.tab-container {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
		position: relative;
	}
	
	.tab-item {
		position: relative;
		text-align: center;
		padding: 10px 0;
		font-size: 16px;
		color: #666;
		flex: 1;
	}
	
	.tab-item.active {
		color: #4080ff;
		font-weight: bold;
	}
	
	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 25%;
		width: 50%;
		height: 3px;
		background-color: #4080ff;
		border-radius: 2px;
	}
	
	.tip-text {
		font-size: 14px;
		color: #666;
		margin-bottom: 20px;
	}
	
	.input-item {
		display: flex;
		align-items: center;
		border-bottom: 1px solid #eee;
		padding: 12px 0;
		height: 24px;
	}
	
	.input-prefix {
		color: #333;
		margin-right: 10px;
		padding-right: 10px;
		border-right: 1px solid #eee;
		font-size: 14px;
	}
	
	.input-field {
		flex: 1;
		height: 24px;
		font-size: 15px;
	}
	
	.code-input-box {
		position: relative;
	}
	
	.send-code-btn {
		position: absolute;
		right: 0;
		background-color: #4080ff;
		color: #fff;
		padding: 5px 10px;
		border-radius: 4px;
		font-size: 12px;
	}
	
	.send-code-btn.disabled {
		background-color: #ccc;
	}
	
	.password-icon {
		padding: 0 5px;
		height: 100%;
		display: flex;
		align-items: center;
	}
	
	.agreement-container {
		display: flex;
		align-items: center;
		margin: 15px 0;
	}
	
	.agreement-checkbox {
		transform: scale(0.8);
		margin-right: 5px;
	}
	
	.agreement-text {
		font-size: 13px;
		color: #666;
	}
	
	.agreement-link {
		font-size: 13px;
		color: #4080ff;
	}
	
	.login-btn {
		height: 44px;
		line-height: 44px;
		text-align: center;
		background-color: #dddddd;
		color: #ffffff;
		border-radius: 22px;
		margin: 20px 0;
		font-size: 16px;
		transition: background-color 0.3s;
	}
	
	.login-btn.active {
		background-color: #4080ff;
	}
	
	.divider {
		display: flex;
		align-items: center;
		margin: 20px 0;
	}
	
	.divider-line {
		flex: 1;
		height: 1px;
		background-color: #eee;
	}
	
	.divider-text {
		color: #999;
		padding: 0 15px;
		font-size: 14px;
	}
	
	.third-party-login {
		margin: 20px 0;
	}
	
	.contact-us {
		text-align: center;
		color: #999;
		font-size: 14px;
		margin-top: 40px;
	}
</style> 