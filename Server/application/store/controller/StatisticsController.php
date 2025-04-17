<?php

namespace app\store\controller;

use app\store\model\WechatFriendModel;
use app\store\model\WechatMessageModel;
use think\facade\Db;

/**
 * 数据统计控制器
 */
class StatisticsController extends BaseController
{
    /**
     * 获取数据概览
     */
    public function getOverview()
    {
        try {
            $companyId =  $this->userInfo['companyId'];
            $wechatAccountId = $this->device['wechatAccountId'];
           
            // 获取时间范围
            $timeRange = $this->getTimeRange();
            $startTime = $timeRange['start_time'];
            $endTime = $timeRange['end_time'];
            $lastStartTime = $timeRange['last_start_time'];
            $lastEndTime = $timeRange['last_end_time'];

            // 1. 总客户数
            $totalCustomers = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])
            ->whereTime('createTime', '>=', $startTime)
            ->whereTime('createTime', '<', $endTime)
            ->count();

            // 上期总客户数
            $lastTotalCustomers = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])
            ->whereTime('createTime', '>=', $lastStartTime)
            ->whereTime('createTime', '<', $lastEndTime)
            ->count();

            // 2. 新增客户数
            $newCustomers = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])
            ->whereTime('createTime', '>=', $startTime)
            ->whereTime('createTime', '<', $endTime)
            ->count();

            // 上期新增客户数
            $lastNewCustomers = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])
            ->whereTime('createTime', '>=', $lastStartTime)
            ->whereTime('createTime', '<', $lastEndTime)
            ->count();

            //3. 互动次数
            $interactionCount = WechatMessageModel::where(['wechatAccountId'=> $wechatAccountId])
            ->where('createTime', '>=', strtotime($startTime))
            ->where('createTime', '<', strtotime($endTime))
            ->count();

            // 上期互动次数
            $lastInteractionCount = WechatMessageModel::where(['wechatAccountId'=> $wechatAccountId])
            ->where('createTime', '>=', strtotime($lastStartTime))
            ->where('createTime', '<', strtotime($lastEndTime))
            ->count();
        

     

            // 计算环比增长率
            $customerGrowth = $this->calculateGrowth($totalCustomers, $lastTotalCustomers);
            $newCustomerGrowth = $this->calculateGrowth($newCustomers, $lastNewCustomers);
            $interactionGrowth = $this->calculateGrowth($interactionCount, $lastInteractionCount);
            $data = [
                'total_customers' => [
                    'value' => $totalCustomers,
                    'growth' => $customerGrowth
                ],
                'new_customers' => [
                    'value' => $newCustomers,
                    'growth' => $newCustomerGrowth
                ],
                'interaction_count' => [
                    'value' => $interactionCount,
                    'growth' => $interactionGrowth
                ]
            ];

            return successJson($data);
        } catch (\Exception $e) {
            return errorJson('获取数据概览失败：' . $e->getMessage());
        }
    }

    /**
     * 获取客户分析数据
     */
    public function getCustomerAnalysis()
    {
        try {
            $companyId =  $this->userInfo['companyId'];
            $wechatAccountId = $this->device['wechatAccountId'];
            
            // 获取时间范围
            $timeRange = $this->getTimeRange();
            $startTime = $timeRange['start_time'];
            $endTime = $timeRange['end_time'];

            // 1. 客户增长趋势数据
            $totalCustomers = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])
                ->whereTime('createTime', '<', $endTime)
                ->count();

            $newCustomers = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])
                ->whereTime('createTime', '>=', $startTime)
                ->whereTime('createTime', '<', $endTime)
                ->count();

            // 计算流失客户数（假设超过30天未互动的客户为流失客户）
            $lostCustomers = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])->where('createTime','>',0)
                ->whereTime('deleteTime', '<', date('Y-m-d', strtotime('-30 days')))
                ->count();

            // 2. 客户来源分布数据
            // 朋友推荐
            $friendRecommend = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])
                ->whereIn('addFrom', [17, 1000017])
                ->count();

            // 微信搜索
            $wechatSearch = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])
                ->whereIn('addFrom', [3, 15, 1000003, 1000015])
                ->count();

            // 微信群
            $wechatGroup = WechatFriendModel::where(['ownerWechatId'=> $wechatAccountId])
                ->whereIn('addFrom', [14, 1000014])
                ->count();

            // 其他渠道（总数减去已知渠道）
            $otherSource = $totalCustomers - $friendRecommend - $wechatSearch - $wechatGroup;
            $otherSource = max(0, $otherSource); // 确保不会出现负数

            // 计算百分比
            $calculatePercentage = function($value) use ($totalCustomers) {
                if ($totalCustomers <= 0) return 0;
                return round(($value / $totalCustomers) * 100, 2);
            };

            $sourceDistribution = [
                [
                    'name' => '朋友推荐',
                    'value' => $calculatePercentage($friendRecommend) . '%',
                    'count' => $friendRecommend
                ],
                [
                    'name' => '微信搜索',
                    'value' => $calculatePercentage($wechatSearch) . '%',
                    'count' => $wechatSearch
                ],
                [
                    'name' => '微信群',
                    'value' => $calculatePercentage($wechatGroup) . '%',
                    'count' => $wechatGroup
                ],
                [
                    'name' => '其他渠道',
                    'value' => $calculatePercentage($otherSource) . '%',
                    'count' => $otherSource
                ]
            ];

            $data = [
                'trend' => [
                    'total' => $totalCustomers,
                    'new' => $newCustomers,
                    'lost' => $lostCustomers
                ],
                'source_distribution' => $sourceDistribution
            ];

            return successJson($data);
        } catch (\Exception $e) {
            return errorJson('获取客户分析数据失败：' . $e->getMessage());
        }
    }

    /**
     * 获取互动分析数据
     */
    public function getInteractionAnalysis()
    {
        try {
            $companyId = $this->userInfo['companyId'];
            $wechatAccountId = $this->device['wechatAccountId'];
            
            // 获取时间范围
            $timeRange = $this->getTimeRange();
            $startTime = $timeRange['start_time'];
            $endTime = $timeRange['end_time'];
            
            // 转换为时间戳
            $startTimestamp = strtotime($startTime);
            $endTimestamp = strtotime($endTime);

            // 1. 互动频率分析
            // 高频互动用户数（每天3次以上）
            $highFrequencyUsers = WechatMessageModel::where(['wechatAccountId' => $wechatAccountId])
                ->where('createTime', '>=', $startTimestamp)
                ->where('createTime', '<', $endTimestamp)
                ->field('wechatFriendId, COUNT(*) as count')
                ->group('wechatFriendId')
                ->having('count > 3')
                ->count();
                
            // 中频互动用户数（每天1-3次）
            $midFrequencyUsers = WechatMessageModel::where(['wechatAccountId' => $wechatAccountId])
                ->where('createTime', '>=', $startTimestamp)
                ->where('createTime', '<', $endTimestamp)
                ->field('wechatFriendId, COUNT(*) as count')
                ->group('wechatFriendId')
                ->having('count >= 1 AND count <= 3')
                ->count();
                
            // 低频互动用户数（仅有1次）
            $lowFrequencyUsers = WechatMessageModel::where(['wechatAccountId' => $wechatAccountId])
                ->where('createTime', '>=', $startTimestamp)
                ->where('createTime', '<', $endTimestamp)
                ->field('wechatFriendId, COUNT(*) as count')
                ->group('wechatFriendId')
                ->having('count = 1')
                ->count();

            // 2. 互动内容分析
            // 文字消息数量
            $textMessages = WechatMessageModel::where([
                'wechatAccountId' => $wechatAccountId,
                'msgType' => 1 
            ])
                ->where('createTime', '>=', $startTimestamp)
                ->where('createTime', '<', $endTimestamp)
                ->count();
                
            // 图片互动数量
            $imgInteractions = WechatMessageModel::where([
                'wechatAccountId' => $wechatAccountId,
                'msgType' => 3
            ])
                ->where('createTime', '>=', $startTimestamp)
                ->where('createTime', '<', $endTimestamp)
                ->count();
                
            // 群聊互动数量
            $groupInteractions = WechatMessageModel::where([
                'wechatAccountId' => $wechatAccountId,
                'type' => 2 
            ])
                ->where('createTime', '>=', $startTimestamp)
                ->where('createTime', '<', $endTimestamp)
                ->count();
                
            // 产品咨询数量 (通过消息内容模糊查询)
            $productInquiries = WechatMessageModel::where([
                'wechatAccountId' => $wechatAccountId
            ])
                ->where('createTime', '>=', $startTimestamp)
                ->where('createTime', '<', $endTimestamp)
                ->where('content', 'like', '%产品%')
                ->whereOr('content', 'like', '%价格%')
                ->whereOr('content', 'like', '%购买%')
                ->whereOr('content', 'like', '%优惠%')
                ->count();

            // 构建返回数据
            $data = [
                'frequency_analysis' => [
                    'high_frequency' => $highFrequencyUsers,
                    'mid_frequency' => $midFrequencyUsers,
                    'low_frequency' => $lowFrequencyUsers,
                    'chart_data' => [
                        ['name' => '高频互动', 'value' => $highFrequencyUsers],
                        ['name' => '中频互动', 'value' => $midFrequencyUsers],
                        ['name' => '低频互动', 'value' => $lowFrequencyUsers]
                    ]
                ],
                'content_analysis' => [
                    'text_messages' => $textMessages,
                    'img_interactions' => $imgInteractions,
                    'group_interactions' => $groupInteractions,
                    'product_inquiries' => $productInquiries,
                    'chart_data' => [
                        ['name' => '文字互动', 'value' => $textMessages],
                        ['name' => '图片互动', 'value' => $imgInteractions],
                        ['name' => '群聊互动', 'value' => $groupInteractions],
                        ['name' => '产品咨询', 'value' => $productInquiries]
                    ]
                ]
            ];

            return successJson($data);
        } catch (\Exception $e) {
            return errorJson('获取互动分析数据失败：' . $e->getMessage());
        }
    }

    /**
     * 获取时间范围
     */
    private function getTimeRange()
    {
        // 可选：today, yesterday, this_week, last_week, this_month, this_quarter, this_year
        $timeType = input('time_type', 'this_week');
        
        switch ($timeType) {
            case 'today': // 今日
                $startTime = date('Y-m-d');
                $endTime = date('Y-m-d', strtotime('+1 day'));
                $lastStartTime = date('Y-m-d', strtotime('-1 day')); // 昨日
                $lastEndTime = $startTime;
                break;
                
            case 'yesterday': // 昨日
                $startTime = date('Y-m-d', strtotime('-1 day'));
                $endTime = date('Y-m-d');
                $lastStartTime = date('Y-m-d', strtotime('-2 day')); // 前日
                $lastEndTime = $startTime;
                break;
                
            case 'this_week': // 本周
                $startTime = date('Y-m-d', strtotime('monday this week'));
                $endTime = date('Y-m-d', strtotime('monday next week'));
                $lastStartTime = date('Y-m-d', strtotime('monday last week')); // 上周一
                $lastEndTime = $startTime;
                break;
                
            case 'last_week': // 上周
                $startTime = date('Y-m-d', strtotime('monday last week'));
                $endTime = date('Y-m-d', strtotime('monday this week'));
                $lastStartTime = date('Y-m-d', strtotime('monday last week', strtotime('last week'))); // 上上周一
                $lastEndTime = $startTime;
                break;
                
            case 'this_month': // 本月
                $startTime = date('Y-m-01');
                $endTime = date('Y-m-d', strtotime(date('Y-m-01') . ' +1 month'));
                $lastStartTime = date('Y-m-01', strtotime('-1 month')); // 上月初
                $lastEndTime = $startTime;
                break;
                
            case 'this_quarter': // 本季度
                $month = date('n');
                $quarter = ceil($month / 3);
                $startMonth = ($quarter - 1) * 3 + 1;
                $startTime = date('Y-') . str_pad($startMonth, 2, '0', STR_PAD_LEFT) . '-01';
                $endTime = date('Y-m-d', strtotime($startTime . ' +3 month'));
                // 上季度
                $lastStartTime = date('Y-m-d', strtotime($startTime . ' -3 month'));
                $lastEndTime = $startTime;
                break;
                
            case 'this_year': // 本年度
                $startTime = date('Y-01-01');
                $endTime = (date('Y') + 1) . '-01-01';
                $lastStartTime = (date('Y') - 1) . '-01-01'; // 去年初
                $lastEndTime = $startTime;
                break;
                
            default:
                $startTime = date('Y-m-d', strtotime('monday this week'));
                $endTime = date('Y-m-d', strtotime('monday next week'));
                $lastStartTime = date('Y-m-d', strtotime('monday last week'));
                $lastEndTime = $startTime;
        }

        return [
            'start_time' => $startTime,
            'end_time' => $endTime,
            'last_start_time' => $lastStartTime,
            'last_end_time' => $lastEndTime
        ];
    }

    /**
     * 计算环比增长率
     */
    private function calculateGrowth($current, $last)
    {
        if ($last == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $last) / $last) * 100, 1);
    }
} 