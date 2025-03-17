<template>
  <div>
    <MainLayout :idx="0">
      <el-container slot="container" class="container">
        <el-header height="60px" class="header no-select" style="font-weight: 500;">首页</el-header>
        <el-container class="full-height" style="background-color: #f4f4f4; overflow-x: hidden; overflow-y: auto;">
          <el-main style="padding-right: 0;">
            <div style="padding-right: 15px;">
              <div style="float: left; width: calc(100% - 335px); padding: 10px 15px 15px 15px; box-shadow: 0 2px 12px 0 rgba(153,153,153, 0.1); background-color: #fff;">
                <el-tabs v-model="active">
                  <el-tab-pane label="数据总览" name="first">
                    <div v-if="false" style="display: flex; justify-content: space-between; margin-top: 12px;">
                      <div class="block-item">
                        <div class="block-item-head" style="height: 40px;">
                          <div>
                            <div style="font-size: 14px;">数据总览</div>
                          </div>
                        </div>
                        <div style="padding: 12px 0 0 12px; display: flex; flex-wrap: wrap;">
                          <div class="data-item">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.friend_total ? chatStat.friend_total : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">客户总数</div>
                          </div>
                          <div class="data-item">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.friend_yes_total ? chatStat.friend_yes_total : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">现存客户</div>
                          </div>
                          <div class="data-item">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.friend_del_total ? chatStat.friend_del_total : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">被删总数</div>
                          </div>
                          <div class="data-item">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.bind_total ? chatStat.bind_total : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">注册总数</div>
                          </div>
                          <div class="data-item">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.account_total ? chatStat.account_total : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">账号总数</div>
                          </div>
                        </div>
                      </div>
                      <div class="block-item" style="width: calc(66.66% - 8px)">
                        <div class="block-item-head" style="height: 40px;">
                          <div>
                            <div style="font-size: 14px;">今日数据<span style="font-size: 12px; color: #888; margin-left: 10px;">(每小时更新一次)</span></div>
                          </div>
                        </div>
                        <div style="padding: 12px 0 0 12px; display: flex; flex-wrap: wrap;">
                          <div class="data-item">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.friend_today ? chatStat.friend_today : 0 }}/{{ chatStat.friend_yes_today ? chatStat.friend_yes_today : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">今日新客数/现存新客数</div>
                          </div>
                          <div class="data-item">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.bind_today ? chatStat.bind_today : 0 }}/{{ chatStat.bind_total ? chatStat.bind_total : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">今日注册数/总注册数</div>
                          </div>
                          <div class="data-item">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.friend_del_today ? chatStat.friend_del_today : 0 }}/{{ chatStat.friend_del_total ? chatStat.friend_del_total : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">今日被删除数/总被删除数</div>
                          </div>
                          <div class="data-item" style="width: calc(20% - 12px);">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.plus_today ? chatStat.plus_today : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">今日添加好友数</div>
                          </div>
                          <div class="data-item" style="width: calc(20% - 12px);">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.plus_pass_today ? chatStat.plus_pass_today : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">今日通过好友数</div>
                          </div>
                          <div class="data-item" style="width: calc(20% - 12px);">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.friend_send_today ? chatStat.friend_send_today : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">今日发送消息人数</div>
                          </div>
                          <div class="data-item" style="width: calc(20% - 12px);">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.friend_reply_today ? chatStat.friend_reply_today : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">今日回复消息人数</div>
                          </div>
                          <div class="data-item" style="width: calc(20% - 12px);">
                            <div style="font-size: 18px; font-weight: bold;">{{ chatStat.friend_reply_rate ? chatStat.friend_reply_rate : 0 }}</div>
                            <div style="font-size: 12px; margin-top: 8px;">今日回复率(%)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="false" style="display: flex; justify-content: space-between; margin-top: 12px;">
                      <div class="block-item">
                        <div class="block-item-head" style="height: 40px;">
                          <div style="font-size: 14px;">业绩指标</div>
                          <div style="display: flex; align-items: center;">
                            <div style="line-height: 40px; font-size: 12px; padding-right: 8px;">注册目标: {{ performanceNum }}</div>
                            <el-radio-group v-model="performanceType" @change="loadPerformanceStatIndex" size="mini">
                              <el-radio-button label="day">日</el-radio-button>
                              <el-radio-button label="week">周</el-radio-button>
                              <el-radio-button label="month">月</el-radio-button>
                            </el-radio-group>
                          </div>
                        </div>
                        <div style="height: 300px; overflow-x: hidden; overflow-y: auto;">
                          <div style="width: 100%; height: auto;">
                            <div style="padding: 12px; font-size: 13px;">
                              <div v-for="(item, i) in performanceList" :key="i" style="height: 30px; display: flex; align-items: center;">
                                <div style="width: 10%;">{{ i + 1 }}</div>
                                <div style="width: 50%;">{{ item.name }}</div>
                                <div style="width: 40%;"><el-progress :percentage="item.rate"></el-progress></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="block-item" style="width: calc(66.66% - 8px)">
                        <div class="block-item-head" style="height: 40px;">
                          <div style="font-size: 14px;">加人增长</div>
                          <div style="display: flex; align-items: center;">
                            <el-radio-group v-model="plusIncType" @change="setPlusInc" size="mini">
                              <el-radio-button label="day">日</el-radio-button>
                              <el-radio-button label="week">周</el-radio-button>
                              <el-radio-button label="month">月</el-radio-button>
                            </el-radio-group>
                          </div>
                        </div>
                        <div style="height: 300px;">
                          <iframe :src="plusIncUrl" style="width: 100%; height: 100%; border: 0;"></iframe>
                        </div>
                      </div>
                    </div>
                    <div v-if="false" style="margin-top: 20px; border-top: 1px solid #e8e8e8;">
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="padding: 15px 0; font-size: 14px; font-weight: bold;">员工账号<span style="font-size: 12px; color: #888; margin-left: 10px; font-weight: normal;">(每小时更新一次)</span></div>
                        <div>
                          <el-date-picker
                              v-model="userDays"
                              type="date"
                              format="yyyy年MM月dd日"
                              value-format="yyyyMMdd"
                              placeholder="选择日期"
                              @change="loadChatStatUserIndex"
                              size="mini"
                              style="width: 158px;">
                          </el-date-picker>
                        </div>
                      </div>
                      <div>
                        <el-table
                            :data="userList"
                            height="300px"
                            stripe
                            style="width: 100%;"
                            size="small">
                          <el-table-column
                              prop="days"
                              label="日期"
                              min-width="120"
                              show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                              prop="username"
                              label="账号"
                              min-width="120"
                              show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                              prop="name"
                              label="姓名"
                              min-width="120"
                              show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                              prop="bind_total"
                              label="总注册数"
                              min-width="100"
                              show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                              prop="bind_today"
                              label="今日注册数"
                              min-width="100"
                              show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                              prop="friend_send_today"
                              label="发送消息人数"
                              min-width="100"
                              show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                              prop="friend_reply_today"
                              label="回复消息人数"
                              min-width="100"
                              show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                              prop="friend_reply_rate"
                              label="回复消息率"
                              min-width="100"
                              show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                              prop="group_send_today"
                              label="群发消息数"
                              width="100">
                          </el-table-column>
                          <el-table-column
                              prop="group_send_reply_rate_today"
                              label="群发回复率"
                              width="100">
                          </el-table-column>
                          <el-table-column
                              prop="update_time"
                              label="更新时间"
                              width="150">
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <div style="float: right; width: 288px;">
                <div style="padding: 10px 15px; box-shadow: 0 2px 12px 0 rgba(153,153,153, 0.1); background-color: #fff; display: none;">
                  <div style="font-size: 14px; font-weight: bold; line-height: 30px;">企微号</div>
                  <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 14px;">
                    <div style="background-color: #ffede3; width: 123px; padding-bottom: 10px; border-radius: 5px;">
                      <div style="padding: 10px 15px;">席位数：</div>
                      <div style="font-size: 18px; font-weight: bold; color: #f90; padding-left: 15px; line-height: 18px;">-</div>
                    </div>
                    <div style="background-color: #ffede3; width: 123px; padding-bottom: 10px; border-radius: 5px;">
                      <div style="padding: 10px 15px;">当前在线数：</div>
                      <div style="font-size: 18px; font-weight: bold; color: #f90; padding-left: 15px; line-height: 18px;">-</div>
                    </div>
                  </div>
                  <div style="padding-bottom: 10px;">
                    <el-button type="primary" size="medium" plain style="width: 100%; margin-top: 15px;">企微号管理</el-button>
                  </div>
                </div>
                <div style="padding: 10px 15px; box-shadow: 0 2px 12px 0 rgba(153,153,153, 0.1); background-color: #fff;">
                  <div style="font-size: 14px; font-weight: bold; line-height: 30px;">帮助文档</div>
                  <div style="margin-top: 10px;">
                    <!--<div class="help-item">
                      <i class="el-icon-question"></i>
                      <span>天眼AI操作指南</span>
                    </div>
                    <div class="help-item">
                      <i class="el-icon-question"></i>
                      <span>账号登录注意事项</span>
                    </div>
                    <div class="help-item">
                      <i class="el-icon-question"></i>
                      <span>如何配置新客户自动化接待</span>
                    </div>-->
                  </div>
                </div>
              </div>
              <div style="clear: both;"></div>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </MainLayout>
  </div>
</template>
<script>
import MainLayout from '@/views/layout/MainLayout'
import config from '@/config/config'
import { getToken } from "@/utils/auth";

export default {
  name: 'WorkPage',
  components: {
    MainLayout,
  },
  data() {
    return {
      type: 2,
      active: 'first',
      tableData: [],
      userSmall: {},
      payMoney: {},
      sendNum: {},
      chatStat: {},
      userDays: '',
      userList: [],
      performanceType: 'day',
      performanceList: [],
      performanceNum: 0,
      plusIncType: 'day',
      plusIncUrl: '',
    }
  },
  created() {
    //this.loadData()
    //this.setPlusInc()
  },
  methods: {
    setPlusInc() {
      //this.plusIncUrl = config.BASE_API_URL + '/manage/plus_stat/chartIndex?type=' + this.plusIncType + '&token=' + getToken()
    },
    loadData() {

    },

    timeFormat(timestamp, fmt) {
      var t = new Date(timestamp);
      var o = {
        "M+" : t.getMonth() + 1,                 //月份
        "d+" : t.getDate(),                    //日
        "h+" : t.getHours(),                   //小时
        "m+" : t.getMinutes(),                 //分
        "s+" : t.getSeconds(),                 //秒
        "q+" : Math.floor((t.getMonth() + 3) / 3), //季度
        "S"  : t.getMilliseconds()             //毫秒
      };
      if(/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (t.getFullYear() + '').substr(4 - RegExp.$1.length));
      }
      for (var k in o) {
        if(new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
      }
      return fmt;
    },
    clientScreenChange(e) {
      var t = new Date().getTime()
      var n = this.timeFormat(t, 'yyyy-MM-dd')
      var l = this.timeFormat(t - e * 24 * 3600 * 1000 + 24 * 3600 * 1000, 'yyyy-MM-dd')

      this.clientDate = [
          l, n
      ]
    },
  }
}
</script>
<style lang="less">
.block-item .data-item {
  width: calc(33.33% - 12px);
  background: #f4f4f4;
  border-radius: 3px;
  text-align: center;
  padding: 12px 0;
  margin-right: 12px;
  margin-bottom: 12px;
}
.block-item {
  width: calc(33% - 8px);
  border: 1px solid #e8e8e8;
  border-radius: 3px;
}
.block-item-head {
  padding: 0 15px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
}
.help-item {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  height: 38px;
  font-size: 14px;
  color: #333;
  padding: 0 10px;
  margin-bottom: 5px;
  cursor: pointer;
}
.help-item span {
  padding-left: 5px;
}
.help-item :hover {
  background: rgb(236, 245, 255);
}
.container {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .header {
    line-height: 60px;
    border-bottom: 1px solid #f5f5f5;
  }

  .aside {
    display: flex;
    flex-direction: column;
    padding: 8px;
    background-color: #f0f2f5;

    a {
      text-decoration: none;
      color: rgba(0, 0, 0, 0.65);
    }

    .menu-list {
      height: 35px;
      line-height: 35px;
      padding-left: 25px;
      font-weight: 400;
      font-size: 13px;
      background-color: white;
      border-left: 3px solid white;
      border-radius: 5px;
      margin: 4px 2px;
      transition: ease 0.5s;

      &:hover {
        color: rgb(24, 144, 255);
      }

      &.selectd {
        border-left-color: #2196f3;
        color: #2196f3;
      }
    }
  }
}
</style>
