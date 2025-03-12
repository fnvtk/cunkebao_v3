<?php

namespace app\backend\model;

class TimeRangeModel {

    /**
     * 获取年
     *
     * @return array
     */
    static public function getYears() {
        $years = [];
        $timeS = strtotime(date('Y') . '-01-01');
        $timeE = strtotime((date('Y', $timeS) + 1) . '-01-01') - 1;
        for ($i = 0; $i > -3; $i --) {
            $years[] = [
                'key'   => $i,
                'label' => date('Y 年', $timeS),
                'timeS' => $timeS,
                'timeE' => $timeE,
            ];

            $timeE = $timeS - 1;
            $timeS = strtotime(date('Y', $timeE) . '-01-01');
        }

        return $years;
    }

    /**
     * 获取月份
     *
     * @return array
     */
    static public function getMonths() {
        $months = [];
        $timeS  = strtotime(date('Y-m') . '-01');
        $timeE  = $timeS + date('t', $timeS) * 24 * 3600 - 1;
        for ($i = 0; $i > -24; $i --) {
            $months[] = [
                'key'   => $i,
                'label' => date('Y 年 m 月', $timeS) . ' (' . date('Y.m.d', $timeS) . '-' . date('Y.m.d', $timeE) . ')',
                'timeS' => $timeS,
                'timeE' => $timeE,
            ];

            $timeS = strtotime(date('Y-m', $timeS - 1) . '-01');
            $timeE = $timeS + date('t', $timeS) * 24 * 3600 - 1;
        }

        return $months;
    }
}