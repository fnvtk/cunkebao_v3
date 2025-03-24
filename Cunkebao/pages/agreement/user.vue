<template>
  <view class="agreement-container">
    <u-navbar
      title="用户协议"
      bgColor="#ffffff"
    ></u-navbar>
    
    <view class="content">
      <view class="title">村客宝用户协议</view>
      <view class="date">生效日期：2023年1月1日</view>
      
      <view class="section">
        <view class="section-title">一、总则</view>
        <view class="paragraph">
          1.1 村客宝用户协议（以下简称"本协议"）是您与村客宝平台（以下简称"我们"）之间就村客宝平台服务等相关事宜所订立的契约。
        </view>
        <view class="paragraph">
          1.2 您应当在使用村客宝平台服务之前认真阅读本协议全部内容。如您对本协议有任何疑问，可随时咨询我们的客服。
        </view>
        <view class="paragraph">
          1.3 您点击"同意"或"下一步"，或您使用村客宝平台服务，即视为您已阅读并同意签署本协议。本协议自您确认同意之时起生效。
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">二、账号注册与使用</view>
        <view class="paragraph">
          2.1 您应当保证您具有完全民事行为能力，能够独立承担民事责任，并独立承担使用村客宝平台服务的一切法律责任。
        </view>
        <view class="paragraph">
          2.2 您注册成功后，我们将给予您一个用户账号及相应的密码，该用户账号和密码由您负责保管。
        </view>
        <view class="paragraph">
          2.3 您应当对您的账号负责，并就账号项下的一切行为负全部责任。因您保管不当等自身原因导致的任何损失或损害，我们不承担责任。
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">三、服务内容</view>
        <view class="paragraph">
          3.1 村客宝平台服务的具体内容由我们根据实际情况提供，包括但不限于信息发布、交易撮合、数据统计等。
        </view>
        <view class="paragraph">
          3.2 我们有权不经事先通知，随时变更、中断或终止部分或全部的服务。
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">四、用户义务</view>
        <view class="paragraph">
          4.1 您在使用村客宝平台服务时，必须遵守中华人民共和国相关法律法规。
        </view>
        <view class="paragraph">
          4.2 您不得利用村客宝平台服务从事违法违规行为，包括但不限于发布违法信息、侵犯他人知识产权等。
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">五、知识产权</view>
        <view class="paragraph">
          5.1 村客宝平台所包含的全部智力成果，包括但不限于程序、源代码、图标、图饰、图像、图表、文字等，均受著作权法、商标法、专利法及其他知识产权法律法规的保护。
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">六、隐私保护</view>
        <view class="paragraph">
          6.1 保护您的隐私是我们的重要原则，我们会采取合理的措施保护您的个人信息。
        </view>
        <view class="paragraph">
          6.2 有关隐私保护的详细政策，请参见《隐私政策》。
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">七、协议修改</view>
        <view class="paragraph">
          7.1 我们有权随时修改本协议，并在修改后的协议生效前通过适当方式通知您。
        </view>
        <view class="paragraph">
          7.2 如您不同意修改后的协议，可以选择停止使用村客宝平台服务；如您继续使用村客宝平台服务，则视为您已同意修改后的协议。
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">八、法律适用与争议解决</view>
        <view class="paragraph">
          8.1 本协议的成立、生效、履行、解释及纠纷解决，适用中华人民共和国大陆地区法律。
        </view>
        <view class="paragraph">
          8.2 若您和我们之间发生任何纠纷或争议，首先应友好协商解决；协商不成的，您同意将纠纷或争议提交至本协议签订地有管辖权的人民法院管辖。
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      
    }
  },
  methods: {
    
  }
}
</script>

<style lang="scss" scoped>
.agreement-container {
  background-color: #ffffff;
  min-height: 100vh;
}

.content {
  padding: 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
  color: #333333;
}

.date {
  font-size: 24rpx;
  color: #999999;
  text-align: center;
  margin-bottom: 60rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333333;
}

.paragraph {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
  margin-bottom: 20rpx;
  text-align: justify;
}
</style>