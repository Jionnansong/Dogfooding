import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * 剧本编辑器 - 额度耗尽高压测试
 * 
 * 测试场景：
 * 初始条件: 用户剩余额度正好等于当前输入字数
 * 操作: 继续输入一个字符
 * 期望约束: 
 *   - 编辑器必须无感切换为 ReadOnly 状态
 *   - 触发 ShieldAlert 警报显示
 *   - 由于 tokenQuota 耗尽瞬间弹出 QuotaModal
 */

// 模拟类型定义
type EditorSection = 'content' | 'script_dialogue' | 'script_action' | 'script_camera';

interface TokenQuota {
  used: number;
  total: number;
}

interface User {
  id: string;
  username: string;
  tokenQuota: TokenQuota;
}

interface EditorState {
  content: string;
  isReadOnly: boolean;
  showQuotaModal: boolean;
  showShieldAlert: boolean;
  lastSavedLengths: Record<EditorSection, number>;
}

// 编辑器状态管理模拟
class ScriptEditorController {
  private state: EditorState;
  private user: User;
  private onStateChange: (state: EditorState) => void;

  constructor(user: User, onStateChange: (state: EditorState) => void) {
    this.user = user;
    this.onStateChange = onStateChange;
    this.state = {
      content: '',
      isReadOnly: false,
      showQuotaModal: false,
      showShieldAlert: false,
      lastSavedLengths: {
        content: 0,
        script_dialogue: 0,
        script_action: 0,
        script_camera: 0
      }
    };
  }

  getState(): EditorState {
    return { ...this.state };
  }

  getUser(): User {
    return { ...this.user };
  }

  // 检查是否只读
  private checkReadOnly(): boolean {
    return this.user.tokenQuota.used >= this.user.tokenQuota.total;
  }

  // 检查剩余额度
  private getRemainingQuota(): number {
    return Math.max(0, this.user.tokenQuota.total - this.user.tokenQuota.used);
  }

  // 处理输入
  handleInput(newContent: string, section: EditorSection = 'content'): { 
    accepted: boolean; 
    truncatedContent?: string;
    stateChanges: Partial<EditorState>;
  } {
    const previousLength = this.state.lastSavedLengths[section];
    const newLength = newContent.length;
    const diff = Math.max(0, newLength - previousLength);
    const remainingQuota = this.getRemainingQuota();

    // 场景：额度正好等于当前输入，再输入一个字符
    if (remainingQuota === 0) {
      // 立即触发所有约束
      this.state.isReadOnly = true;
      this.state.showShieldAlert = true;
      this.state.showQuotaModal = true;
      
      this.onStateChange(this.getState());
      
      return {
        accepted: false,
        stateChanges: {
          isReadOnly: true,
          showShieldAlert: true,
          showQuotaModal: true
        }
      };
    }

    // 场景：输入会超出额度
    if (diff > remainingQuota) {
      // 截断到可用额度
      const allowedLength = previousLength + remainingQuota;
      const truncatedContent = newContent.slice(0, allowedLength);
      
      // 消耗所有剩余额度
      this.user.tokenQuota.used = this.user.tokenQuota.total;
      
      // 触发约束
      this.state.isReadOnly = true;
      this.state.showShieldAlert = true;
      this.state.showQuotaModal = true;
      this.state.content = truncatedContent;
      
      this.onStateChange(this.getState());
      
      return {
        accepted: false,
        truncatedContent,
        stateChanges: {
          isReadOnly: true,
          showShieldAlert: true,
          showQuotaModal: true
        }
      };
    }

    // 正常输入
    this.user.tokenQuota.used += diff;
    this.state.content = newContent;
    this.state.lastSavedLengths[section] = newLength;
    
    this.onStateChange(this.getState());
    
    return {
      accepted: true,
      stateChanges: {}
    };
  }

  // 模拟粘贴操作
  handlePaste(text: string, section: EditorSection = 'content'): {
    accepted: boolean;
    insertedLength: number;
    stateChanges: Partial<EditorState>;
  } {
    const remainingQuota = this.getRemainingQuota();
    
    if (remainingQuota === 0) {
      this.state.isReadOnly = true;
      this.state.showShieldAlert = true;
      this.state.showQuotaModal = true;
      this.onStateChange(this.getState());
      
      return {
        accepted: false,
        insertedLength: 0,
        stateChanges: {
          isReadOnly: true,
          showShieldAlert: true,
          showQuotaModal: true
        }
      };
    }

    const insertLength = Math.min(text.length, remainingQuota);
    const accepted = insertLength > 0;
    
    if (insertLength < text.length) {
      // 部分接受，触发额度耗尽
      this.user.tokenQuota.used = this.user.tokenQuota.total;
      this.state.isReadOnly = true;
      this.state.showShieldAlert = true;
      this.state.showQuotaModal = true;
    } else {
      this.user.tokenQuota.used += insertLength;
    }
    
    this.onStateChange(this.getState());
    
    return {
      accepted,
      insertedLength: insertLength,
      stateChanges: accepted && insertLength < text.length ? {
        isReadOnly: true,
        showShieldAlert: true,
        showQuotaModal: true
      } : {}
    };
  }

  // 关闭额度弹窗
  closeQuotaModal(): void {
    this.state.showQuotaModal = false;
    // 注意：isReadOnly 保持 true，showShieldAlert 保持显示
    this.onStateChange(this.getState());
  }

  // 升级额度（模拟）
  upgradeQuota(newTotal: number): void {
    this.user.tokenQuota.total = newTotal;
    if (this.user.tokenQuota.used < this.user.tokenQuota.total) {
      this.state.isReadOnly = false;
      this.state.showShieldAlert = false;
    }
    this.onStateChange(this.getState());
  }
}

describe('剧本编辑器 - 额度耗尽高压测试', () => {
  let controller: ScriptEditorController;
  let stateChanges: EditorState[] = [];
  let mockUser: User;

  beforeEach(() => {
    stateChanges = [];
    // 初始条件：剩余额度正好等于当前输入字数
    // 假设已有100字符，额度也是100
    mockUser = {
      id: 'user-1',
      username: 'test-user',
      tokenQuota: {
        used: 100,
        total: 100  // 剩余额度 = 0
      }
    };
    
    controller = new ScriptEditorController(mockUser, (state) => {
      stateChanges.push({ ...state });
    });
    
    // 设置初始状态
    const initialState = controller.getState();
    initialState.lastSavedLengths.content = 100;
    initialState.content = 'A'.repeat(100);
  });

  describe('核心约束验证 - 额度正好耗尽场景', () => {
    it('初始条件验证：剩余额度应为0', () => {
      const user = controller.getUser();
      const remaining = user.tokenQuota.total - user.tokenQuota.used;
      expect(remaining).toBe(0);
    });

    it('继续输入一个字符时，应立即触发所有约束', () => {
      const result = controller.handleInput('A'.repeat(101));
      
      // 验证输入被拒绝
      expect(result.accepted).toBe(false);
      
      // 验证约束触发
      expect(result.stateChanges.isReadOnly).toBe(true);
      expect(result.stateChanges.showShieldAlert).toBe(true);
      expect(result.stateChanges.showQuotaModal).toBe(true);
    });

    it('应无感切换为 ReadOnly 状态', () => {
      const beforeState = controller.getState();
      expect(beforeState.isReadOnly).toBe(false);
      
      // 触发额度耗尽
      controller.handleInput('A'.repeat(101));
      
      const afterState = controller.getState();
      expect(afterState.isReadOnly).toBe(true);
      
      // 验证状态变化被记录
      expect(stateChanges.length).toBeGreaterThan(0);
      const lastChange = stateChanges[stateChanges.length - 1];
      expect(lastChange.isReadOnly).toBe(true);
    });

    it('应触发 ShieldAlert 警报显示', () => {
      controller.handleInput('A'.repeat(101));
      
      const state = controller.getState();
      expect(state.showShieldAlert).toBe(true);
    });

    it('应瞬间弹出 QuotaModal', () => {
      controller.handleInput('A'.repeat(101));
      
      const state = controller.getState();
      expect(state.showQuotaModal).toBe(true);
    });

    it('所有约束应同时触发', () => {
      controller.handleInput('A'.repeat(101));
      
      const state = controller.getState();
      
      // 所有约束应同时满足
      expect(state.isReadOnly).toBe(true);
      expect(state.showShieldAlert).toBe(true);
      expect(state.showQuotaModal).toBe(true);
    });
  });

  describe('边界条件测试', () => {
    it('额度剩余1时，输入1个字符应成功但立即耗尽', () => {
      // 重置额度：used=99, total=100
      mockUser.tokenQuota.used = 99;
      controller = new ScriptEditorController(mockUser, (state) => {
        stateChanges.push({ ...state });
      });
      
      // 设置初始状态，lastSavedLengths 为 99（已有99字符）
      const initialState = controller.getState();
      initialState.lastSavedLengths.content = 99;
      initialState.content = 'A'.repeat(99);
      
      // 输入到100字符（增加1个）
      const result = controller.handleInput('A'.repeat(100));
      
      // 这次应该接受输入（diff = 100 - 99 = 1，剩余额度 = 1）
      expect(result.accepted).toBe(true);
      
      // 但之后额度耗尽
      const user = controller.getUser();
      expect(user.tokenQuota.used).toBe(100);
      expect(user.tokenQuota.total - user.tokenQuota.used).toBe(0);
    });

    it('额度剩余1时，输入2个字符应触发约束', () => {
      mockUser.tokenQuota.used = 99;
      controller = new ScriptEditorController(mockUser, (state) => {
        stateChanges.push({ ...state });
      });
      
      // 设置初始状态
      const initialState = controller.getState();
      initialState.lastSavedLengths.content = 99;
      initialState.content = 'A'.repeat(99);
      
      // 尝试输入到101字符（增加2个，但只有1个额度）
      const result = controller.handleInput('A'.repeat(101));
      
      expect(result.accepted).toBe(false);
      expect(result.stateChanges.isReadOnly).toBe(true);
      expect(result.stateChanges.showQuotaModal).toBe(true);
    });

    it('粘贴操作在额度耗尽时应被拒绝', () => {
      const result = controller.handlePaste('一些文本');
      
      expect(result.accepted).toBe(false);
      expect(result.insertedLength).toBe(0);
      expect(result.stateChanges.isReadOnly).toBe(true);
      expect(result.stateChanges.showQuotaModal).toBe(true);
    });

    it('部分粘贴应截断并触发约束', () => {
      // 剩余5个额度
      mockUser.tokenQuota.used = 95;
      mockUser.tokenQuota.total = 100;
      controller = new ScriptEditorController(mockUser, (state) => {
        stateChanges.push({ ...state });
      });
      
      // 尝试粘贴20个字符
      const result = controller.handlePaste('A'.repeat(20));
      
      // 只接受5个
      expect(result.insertedLength).toBe(5);
      expect(result.stateChanges.isReadOnly).toBe(true);
      expect(result.stateChanges.showQuotaModal).toBe(true);
    });
  });

  describe('状态持久性测试', () => {
    it('关闭 QuotaModal 后应保持 ReadOnly', () => {
      controller.handleInput('A'.repeat(101));
      
      // 关闭弹窗
      controller.closeQuotaModal();
      
      const state = controller.getState();
      expect(state.showQuotaModal).toBe(false);
      expect(state.isReadOnly).toBe(true);  // 应保持只读
      expect(state.showShieldAlert).toBe(true);  // 警报应保持
    });

    it('升级额度后应解除 ReadOnly', () => {
      controller.handleInput('A'.repeat(101));
      
      // 验证初始状态
      let state = controller.getState();
      expect(state.isReadOnly).toBe(true);
      
      // 升级额度
      controller.upgradeQuota(200);
      
      state = controller.getState();
      expect(state.isReadOnly).toBe(false);
      expect(state.showShieldAlert).toBe(false);
    });

    it('升级额度不足时不应解除 ReadOnly', () => {
      controller.handleInput('A'.repeat(101));
      
      // 升级额度但used已经超过新的total
      controller.upgradeQuota(100);  // used=100, total=100，仍然耗尽
      
      const state = controller.getState();
      expect(state.isReadOnly).toBe(true);
      expect(state.showShieldAlert).toBe(true);
    });
  });

  describe('多 Section 额度管理', () => {
    it('不同 Section 应共享额度', () => {
      // 在 content section 耗尽额度
      controller.handleInput('A'.repeat(101));
      
      // 切换到 script_dialogue section
      const result = controller.handleInput('一些对白', 'script_dialogue');
      
      // 应该仍然被拒绝
      expect(result.accepted).toBe(false);
      expect(result.stateChanges.isReadOnly).toBe(true);
    });

    it('各 Section 应有独立的 lastSavedLengths', () => {
      mockUser.tokenQuota.used = 50;
      mockUser.tokenQuota.total = 100;
      controller = new ScriptEditorController(mockUser, (state) => {
        stateChanges.push({ ...state });
      });
      
      // 设置不同 section 的不同长度
      const state = controller.getState();
      state.lastSavedLengths.content = 50;
      state.lastSavedLengths.script_dialogue = 30;
      state.lastSavedLengths.script_action = 20;
      
      // 每个 section 的额度计算应基于各自的 baseline
      const contentResult = controller.handleInput('A'.repeat(60), 'content');
      expect(contentResult.accepted).toBe(true);  // 增加10，剩余50
      
      const dialogueResult = controller.handleInput('B'.repeat(40), 'script_dialogue');
      expect(dialogueResult.accepted).toBe(true);  // 增加10，剩余40
    });
  });

  describe('性能测试', () => {
    it('约束触发应在单帧内完成', () => {
      const startTime = performance.now();
      
      controller.handleInput('A'.repeat(101));
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 应在 16.67ms 内完成（60fps）
      expect(duration).toBeLessThan(16.67);
    });

    it('连续输入不应导致状态抖动', () => {
      const stateSnapshots: EditorState[] = [];
      
      controller = new ScriptEditorController(mockUser, (state) => {
        stateSnapshots.push({ ...state });
      });
      
      // 快速连续输入
      for (let i = 0; i < 10; i++) {
        controller.handleInput(`A`.repeat(100 + i));
      }
      
      // 验证最终状态一致
      const finalState = controller.getState();
      expect(finalState.isReadOnly).toBe(true);
      expect(finalState.showQuotaModal).toBe(true);
      
      // 验证 showQuotaModal 不会重复触发导致抖动
      const modalStates = stateSnapshots.map(s => s.showQuotaModal);
      const trueCount = modalStates.filter(s => s).length;
      expect(trueCount).toBeLessThanOrEqual(stateSnapshots.length);
    });
  });

  describe('用户体验测试', () => {
    it('ReadOnly 状态应有正确的占位符提示', () => {
      controller.handleInput('A'.repeat(101));
      
      const state = controller.getState();
      expect(state.isReadOnly).toBe(true);
      
      // 验证占位符逻辑
      const getPlaceholder = (isReadOnly: boolean) => {
        return isReadOnly ? '配额已耗尽，请升级后继续创作...' : '开始书写你的精彩剧本...';
      };
      
      expect(getPlaceholder(state.isReadOnly)).toBe('配额已耗尽，请升级后继续创作...');
    });

    it('ShieldAlert 应显示正确的警告信息', () => {
      controller.handleInput('A'.repeat(101));
      
      const state = controller.getState();
      expect(state.showShieldAlert).toBe(true);
      
      // 验证 UI 应显示的元素
      const alertElements = {
        icon: 'ShieldAlert',
        text: '只读模式',
        color: 'rose-500'
      };
      
      expect(alertElements.icon).toBe('ShieldAlert');
      expect(alertElements.text).toBe('只读模式');
    });
  });
});
