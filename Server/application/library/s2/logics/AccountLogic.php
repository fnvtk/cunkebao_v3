<?php
namespace app\library\s2\logics;

use app\library\s2\interfaces\AccountInterface;
use app\library\s2\interfaces\LoginInterface;

class AccountLogic implements AccountInterface, LoginInterface
{
    public function create(string $accout, string $password)
    {
        // TODO: Implement create() method.
    }

    public function login(string $accout, string $password): LoginInterface
    {
        // TODO: Implement login() method.

        return $this;
    }

    public function delete(int $id)
    {
        // TODO: Implement delete() method.
    }
}