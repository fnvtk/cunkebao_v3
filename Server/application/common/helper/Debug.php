<?php
namespace app\common\helper;

/**
 * 调试助手类
 */
class Debug
{
    /**
     * 美化打印变量并终止程序
     * 可以传入任意数量的参数
     * 
     * @return void
     */
    public static function dd()
    {
        $args = func_get_args();
        
        // 判断是否是CLI环境
        $isCli = PHP_SAPI === 'cli';
        
        if (!$isCli) {
            // 非CLI环境，使用HTML格式输出
            header('Content-Type: text/html; charset=utf-8');
            echo '<html><head><title>调试输出</title>';
            echo '<style>
                body { background-color: #fff; color: #333; font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif; padding: 20px; line-height: 1.5; }
                h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                pre { background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; margin: 10px 0; border: 1px solid #ddd; }
                .type { color: #0086b3; font-weight: bold; }
                .trace { font-size: 12px; margin-top: 10px; padding: 10px; background: #f8f8f8; border: 1px dashed #ddd; }
                .backtrace-item { margin-bottom: 5px; }
                .key { color: #881391; }
                .string { color: #183691; }
                .number { color: #0086b3; }
                .boolean { color: #0086b3; }
                .null { color: #7D7D7D; }
                .debug-header { background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; font-weight: bold; }
                .variable-section { margin-bottom: 30px; }
            </style>';
            echo '</head><body>';
            
            $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
            $file = isset($trace[0]['file']) ? $trace[0]['file'] : '未知文件';
            $line = isset($trace[0]['line']) ? $trace[0]['line'] : '未知行号';
            
            echo '<div class="debug-header">调试输出 - ' . $file . ' (第 ' . $line . ' 行)</div>';
            
            foreach ($args as $index => $arg) {
                echo '<div class="variable-section">';
                echo '<h2>变量 #' . ($index + 1) . '</h2>';
                echo '<pre>' . self::formatVar($arg) . '</pre>';
                echo '</div>';
            }
            
            // 打印调用栈
            echo '<h2>调用栈</h2>';
            echo '<div class="trace">';
            $traces = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT);
            foreach ($traces as $i => $t) {
                if ($i === 0) continue; // 跳过当前函数
                $class = isset($t['class']) ? $t['class'] : '';
                $type = isset($t['type']) ? $t['type'] : '';
                $function = isset($t['function']) ? $t['function'] : '';
                $file = isset($t['file']) ? $t['file'] : '未知文件';
                $line = isset($t['line']) ? $t['line'] : '未知行号';
                
                echo '<div class="backtrace-item">';
                echo '<strong>#' . $i . '</strong> ';
                echo $file . ' (' . $line . '): ';
                if ($class) {
                    echo $class . $type . $function . '()';
                } else {
                    echo $function . '()';
                }
                echo '</div>';
            }
            echo '</div>';
            
            echo '</body></html>';
        } else {
            // CLI环境，使用文本格式输出
            $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
            $file = isset($trace[0]['file']) ? $trace[0]['file'] : '未知文件';
            $line = isset($trace[0]['line']) ? $trace[0]['line'] : '未知行号';
            
            echo "\n\033[1;36m调试输出 - {$file} (第 {$line} 行)\033[0m\n\n";
            
            foreach ($args as $index => $arg) {
                echo "\033[1;33m变量 #" . ($index + 1) . "\033[0m\n";
                echo self::formatVarCli($arg) . "\n\n";
            }
            
            // 打印调用栈
            echo "\033[1;33m调用栈:\033[0m\n";
            $traces = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT);
            foreach ($traces as $i => $t) {
                if ($i === 0) continue; // 跳过当前函数
                $class = isset($t['class']) ? $t['class'] : '';
                $type = isset($t['type']) ? $t['type'] : '';
                $function = isset($t['function']) ? $t['function'] : '';
                $file = isset($t['file']) ? $t['file'] : '未知文件';
                $line = isset($t['line']) ? $t['line'] : '未知行号';
                
                echo "#" . $i . " " . $file . " (" . $line . "): ";
                if ($class) {
                    echo $class . $type . $function . "()\n";
                } else {
                    echo $function . "()\n";
                }
            }
        }
        
        // 终止程序
        exit(1);
    }
    
    /**
     * 美化打印变量但不终止程序
     * 可以传入任意数量的参数
     * 
     * @return void
     */
    public static function dump()
    {
        $args = func_get_args();
        
        // 复用dd的逻辑，但不终止程序
        ob_start();
        call_user_func_array([self::class, 'dd'], $args);
        $output = ob_get_clean();
        
        echo $output;
        
        // 不终止程序继续执行
        return;
    }
    
    /**
     * 格式化变量输出（HTML）
     * 
     * @param mixed $var 需要格式化的变量
     * @param int $depth 当前递归深度
     * @param int $maxDepth 最大递归深度
     * @return string
     */
    private static function formatVar($var, $depth = 0, $maxDepth = 10)
    {
        // 防止递归过深
        if ($depth > $maxDepth) {
            return '<span class="type">** 最大递归深度 **</span>';
        }
        
        $output = '';
        
        // 根据变量类型格式化输出
        switch (gettype($var)) {
            case 'NULL':
                $output .= '<span class="null">null</span>';
                break;
                
            case 'boolean':
                $output .= '<span class="boolean">' . ($var ? 'true' : 'false') . '</span>';
                break;
                
            case 'integer':
            case 'double':
                $output .= '<span class="number">' . $var . '</span>';
                break;
                
            case 'string':
                $output .= '<span class="type">string(' . strlen($var) . ')</span> "<span class="string">' . htmlspecialchars($var) . '</span>"';
                break;
                
            case 'array':
                $count = count($var);
                $output .= '<span class="type">array(' . $count . ')</span> {<br>';
                $indent = str_repeat('&nbsp;&nbsp;&nbsp;&nbsp;', $depth + 1);
                
                foreach ($var as $key => $value) {
                    $output .= $indent . '[<span class="key">' . htmlspecialchars($key) . '</span>] => ';
                    $output .= self::formatVar($value, $depth + 1, $maxDepth) . '<br>';
                }
                
                if ($count > 0) {
                    $output .= str_repeat('&nbsp;&nbsp;&nbsp;&nbsp;', $depth);
                }
                $output .= '}';
                break;
                
            case 'object':
                $id = spl_object_id($var);
                $class = get_class($var);
                $output .= '<span class="type">object(' . $class . '#' . $id . ')</span> {<br>';
                
                $indent = str_repeat('&nbsp;&nbsp;&nbsp;&nbsp;', $depth + 1);
                
                // 获取对象属性
                $reflection = new \ReflectionObject($var);
                $properties = $reflection->getProperties();
                
                foreach ($properties as $property) {
                    $property->setAccessible(true);
                    $propName = $property->getName();
                    
                    $visibility = '';
                    if ($property->isPublic()) {
                        $visibility = 'public';
                    } elseif ($property->isProtected()) {
                        $visibility = 'protected';
                        $propName = '*' . $propName;
                    } elseif ($property->isPrivate()) {
                        $visibility = 'private';
                        $propName = '#' . $propName;
                    }
                    
                    $output .= $indent . '[<span class="key">' . $visibility . ' ' . $propName . '</span>] => ';
                    
                    if ($property->isInitialized($var)) {
                        $propValue = $property->getValue($var);
                        $output .= self::formatVar($propValue, $depth + 1, $maxDepth) . '<br>';
                    } else {
                        $output .= '<span class="null">uninitialized</span><br>';
                    }
                }
                
                if (count($properties) > 0) {
                    $output .= str_repeat('&nbsp;&nbsp;&nbsp;&nbsp;', $depth);
                }
                $output .= '}';
                break;
                
            case 'resource':
                $output .= '<span class="type">resource(' . get_resource_type($var) . ')</span>';
                break;
                
            default:
                $output .= '<span class="type">' . gettype($var) . '</span>: ' . htmlspecialchars((string)$var);
                break;
        }
        
        return $output;
    }
    
    /**
     * 格式化变量输出（CLI）
     * 
     * @param mixed $var 需要格式化的变量
     * @param int $depth 当前递归深度
     * @param int $maxDepth 最大递归深度
     * @return string
     */
    private static function formatVarCli($var, $depth = 0, $maxDepth = 10)
    {
        // 防止递归过深
        if ($depth > $maxDepth) {
            return "\033[1;30m** 最大递归深度 **\033[0m";
        }
        
        $output = '';
        $indent = str_repeat('  ', $depth);
        
        // 根据变量类型格式化输出
        switch (gettype($var)) {
            case 'NULL':
                $output .= "\033[1;30mnull\033[0m";
                break;
                
            case 'boolean':
                $output .= "\033[0;36m" . ($var ? 'true' : 'false') . "\033[0m";
                break;
                
            case 'integer':
            case 'double':
                $output .= "\033[0;36m" . $var . "\033[0m";
                break;
                
            case 'string':
                $output .= "\033[0;32mstring(" . strlen($var) . ")\033[0m \"" . $var . "\"";
                break;
                
            case 'array':
                $count = count($var);
                $output .= "\033[0;32marray(" . $count . ")\033[0m {";
                
                if ($count > 0) {
                    $output .= "\n";
                    
                    foreach ($var as $key => $value) {
                        $output .= $indent . '  [' . "\033[0;35m" . $key . "\033[0m" . '] => ';
                        $output .= self::formatVarCli($value, $depth + 1, $maxDepth) . "\n";
                    }
                    
                    $output .= $indent;
                }
                
                $output .= '}';
                break;
                
            case 'object':
                $id = spl_object_id($var);
                $class = get_class($var);
                $output .= "\033[0;32mobject(" . $class . "#" . $id . ")\033[0m {";
                
                // 获取对象属性
                $reflection = new \ReflectionObject($var);
                $properties = $reflection->getProperties();
                
                if (count($properties) > 0) {
                    $output .= "\n";
                    
                    foreach ($properties as $property) {
                        $property->setAccessible(true);
                        $propName = $property->getName();
                        
                        $visibility = '';
                        if ($property->isPublic()) {
                            $visibility = 'public';
                        } elseif ($property->isProtected()) {
                            $visibility = 'protected';
                            $propName = '*' . $propName;
                        } elseif ($property->isPrivate()) {
                            $visibility = 'private';
                            $propName = '#' . $propName;
                        }
                        
                        $output .= $indent . '  [' . "\033[0;35m" . $visibility . ' ' . $propName . "\033[0m" . '] => ';
                        
                        if ($property->isInitialized($var)) {
                            $propValue = $property->getValue($var);
                            $output .= self::formatVarCli($propValue, $depth + 1, $maxDepth) . "\n";
                        } else {
                            $output .= "\033[1;30muninitialized\033[0m\n";
                        }
                    }
                    
                    $output .= $indent;
                }
                
                $output .= '}';
                break;
                
            case 'resource':
                $output .= "\033[0;32mresource(" . get_resource_type($var) . ")\033[0m";
                break;
                
            default:
                $output .= "\033[0;32m" . gettype($var) . "\033[0m: " . (string)$var;
                break;
        }
        
        return $output;
    }
} 