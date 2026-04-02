# 字段缩写对照字典

本文档列出所有中文缩写字段的完整含义，并标注已知的数据问题和使用约束。

## 微信社群首发相关

| 缩写 | 全称 | 英文 | 说明 | 约束/注意 |
|------|------|------|------|-----------|
| `sfr` | 首发人 | First Caller | 最早在微信群推荐该代币的人 | ⚠️ 约 47% 为空，需 fallback 到 `cxr` |
| `sfsj` | 首发时间 | First Call Time | 代币首次在微信群出现的时间 | UTC+8 格式化字符串 |
| `sfqy` | 首发社群 | First Call Community | 代币最早出现的微信社群 | |
| `sfzf` | 首发至今倍数 | First Call Multiple | 从首发价到当前价的倍数 | 格式 `"149.46x"`，需 `parseFloat()`。可能为空或 `"0x"` |
| `fshzf` | 发射后最高倍数 | Post-Launch Peak Multiple | 发射后达到的历史最高倍数 | 纯数字字符串，无 `x` 后缀。可能为空或 `"0"` |
| `sfxx` | 首发信息 | First Call Summary | 首发人、倍数、市值变化的汇总 | 多行格式化文本 |
| `zfzgzf` | 至今最高倍数 | Peak Multiple to Date | 最高倍数含文字描述 | |

## 社群热度

| 缩写 | 全称 | 英文 | 说明 | 约束/注意 |
|------|------|------|------|-----------|
| `cazs` | 查询指数 | Query Index | 被查询的热度指标 | |
| `sqzs` | 社群指数 | Community Index | 在微信社群中的综合热度 | |
| `bqfc` | 本群分享次数 | Group Share Count | 在**当前群**的分享次数 | ⚠️ 仅当前群，非全网。评估热度应看 `qwfc` 和 `fgq` |
| `qwfc` | 全网覆盖次数 | Network Mention Count | 全部微信群的喊单总次数 | 跨群累加的总提及次数 |
| `fgq` | 覆盖群数 | Coverage Groups | 该代币被分享到的不重复群总数 | 不重复群数量，≠ 总喊单次数 |

> **关键区分**: `bqfc` = 单群次数，`qwfc` = 全网总次数，`fgq` = 不重复群数。一个代币 `fgq=5, qwfc=87` 意味着被分享到 5 个不同的群，总共被提及 87 次。

## 查询人相关

| 缩写 | 全称 | 英文 | 说明 | 约束/注意 |
|------|------|------|------|-----------|
| `cxr` | 查询人 | Querier | 最近查询该代币的用户 | 当 `sfr` 为空时作为 fallback 用户标识 |
| `cxrxx` | 查询人信息 | Querier Info | 查询人的详细信息 | 多行文本 |
| `cxrzf` | 查询人至今涨幅 | Querier Return | 查询后到当前的涨幅 | |
| `zgzf` | 最高涨幅 | Peak Return | 查询后的最高涨幅 | |
| `grcxcs` | 个人查询次数 | Personal Query Count | 该用户查询该代币的次数 | |

## 首发人战绩

| 字段 | 说明 | 约束/注意 |
|------|------|-----------|
| `sender_total_tokens` | 该首发人推荐代币总数 | |
| `sender_win_tokens` | 推荐成功（盈利>0）的代币数 | string 类型 |
| `sender_win_rate` | 推荐胜率（%） | ⚠️ **严重虚高**，使用 `success / (success+failure)` 错误公式，忽略未结算代币。正确公式: `sender_win_tokens / sender_total_tokens * 100` |
| `sender_best_multiple` | 历史最佳倍数 | string 类型 |

## 持仓分布

| 缩写 | 全称 | 英文 | 说明 | 约束/注意 |
|------|------|------|------|-----------|
| `zbbl` | 占比比例 | Holding Ratio | 前 10 大持仓地址各自占比 | 以 `\|` 分隔，如 `"0.38\|0.03\|..."` |
| `zzb` | 总占比 | Total Ratio | 前 10 大持仓合计占比（%） | |

## 时间与状态

| 缩写 | 全称 | 英文 | 说明 | 约束/注意 |
|------|------|------|------|-----------|
| `dqsj` | 当前时间 | Current Time | 数据快照的时间戳 | UTC+8 格式化字符串 |
| `jy` | 交易 | Trade | 交易标记 | |
| `xwb` | 新闻播报 | News Broadcast | 相关新闻播报内容 | |

## 微信群信息

| 缩写 | 全称 | 英文 | 说明 | 约束/注意 |
|------|------|------|------|-----------|
| `qun_name` | 群名 | Group Name | 微信群名称 | ⚠️ 可能含 emoji 乱码（UTF-16 代理对） |
| `qun_id` | 群ID | Group ID | 微信群唯一标识 | 格式: 数字 或 `数字@chatroom` |
| `wx_id` | 微信ID | WeChat ID | 微信数据 ID | |
| `qy_wxid` | 群友微信ID | Member WeChat ID | 群友的微信 ID | |
| `qy_name` | 群友名称 | Member Name | 群友的昵称 | 可能含 emoji 乱码 |

## Unicode/Emoji 编码问题

以下字段可能包含损坏的 Unicode 编码：`qun_name`、`sfr`、`cxr`、`qy_name`

常见乱码模式：
- `\uD83D\uDC8B` — UTF-16 代理对（应转为 emoji 💋）
- `uD83DuDC8B` — 无反斜杠的代理对标记
- `\uE134` — 私有域 Unicode 字符（应移除）

处理方法参见 SKILL.md 中的 `fixSurrogates()` 函数。
