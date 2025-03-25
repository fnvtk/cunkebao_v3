<?php

use think\migration\Seeder;

class FlowPackageSeeder extends Seeder
{
    /**
     * 执行数据填充
     */
    public function run()
    {
        $data = [
            [
                'name' => '基础套餐',
                'tag' => '入门级',
                'original_price' => 999.00,
                'price' => 899.00,
                'monthly_flow' => 20,
                'duration' => 1,
                'privileges' => "基础客服支持\n自动化任务\n每日数据报表",
                'sort' => 1,
                'status' => 1
            ],
            [
                'name' => '标准套餐',
                'tag' => '热销',
                'original_price' => 2799.00,
                'price' => 2499.00,
                'monthly_flow' => 50,
                'duration' => 3,
                'privileges' => "优先客服支持\n高级自动化任务\n每日数据报表\n好友数据分析\n一对一培训支持",
                'sort' => 2,
                'status' => 1
            ],
            [
                'name' => '专业套餐',
                'tag' => '推荐',
                'original_price' => 5999.00,
                'price' => 4999.00,
                'monthly_flow' => 100,
                'duration' => 6,
                'privileges' => "24小时专属客服\n全部自动化任务\n实时数据报表\n深度数据分析\n个性化培训支持\n专属策略顾问\n优先功能更新",
                'sort' => 3,
                'status' => 1
            ],
            [
                'name' => '企业套餐',
                'tag' => '高级',
                'original_price' => 11999.00,
                'price' => 9999.00,
                'monthly_flow' => 200,
                'duration' => 12,
                'privileges' => "24小时专属客服\n全部自动化任务\n实时数据报表\n深度数据分析\n个性化培训支持\n专属策略顾问\n优先功能更新\n企业API对接\n专属功能定制\n全平台数据打通",
                'sort' => 4,
                'status' => 1
            ]
        ];

        $this->table('flow_package')->insert($data)->save();
    }
} 