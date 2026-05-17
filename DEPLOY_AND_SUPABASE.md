# 3.2 部署说明

## GitHub Pages
新建仓库，把 public/index.html 上传到仓库根目录，并命名为 index.html。
然后打开 Settings → Pages → Deploy from branch → main/root。

## Supabase
创建项目后，进入 SQL Editor，运行 supabase/schema.sql。
再到 Project Settings → API 复制：
- Project URL
- anon public key

打开网页云同步页，填入以上两项，注册/登录即可。

## 4.0 AI 复盘后端函数
1. 先在 Supabase SQL Editor 重新运行仓库根目录的 `schema.sql`，创建 `research_growth_ai_settings`。
2. 部署 Edge Function：`supabase functions deploy ai-review`。
3. 前端“AI复盘”页只会调用 Supabase Function `ai-review`，不会直接请求 DeepSeek / OpenAI 兼容接口。
4. 在“AI复盘”页保存供应商、Base URL、模型和 API Key 后，可点击“测试后端通道”确认账号配置与函数可用。
