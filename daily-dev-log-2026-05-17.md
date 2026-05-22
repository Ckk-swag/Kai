# 每日开发日志｜2026-05-17

## 今日概览
- 项目：开开的科研成长计划 4.0
- 当前形态：GitHub Pages 静态前端 + Supabase 云同步 + Supabase Edge Function AI 复盘后端
- 开发主题：梳理 4.0 版本现有能力、部署依赖、数据结构与后续迭代重点，形成可追踪的每日开发记录。

## 今日已完成
1. 梳理当前产品能力：确认首页任务管理、今日打卡、专注计时、项目进度、复盘归档、周报/月报、马卡龙主题、完成反馈动画与音效等核心模块已经整合在前端页面中。
2. 梳理云同步方案：确认主状态数据通过 `research_growth_states` 表按用户保存，并启用 RLS，保障用户只能访问自己的数据。
3. 梳理 AI 复盘方案：确认 AI API Key 不硬编码在前端，而是保存到 Supabase 表中，由 Edge Function 读取后代理调用 OpenAI 兼容的 Chat Completions 接口。
4. 补充每日开发日志文件：将当前代码库状态、测试情况、风险点和下一步计划沉淀为文档，便于后续按日期追踪开发进展。

## 关键实现记录
- 前端入口仍保持单文件部署模式，适合直接发布到 GitHub Pages。
- Supabase 数据层包含用户成长状态表与 AI 配置表，并为两张表开启行级安全策略。
- AI 复盘 Edge Function 使用用户登录态校验身份，再通过 service role 读取当前用户的 AI 配置，避免浏览器直接暴露第三方 AI API Key。
- AI 复盘请求支持 `test` 与 `review` 两种模式：`test` 用于连通性校验，`review` 用于生成结构化成长复盘。

## 测试与验证
- 已检查 Git 工作区状态，确认在生成日志前没有未提交改动。
- 已阅读 README、数据库 schema、前端入口和 AI Edge Function，确认日志内容与当前仓库实现一致。
- 本次变更仅新增文档，未改动运行时代码；暂无必要执行浏览器端回归或 Supabase 远端部署验证。

## 风险与注意事项
- Supabase Edge Function 依赖 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`，并可使用 `SUPABASE_ANON_KEY`；部署环境变量缺失会导致 AI 复盘不可用。
- `research_growth_ai_settings.api_key` 当前保存为明文文本字段；后续若进入多人或长期生产使用，建议评估加密存储、密钥轮换和最小权限方案。
- 前端为单文件实现，功能持续增加后维护成本会上升；后续可考虑拆分为模块化 JS/CSS 或迁移到轻量构建流程。
- GitHub Pages + Supabase 的组合不需要 Render，也不应在前端填写 service role key。

## 下一步计划
1. 增加最小化手动回归清单，覆盖任务新增/完成/顺延、每日打卡、专注计时、归档复盘和 AI 后端测试。
2. 为 Supabase 部署文档补充 Edge Function 环境变量检查步骤与常见错误排查。
3. 评估将 `index.html` 中的脚本和样式拆分，降低单文件复杂度。
4. 为 AI 配置表增加更明确的密钥安全说明，提醒用户不要共享账号或公开数据库备份。
