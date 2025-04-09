INSERT INTO `tk_administrators` (`name`, `account`, `password`, `status`, `createTime`, `updateTime`) 
VALUES ('超级管理员', 'admin', MD5('123456'), 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()); 