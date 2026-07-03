# AGENTS.md - three-tile 开发指南

本文档为在 three-tile 代码库中工作的代理编码助手提供指导。

## 项目概述

three-tile 是一个基于 Three.js 的轻量级瓦片地图库，采用 monorepo 架构：

- `packages/lib/` - 核心库
- `packages/plugin/` - 插件扩展
- `packages/demo/` - 演示应用

## 构建和开发命令

### 开发环境

```bash
pnpm dev                       # 启动 demo 开发服务器 (默认 workspace)
pnpm dev --filter @three-tile/lib    # 监听构建 lib 包
pnpm dev --filter @three-tile/plugin # 监听构建 plugin 包
```

### 构建命令

```bash
pnpm build                     # 构建所有包（lib + plugin）
pnpm build:lib                 # 构建 lib 包 (vite build)
pnpm build:plugin              # 构建 plugin 包 (tsc && vite build)
pnpm build:demo                # 构建 demo 应用
```

### 代码质量检查

```bash
npm run format                 # 使用 oxfmt 格式化所有文件
npm run lint                   # 使用 oxlint 检查代码质量
npm run build --workspace=packages/lib  # TypeScript 编译检查
```

### 单包测试

```bash
npm run build --workspace=packages/lib     # 检查 lib 包编译
npm run build --workspace=packages/plugin  # 检查 plugin 包编译
npm run build --workspace=packages/demo    # 检查 demo 包编译
```

## 代码风格指南

### 导入规范

- 使用 ES6 模块导入语法 (`import { } from "..."`)
- Three.js 相关导入: `import { Mesh, Material } from "three"`
- 相对路径导入: `import { ISource } from "../source"`
- 外部库放在前面，相对路径放在后面

### 命名约定

- **类名**: PascalCase (如 `TileLoader`, `GeometryLoader`)
- **接口名**: 以 I 开头的 PascalCase (如 `ISource`, `ITileLoader`)
- **函数/方法**: camelCase (如 `registerLoader`, `getTileLoaders`)
- **变量/属性**: camelCase (如 `_maxThreads`, `cameraWorldPosition`)
- **常量**: UPPER_SNAKE_CASE (如 `cameraWorldPosition`)
- **文件名**: PascalCase.ts (如 `TileLoader.ts`, `ITileLoader.ts`)

### TypeScript 规范

- 启用严格模式 (`"strict": true`)
- 启用未使用变量检查 (`"noUnusedLocals": true`, `"noUnusedParameters": true`)
- 使用显式返回值检查 (`"noImplicitReturns": true`)
- 优先使用接口定义类型，使用 type 定义联合类型
- 避免使用 `any`，如必须使用请添加注释说明原因

### 注释和文档

- 使用 JSDoc 格式的文件头注释，导出的类和方法必须有注释
- 每个文件只导出一个主要类/接口，使用 `export * from "./module"` 重新导出
- 工厂类使用静态方法创建实例，使用私有字段 (\_前缀) 封装实现

### 错误处理与性能

- 使用 try-catch 包装可能出错的操作，优先返回 Promise
- 复杂计算使用 Web Workers，使用对象池减少内存分配
- 避免在渲染循环中创建新对象，使用 TypeScript 可选链操作符

## 包管理

### Workspaces

- 使用 npm workspaces 管理多包依赖
- 内部包引用使用相对路径: `"three-tile": "../lib"`
- 版本号保持同步，根包的 package.json 作为主版本

### 依赖管理

- Three.js 作为 peerDependency (`"three": "0.171.0"`)
- 构建工具: Vite 6 + TypeScript
- 代码格式化: Oxfmt
- 代码检查: Oxlint
- Git Hooks: Husky + Lint-staged + Commitlint
- 类型定义: @types/three

## 开发工具配置

### TypeScript

- 目标版本: ES2020
- 模块系统: ES2020 + bundler resolution
- 严格模式: 启用所有严格检查

### Vite 构建配置

- 库模式构建，支持 UMD 和 ESM
- 外部依赖: three, three-tile
- 生成类型定义文件

### Oxfmt 配置

- 缩进: 使用制表符，宽度2
- 行宽: 120字符
- 引号: 双引号
- 分号: 必须
- 尾随逗号: ES5
- 箭头函数参数: 避免括号 (avoid)
- 参考 `.oxfmtrc.json`

### Commitlint 配置

- 遵循 Conventional Commits 规范
- 允许类型: feat, fix, docs, style, refactor, perf, test, build, ci, chore, remove
- 提交信息长度限制: 72字符
- 参考 `.commitlintrc.js`

## 测试指南

目前项目未配置自动化测试，代码验证通过：

1. TypeScript 编译检查
2. Demo 应用运行验证
3. 构建过程验证

如需添加测试，建议使用：

- 单元测试: Jest + @types/jest
- E2E 测试: Playwright 或 Cypress
- 组件测试: Testing Library

## 提交规范

- 提交前运行 `npm run format` 格式化代码
- 确保 TypeScript 编译无错误
- 测试 Demo 应用正常运行
- 遵循语义化版本控制

## 常见问题

### Q: 如何添加新的瓦片加载器？

A: 实现 `ITileGeometryLoader` 或 `ITileMaterialLoader` 接口，使用 `registerDEMLoader()` 或 `registerImgLoader()` 注册。

### Q: 如何添加新的地图源？

A: 实现 `ISource` 接口，在 plugin 的 mapSource 目录下创建源文件。

### Q: 调试建议？

A: 使用 Chrome DevTools，关注 Web Workers 状态，查看网络请求和内存使用情况。
