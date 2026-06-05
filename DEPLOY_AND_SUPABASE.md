# 4.3.3 部署说明

## GitHub Pages
新建仓库，把 public/index.html 上传到仓库根目录，并命名为 index.html。
然后打开 Settings → Pages → Deploy from branch → main/root。

## Supabase
创建项目后，进入 SQL Editor，运行 supabase/schema.sql。
当前版本会预填一个公开 Supabase Project URL 和 anon public key，同时保留输入框，方便替换为自己的 Project URL 与 anon public / publishable key。不要填写 service_role 或任何 secret key。

打开网页后会先加载本地任务和论文进度，云端登录状态与拉取在后台进行；“账号与云同步”页可确认 Project URL、anon key、邮箱和密码，先点“测试配置”，再注册/登录、推送云端或拉取云端。

## 4.3.3 AI 复盘后端函数
1. 先在 Supabase SQL Editor 重新运行仓库根目录的 `schema.sql`，创建 `research_growth_ai_settings`。
2. 部署 Edge Function：`supabase functions deploy ai-review`。
3. 前端“AI总结”页只会调用 Supabase Function `ai-review`，不会直接请求 DeepSeek / OpenAI 兼容接口。
4. 在“AI总结”页保存供应商、Base URL、模型（支持 DeepSeek V4 Flash / V4 Pro）和 API Key 后，可点击“测试后端通道”确认账号配置与函数可用；前端只展示阅读版并保存归档记录。

## GitHub Actions
本仓库是 GitHub Pages 静态前端 + Supabase JS SDK 项目，不需要 Supabase Preview / Postgres Preview workflow 直连数据库；当前仓库未保留这类 workflow。

## 清缓存
部署后请用 `https://ckk-swag.github.io/Kai/?v=433` 验证新版本，必要时递增 `v` 参数并强制刷新。
