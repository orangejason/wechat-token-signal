# 字段缩写对照字典

本文档列出所有中文缩写字段的完整含义，按三维数据模型（人/群/代币）分类。

## 人（People）相关

| 缩写 | 全称 | 英文 | 说明 | 数据源 | 注意 |
|------|------|------|------|--------|------|
| `sfr` | 推荐人 | Recommender | 在微信群推荐代币的人 | WS | ⚠️ 约 47% 为空，fallback: `cxr` → `qy_name` |
| `cxr` | 查询人 | Querier | 最近查询该代币的用户 | WS | 可能含 emoji 乱码 |
| `cxrxx` | 查询人信息 | Querier Info | 查询人详细信息 | WS | 多行文本 |
| `cxrzf` | 查询人至今涨幅 | Querier Return | 查询后到当前的涨幅 | WS | |
| `zgzf` | 最高涨幅 | Peak Return | 查询后的最高涨幅 | WS | |
| `grcxcs` | 个人查询次数 | Personal Query Count | 该用户查询该代币的次数 | WS | |
| `qy_wxid` | 群友微信ID | Member WeChat ID | 群友的微信 ID | WS | |
| `qy_name` | 群友名称 | Member Name | 群友的昵称 | WS | 可能含 emoji 乱码 |

## 群（Groups）相关

| 缩写 | 全称 | 英文 | 说明 | 数据源 | 注意 |
|------|------|------|------|--------|------|
| `qun_name` | 群名 | Group Name | 微信群名称 | WS + HTTP | ⚠️ 可能含 emoji 乱码 |
| `qun_id` | 群ID | Group ID | 微信群唯一标识 | WS | 格式: `数字@chatroom` |
| `wx_id` | 微信ID | WeChat ID | 微信数据 ID | WS | |
| `sfqy` | 推荐社群 | Recommending Community | 代币被推荐的社群 | WS | |
| `sqzs` | 社群指数 | Community Index | 社群综合热度 | WS | |
| `cazs` | 查询指数 | Query Index | 被查询的热度 | WS | |
| `bqfc` | 本群分享次数 | Group Share Count | 当前群的分享次数 | WS | ⚠️ 仅当前群，非全网 |
| `qwfc` | 全网覆盖次数 | Network Mention Count | 全网喊单总次数 | WS | 跨群累加 |
| `fgq` | 覆盖群数 | Coverage Groups | 不重复群数量 | WS | |

> **关键区分**: `bqfc` = 单群次数，`qwfc` = 全网总次数，`fgq` = 不重复群数。

## 代币（Tokens）信号相关

| 缩写 | 全称 | 英文 | 说明 | 数据源 | 注意 |
|------|------|------|------|--------|------|
| `sfsj` | 推荐时间 | Recommend Time | 代币首次在群出现的时间 | WS | UTC+8 格式化字符串 |
| `sfzf` | 推荐至今倍数 | Recommend Multiple | 从推荐时到当前的倍数 | WS | 格式 `"149.46x"`，需 `parseFloat()` |
| `fshzf` | 发射后最高倍数 | Post-Launch Peak | 发射到历史最高价的倍数 | WS | 纯数字字符串，可能为空 |
| `sfxx` | 推荐信息 | Recommend Summary | 推荐人、倍数、市值变化汇总 | WS | 多行文本 |
| `zfzgzf` | 至今最高倍数 | Peak Multiple to Date | 最高倍数含描述 | WS | |
| `dqsj` | 当前时间 | Current Time | 数据快照时间 | WS | UTC+8 |
| `jy` | 交易 | Trade | 交易标记 | WS | |
| `xwb` | 新闻播报 | News Broadcast | 相关新闻 | WS | |

## 持仓分布

| 缩写 | 全称 | 英文 | 说明 | 数据源 | 注意 |
|------|------|------|------|--------|------|
| `zbbl` | 占比比例 | Holding Ratio | 前10大持仓各自占比 | WS | `\|` 分隔 |
| `zzb` | 总占比 | Total Ratio | 前10合计占比(%) | WS | |

## Unicode/Emoji 编码问题

以下字段可能含损坏的 Unicode 编码：`qun_name`、`sfr`、`cxr`、`qy_name`

常见乱码模式：
- `\uD83D\uDC8B` — UTF-16 代理对
- `uD83DuDC8B` — 无反斜杠的代理对
- `\uE134` — 私有域 Unicode 字符

建议使用清洗函数处理后再作为标识 key。
