<?php
namespace app\http\middleware;

/**
 * JWT中间件别名
 * 解决类不存在: app\http\middleware\jwt的问题
 */
class jwt extends JwtAuth
{
    // 继承JwtAuth的所有功能
} 