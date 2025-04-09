/**
 * 菜单项接口
 */
export interface MenuItem {
  id: number;
  title: string;
  path: string;
  icon?: string;
  parent_id: number;
  status: number;
  sort: number;
  children?: MenuItem[];
}

/**
 * 从服务器获取菜单数据
 * @param onlyEnabled 是否只获取启用的菜单
 * @returns Promise<MenuItem[]>
 */
export async function getMenus(onlyEnabled: boolean = true): Promise<MenuItem[]> {
  try {
    // API基础路径从环境变量获取
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    // 构建API URL
    const url = `${apiBaseUrl}/menu/tree?only_enabled=${onlyEnabled ? 1 : 0}`;
    
    // 获取存储的token
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    // 发起请求
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      credentials: 'include'
    });
    
    // 处理响应
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code === 200) {
      return result.data;
    } else {
      console.error('获取菜单失败:', result.msg);
      return [];
    }
  } catch (error) {
    console.error('获取菜单出错:', error);
    return [];
  }
}

/**
 * 保存菜单
 * @param menuData 菜单数据
 * @returns Promise<boolean>
 */
export async function saveMenu(menuData: Partial<MenuItem>): Promise<boolean> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const url = `${apiBaseUrl}/menu/save`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(menuData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.code === 200;
  } catch (error) {
    console.error('保存菜单出错:', error);
    return false;
  }
}

/**
 * 删除菜单
 * @param id 菜单ID
 * @returns Promise<boolean>
 */
export async function deleteMenu(id: number): Promise<boolean> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const url = `${apiBaseUrl}/menu/delete/${id}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.code === 200;
  } catch (error) {
    console.error('删除菜单出错:', error);
    return false;
  }
}

/**
 * 更新菜单状态
 * @param id 菜单ID
 * @param status 状态 (0-禁用, 1-启用)
 * @returns Promise<boolean>
 */
export async function updateMenuStatus(id: number, status: 0 | 1): Promise<boolean> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const url = `${apiBaseUrl}/menu/status`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ id, status })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.code === 200;
  } catch (error) {
    console.error('更新菜单状态出错:', error);
    return false;
  }
} 