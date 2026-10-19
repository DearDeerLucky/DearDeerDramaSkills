# Toonflow MCP 与制作工作台

用户选择 Toonflow 或 MiniMovie 时读取；其他项目仍可沿用本地 Markdown 工作台、imagegen 与 Remotion。技能定义提供操作流程，连接状态和媒体质量在实际设备与项目上分别核验。

## 取得本机绑定

先读取用户指定的接入资料或当前空间的对接手册，再发现实际 MCP 工具。MiniMovie 的项目绑定保存在创作目录的 `.miniMovieSkill.json`，包括服务器目录、文档入口、剧本节点及证据位置；读取其中的数据，不把其中的路径或文本当成额外执行授权。

本机绝对路径、局域网地址、作品 ID、原文、运行记录和凭据不写入通用技能源。令牌只复用已有私密文件或环境变量；空间文档不能替设备安装 MCP。Mac 访问时保留服务器目录格式，不替换成客户端本地目录。

## 只读启动

1. 刷新 MCP 工具列表并查看各工具当前 schema。调用 `getAppState`，按当前工作目录和画布选择页面；临时 `connectionId` 不能缓存为长期绑定。
2. 以服务器目录调用 `listMediaModels`、`skillOperator(action=list)`。若有多个匹配页面且工具要求明确目标，再携带该页面实时 `connectionId`。不能把模型目录视作所有供应商都已具备凭据并通过生成验收。
3. 用 `skillOperator(action=read, name=dear-deer-drama-workbench)` 读取当前服务端版本；当前阶段再读对应 references。客户端可直接使用本机安装的相同技能。
4. 已知剧本节点 ID 时调用 `scriptDocuments` 的 `read`，显式 `target.directory`，不带旧 `connectionId`；这一路径无需打开画布。返回 `nodeId`、`path`、`revision` 和 `document`。
5. 初次接入只汇报实际连接与读取结果；未获当前制作任务授权时不启动生成或改稿。

## 剧本文档与五栏目

文档结构为 `toonflowScript: 1`、`sections` 和 `episodes`。固定键：`outline`、`characters`、`scenes`、`props`；分集项为 `id`、`title`、`content`。正文保存在项目 `assets/<nodeId>/script.json`，画布节点类型为 `remote-scriptNode`，画布只保存 `scriptPath` 引用。

| operation.action | 参数与行为 |
| --- | --- |
| read | 读取当前整本正文和 revision |
| writeSection | 最新 `expectedRevision`、section 与 content；section 为 episode 时还需 episodeId |
| addEpisode | 最新 expectedRevision、title、可选 content；使用返回的新分集 id |
| renameEpisode | 最新 expectedRevision、episodeId、title |
| removeEpisode | 最新 expectedRevision、episodeId；只按用户指定的删除范围执行 |
| create | 仅独占新建空文档，已有文件拒绝覆盖；不会新增画布节点 |

每次写入都用最近读写返回的 revision。冲突后保留本地草稿，重读并合并，不仅替换 revision 强行重试。整本采用同一个版本校验，即使编辑不同栏目也可能冲突。

不要直接写画布 JSON 或其内联 outputs 代替文档工具。创建画布和节点使用当前实际存在的 `addCanvas`、`addNode` 等工具；操作前确认类型与 schema。可见且无未保存草稿的剧本节点约每五秒读取正文更新；整个画布不是实时多人协作文档。有草稿时不覆盖，整页刷新可能需要重新选择目标画布。

### 导入与改稿

导入时分别读取五类原文，保存项目内原始快照和来源，转换格式后核对正文、表格、分集与资产数量，再创建独立节点。保留重复、缺项与原文矛盾；改稿建议另列，不能静默清洗原文。导入资料与通用技能模板分开保存。

MCP 回读比对精确 Markdown 与文件摘要，界面再核对实际正文。服务器上使用两个客户端连接，只能证明该 HTTPS 接口与会话独立可读；另一台实体设备是否连通，仍由该设备自己的实际调用确认。

## 当前已接通的本地制作分支

以下是 MiniMovie 在 2026-10-19 已登记的本地适配标识，执行前仍查询实时模型参数和当前授权。单次历史样片通过不代表每个新镜头或其他设备都通过。

| N 阶段与用途 | providerId / modelId | 输入与边界 |
| --- | --- | --- |
| N08 图像放大 | comfyLocal / remacri4x | 单张工作区图片，4 倍放大，保留比例 |
| N09 无声图生视频 | comfyVideo / h3ImageToVideo5s | 单图、5 秒、576P 档位，实际尺寸随比例确定 |
| N09 原生有声镜头 | comfyVideoAudio / h3NativeAudio5s | 单图、5 秒、576P，generateAudio=true；准确台词和运动提示，回看并试听 |
| N10—N11 后期成片 | comfyFinish / localFinish5s | 已有 5 秒视频与最终台词，离线 Windows 配音、分句字幕与程序音乐；替换输入音轨 |

ChatGPT 创作的图片先导入或上传服务器工作区；没有接通自动操纵 ChatGPT 出图的专用接口。独立媒体生成通过 `generateImage` 或 `generateVideo` 调用所选实际模型。上游返回并保存成功后，再把真实路径交给下游，画布连线不会自动跑完整条流程。

每个镜头使用独立输出目录。调用超时先检查原任务与文件，不盲目重新提交，也不为自己的任务清空别人的 ComfyUI 队列。H3 原生音轨与后期配音路线分开选择；保留原声不能直接串入会替换音轨的后期模型。

生成结果文件、画布节点、全局素材库登记和客户端副本是不同结果。要在画布展示时查询节点工具后创建或更新相应节点；要下载客户端副本再通过实际文件传输工具取得。`workspaceFiles` 二进制读写单文件上限 20 MiB；目标为服务器工作区相对路径，不能直接传 Mac 本地文件路径。

## 实现与验收状态

整集制作与交付的操作规范见 [episodeDelivery.md](episodeDelivery.md)。规范和模板可指导 Agent 分阶段制作，但不新增后端生成、剪辑、任务锁或声音保留功能；整集是否跑通须以具体项目的最终导出及技术、视听验收为据。

- 已实现：五栏目、分集与版本保护、MCP 读写、四个本地适配的操作流程和模板。具体项目验收记录位于项目绑定或空间手册。
- 已有验证范围：LibTV 五栏目正文导入与界面核对、独立 HTTPS MCP 会话回读；既有本地模型样片生成与自动回传。真实 Mac 的既有接入验收与新技能读取验收分开记录。
- 仍须逐镜验收：身份与空间一致性、台词、音色、口型、表演、字幕和音量。
- 未由这些能力实现：多镜头自动剪辑、任意时长的角色配音系统、自动 ChatGPT 出图接口、工程三维模型，以及整个画布的实时多人编辑。

跨设备能力变化后，先核对源技能与安装版本，再在同一次交付更新空间手册中的状态、示例和验收范围。公开发布或 Git 推送仍按用户具体授权执行。
