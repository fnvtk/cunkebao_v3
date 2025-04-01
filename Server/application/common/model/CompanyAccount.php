<?php
namespace app\common\model;

use think\Model;

/**
 * 公司账户模型类
 */
class CompanyAccount extends Model
{
    /**
     * 数据表名
     * @var string
     */
    protected $table = 'tk_company_account';

    /**
     * 主键
     * @var string
     */
    protected $pk = 'id';

    /**
     * 自动写入时间戳
     * @var bool
     */
    protected $autoWriteTimestamp = true;

    /**
     * 创建时间字段
     * @var string
     */
    protected $createTime = 'createTime';

    /**
     * 更新时间字段
     * @var string
     */
    protected $updateTime = 'updateTime';

    /**
     * 隐藏属性
     * @var array
     */
    protected $hidden = ['passwordMd5', 'passwordLocal', 'secret'];

    /**
     * 字段类型
     * @var array
     */
    protected $type = [
        'id' => 'integer',
        'tenantId' => 'integer',
        'accountType' => 'integer',
        'companyId' => 'integer',
        'useGoogleSecretKey' => 'boolean',
        'hasVerifyGoogleSecret' => 'boolean',
        'lastLoginTime' => 'integer',
        'createTime' => 'integer',
        'updateTime' => 'integer'
    ];

    /**
     * 获取公司账户信息
     * @param string $userName 用户名
     * @param string $password 密码（MD5加密后的）
     * @return array|null
     */
    public static function getAccount($userName, $password)
    {
        // 查询账户
        $account = self::where('userName', $userName)
                    ->find();
        
        if (!$account) {
            return null;
        }
        
        // 验证密码
        if ($account->passwordMd5 !== $password) {
            return null;
        }
        
        // 更新登录信息
        $account->lastLoginIp = request()->ip();
        $account->lastLoginTime = time();
        $account->save();
        
        return [
            'id' => $account->id,
            'tenantId' => $account->tenantId,
            'userName' => $account->userName,
            'realName' => $account->realName,
            'nickname' => $account->nickname,
            'avatar' => $account->avatar,
            'accountType' => $account->accountType,
            'companyId' => $account->companyId,
            'lastLoginIp' => $account->lastLoginIp,
            'lastLoginTime' => $account->lastLoginTime
        ];
    }

    /**
     * 通过租户ID获取账户信息
     * @param int $companyId 租户ID
     * @return array|null
     */
    public static function getAccountByCompanyId($companyId)
    {
        // 查询账户
        $account = self::where('companyId', $companyId)->find();
        
        if (!$account) {
            return null;
        }
        
        return [
            'id' => $account->id,
            'tenantId' => $account->tenantId,
            'userName' => $account->userName,
            'realName' => $account->realName,
            'nickname' => $account->nickname,
            'avatar' => $account->avatar,
            'accountType' => $account->accountType,
            'companyId' => $account->companyId,
            'lastLoginIp' => $account->lastLoginIp,
            'lastLoginTime' => $account->lastLoginTime
        ];
    }

} 