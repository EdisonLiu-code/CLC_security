# CLC 安總服事

[安總同工班表](https://edisonliu-code.github.io/CLC_security/#roster)

同工可免登入安總網站。選擇姓名後，在 Google 行事曆確認訂閱整季的確定班次。

GitHub Pages 提供網站入口。Cloudflare Worker 提供班表頁面與個人訂閱資料，並從 CLC 專案的 D1 讀取已發布班表。

[source/calendar](source/calendar) 包含班表介面、訂閱路由與行事曆格式的程式碼。路由模組在 Cloudflare 專案中使用既有的 D1 讀取和回應模組。
