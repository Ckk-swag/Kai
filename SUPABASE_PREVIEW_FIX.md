# Supabase Preview / Postgres timeout 修复说明

如果 GitHub PR 页面出现下面这种失败：

```text
failed to connect to postgres: failed to connect to `host=2600:... user=postgres database=postgres`: dial error (timeout: dial tcp [2600:...]:5432: i/o timeout)
```

这不是网页前端代码报错，也不是 `index.html` 运行失败。这个错误来自 **Supabase GitHub Integration / Branching Preview** 尝试为 PR 创建 Supabase Preview 数据库，并通过 Postgres 直连端口 `5432` 连接数据库。

本仓库是 GitHub Pages 静态前端：

- 前端通过 Supabase JS SDK 访问 Supabase HTTP API。
- 不需要 GitHub Actions 直连 Postgres。
- 不需要 PR Preview 数据库。
- 不应该在仓库或前端写入 `service_role`、数据库密码、Postgres URL 等 secret。

## 已在仓库内处理的部分

仓库保留了 `.github/workflows/supabase-preview.yml`，它是 no-op 通过检查，只输出说明，不连接 Postgres，不执行 `supabase db push`，不读取任何 secret。

## 仍然失败时必须在 Supabase 后台处理

如果 GitHub 检查项左侧是 **Supabase 图标**，说明它不是本仓库里的 GitHub Actions workflow，而是 Supabase 外部 GitHub App 创建的 check。仓库代码无法关闭外部 App check，需要到 Supabase 后台关闭：

1. 打开 Supabase Dashboard。
2. 进入当前项目。
3. 打开 **Project Settings → Integrations**。
4. 找到 GitHub Integration / Branching / Preview Branches。
5. 关闭该仓库的 Preview / Branching check，或断开该仓库的 Supabase GitHub Integration。
6. 回到 GitHub PR，重新运行 checks 或推送一个新 commit。

## 如果以后真的需要 CI 直连 Postgres

不要使用 `db.<project-ref>.supabase.co:5432` 的 IPv6 direct connection 作为 GitHub Actions 连接地址；GitHub runner / 网络环境可能无法访问 IPv6，导致上面的 timeout。应改用 Supabase Dashboard → Connect 里提供的 **pooler** 连接串，并通过 GitHub Secrets 注入，不能提交到仓库。
