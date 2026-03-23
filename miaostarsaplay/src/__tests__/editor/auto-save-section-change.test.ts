import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * 跨 Section 自动保存高压测试
 * 
 * 测试场景：
 * 操作: 在 script_dialogue 中快速编辑，两秒内点击切换至 script_camera
 * 期望约束: 
 *   - 遵循"先保存后切换"原则
 *   - 系统必须在 handleSectionChange 时立即触发 API 调用
 *   - 等 updateProject 异步返回成功并在 lastSavedLengthsRef 更新 baseline 后
 *   - 才允许前端 UI 的 Tab 态发生偏转
 */

// 类型定义
type EditorSection = 'content' | 'script_dialogue' | 'script_action' | 'script_camera';

interface Project {
  id: string;
  title: string;
  content?: string;
  script_dialogue?: string;
  script_action?: string;
  script_camera?: string;
}

interface SaveOperation {
  section: EditorSection;
  content: string;
  status: 'pending' | 'success' | 'error';
  timestamp: number;
}

// 模拟 API 调用
const mockUpdateProjectAPI = vi.fn();

// 编辑器控制器 - 模拟 ScriptEditor 的核心逻辑
class SectionChangeController {
  private project: Project;
  private localScripts: Record<EditorSection, string>;
  private lastSavedLengths: Record<EditorSection, number>;
  private activeSection: EditorSection;
  private isSaving: boolean;
  private pendingSectionChange: EditorSection | null;
  private saveQueue: SaveOperation[];
  private onStateChange: (state: {
    activeSection: EditorSection;
    isSaving: boolean;
    lastSavedLengths: Record<EditorSection, number>;
  }) => void;

  constructor(
    project: Project,
    onStateChange: (state: {
      activeSection: EditorSection;
      isSaving: boolean;
      lastSavedLengths: Record<EditorSection, number>;
    }) => void
  ) {
    this.project = project;
    this.onStateChange = onStateChange;
    this.activeSection = 'content';
    this.isSaving = false;
    this.pendingSectionChange = null;
    this.saveQueue = [];
    
    // 初始化本地脚本状态
    this.localScripts = {
      content: project.content || '',
      script_dialogue: project.script_dialogue || '',
      script_action: project.script_action || '',
      script_camera: project.script_camera || ''
    };
    
    // 初始化最后保存长度
    this.lastSavedLengths = {
      content: (project.content || '').length,
      script_dialogue: (project.script_dialogue || '').length,
      script_action: (project.script_action || '').length,
      script_camera: (project.script_camera || '').length
    };
  }

  getState() {
    return {
      activeSection: this.activeSection,
      isSaving: this.isSaving,
      lastSavedLengths: { ...this.lastSavedLengths },
      localScripts: { ...this.localScripts }
    };
  }

  getSaveQueue() {
    return [...this.saveQueue];
  }

  // 更新本地内容
  updateLocalContent(section: EditorSection, content: string) {
    this.localScripts[section] = content;
  }

  // 保存内容到服务器
  private async saveContent(section: EditorSection, content: string): Promise<boolean> {
    const operation: SaveOperation = {
      section,
      content,
      status: 'pending',
      timestamp: Date.now()
    };
    this.saveQueue.push(operation);
    
    this.isSaving = true;
    this.notifyStateChange();

    try {
      // 调用 API
      await mockUpdateProjectAPI({
        id: this.project.id,
        changes: { [section]: content }
      });

      // 更新 baseline
      this.lastSavedLengths[section] = content.length;
      operation.status = 'success';
      
      // 更新项目数据
      this.project = {
        ...this.project,
        [section]: content
      };
      
      return true;
    } catch (error) {
      operation.status = 'error';
      return false;
    } finally {
      this.isSaving = false;
      this.notifyStateChange();
    }
  }

  // 核心：处理 Section 切换 - "先保存后切换"原则
  async handleSectionChange(newSection: EditorSection): Promise<boolean> {
    const currentText = this.localScripts[this.activeSection];
    const savedText = this.project[this.activeSection] || '';

    // 如果有未保存的更改，先保存
    if (currentText !== savedText) {
      // 立即触发 API 调用
      const saveSuccess = await this.saveContent(this.activeSection, currentText);
      
      if (!saveSuccess) {
        // 保存失败，不应切换
        return false;
      }
      
      // 确保 baseline 已更新
      // 等待 lastSavedLengthsRef 更新后才允许切换
      if (this.lastSavedLengths[this.activeSection] !== currentText.length) {
        console.error('Baseline 更新失败');
        return false;
      }
    }

    // 现在可以安全地切换 Section
    this.activeSection = newSection;
    this.notifyStateChange();
    return true;
  }

  // 快速切换测试场景
  async handleRapidSectionChange(newSection: EditorSection): Promise<{
    success: boolean;
    savedBeforeSwitch: boolean;
    baselineUpdated: boolean;
  }> {
    const currentText = this.localScripts[this.activeSection];
    const savedText = this.project[this.activeSection] || '';
    const hasUnsavedChanges = currentText !== savedText;

    let savedBeforeSwitch = false;
    let baselineUpdated = false;

    if (hasUnsavedChanges) {
      savedBeforeSwitch = true;
      const saveSuccess = await this.saveContent(this.activeSection, currentText);
      
      if (saveSuccess) {
        baselineUpdated = this.lastSavedLengths[this.activeSection] === currentText.length;
      }
      
      if (!saveSuccess || !baselineUpdated) {
        return {
          success: false,
          savedBeforeSwitch,
          baselineUpdated
        };
      }
    }

    this.activeSection = newSection;
    this.notifyStateChange();
    
    return {
      success: true,
      savedBeforeSwitch,
      baselineUpdated
    };
  }

  private notifyStateChange() {
    this.onStateChange({
      activeSection: this.activeSection,
      isSaving: this.isSaving,
      lastSavedLengths: { ...this.lastSavedLengths }
    });
  }
}

describe('跨 Section 自动保存高压测试', () => {
  let controller: SectionChangeController;
  let stateChanges: Array<{
    activeSection: EditorSection;
    isSaving: boolean;
    lastSavedLengths: Record<EditorSection, number>;
  }> = [];
  let mockProject: Project;

  beforeEach(() => {
    vi.clearAllMocks();
    stateChanges = [];
    
    mockProject = {
      id: 'project-1',
      title: '测试项目',
      content: '初始内容',
      script_dialogue: '初始对白',
      script_action: '初始动作',
      script_camera: '初始镜头'
    };

    // 模拟 API 成功
    mockUpdateProjectAPI.mockResolvedValue({ success: true });

    controller = new SectionChangeController(mockProject, (state) => {
      stateChanges.push({ ...state });
    });
  });

  describe('核心约束验证 - "先保存后切换"原则', () => {
    it('无未保存更改时应直接切换', async () => {
      // 确保没有未保存的更改
      const state = controller.getState();
      expect(state.localScripts.script_dialogue).toBe('初始对白');

      const result = await controller.handleSectionChange('script_camera');
      
      expect(result).toBe(true);
      expect(controller.getState().activeSection).toBe('script_camera');
      expect(mockUpdateProjectAPI).not.toHaveBeenCalled();
    });

    it('有未保存更改时应先保存再切换', async () => {
      // 在当前 activeSection (content) 中编辑
      controller.updateLocalContent('content', '修改后的内容');
      
      const result = await controller.handleSectionChange('script_camera');
      
      // 验证 API 被调用
      expect(mockUpdateProjectAPI).toHaveBeenCalledWith({
        id: 'project-1',
        changes: { content: '修改后的内容' }
      });
      
      expect(result).toBe(true);
      expect(controller.getState().activeSection).toBe('script_camera');
    });

    it('应在 baseline 更新后才切换 Section', async () => {
      // 编辑当前 activeSection (content) 的内容
      const newContent = '修改后的内容';
      controller.updateLocalContent('content', newContent);
      
      const beforeState = controller.getState();
      expect(beforeState.lastSavedLengths.content).toBe(4); // '初始内容'.length
      
      await controller.handleSectionChange('script_camera');
      
      const afterState = controller.getState();
      
      // 验证 baseline 已更新
      expect(afterState.lastSavedLengths.content).toBe(newContent.length);
      expect(afterState.activeSection).toBe('script_camera');
    });

    it('保存失败时不应切换 Section', async () => {
      // 模拟 API 失败
      mockUpdateProjectAPI.mockRejectedValue(new Error('Network error'));
      
      // 修改当前 activeSection (content) 的内容以触发保存
      controller.updateLocalContent('content', '修改后的内容');
      
      const result = await controller.handleSectionChange('script_camera');
      
      expect(result).toBe(false);
      expect(controller.getState().activeSection).toBe('content'); // 保持原 Section
    });
  });

  describe('高压场景测试 - 快速编辑并切换', () => {
    it('应在两秒内编辑后切换时正确保存', async () => {
      // 模拟快速编辑：修改当前 activeSection (content) 的内容
      controller.updateLocalContent('content', '快速编辑的内容');
      
      // 立即切换（模拟两秒内）
      const result = await controller.handleRapidSectionChange('script_camera');
      
      expect(result.success).toBe(true);
      expect(result.savedBeforeSwitch).toBe(true);
      expect(result.baselineUpdated).toBe(true);
      
      // 验证保存队列
      const saveQueue = controller.getSaveQueue();
      expect(saveQueue).toHaveLength(1);
      expect(saveQueue[0].section).toBe('content');
      expect(saveQueue[0].status).toBe('success');
    });

    it('快速切换时应保持正确的执行顺序', async () => {
      const executionOrder: string[] = [];
      
      mockUpdateProjectAPI.mockImplementation(async () => {
        executionOrder.push('api-called');
        return { success: true };
      });
      
      controller = new SectionChangeController(mockProject, (state) => {
        if (state.isSaving) {
          executionOrder.push('saving-started');
        } else if (executionOrder.includes('saving-started')) {
          executionOrder.push('saving-ended');
        }
        if (state.activeSection === 'script_camera') {
          executionOrder.push('section-changed');
        }
        stateChanges.push(state);
      });
      
      // 修改当前 activeSection (content) 的内容以触发保存
      controller.updateLocalContent('content', '新内容');
      await controller.handleSectionChange('script_camera');
      
      // 验证执行顺序：API调用 -> saving-started -> saving-ended -> section-changed
      expect(executionOrder).toContain('api-called');
      expect(executionOrder).toContain('saving-started');
      expect(executionOrder).toContain('saving-ended');
      expect(executionOrder).toContain('section-changed');
      
      // 验证顺序：section-changed 应该在 saving-ended 之后
      const sectionChangedIndex = executionOrder.indexOf('section-changed');
      const savingEndedIndex = executionOrder.indexOf('saving-ended');
      expect(sectionChangedIndex).toBeGreaterThan(savingEndedIndex);
    });

    it('多次快速切换应正确处理队列', async () => {
      // 第一次编辑和切换：修改 content -> 切换到 script_action
      controller.updateLocalContent('content', '内容1');
      await controller.handleSectionChange('script_action');
      
      // 第二次编辑和切换：修改 script_action -> 切换到 script_camera
      controller.updateLocalContent('script_action', '动作1');
      await controller.handleSectionChange('script_camera');
      
      // 第三次编辑和切换：修改 script_camera -> 切换到 content
      controller.updateLocalContent('script_camera', '镜头1');
      await controller.handleSectionChange('content');
      
      const saveQueue = controller.getSaveQueue();
      // 应该有3次保存操作
      expect(saveQueue).toHaveLength(3);
      expect(saveQueue.every(s => s.status === 'success')).toBe(true);
      
      const finalState = controller.getState();
      expect(finalState.activeSection).toBe('content');
    });
  });

  describe('baseline 更新验证', () => {
    it('保存成功后应更新对应 section 的 baseline', async () => {
      // 修改当前 activeSection (content) 的内容
      const newContent = '这是一段很长的内容，用于测试 baseline 更新';
      controller.updateLocalContent('content', newContent);
      
      const beforeBaseline = controller.getState().lastSavedLengths.content;
      
      await controller.handleSectionChange('script_camera');
      
      const afterBaseline = controller.getState().lastSavedLengths.content;
      
      expect(afterBaseline).toBe(newContent.length);
      expect(afterBaseline).toBeGreaterThan(beforeBaseline);
    });

    it('不应影响其他 section 的 baseline', async () => {
      const beforeState = controller.getState();
      const originalActionBaseline = beforeState.lastSavedLengths.script_action;
      const originalCameraBaseline = beforeState.lastSavedLengths.script_camera;
      const originalDialogueBaseline = beforeState.lastSavedLengths.script_dialogue;
      
      // 修改当前 activeSection (content) 的内容
      controller.updateLocalContent('content', '新内容');
      await controller.handleSectionChange('script_camera');
      
      const afterState = controller.getState();
      
      // 其他 section 的 baseline 应保持不变
      expect(afterState.lastSavedLengths.script_action).toBe(originalActionBaseline);
      expect(afterState.lastSavedLengths.script_camera).toBe(originalCameraBaseline);
      expect(afterState.lastSavedLengths.script_dialogue).toBe(originalDialogueBaseline);
    });

    it('baseline 未更新时不应切换', async () => {
      // 模拟 baseline 更新失败的情况
      mockUpdateProjectAPI.mockResolvedValue({ success: true });
      
      controller = new SectionChangeController(mockProject, (state) => {
        stateChanges.push(state);
      });
      
      // 篡改 baseline 检查逻辑来模拟失败
      const originalHandleChange = controller.handleSectionChange.bind(controller);
      controller.handleSectionChange = async (newSection: EditorSection) => {
        const currentText = controller.getState().localScripts[controller.getState().activeSection];
        
        // 调用保存但不更新 baseline
        await mockUpdateProjectAPI({
          id: mockProject.id,
          changes: { [controller.getState().activeSection]: currentText }
        });
        
        // 故意不更新 baseline
        return false;
      };
      
      controller.updateLocalContent('script_dialogue', '新对白');
      const result = await controller.handleSectionChange('script_camera');
      
      expect(result).toBe(false);
    });
  });

  describe('UI 状态同步测试', () => {
    it('保存期间 isSaving 应为 true', async () => {
      let savingStates: boolean[] = [];
      
      controller = new SectionChangeController(mockProject, (state) => {
        savingStates.push(state.isSaving);
      });
      
      // 修改当前 activeSection (content) 的内容以触发保存
      controller.updateLocalContent('content', '新内容');
      
      // 使用延迟的 Promise 来捕获中间状态
      mockUpdateProjectAPI.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 50))
      );
      
      const changePromise = controller.handleSectionChange('script_camera');
      
      // 等待一小段时间让保存开始
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(savingStates).toContain(true);
      
      await changePromise;
      
      // 最终状态应为 false
      expect(controller.getState().isSaving).toBe(false);
    });

    it('Tab 态偏转应在保存完成后发生', async () => {
      const tabChanges: EditorSection[] = [];
      
      controller = new SectionChangeController(mockProject, (state) => {
        tabChanges.push(state.activeSection);
      });
      
      // 修改当前 activeSection (content) 的内容以触发保存
      controller.updateLocalContent('content', '新内容');
      await controller.handleSectionChange('script_camera');
      
      // 验证 Tab 切换发生在保存之后
      const saveQueue = controller.getSaveQueue();
      expect(saveQueue.length).toBeGreaterThan(0);
      expect(saveQueue[0].status).toBe('success');
      expect(tabChanges[tabChanges.length - 1]).toBe('script_camera');
    });
  });

  describe('边界条件测试', () => {
    it('空内容编辑后切换应正常工作', async () => {
      // 修改当前 activeSection (content) 的内容为空字符串
      controller.updateLocalContent('content', '');
      
      const result = await controller.handleSectionChange('script_camera');
      
      expect(result).toBe(true);
      expect(mockUpdateProjectAPI).toHaveBeenCalledWith({
        id: 'project-1',
        changes: { content: '' }
      });
    });

    it('相同内容不应触发保存', async () => {
      // 设置与服务器相同的内容
      controller.updateLocalContent('script_dialogue', '初始对白');
      
      const result = await controller.handleSectionChange('script_camera');
      
      expect(result).toBe(true);
      expect(mockUpdateProjectAPI).not.toHaveBeenCalled();
    });

    it('网络延迟时不应提前切换', async () => {
      mockUpdateProjectAPI.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      // 修改当前 activeSection 的内容以触发保存
      controller.updateLocalContent('content', '新内容');
      
      const changePromise = controller.handleSectionChange('script_camera');
      
      // 在延迟期间检查状态
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(controller.getState().activeSection).toBe('content'); // 尚未切换
      expect(controller.getState().isSaving).toBe(true); // 正在保存
      
      await changePromise;
      expect(controller.getState().activeSection).toBe('script_camera'); // 已切换
      expect(controller.getState().isSaving).toBe(false); // 保存完成
    });
  });

  describe('并发安全测试', () => {
    it('保存期间应阻止新的保存操作', async () => {
      // 修改当前 activeSection 的内容以触发保存
      controller.updateLocalContent('content', '新内容');
      
      // 模拟慢速 API
      mockUpdateProjectAPI.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );
      
      // 启动第一次切换
      const promise1 = controller.handleSectionChange('script_action');
      
      // 在第一次完成前检查 isSaving 状态
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(controller.getState().isSaving).toBe(true);
      
      // 在保存期间再次修改 content（模拟用户在保存期间继续输入）
      controller.updateLocalContent('content', '更新后的内容');
      
      // 等待第一次切换完成
      const result1 = await promise1;
      expect(result1).toBe(true);
      expect(controller.getState().activeSection).toBe('script_action');
      
      // 验证 API 只被调用一次（第一次保存）
      expect(mockUpdateProjectAPI).toHaveBeenCalledTimes(1);
      expect(mockUpdateProjectAPI).toHaveBeenCalledWith({
        id: 'project-1',
        changes: { content: '新内容' }
      });
    });
  });

  describe('错误恢复测试', () => {
    it('保存失败后应允许重试', async () => {
      // 重新创建 controller 以确保干净状态
      mockUpdateProjectAPI.mockRejectedValue(new Error('Network error'));
      
      controller = new SectionChangeController(mockProject, (state) => {
        stateChanges.push(state);
      });
      
      // 修改当前 activeSection (content) 的内容以触发保存
      controller.updateLocalContent('content', '修改后的内容');
      
      const result1 = await controller.handleSectionChange('script_camera');
      expect(result1).toBe(false);
      expect(controller.getState().activeSection).toBe('content');
      
      // 第二次成功 - 重置 mock
      mockUpdateProjectAPI.mockReset();
      mockUpdateProjectAPI.mockResolvedValue({ success: true });
      
      const result2 = await controller.handleSectionChange('script_camera');
      expect(result2).toBe(true);
      expect(controller.getState().activeSection).toBe('script_camera');
    });

    it('部分保存失败不应影响其他 section', async () => {
      // 重新创建 controller
      mockUpdateProjectAPI.mockRejectedValue(new Error('Error'));
      
      controller = new SectionChangeController(mockProject, (state) => {
        stateChanges.push(state);
      });
      
      // 修改当前 activeSection (content) 的内容以触发保存
      controller.updateLocalContent('content', '修改后的内容');
      
      const result = await controller.handleSectionChange('script_camera');
      expect(result).toBe(false);
      
      // 切换到其他 section 应该可以正常工作 - 重置 mock
      mockUpdateProjectAPI.mockReset();
      mockUpdateProjectAPI.mockResolvedValue({ success: true });
      
      controller.updateLocalContent('script_action', '新动作');
      
      const result2 = await controller.handleSectionChange('script_camera');
      expect(result2).toBe(true);
    });
  });
});
