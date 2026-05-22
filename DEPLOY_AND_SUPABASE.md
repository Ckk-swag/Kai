# 4.3.1 部署说明

## GitHub Pages
新建仓库，把 public/index.html 上传到仓库根目录，并命名为 index.html。
然后打开 Settings → Pages → Deploy from branch → main/root。

## Supabase
创建项目后，进入 SQL Editor，运行 supabase/schema.sql。
当前版本已内置统一 Supabase Project URL 和 anon public key，网页端不再要求用户填写这两项。

打开网页“账号与云同步”页，只填写邮箱和密码，注册/登录即可。

## 4.3.1 AI 复盘后端函数
1. 先在 Supabase SQL Editor 重新运行仓库根目录的 `schema.sql`，创建 `research_growth_ai_settings`。
2. 部署 Edge Function：`supabase functions deploy ai-review`。
3. 前端“AI总结”页只会调用 Supabase Function `ai-review`，不会直接请求 DeepSeek / OpenAI 兼容接口。
4. 在“AI总结”页保存供应商、Base URL、模型（支持 DeepSeek V4 Flash / V4 Pro）和 API Key 后，可点击“测试后端通道”确认账号配置与函数可用；前端只展示阅读版并保存归档记录。
