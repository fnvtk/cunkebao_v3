export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // 创建提示元素
  const toast = document.createElement('div');
  toast.className = `fixed inset-0 flex items-center justify-center z-50`;
  
  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0';
  
  // 创建内容框
  const content = document.createElement('div');
  content.className = `relative bg-black/50 p-4 rounded-lg shadow-lg text-white z-50 min-w-[300px] max-w-[80%]`;
  
  // 创建消息
  const messageElement = document.createElement('p');
  messageElement.className = 'text-base text-center';
  messageElement.textContent = message;
  
  // 组装元素
  content.appendChild(messageElement);
  toast.appendChild(overlay);
  toast.appendChild(content);
  
  // 添加到页面
  document.body.appendChild(toast);
  
  // 3秒后自动移除
  setTimeout(() => {
    toast.remove();
  }, 1500);
}; 