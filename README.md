# 和平之死 TRPG 控制台

这是《巨人之间：和平之死》的半自动化团务台，前端是纯静态 HTML/CSS/JS，后端使用 Supabase Auth、Postgres 和 RLS。

部署仓库：[huaerbujizewang/peace-death](https://github.com/huaerbujizewang/peace-death)

GitHub Pages 地址：[https://huaerbujizewang.github.io/peace-death/](https://huaerbujizewang.github.io/peace-death/)

## 本地运行

1. 编辑 `config.js`，填入 Supabase 项目的 URL 和 anon key。
2. 启动静态服务器：

```powershell
npm run dev:bundled
```

也可以直接把整个目录部署到 GitHub Pages、Netlify 或 Vercel 的静态托管。

## Supabase 初始化

1. 在 Supabase SQL Editor 运行 `supabase/schema.sql`。
2. 在 Authentication 里创建账号。建议先建：

```text
dm@peace.local
player1@peace.local
player2@peace.local
player3@peace.local
player4@peace.local
player5@peace.local
observe@peace.local
```

3. 再运行 `supabase/seed.sql`。它会初始化国家状态、政策、派系、职位、群体情绪、境外势力耐心，并把汉娜公爵作为 DM 持有的教材角色写入。

如果你换了登录邮箱，修改 `seed.sql` 里对应邮箱后再运行。

## 已覆盖的规则面

- DM 手动推进阶段。
- 私人行动和政府行动按阶段提交，草稿可随时写。
- 私人行动只对本人和 DM 可见。
- 政府行动可公开；不公开时必须填写理由。
- 需要批准的政府行动由公爵或首相批准/驳回。
- 角色公开信息与私密属性拆表，属性、财富、技能、秘密特质、人生追求、黑料受 RLS 保护。
- 亲信作为角色的小片片，可由 DM 任命政府职位，可执行行动。
- 国会投票按 100 席记录，DM 分配每个派系票向。
- 合法性按政策、群体情绪、派系入阁状态和 DM 修正显示建议值。
- 内置黑料随机抽取。

## 重要说明

`config.js` 里的 anon key 是前端公开配置，安全边界依赖 Supabase RLS。不要在前端放 service role key。
