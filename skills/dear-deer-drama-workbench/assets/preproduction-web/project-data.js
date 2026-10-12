window.DRAMA_DATA={
  "version": 1,
  "assets": {},
  "projects": [
    {
      "id": "dear-drama-new-project",
      "name": "空白制作模板",
      "episode": "EP001",
      "episodeName": "待填写",
      "metadata": {
        "title": "Dear Deer · 新作品",
        "episode": "EP001",
        "duration": "",
        "ratio": "",
        "language": "普通话",
        "style": "",
        "totalEpisodes": "",
        "form": ""
      },
      "nodes": [
        {
          "id": "N00",
          "title": "制作规格与本次范围",
          "short": "制作规格",
          "description": "先固定这次做哪一集、做多长、用什么画幅。已有选择会直接带入。",
          "depends": [],
          "items": [
            {
              "id": "n00-choice",
              "title": "画幅选择记录",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n00-style",
              "title": "画风与表现形式选定记录",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n00-tool",
              "title": "视频工具、路线与成本计划",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "materials",
          "groups": [],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "制作规格与本次范围资料与选用记录"
        },
        {
          "id": "N01",
          "title": "故事、世界观与信息边界",
          "short": "故事设定",
          "description": "说明主角的目标、冲突、世界限制，以及本集能揭示什么。",
          "depends": [
            "N00"
          ],
          "items": [
            {
              "id": "n01-source",
              "title": "故事与世界规则摘录",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n01-beats",
              "title": "第一集因果节拍",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n01-outline",
              "title": "完整季大纲／分集索引",
              "kind": "document",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n01-professional",
              "title": "农业与工程机制核验",
              "kind": "document",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "materials",
          "groups": [],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "故事、世界观与信息边界资料与选用记录"
        },
        {
          "id": "N02",
          "title": "分集剧本与场次",
          "short": "分集剧本",
          "description": "地点、人物、动作、对白和每场变化应在同一份本集稿里。",
          "depends": [
            "N01"
          ],
          "items": [
            {
              "id": "n02-script",
              "title": "本集场次与对白稿",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n02-dialogue",
              "title": "对白与字幕文本",
              "kind": "text",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加经过核对的文字资料。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n02-final",
              "title": "正式剧本选定／修订记录",
              "kind": "document",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "materials",
          "groups": [],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "第一集剧本与场次资料与选用记录"
        },
        {
          "id": "N03",
          "title": "角色、场景、道具与镜头拆单",
          "short": "资产清单",
          "description": "把本集可见资产对齐到稳定编号，避免漏项和混用版本。",
          "depends": [
            "N02"
          ],
          "items": [
            {
              "id": "n03-assets",
              "title": "本集资产清单",
              "kind": "data",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加资产／镜头清单，保持编号和版本可追踪。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n03-references",
              "title": "当前版本与镜头引用清单",
              "kind": "data",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加资产／镜头清单，保持编号和版本可追踪。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n03-variants",
              "title": "本集服装／伤势／特殊主体变体",
              "kind": "document",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "materials",
          "groups": [],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "角色、场景、道具与镜头拆单资料与选用记录"
        },
        {
          "id": "N04",
          "title": "角色图、定妆与表演参考",
          "short": "角色资料",
          "description": "入镜角色需有可辨认的参考，年龄、服装和外观候选要与事实区分。",
          "depends": [
            "N03"
          ],
          "items": [
            {
              "id": "role01-card",
              "title": "人物小传与外观卡",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": "role01",
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "role01-face",
              "title": "面部参考",
              "kind": "image",
              "defaultAssets": [],
              "required": true,
              "group": "role01",
              "note": "添加清楚可辨的参考图；状态变化需要对应视图。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "role01-turn",
              "title": "服装／侧背／多角度参考",
              "kind": "image",
              "defaultAssets": [],
              "required": true,
              "group": "role01",
              "note": "添加清楚可辨的参考图；状态变化需要对应视图。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "grouped",
          "groups": [
            {
              "id": "role01",
              "name": "角色01",
              "code": "CHAR001",
              "note": "等待人物小传与视觉参考。"
            }
          ],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "角色图、定妆与表演参考资料与选用记录"
        },
        {
          "id": "N05",
          "title": "场景母版、空间与机位",
          "short": "场景资料",
          "description": "固定关键入口、主体位置、走位与光源，建立可用于正反打的空间参考。",
          "depends": [
            "N03"
          ],
          "items": [
            {
              "id": "scene01-card",
              "title": "场景卡与空间关系",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": "scene01",
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "scene01-image",
              "title": "场景全景母版",
              "kind": "image",
              "defaultAssets": [],
              "required": true,
              "group": "scene01",
              "note": "添加清楚可辨的参考图；状态变化需要对应视图。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "scene01-angle",
              "title": "方向／光源参考",
              "kind": "image",
              "defaultAssets": [],
              "required": false,
              "group": "scene01",
              "note": "添加清楚可辨的参考图；状态变化需要对应视图。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "grouped",
          "groups": [
            {
              "id": "scene01",
              "name": "场景01",
              "code": "LOC001",
              "note": "等待空间、母版与方向参考。"
            }
          ],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "场景母版、空间与机位资料与选用记录"
        },
        {
          "id": "N06",
          "title": "道具外观与使用状态",
          "short": "道具资料",
          "description": "每件关键物件应有外观、状态和与手／场景交互的参考。",
          "depends": [
            "N03"
          ],
          "items": [
            {
              "id": "prop01-card",
              "title": "道具卡",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": "prop01",
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "prop01-image",
              "title": "外观参考",
              "kind": "image",
              "defaultAssets": [],
              "required": true,
              "group": "prop01",
              "note": "添加清楚可辨的参考图；状态变化需要对应视图。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "prop01-state",
              "title": "使用／持握状态",
              "kind": "image",
              "defaultAssets": [],
              "required": true,
              "group": "prop01",
              "note": "添加清楚可辨的参考图；状态变化需要对应视图。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "props",
          "groups": [
            {
              "id": "prop01",
              "name": "道具01",
              "code": "PROP001"
            }
          ],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "道具外观与使用状态资料与选用记录"
        },
        {
          "id": "N07",
          "title": "分镜表、图页与节奏预演",
          "short": "分镜节奏",
          "description": "一行对应一镜，明确景别、动作、对白、声音、资产和转场。",
          "depends": [
            "N02",
            "N04",
            "N05",
            "N06"
          ],
          "items": [
            {
              "id": "n07-table",
              "title": "本集分镜与时长表",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n07-pages",
              "title": "分镜图",
              "kind": "image",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加清楚可辨的参考图；状态变化需要对应视图。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n07-previs",
              "title": "静态音画节奏预演",
              "kind": "video",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加节奏或动作验证片段。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n07-measure",
              "title": "对白时长测量",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n07-motion",
              "title": "复杂动作时长／运动样段验证",
              "kind": "video",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加节奏或动作验证片段。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "materials",
          "groups": [],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "分镜表、图页与节奏预演资料与选用记录"
        },
        {
          "id": "N10",
          "title": "配音、音效与对白路线",
          "short": "声音准备",
          "description": "与关键帧并行准备。需要口型或音画同步时，先确定实际音轨。",
          "depends": [
            "N02",
            "N07"
          ],
          "items": [
            {
              "id": "n10-plan",
              "title": "声音与运动交接说明",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n10-reading",
              "title": "六句临时试读",
              "kind": "audio",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加试读或正式音轨，注明用途。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n10-card",
              "title": "角色声音卡与选定记录",
              "kind": "document",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n10-voice",
              "title": "正式声线样音",
              "kind": "audio",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加试读或正式音轨，注明用途。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n10-final",
              "title": "最终对白音轨",
              "kind": "audio",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加试读或正式音轨，注明用途。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n10-fx",
              "title": "环境与动作音效音轨",
              "kind": "audio",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加试读或正式音轨，注明用途。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "materials",
          "groups": [],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "配音、音效与对白路线资料与选用记录"
        },
        {
          "id": "N08",
          "title": "逐镜关键帧与起止状态",
          "short": "镜头关键帧",
          "description": "按本批镜头补起始帧；必要时补结束帧，控制进出门、手部和道具变化。",
          "depends": [
            "N04",
            "N05",
            "N06",
            "N07"
          ],
          "items": [
            {
              "id": "EP001-SH001-start",
              "title": "起始关键帧",
              "kind": "image",
              "defaultAssets": [],
              "required": true,
              "group": "EP001-SH001",
              "note": "添加清楚可辨的参考图；状态变化需要对应视图。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "EP001-SH001-end",
              "title": "结束关键帧",
              "kind": "image",
              "defaultAssets": [],
              "required": true,
              "group": "EP001-SH001",
              "note": "添加清楚可辨的参考图；状态变化需要对应视图。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "shots",
          "groups": [
            {
              "id": "EP001-SH001",
              "name": "镜头内容待填写",
              "code": "EP001-SH001",
              "seconds": null,
              "needsEnd": true
            }
          ],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "逐镜关键帧与起止状态资料与选用记录"
        },
        {
          "id": "N14",
          "title": "连续性、版本与使用记录",
          "short": "连续性检查",
          "description": "确认本批镜头用的是同一套人物、服装、场景与道具版本。",
          "depends": [
            "N04",
            "N05",
            "N06",
            "N08"
          ],
          "items": [
            {
              "id": "n14-lock",
              "title": "连续性与不能改变的特征",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n14-review",
              "title": "已有预演／图像检查记录",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n14-sources",
              "title": "素材来源与使用范围记录",
              "kind": "document",
              "defaultAssets": [],
              "required": false,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            },
            {
              "id": "n14-batch",
              "title": "本批独立关键帧回看／返工单",
              "kind": "document",
              "defaultAssets": [],
              "required": true,
              "group": null,
              "note": "添加本节点资料，注明版本与本次采用范围。",
              "suggested": "",
              "initialSelected": false
            }
          ],
          "kind": "materials",
          "groups": [],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "连续性、版本与使用记录资料与选用记录"
        },
        {
          "id": "N09",
          "title": "视频启动资料检查",
          "short": "视频启动",
          "description": "检查的是资料准备情况，不会调用视频模型或产生费用。",
          "depends": [
            "N00",
            "N02",
            "N04",
            "N05",
            "N06",
            "N07",
            "N08",
            "N10",
            "N14"
          ],
          "items": [],
          "kind": "gate",
          "groups": [],
          "skill": "dear-deer-drama-workbench",
          "skillState": "已绑定",
          "productionState": "准备中",
          "output": "视频启动资料检查资料与选用记录"
        }
      ],
      "shots": [],
      "confirmationNote": "模板仅提供资料位；添加文件后再选用、检查。",
      "characterDesign": {
        "characterId": "CHAR001",
        "title": "角色设计 · 多轮选择",
        "expectations": [
          "等待录入创作期望；现有五个资料位是占位，不是已完成设计。"
        ],
        "rounds": [
          {
            "id": "R1",
            "title": "五个整体方向",
            "options": [
              {
                "id": "D01",
                "title": "方向1 · 等待设计",
                "detail": "等待角色设计 Skill 填入面部、轮廓、服装、材质、配件、适配理由和代价。",
                "assetIds": [],
                "pending": true
              },
              {
                "id": "D02",
                "title": "方向2 · 等待设计",
                "detail": "等待角色设计 Skill 填入面部、轮廓、服装、材质、配件、适配理由和代价。",
                "assetIds": [],
                "pending": true
              },
              {
                "id": "D03",
                "title": "方向3 · 等待设计",
                "detail": "等待角色设计 Skill 填入面部、轮廓、服装、材质、配件、适配理由和代价。",
                "assetIds": [],
                "pending": true
              },
              {
                "id": "D04",
                "title": "方向4 · 等待设计",
                "detail": "等待角色设计 Skill 填入面部、轮廓、服装、材质、配件、适配理由和代价。",
                "assetIds": [],
                "pending": true
              },
              {
                "id": "D05",
                "title": "方向5 · 等待设计",
                "detail": "等待角色设计 Skill 填入面部、轮廓、服装、材质、配件、适配理由和代价。",
                "assetIds": [],
                "pending": true
              }
            ]
          },
          {
            "id": "R2",
            "title": "面部与头发",
            "options": []
          },
          {
            "id": "R3",
            "title": "服装与配件",
            "options": []
          },
          {
            "id": "R4",
            "title": "完整设计复核",
            "options": []
          }
        ],
        "locked": []
      }
    }
  ]
};
