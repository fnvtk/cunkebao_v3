<?php
use think\facade\Route;

// 超级管理员认证相关路由
Route::post('auth/login', 'app\\superadmin\\controller\\Auth@login'); 