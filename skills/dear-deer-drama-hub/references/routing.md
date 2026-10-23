# 路由与版本维护

## 生产能力

| 用户当前任务 | 入口 | 读取范围与执行边界 |
|---|---|---|
| 从创意开始／继续剧本 | dear-deer-drama-workbench | 制作卡与当前节点；按需读取 N01／N02 |
| /漫剧／参考 LibTV／导入五栏目剧本 | dear-deer-drama-hub → dear-deer-drama-workbench | 按当前阶段读取 [制作标准](../../dear-deer-drama-workbench/references/libtvStandards.md) 与 [提示词](../../dear-deer-drama-workbench/references/promptTemplates.md)，保留原稿和已选资产 |
| Toonflow 画布 Agent／Codex CLI／MCP／H3 | dear-deer-drama-workbench＋实际 Toonflow 工具 | 读取 [桥接说明](../../dear-deer-drama-workbench/references/toonflowBridge.md)，区分画布内 Agent 和外部 MCP，核对绑定；技能读取、节点改写、真实生成与质量分别验收 |
| 正反方剧本讨论／五视角审稿／图文主理汇报 | dear-deer-drama-workbench 剧本讨论模式 | 读取 references/script-review.md，固定稿件、作者目标与范围；按实际工具执行四席评审和主理裁决，不自动改稿 |
| 整理旧对话／历史版本／可下载剧本总稿与归档 | dear-deer-drama-workbench 历史恢复与归档模式 | 读取 references/script-archive.md，隔离作品分支，核实母本和恢复覆盖；按需制作DOCX／PDF与ZIP，历史和缺口独立记录 |
| 单独试用任务卡、场景卡或道具卡 | dear-deer-drama-workbench | 对应模板与必要输入，独立保存试用 |
| 做CG角色／五方向／组合局部 | dear-deer-cg-character-assets | 创建时选择文案配对应示例图；读取询问、方向与细化规范，保留已有选择；文字试用不自动生图 |
| 转CG／修眉或衣装位置 | dear-deer-cg-character-assets | 实际参考、生成与质量规范；不重新设计已选身份 |
| 生成角色场景道具图／关键帧 | 对应资产节点＋当前图片供应商 | Toonflow 内用已注册媒体工具；Codex 原生生图先查实时模型与节点配置，其他环境按当前 imagegen 入口；附实际参考图 |
| 编写／优化／审核视频提示词、核查参考或运镜 | dear-deer-drama-workbench 视频提示词模式 | 读取 references/video-prompting.md；导演稿按真实模式和输入编成模型稿，MiniMax H3 按需读对应参考；写稿、保存与生成分开 |
| 网页整理资料或比较五方向 | dear-deer-drama-workbench 网页模式 | 使用自有模板和实际素材，缺项留等待添加 |
| 编排、字幕、导出 | 对应工作台节点＋Remotion专用Skill | 实际素材与音轨；真实播放和文件验证 |
| 专用能力暂缺 | 工作台准备能力与缺口登记 | 继续文字准备和交接包；不伪造工具调用 |

通过当前可用技能列表找外部入口。管理脚本只做本机定义盘点，不试探真实付费生成、登录凭据或云端数据。

## 项目命令

在项目根目录使用：

```text
python3 scripts/skills.py list
python3 scripts/skills.py doctor
python3 scripts/skills.py validate
python3 scripts/skills.py install --skill dear-deer-drama-hub --dry-run
python3 scripts/skills.py install --skill dear-deer-drama-hub
python3 scripts/skills.py install --all --dry-run
```

默认安装到当前 CODEX_HOME 的 skills 目录，未配置时为用户的 `.codex/skills`。可显式给 `--target`。只安装目录中自有的三个 Skill，不下载或复制第三方技能。

同版文件保持原样；不同版本默认拒绝覆盖。用户授权更新后用 `--replace`，旧目录先完整备份到项目忽略的 `.local/install-backups/`。符号链接或文件型目标不自动替换。

本机源定位记录由安装脚本写入安装副本，不进入公开源。它含项目路径、源版本和文件摘要，供后续定位与差异检查；不含凭据或作品内容。

`doctor` 分别报告自有源、已安装同版／不同版／缺失，以及外部定义找到／缺失。外部找到多个版本时列出候选，真正执行优先读当前会话提供的可用入口，不凭目录版本号自动挑选。

项目版本登记在 catalog.json。正常维护流程：改所属 Skill → 相关验证 → 本地提交 → 按用户授权推送 → 按需同步本机安装。项目源和本机副本存在差异时保留两者，不以新建仓库为由删除旧改动。
