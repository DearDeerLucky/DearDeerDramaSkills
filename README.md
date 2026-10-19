# DearDeerDramaSkills

**Dear Deer 短剧 Skill 项目**：一个总管理入口，串联从剧本到角色、场景、道具、分镜、图像、声音、剪辑与资料网页的制作能力。

本项目维护自有 Skill 的完整源文件和可复用模板；外部能力通过目录接入。适合在 Codex 中按当前任务使用，也可以只试做一个节点。

## 三个自有入口

| Skill | 用途 | 源文件 |
|---|---|---|
| `dear-deer-drama-hub` | 总管理、能力目录、路由、安装与版本维护 | [SKILL.md](skills/dear-deer-drama-hub/SKILL.md) |
| `dear-deer-drama-workbench` | N00—N15 制作流程、卡片、资料网页、交接和检查 | [SKILL.md](skills/dear-deer-drama-workbench/SKILL.md) |
| `dear-deer-cg-character-assets` | 期望询问、五方向、多轮细化、CG资产图及定向修复 | [SKILL.md](skills/dear-deer-cg-character-assets/SKILL.md) |

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

## 外部能力接入

0.2.0 加入 [LibTV 制作标准](skills/dear-deer-drama-workbench/references/libtvStandards.md)、[可复用提示词](skills/dear-deer-drama-workbench/references/promptTemplates.md) 和 [Toonflow MCP 桥接](skills/dear-deer-drama-workbench/references/toonflowBridge.md)。保留 N00—N15、CG 五方向与选择记录；新增五栏目剧本、锚点连续性和本地媒体流程的适配。LibTV 参考来自授权可见资料，不包含隐藏系统 prompt。

MiniMovie 的项目绑定、具体节点与验证记录保存在创作目录或忽略的 `.local/`；通用技能源不含本机路径、令牌和作品。服务端安装这三个相同技能后，其他设备可通过 `skillOperator` 发现并读取；客户端安装副本由原管理脚本同步。MCP 连接、旧样片与新镜头质量分别验收。

[能力目录](skills/dear-deer-drama-hub/references/catalog.json) 登记 imagegen、Remotion、Sites、humanizer-zh 和 skill-creator。运行 `python3 scripts/skills.py doctor` 可查看当前本机定义；真正操作仍需当前工具、输入材料和具体执行范围。外部Skill的定义、插件和服务由各自提供方管理。

## 维护版本

在项目源文件修改，验证后提交到 Git。安装副本用管理脚本显式同步。新增技能先完成可执行指令与小样，再登记目录；保留未实现能力的缺口状态。详见 [AGENTS.md](AGENTS.md) 与[路由维护说明](skills/dear-deer-drama-hub/references/routing.md)。
