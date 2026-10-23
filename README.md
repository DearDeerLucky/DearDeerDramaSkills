# DearDeerDramaSkills

**Dear Deer 短剧 Skill 项目**：一个总管理入口，串联从剧本到角色、场景、道具、分镜、图像、声音、剪辑与资料网页的制作能力。

本项目维护自有 Skill 的完整源文件和可复用模板；外部能力通过目录接入。适合在 Codex 中按当前任务使用，也可以只试做一个节点。

## 三个自有入口

| Skill | 用途 | 源文件 |
|---|---|---|
| `dear-deer-drama-hub` | 总管理、能力目录、路由、安装与版本维护 | [SKILL.md](skills/dear-deer-drama-hub/SKILL.md) |
| `dear-deer-drama-workbench` | N00—N15 制作流程、五视角剧本讨论、图文汇报、历史恢复与剧本归档、视频提示词与模型适配、LibTV／Toonflow、卡片与资料网页 | [SKILL.md](skills/dear-deer-drama-workbench/SKILL.md) |
| `dear-deer-cg-character-assets` | 角色探索、细化与修复、11张制作原图、IP面板及交接包 | [SKILL.md](skills/dear-deer-cg-character-assets/SKILL.md) |

CG角色输出为渲染外观的图片。实际创建角色时，五方向及脸发、衣装选择默认配对应可见参考示例；只做文字或维护 Skill 时不自动生图。示例和正式母版分别记录，详见[选择示例规范](skills/dear-deer-cg-character-assets/references/selection-examples.md)。可绑定的工程模型、真实AI人物动作视频、正式TTS分别需要对应工具；能力状态见[目录](skills/dear-deer-drama-hub/references/catalog.json)。本地资料网页支持实际素材预览、待补占位、版本选用、本机保存、导入导出与角色多轮暂选。

## 开始使用

需要 Python 3.9 或更新版本。脚本使用标准库，不安装生成模型或第三方依赖。

```sh
git clone https://github.com/DearDeerLucky/DearDeerDramaSkills.git
cd DearDeerDramaSkills
python3 scripts/skills.py list
python3 scripts/skills.py validate
python3 scripts/skills.py install --all --dry-run
python3 scripts/skills.py install --all
```

已有同名本机 Skill 时，同版保持原样；不同版默认停止并说明差异。确认要以项目版更新时使用 `--replace`，旧版保留在 `.local/install-backups/`。

在 Codex 中调用：

「/漫剧」对应现有总管理入口 `dear-deer-drama-hub`，界面显示名为「漫剧」。这不是另建一个同名技能或保证注册了字面斜杠命令；准确调用方式如下。

```text
$dear-deer-drama-hub 根据我当前的短剧任务，选择对应Skill。
$dear-deer-drama-workbench 只测试任务卡设计，用我提供的素材。
$dear-deer-drama-workbench 对附件第一集做正反方剧本讨论，五个角色参与，保留原稿，给图文主理汇报，先不改稿。
$dear-deer-drama-workbench 恢复我指定作品的历史讨论与版本，保留原件，制作DOCX、PDF和ZIP归档；明确原话、转述、推定与缺失。
$dear-deer-cg-character-assets 先询问期望，再提出五个具体方向并逐轮细化。
```

## 项目结构

```text
skills/
  dear-deer-drama-hub/             总管理与能力目录
  dear-deer-drama-workbench/       制作流程、卡片、网页模板和构建脚本
  dear-deer-cg-character-assets/   CG角色设计、生成和质量规范
scripts/skills.py                 本机管理与验证入口
AGENTS.md                        项目协作与维护约定
.local/                          本机定位、备份与检查记录（忽略）
```

`SKILL.md` 提供当前流程入口，`references/` 保存按需读取的完整规范，`assets/` 保存模板。角色方向、细节、选择与生成记录遵循同一版本链；用户的剧本、原图和制作成果保存到独立创作目录。

历史恢复与归档属于 N14，见[归档规范](skills/dear-deer-drama-workbench/references/script-archive.md)。同一长对话中的多个作品按用户确认的分支隔离；工具只返回片段或占位符时，不宣称完整历史已恢复。总稿、历史稿、未采用方案和规划内容分开，文件可打开、链接与ZIP校验按实际结果记录。

## 外部能力接入

0.2.0 加入 [LibTV 制作标准](skills/dear-deer-drama-workbench/references/libtvStandards.md)、[可复用提示词](skills/dear-deer-drama-workbench/references/promptTemplates.md) 和 [Toonflow MCP 桥接](skills/dear-deer-drama-workbench/references/toonflowBridge.md)。保留 N00—N15、CG 五方向与选择记录；新增五栏目剧本、锚点连续性和本地媒体流程的适配。LibTV 参考来自授权可见资料，不包含隐藏系统 prompt。

MiniMovie 的项目绑定、具体节点与验证记录保存在创作目录或忽略的 `.local/`；通用技能源不含本机路径、令牌和作品。服务端安装这三个相同技能后，其他设备可通过 `skillOperator` 发现并读取；客户端安装副本由原管理脚本同步。MCP 连接、旧样片与新镜头质量分别验收。

[能力目录](skills/dear-deer-drama-hub/references/catalog.json) 登记 imagegen、Remotion、Sites、humanizer-zh 和 skill-creator。运行 `python3 scripts/skills.py doctor` 可查看当前本机定义；真正操作仍需当前工具、输入材料和具体执行范围。外部Skill的定义、插件和服务由各自提供方管理。

## 维护版本

0.2.4 合并 LibTV、Toonflow、整集和 CG 生产能力与五视角审稿、历史归档；接入[视频提示词方法](skills/dear-deer-drama-workbench/references/video-prompting.md)、[MiniMax H3 适配](skills/dear-deer-drama-workbench/references/minimax-h3.md)和[逐镜记录模板](skills/dear-deer-drama-workbench/assets/video-prompt-card.md)。图像校对、真实模型输入、当前提示词与既有输出分别留证；外部画布中断先恢复真实状态再继续。匿名提取记录见 [本轮经验与集成说明](extractions/2026-10-23-video-prompting-and-canvas-recovery.md)。

0.2.3 更新三个技能的 [Toonflow 桥接](skills/dear-deer-drama-workbench/references/toonflowBridge.md)：画布内本机 Codex Agent 与外部 MCP 的区别、跨技能读取、节点提示词改写及回读、Codex 原生双参考生图与原图回填、H3 首尾帧／Guide／AV latent 续接，以及原生 auto 尺寸和本地请求边界。两端技能需分别同步；外部插件仍单独绑定，具体技能调用链和媒体质量按当前任务实际验收。

0.2.2 将完整CG角色包设为后续默认标准：[角色资产生产](skills/dear-deer-cg-character-assets/references/production-package.md)和[IP面板交付](skills/dear-deer-cg-character-assets/references/ip-panel-delivery.md)。标准人类角色包包含11张独立原图、3840×2160总览PNG、单页PDF、实际提示词、锁定卡、检查记录、便携清单和ZIP；从已选身份续做、逐图核验，再由原图固定排版。用户指定的小范围与特殊拓扑按实际任务调整，不把静态图片验收外推为动作、绑定或整集通过。

0.2.1 补充 [整集制作与交付验收](skills/dear-deer-drama-workbench/references/episodeDelivery.md)：实际剪入时间线、原声保留或替换、任务续做与多设备交接、技术检查和整集视听证据。此次为规范与模板更新，不代表新增媒体工具或完成整集制作验收。

在项目源文件修改，验证后提交到 Git。安装副本用管理脚本显式同步。新增技能先完成可执行指令与小样，再登记目录；保留未实现能力的缺口状态。详见 [AGENTS.md](AGENTS.md) 与[路由维护说明](skills/dear-deer-drama-hub/references/routing.md)。
