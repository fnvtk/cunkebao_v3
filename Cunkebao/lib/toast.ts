export const showToast = (message: string, type: 'success' | 'error' | 'loading' = 'success', showIcon: boolean = false) => {
  // 创建提示元素
  const toast = document.createElement('div');
  toast.className = `fixed inset-0 flex items-center justify-center z-50`;
  
  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0';
  
  // 创建内容框
  const content = document.createElement('div');
  content.className = `relative bg-black/50 rounded-lg shadow-lg text-white z-50 min-w-[160px] max-w-[80%] flex flex-col items-center ${showIcon ? 'p-4 w-[160px] h-[160px]' : 'py-4 px-6'} ${showIcon ? 'gap-2' : ''}`;
  
  if (showIcon) {
    // 创建图标
    const icon = document.createElement('div');
    icon.className = 'w-10 h-10 flex items-center justify-center mt-4';
    
    if (type === 'loading') {
      icon.innerHTML = `<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>`;
    } else if (type === 'success') {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`;
    } else {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>`;
    }
    content.appendChild(icon);
  }
  
  // 创建消息
  const messageElement = document.createElement('p');
  messageElement.className = `text-sm text-center ${showIcon ? 'mt-2' : ''}`;
  messageElement.textContent = message;
  
  // 组装元素
  content.appendChild(messageElement);
  toast.appendChild(overlay);
  toast.appendChild(content);
  
  // 添加到页面
  document.body.appendChild(toast);
  
  // 如果不是loading状态,1.5秒后自动移除
  if (type !== 'loading') {
    setTimeout(() => {
      toast.remove();
    }, 1500);
  }
  
  // 返回toast元素,方便手动移除
  return toast;
}; 