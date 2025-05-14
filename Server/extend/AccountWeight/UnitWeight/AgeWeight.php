<?php

namespace AccountWeight\UnitWeight;

use library\interfaces\WechatAccountWeightResultSet as WechatAccountWeightResultSetInterface;

class AgeWeight implements WechatAccountWeightResultSetInterface
{
    private $weight;

    /**
     * 计算账号年龄（从创建时间到现在）
     *
     * @param string $wechatId
     * @return string
     */
    private function getRegisterDate(string $wechatId): string
    {
        return date('Y-m-d H:i:s', strtotime('-15 months'));
    }

    /**
     * 计算两个时间相差几个月
     *
     * @param string $wechatId
     * @return int
     * @throws \DateMalformedStringException
     */
    private function getDateTimeDiff(string $wechatId): int
    {
        $currentData = new \DateTime(date('Y-m-d H:i:s', time()));
        $registerDate = new \DateTime($this->getRegisterDate($wechatId));

        $interval = date_diff($currentData, $registerDate);

        return $interval->y * 12 + $interval->m;
    }

    /**
     * @inheritDoc
     */
    public function settingFactor($wechatId): WechatAccountWeightResultSetInterface
    {
        $cha = ceil($this->getDateTimeDiff($wechatId) / 60) * 100;

        // 规定账号年龄五年起拥有最高权重
        $this->weight = $cha > 100 ? 100 : $cha;

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function getResult(): int
    {
        return $this->weight ?: 0;
    }
}