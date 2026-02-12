# Vibe Coding 重构方法论

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [中文](README.zh-CN.md)

一套系统性重构 AI 生成代码（Vibe Coding）的方法论。帮助你发现重复实现、未使用的资源和不一致的模式。

## 功能特性

- **六阶段工作流** - 从分析到验证的结构化方法
- **深度分析方法** - 架构层和模块层问题检测
- **资源盘点** - 全面发现可复用的组件、工具和基础设施
- **任务持久化** - 所有分析结果和任务进度保存到 `.refactor/` 目录
- **会话可恢复** - 支持跨会话增量执行，新 Agent 可精确从中断点继续

## 问题背景

在 Vibe Coding 模式下，AI 受限于上下文窗口，难以看清大型项目的全局。跨会话开发导致上下文碎片化，代码以打补丁的方式迭代演进。久而久之，项目中会积累大量问题：重复实现、组件库未被使用、模式混乱、维护成本激增。

## 如何使用

### 在 Cursor 中使用

**方法一：作为 Skill 使用（推荐）**

1. 将此文件夹复制到 `~/.cursor/skills/vibecoding-refactor/`
2. 当你请求以下操作时，Cursor 会自动使用此技能：
   - "重构这个代码库"
   - "清理代码"
   - "分析架构"
   - "提升代码质量"

**方法二：直接引用**

在提示中直接引用 SKILL.md：

```
@SKILL.md 请分析并重构这个项目
```

### 在 Claude Code 中使用

**方法一：作为 AGENTS.md**

1. 将 `SKILL.md` 的内容复制到项目的 `AGENTS.md` 文件中
2. Claude Code 会自动遵循此方法论

**方法二：在提示中引用**

```bash
# 直接引用技能文件
claude "读取 @SKILL.md 并按照方法论重构这个项目"
```

**方法三：使用 /read 命令**

```bash
claude
> /read /path/to/vibecoding-refactor/SKILL.md
> 请按照方法论重构这个代码库
```

### 快速命令

| 目标 | 提示词 |
|------|--------|
| 完整重构 | "按照 Vibe Coding 方法论重构这个代码库" |
| 继续工作 | "继续重构"（如果 `.refactor/` 存在） |
| 仅架构分析 | "只分析架构层" |
| 特定模块 | "分析 [模块名] 模块" |

## 核心工作流

```
阶段 0          阶段 1           阶段 2             阶段 3             阶段 4           阶段 5
项目分区    →   关键识别     →   架构层分析     →   模块层分析     →   执行重构     →   最终验证
```

1. **阶段 0：项目分区** - 盘点所有可复用资源
2. **阶段 1：关键识别** - 识别需要分析的核心功能
3. **阶段 2：架构分析** - 检测全局架构问题
4. **阶段 3：模块分析** - 深入分析每个功能模块
5. **阶段 4：执行重构** - 按层次系统性重构
6. **阶段 5：最终验证** - 验证和清理

## 核心原则

1. **功能不变** - 所有功能与重构前完全一致
2. **UI 不变** - 视觉外观和交互行为保持不变
3. **可回滚** - 每个变更都可以独立回滚
4. **可追溯** - 所有操作都有记录

## 工作区持久化

重构开始时会创建 `.refactor/` 工作区，所有分析结果和进度都会持久化保存：

```
.refactor/
├── README.md                 # 状态摘要（恢复入口点）
├── tasks/
│   ├── master-plan.md        # 任务树和进度
│   ├── active/               # 当前活动任务
│   └── completed/            # 已完成任务
├── logs/                     # 会话日志
├── checkpoints/              # 回滚点（含 git 引用）
└── analysis/                 # 分析产物
    ├── project-partition.md  # 资源盘点
    ├── architecture-report.md
    └── modules/              # 逐功能分析
```

### 会话恢复

当你说"继续重构"或项目中存在 `.refactor/` 目录时，Agent 会：

1. 读取 `.refactor/README.md` 获取整体状态
2. 读取 `master-plan.md` 了解任务进度
3. 读取活动任务文件，从中断点继续执行

**无需重新分析，所有上下文都从持久化文件恢复。**

## 项目结构

```
vibecoding-refactor/
├── SKILL.md                 # 主技能定义（入口点）
├── analysis/                # 分析方法
├── patterns/                # 模式库
├── strategies/              # 执行策略
└── workspace/               # 工作区管理
```

## 关键文档

| 文档 | 描述 |
|------|------|
| [SKILL.md](SKILL.md) | **从这里开始** - 完整工作流程 |
| [深度分析](analysis/deep-analysis.md) | 核心分析方法论 |
| [Vibe Coding 问题](patterns/vibe-coding-problems.md) | 问题分类 |
| [重构模式](patterns/refactor-patterns.md) | 标准解决方案 |

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。
