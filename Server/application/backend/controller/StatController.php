<?php

namespace app\backend\controller;

use app\common\CloneInfo;
use app\common\model\MemberModel;
use app\common\model\MemberMoneyModel;
use app\common\model\MemberQrcodeModel;
use app\common\model\MemberWithdrawModel;
use app\common\model\StatisticsModel;
use app\common\Utils;

class StatController extends BaseLoginController {

    protected $chartColumns = [
        'register'             => '用户注册',
        'qr_number'            => '扫码企点号',
        'qr_member'            => '扫码人数',
        'qrcode'               => '取码次数',
        'qrcode_succ'          => '取码成功',
        'clone_succ'           => '克隆成功',
        'clone_error'          => '克隆错误',
        'clone_timeout'        => '克隆超时',
        'xinyue_select'        => '选择克隆心悦数',
        'xinyue_clone'         => '克隆成功心悦数',
        'reward_clone'         => '克隆奖励笔数',
        'reward_invite1'       => '一级奖励笔数',
        'reward_invite2'       => '二级奖励笔数',
        'money_clone'          => '克隆奖励金额',
        'money_invite1'        => '一级奖励金额',
        'money_invite2'        => '二级奖励金额',
        'withdraw'             => '申请提现笔数',
        'withdraw_check'       => '检测通过笔数',
        'withdraw_money'       => '申请提现金额',
        'withdraw_money_check' => '检测通过金额',
        'withdraw_succ'        => '提现成功笔数',
        'withdraw_succ_money'  => '提现成功金额',
        'withdraw_fail'        => '提现失败笔数',
        'withdraw_fail_money'  => '提现失败金额',
    ];

    public function dayChartView() {
        $day     = trim($this->request->param('day'));
        $columns = trim($this->request->param('columns'));
        $columns = explode('|', $columns);
        if (empty($day) OR empty($columns)) {
            exit('Page not found.');
        }

        $legend = [];
        $xAxis  = [];
        $series = [];
        for ($i = 0; $i <= 23; $i ++) {
            $xAxis[] = $i . '时';
        }
        foreach ($columns as $i => $column) {
            if (isset($this->chartColumns[$column])) {
                $legend[] = $this->chartColumns[$column];
                $series[$column] = [
                    'name'  => $this->chartColumns[$column],
                    'type'  => 'line',
                    'stack' => 'Total',
                    'data'  => [],
                ];
            } else {
                unset($columns[$i]);
            }
        }

        $list = $this->getDayData($day);
        $rows = [];
        foreach ($list as $row) {
            $rows[$row['hour']] = $row;
        }

        foreach ($xAxis as $axi) {
            if (isset($rows[$axi])) {
                foreach ($columns as $column) {
                    $series[$column]['data'][] = $rows[$axi][$column];
                }
            } else {
                foreach ($columns as $column) {
                    $series[$column]['data'][] = 0;
                }
            }
        }

        return $this->fetch('/chart-day', [
            'legend' => $legend,
            'xAxis'  => $xAxis,
            'series' => array_values($series),
        ]);
    }

    public function monthChartView() {
        $month   = trim($this->request->param('month'));
        $columns = trim($this->request->param('columns'));
        $columns = explode('|', $columns);
        if (empty($month) OR empty($columns)) {
            exit('Page not found.');
        }

        $time = strtotime($month . '01');
        if ($time === FALSE) {
            exit('Page not found.');
        }

        $days   = date('t', $time);
        $legend = [];
        $xAxis  = [];
        $series = [];
        for ($i = 1; $i <= $days; $i ++) {
            $xAxis[] = $i . '日';
        }
        foreach ($columns as $i => $column) {
            if (isset($this->chartColumns[$column])) {
                $legend[] = $this->chartColumns[$column];
                $series[$column] = [
                    'name'  => $this->chartColumns[$column],
                    'type'  => 'line',
                    'stack' => 'Total',
                    'data'  => [],
                ];
            } else {
                unset($columns[$i]);
            }
        }

        $list = $this->getMonthData($month);
        $rows = [];
        foreach ($list as $row) {
            $row['day'] = str_replace(['年', '月'], '-', $row['day']);
            $row['day'] = str_replace(['日'], '', $row['day']);
            $row['day'] = intval(date('d', strtotime($row['day']))) . '日';

            $rows[$row['day']] = $row;
        }

        foreach ($xAxis as $axi) {
            if (isset($rows[$axi])) {
                foreach ($columns as $column) {
                    $series[$column]['data'][] = $rows[$axi][$column];
                }
            } else {
                foreach ($columns as $column) {
                    $series[$column]['data'][] = 0;
                }
            }
        }

        return $this->fetch('/chart-day', [
            'legend' => $legend,
            'xAxis'  => $xAxis,
            'series' => array_values($series),
        ]);
    }

    /**
     * 日统计图表
     *
     * @return \think\response\Json
     */
    public function dayChart() {
        $day     = trim($this->request->param('day'));
        $columns = $this->request->param('columns');
        if (empty($day)) {
            $day = date('Y-m-d');
        }
        if (strtotime($day) === FALSE) {
            return $this->jsonFail('日期错误');
        }
        if (empty($columns)) {
            $columns = ['xinyue_select', 'xinyue_clone', 'money_clone'];
        }

        return $this->jsonSucc([
            'day' => $day,
            'columns' => $columns,
            'chartColumns' => $this->assocToList($this->chartColumns),
            'url' => $this->absoluteUrl('/backend/stat/dayChartView?token=' . $this->token . '&day=' . $day . '&columns=' . implode('|', $columns)),
        ]);
    }

    /**
     * 月统计图表
     *
     * @return \think\response\Json
     */
    public function monthChart() {
        $month   = trim($this->request->param('month'));
        $columns = $this->request->param('columns');
        if (empty($month)) {
            $month = date('Ym');
        }
        if (empty($columns)) {
            $columns = ['xinyue_select', 'xinyue_clone', 'money_clone'];
        }

        return $this->jsonSucc([
            'month' => $month,
            'months' => $this->assocToList($this->getMonths()),
            'columns' => $columns,
            'chartColumns' => $this->assocToList($this->chartColumns),
            'url' => $this->absoluteUrl('/backend/stat/monthChartView?token=' . $this->token . '&month=' . $month . '&columns=' . implode('|', $columns)),
        ]);
    }

    /**
     * 日统计列表
     *
     * @return \think\response\Json
     */
    public function dayIndex() {
        $day = trim($this->request->param('day'));
        if (empty($day)) {
            $day = date('Y-m-d');
        }
        if (strtotime($day) === FALSE) {
            return $this->jsonFail('日期错误');
        }

        return $this->jsonSucc([
            'list' => $this->getDayData($day),
            'day'  => $day,
        ]);
    }

    /**
     * 月统计
     *
     * @return \think\response\Json
     */
    public function monthIndex() {
        $month = trim($this->request->param('month'));
        if (empty($month)) {
            $month = date('Ym');
        }

        return $this->jsonSucc([
            'list'   => $this->getMonthData($month),
            'month'  => $month,
            'months' => $this->assocToList($this->getMonths()),
        ]);
    }

    /**
     * 获取统计信息
     *
     * @return \think\response\Json
     */
    public function get() {
        $weekTime  = time() - 7 * 24 * 3600;
        $monthTime = time() - 30 * 24 * 3600;

        $memberTotal = MemberModel::where(1)
            ->count();
        $memberToday = MemberModel::where(1)
            ->where('create_time', '>=', strtotime(date('Y-m-d')))
            ->count();
        $memberYesterday = MemberModel::where(1)
            ->where('create_time', '>=', strtotime(date('Y-m-d')) - 24 * 3600)
            ->where('create_time', '<', strtotime(date('Y-m-d')))
            ->count();
        $memberWeek = MemberModel::where(1)
            ->where('create_time', '>=', $weekTime)
            ->count();
        $memberMonth = MemberModel::where(1)
            ->where('create_time', '>=', $monthTime)
            ->count();

        /*$xinyueTotal = MemberQrcodeModel::where(1)
            ->where('status', MemberQrcodeModel::STATUS_SUCCESS)
            ->sum('select_xinyue_count');
        $xinyueToday = MemberQrcodeModel::where(1)
            ->where('status', MemberQrcodeModel::STATUS_SUCCESS)
            ->where('create_time', '>=', strtotime(date('Y-m-d')))
            ->sum('select_xinyue_count');
        $xinyueYesterday = MemberQrcodeModel::where(1)
            ->where('status', MemberQrcodeModel::STATUS_SUCCESS)
            ->where('create_time', '>=', strtotime(date('Y-m-d')) - 24 * 3600)
            ->where('create_time', '<', strtotime(date('Y-m-d')))
            ->sum('select_xinyue_count');
        $xinyueWeek = MemberQrcodeModel::where(1)
            ->where('status', MemberQrcodeModel::STATUS_SUCCESS)
            ->where('create_time', '>=', $weekTime)
            ->sum('select_xinyue_count');
        $xinyueMonth = MemberQrcodeModel::where(1)
            ->where('status', MemberQrcodeModel::STATUS_SUCCESS)
            ->where('create_time', '>=', $monthTime)
            ->sum('select_xinyue_count');*/

        $xinyueTotal = StatisticsModel::where(1)
            ->sum('xinyue_select');
        $xinyueToday = StatisticsModel::where(1)
            ->where('day', date('Ymd'))
            ->sum('xinyue_select');
        $xinyueYesterday = StatisticsModel::where(1)
            ->where('day', date('Ymd', time() - 24 * 3600))
            ->sum('xinyue_select');
        $xinyueWeek = StatisticsModel::where(1)
            ->where('day', '>=', date('Ymd', time() - 7 * 24 * 3600))
            ->sum('xinyue_select');
        $xinyueMonth = StatisticsModel::where(1)
            ->where('day', '>=', date('Ymd', time() - 30 * 24 * 3600))
            ->sum('xinyue_select');

        $moneyTotal = MemberMoneyModel::where(1)
            ->where('money', '>', 0)
            ->where('status', MemberMoneyModel::STATUS_SUCC)
            ->sum('money');
        $moneyToday = MemberMoneyModel::where(1)
            ->where('money', '>', 0)
            ->where('status', MemberMoneyModel::STATUS_SUCC)
            ->where('create_time', '>=', strtotime(date('Y-m-d')))
            ->sum('money');
        $moneyYesterday = MemberMoneyModel::where(1)
            ->where('money', '>', 0)
            ->where('status', MemberMoneyModel::STATUS_SUCC)
            ->where('create_time', '>=', strtotime(date('Y-m-d')) - 24 * 3600)
            ->where('create_time', '<', strtotime(date('Y-m-d')))
            ->sum('money');
        $moneyWeek = MemberMoneyModel::where(1)
            ->where('money', '>', 0)
            ->where('status', MemberMoneyModel::STATUS_SUCC)
            ->where('create_time', '>=', $weekTime)
            ->sum('money');
        $moneyMonth = MemberMoneyModel::where(1)
            ->where('money', '>', 0)
            ->where('status', MemberMoneyModel::STATUS_SUCC)
            ->where('create_time', '>=', $monthTime)
            ->sum('money');

        $withdrawTotal = MemberMoneyModel::where(1)
            ->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberMoneyModel::STATUS_SUCC, MemberMoneyModel::STATUS_AWAIT])
            ->sum('money');
        $withdrawToday = MemberMoneyModel::where(1)
            ->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberMoneyModel::STATUS_SUCC, MemberMoneyModel::STATUS_AWAIT])
            ->where('create_time', '>=', strtotime(date('Y-m-d')))
            ->sum('money');
        $withdrawYesterday = MemberMoneyModel::where(1)
            ->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberMoneyModel::STATUS_SUCC, MemberMoneyModel::STATUS_AWAIT])
            ->where('create_time', '>=', strtotime(date('Y-m-d')) - 24 * 3600)
            ->where('create_time', '<', strtotime(date('Y-m-d')))
            ->sum('money');
        $withdrawWeek = MemberMoneyModel::where(1)
            ->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberMoneyModel::STATUS_SUCC, MemberMoneyModel::STATUS_AWAIT])
            ->where('create_time', '>=', $weekTime)
            ->sum('money');
        $withdrawMonth = MemberMoneyModel::where(1)
            ->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberMoneyModel::STATUS_SUCC, MemberMoneyModel::STATUS_AWAIT])
            ->where('create_time', '>=', $monthTime)
            ->sum('money');

        $remitTotal = MemberWithdrawModel::where(1)
            //->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberWithdrawModel::STATUS_SUCC, MemberWithdrawModel::STATUS_AUTO_SUCC])
            ->sum('money');
        $remitToday = MemberWithdrawModel::where(1)
            //->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberWithdrawModel::STATUS_SUCC, MemberWithdrawModel::STATUS_AUTO_SUCC])
            ->where('verify_time', '>=', strtotime(date('Y-m-d')))
            ->sum('money');
        $remitYesterday = MemberWithdrawModel::where(1)
            //->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberWithdrawModel::STATUS_SUCC, MemberWithdrawModel::STATUS_AUTO_SUCC])
            ->where('verify_time', '>=', strtotime(date('Y-m-d')) - 24 * 3600)
            ->where('verify_time', '<', strtotime(date('Y-m-d')))
            ->sum('money');
        $remitWeek = MemberWithdrawModel::where(1)
            //->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberWithdrawModel::STATUS_SUCC, MemberWithdrawModel::STATUS_AUTO_SUCC])
            ->where('verify_time', '>=', $weekTime)
            ->sum('money');
        $remitMonth = MemberWithdrawModel::where(1)
            //->whereIn('type', MemberMoneyModel::withdrawTypes())
            ->whereIn('status', [MemberWithdrawModel::STATUS_SUCC, MemberWithdrawModel::STATUS_AUTO_SUCC])
            ->where('verify_time', '>=', $monthTime)
            ->sum('money');

        return $this->jsonSucc([
            'member_total'     => $memberTotal,
            'member_today'     => $memberToday,
            'member_yesterday' => $memberYesterday,
            'member_week'      => $memberWeek,
            'member_month'     => $memberMonth,
            'xinyue_total'       => $xinyueTotal,
            'xinyue_today'       => $xinyueToday,
            'xinyue_yesterday'   => $xinyueYesterday,
            'xinyue_week'        => $xinyueWeek,
            'xinyue_month'       => $xinyueMonth,
            'money_total'        => $moneyTotal,
            'money_today'        => $moneyToday,
            'money_yesterday'    => $moneyYesterday,
            'money_week'         => $moneyWeek,
            'money_month'        => $moneyMonth,
            'withdraw'           => round($moneyTotal + $withdrawTotal, 2),
            'withdraw_total'     => abs($withdrawTotal),
            'withdraw_today'     => abs($withdrawToday),
            'withdraw_yesterday' => abs($withdrawYesterday),
            'withdraw_week'      => abs($withdrawWeek),
            'withdraw_month'     => abs($withdrawMonth),
            'remit_total'        => abs($remitTotal),
            'remit_today'        => abs($remitToday),
            'remit_yesterday'    => abs($remitYesterday),
            'remit_week'         => abs($remitWeek),
            'remit_month'        => abs($remitMonth),
            'clone_total'     => 'Loading...',
            'clone_today'     => '-',
            'clone_today_nr'  => '-',
            'clone_today_r'   => '-',
            'clone_yesterday' => '-',
            'clone_week'      => '-',
            'clone_month'     => '-',
            'clone_today_pay' => '-',
            'clone_today_unpay' => '-',
        ]);
    }

    /**
     * 获取克隆统计信息
     *
     * @return \think\response\Json
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    public function getClone() {
        $cloneTotal = StatisticsModel::where(1)
            ->sum('xinyue_clone');
        $cloneToday = StatisticsModel::where(1)
            ->where('day', date('Ymd'))
            ->sum('xinyue_clone');
        $cloneTodayNr = StatisticsModel::where(1)
            ->where('day', date('Ymd'))
            ->sum('xinyue_clone_nr');
        $cloneYesterday = StatisticsModel::where(1)
            ->where('day', date('Ymd', time() - 24 * 3600))
            ->sum('xinyue_clone');
        $cloneWeek = StatisticsModel::where(1)
            ->where('day', '>=', date('Ymd', time() - 7 * 24 * 3600))
            ->sum('xinyue_clone');
        $cloneMonth = StatisticsModel::where(1)
            ->where('day', '>=', date('Ymd', time() - 30 * 24 * 3600))
            ->sum('xinyue_clone');
        $cloneTodayUnpay = CloneInfo::getCloneSuccUnpayByTime(strtotime(date('Ymd')), time());
        $cloneTodayPay = CloneInfo::getCloneSuccPayByTime(strtotime(date('Ymd')), time());

        return $this->jsonSucc([
            'clone_total'     => $cloneTotal,
            'clone_today'     => $cloneToday,
            'clone_today_nr'  => $cloneTodayNr,
            'clone_today_r'   => $cloneToday - $cloneTodayNr,
            'clone_yesterday' => $cloneYesterday,
            'clone_week'      => $cloneWeek,
            'clone_month'     => $cloneMonth,
            'clone_today_pay'   => $cloneTodayPay,
            'clone_today_unpay' => $cloneTodayUnpay,
        ]);
    }

    /**
     * 获取日统计数据
     *
     * @param $day
     * @return array
     */
    protected function getDayData($day) {
        $list = [];
        foreach (StatisticsModel::where(1)
                 ->where('day', date('Ymd', strtotime($day)))
                 ->order('hour', 'DESC')
                 ->select() as $model) {
            $xinyueClone = $model->xinyue_clone;
            $moneyTotal  = $model->money_clone
                + $model->money_invite1
                + $model->money_invite2
                + $model->money_jm
                + $model->money_point;

            $scan1CloneCount = $model->scan1_clone_count;
            $scan2CloneCount = $model->scan2_clone_count;
            $scan3CloneCount = $model->scan3_clone_count;

            $list[] = array_merge($model->toArray(), [
                'day'          => date('Y年m月d日', strtotime($model->day)),
                'hour'         => $model->hour . '时',
                'reward_price' => $xinyueClone > 0 ? round($moneyTotal / $xinyueClone, 2) : 0,
                'scan1_price'  => $scan1CloneCount > 0 ? round($model->scan1_money / $scan1CloneCount, 2) : 0,
                'scan2_price'  => $scan2CloneCount > 0 ? round($model->scan2_money / $scan2CloneCount, 2) : 0,
                'scan3_price'  => $scan3CloneCount > 0 ? round($model->scan3_money / $scan3CloneCount, 2) : 0,
            ]);
        }
        return $list;
    }

    /**
     * 获取月份
     *
     * @return array
     */
    protected function getMonths() {
        $begin   = 20240301;
        $months  = [];
        $nowTime = time();
        while ($nowTime >= strtotime($begin)) {
            if (!isset($months[date('Ym', $nowTime)])) {
                $months[date('Ym', $nowTime)] = date('Y年m月', $nowTime);
            }

            $nowTime -= 24 * 3600;
        }
        return $months;
    }

    /**
     * 获取月统计数据
     *
     * @param $month
     * @return array|\think\response\Json
     */
    protected function getMonthData($month) {
        $time = strtotime($month . '01');
        if ($time === FALSE) {
            return $this->jsonFail('月份错误');
        }

        $today = date('Ymd');
        $days  = [];
        for ($i = date('t', $time); $i >= 1; $i --) {
            $day = date('Ymd', strtotime(date('Y', $time) . '-' . date('m', $time) . '-' . $i));
            if ($day <= $today) {
                $days[] = $day;
            }
        }

        $list = [];
        foreach ($days as $day) {
            $row = [
                'day' => date('Y年m月d日', strtotime($day)),
                'register'       => 0,
                'qr_number'      => 0,
                'qr_member'      => 0,
                'qrcode'         => 0,
                'qrcode_succ'    => 0,
                'clone_succ'     => 0,
                'clone_error'    => 0,
                'clone_timeout'  => 0,
                'xinyue_select'  => 0,
                'xinyue_clone'   => 0,
                'reward_clone'   => 0,
                'reward_invite1' => 0,
                'reward_invite2' => 0,
                'money_clone'    => 0,
                'money_invite1'  => 0,
                'money_invite2'  => 0,
                'money_jm'       => 0,
                'money_point'    => 0,
                'withdraw'       => 0,
                'withdraw_check'       => 0,
                'withdraw_money'       => 0,
                'withdraw_money_check' => 0,
                'withdraw_succ'        => 0,
                'withdraw_succ_money'  => 0,
                'withdraw_fail'        => 0,
                'withdraw_fail_money'  => 0,
                'scan1_num' => 0,
                'scan2_num' => 0,
                'scan3_num' => 0,
                'scan1_xinyue_count' => 0,
                'scan2_xinyue_count' => 0,
                'scan3_xinyue_count' => 0,
                'scan1_clone_count' => 0,
                'scan2_clone_count' => 0,
                'scan3_clone_count' => 0,
                'scan1_money' => 0,
                'scan2_money' => 0,
                'scan3_money' => 0,
                'scan1_price' => 0,
                'scan2_price' => 0,
                'scan3_price' => 0,
                'first_settlement_count' => 0,
                'repeat_settlement_count' => 0,
                'first_reward_money' => 0,
                'repeat_reward_money' => 0,
                'first_clone_succ' => 0,
                'repeat_clone_succ' => 0,
                'first_price' => 0,
                'repeat_price' => 0,
            ];

            foreach (StatisticsModel::where(1)
                         ->where('day', $day)
                         ->select() as $model) {
                $row['register']      += $model->register;
                $row['qr_number']     += $model->qr_number;
                $row['qr_member']     += $model->qr_member;
                $row['qrcode']        += $model->qrcode;
                $row['qrcode_succ']   += $model->qrcode_succ;
                $row['clone_succ']    += $model->clone_succ;
                $row['clone_error']   += $model->clone_error;
                $row['clone_timeout'] += $model->clone_timeout;
                $row['xinyue_select'] += $model->xinyue_select;
                $row['xinyue_clone']  += $model->xinyue_clone;
                $row['reward_clone']  += $model->reward_clone;
                $row['reward_invite1']       += $model->reward_invite1;
                $row['reward_invite2']       += $model->reward_invite2;
                $row['money_clone']          += $model->money_clone;
                $row['money_invite1']        += $model->money_invite1;
                $row['money_invite2']        += $model->money_invite2;
                $row['money_jm']             += $model->money_jm;
                $row['money_point']          += $model->money_point;
                $row['withdraw']             += $model->withdraw;
                $row['withdraw_check']       += $model->withdraw_check;
                $row['withdraw_money']       += $model->withdraw_money;
                $row['withdraw_money_check'] += $model->withdraw_money_check;
                $row['withdraw_succ']        += $model->withdraw_succ;
                $row['withdraw_succ_money']  += $model->withdraw_succ_money;
                $row['withdraw_fail']        += $model->withdraw_fail;
                $row['withdraw_fail_money']  += $model->withdraw_fail_money;

                $row['first_settlement_count'] += $model->first_settlement_count;
                $row['repeat_settlement_count'] += $model->repeat_settlement_count;
                $row['first_reward_money'] += $model->first_reward_money;
                $row['repeat_reward_money'] += $model->repeat_reward_money;
                $row['first_clone_succ'] += $model->first_clone_succ;
                $row['repeat_clone_succ'] += $model->repeat_clone_succ;
                /*$row['scan1_num'] += $model->scan1_num;
                $row['scan2_num'] += $model->scan2_num;
                $row['scan3_num'] += $model->scan3_num;
                $row['scan1_xinyue_count'] += $model->scan1_xinyue_count;
                $row['scan2_xinyue_count'] += $model->scan2_xinyue_count;
                $row['scan3_xinyue_count'] += $model->scan3_xinyue_count;
                $row['scan1_clone_count'] += $model->scan1_clone_count;
                $row['scan2_clone_count'] += $model->scan2_clone_count;
                $row['scan3_clone_count'] += $model->scan3_clone_count;
                $row['scan1_money'] += $model->scan1_money;
                $row['scan2_money'] += $model->scan2_money;
                $row['scan3_money'] += $model->scan3_money;*/
            }

            $xinyueClone = $row['xinyue_clone'];
            $moneyTotal  = $row['money_clone']
                + $row['money_invite1']
                + $row['money_invite2']
                + $row['money_jm']
                + $row['money_point'];

            //$scan1CloneCount = $row['scan1_clone_count'];
            //$scan2CloneCount = $row['scan2_clone_count'];
            //$scan3CloneCount = $row['scan3_clone_count'];

            $row['reward_price'] = $xinyueClone > 0 ? round($moneyTotal / $xinyueClone, 2) : 0;
            //$row['scan1_price'] = $scan1CloneCount > 0 ? round($row['scan1_money'] / $scan1CloneCount, 2) : 0;
            //$row['scan2_price'] = $scan2CloneCount > 0 ? round($row['scan2_money'] / $scan2CloneCount, 2) : 0;
            //$row['scan3_price'] = $scan3CloneCount > 0 ? round($row['scan3_money'] / $scan3CloneCount, 2) : 0;

            $row['first_reward_money']  = round($row['first_reward_money'], 2);
            $row['repeat_reward_money'] = round($row['repeat_reward_money'], 2);
            if ($row['first_clone_succ'] > 0) {
                $row['first_price'] = round($row['first_reward_money'] / $row['first_clone_succ'], 2);
            }
            if ($row['repeat_clone_succ'] > 0) {
                $row['repeat_price'] = round($row['repeat_reward_money'] / $row['repeat_clone_succ'], 2);
            }

            $list[] = $row;
        }

        return $list;
    }

    public function scan() {
        $time = time();// - 24 * 3600;
        $ids0 = MemberQrcodeModel::where(1)
            ->field('id')
            ->where('create_time', '>=', strtotime(date('Ymd', $time)))
            ->where('status', MemberQrcodeModel::STATUS_SUCCESS)
            ->where('settlement_count1', '>', 0)
            ->select()
            ->column('id');
        $ids1 = MemberQrcodeModel::where(1)
            ->field('id')
            ->where('create_time', '>=', strtotime(date('Ymd', $time)))
            ->where('status', MemberQrcodeModel::STATUS_SUCCESS)
            ->where('settlement_count2', '>', 0)
            ->select()
            ->column('id');

        $money0     = 0;
        $price0     = 0;
        $xinyue0    = 0;
        $cloneSucc0 = 0;
        $cloneFailRate0 = 0;
        if (!empty($ids0)) {
            $money0 = MemberQrcodeModel::where(1)
                ->field('reward_price * reward_count AS reward_money0')
                ->whereIn('id', $ids0)
                ->select()
                ->reduce(function ($money, $item) {
                    return $money + $item['reward_money0'];
                });
            $xinyue0 = MemberQrcodeModel::where(1)
                ->whereIn('id', $ids0)
                ->sum('settlement_count1');
            $qrIds0 = MemberQrcodeModel::where(1)
                ->field('qr_id')
                ->whereIn('id', $ids0)
                ->where('qr_id', '>', 0)
                ->select()
                ->column('qr_id');
            if (!empty($qrIds0)) {
                $cloneSucc0 = CloneInfo::getCloneSuccCount1ByQrIds($qrIds0);
            }

            if ($xinyue0 > 0) {
                $cloneFailRate0 = round(($xinyue0 - $cloneSucc0) / $xinyue0, 4) * 100;
            }
        }

        $money1     = 0;
        $price1     = 0;
        $xinyue1    = 0;
        $cloneSucc1 = 0;
        $cloneFailRate1 = 0;
        if (!empty($ids1)) {
            $money1 = MemberQrcodeModel::where(1)
                ->field('reward_price2 * reward_count2 AS reward_money0')
                ->whereIn('id', $ids1)
                ->select()
                ->reduce(function ($money, $item) {
                    return $money + $item['reward_money0'];
                });
            $xinyue1 = MemberQrcodeModel::where(1)
                ->whereIn('id', $ids1)
                ->sum('settlement_count2');
            if ($cloneSucc1 > 0) {
                $price1 = floatval(round($money1 / $cloneSucc1, 2));
            }

            $qrIds1 = MemberQrcodeModel::where(1)
                ->field('qr_id')
                ->whereIn('id', $ids1)
                ->where('qr_id', '>', 0)
                ->select()
                ->column('qr_id');
            if (!empty($qrIds1)) {
                $cloneSucc1 = CloneInfo::getCloneSuccCount2ByQrIds($qrIds1);
            }

            if ($xinyue1 > 0) {
                $cloneFailRate1 = round(($xinyue1 - $cloneSucc1) / $xinyue1, 4) * 100;
            }
        }

        $total = floatval(MemberMoneyModel::where(1)
            ->where('create_time', '>=', strtotime(date('Ymd', $time)))
            ->whereIn('type', MemberMoneyModel::rewardTypes())
            ->sum('money'));

        Utils::allocNumber($total, $money0, $money1);

        if ($cloneSucc0 > 0) {
            $price0 = floatval(round($money0 / $cloneSucc0, 2));
        }
        if ($cloneSucc1 > 0) {
            $price1 = floatval(round($money1 / $cloneSucc1, 2));
        }

        return $this->jsonSucc([
            'scan0' => [
                'num'        => count($ids0),
                'money'      => floatval(round($money0, 2)),
                'price'      => $price0,
                'xinyue'     => $xinyue0,
                'clone_succ' => $cloneSucc0,
                'rate_clone_fail' => $cloneFailRate0,
            ],
            'scan1' => [
                'num'        => count($ids1),
                'money'      => floatval(round($money1, 2)),
                'price'      => $price1,
                'xinyue'     => $xinyue1,
                'clone_succ' => $cloneSucc1,
                'rate_clone_fail' => $cloneFailRate1,
            ],
        ]);

    }
}