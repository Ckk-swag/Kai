# 开开的科研成长计划 3.2

这是 GitHub Pages + Supabase 云同步版本。

## 使用顺序
1. 把 public/index.html 上传到 GitHub Pages，或直接重命名为 index.html 使用。
2. 在 Supabase 创建项目。
3. 在 SQL Editor 运行 supabase/schema.sql。
4. 在网页“云同步”里填写 Project URL、anon public key、邮箱、密码。
5. 注册/登录后，先推送云端；换设备后登录，再拉取云端。

## 注意
- 不需要 Render。
- 不需要 server.js。
- 不要把 service_role key 填进前端。
- anon public key 可以放前端，但必须配合 RLS；schema.sql 已经配置 RLS。
