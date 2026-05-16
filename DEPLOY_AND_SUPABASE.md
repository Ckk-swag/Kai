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
