---
name: wechat-token-signal
description: "微信社群代币信号数据平台，提供人（People）、群（Groups）、代币（Tokens）三维数据。支持 WebSocket 实时推送和 HTTP REST API 历史查询，覆盖 BSC / Solana / ETH 多链代币的价格、交易量、风险评估、社群信号等 126+ 个字段。"
license: MIT
metadata:
  author: SmallClaw
  version: "3.0.0"
  homepage: "https://github.com/orangejason/wechat-token-signal"
---

# WeChat Token Signal API

微信社群代币信号数据平台，围绕 **人（People）× 群（Groups）× 代币（Tokens）** 三个维度提供完整数据服务。

## 数据源

| 类型 | 协议 | 地址 | 说明 |
|------|------|------|------|
| 实时数据 | WebSocket | `ws://43.254.167.238:3000/token` | 约每 3 秒推送一条代币完整快照，无需认证 |
| 历史数据 | HTTP REST | `http://43.254.167.238:3000/api/v1/ca-records/` | 成员/群组/代币的历史 CA 记录和胜率统计 |

---

## 三大工具（Tools）

### Tool 1: People（人物信号）

围绕"谁在推荐"维度，提供成员画像、推荐历史、战绩统计和实时信号。

| Module | 说明 | 数据源 | API 端点 |
|--------|------|--------|----------|
| [profile](#people-profile) | 成员基础画像 | HTTP | `GET /api/v1/ca-records/member?name={name}` |
| [history](#people-history) | 推荐历史记录 | HTTP | `GET /api/v1/ca-records/member?name={name}` |
| [performance](#people-performance) | 战绩与胜率统计 | HTTP + WS | `GET /api/v1/ca-records/member?name={name}` |
| [realtime](#people-realtime) | 实时推荐信号 | WS | `ws://43.254.167.238:3000/token` |

### Tool 2: Groups（群组信号）

围绕"哪个群在讨论"维度，提供群组画像、推荐历史、热度排行和实时信号。

| Module | 说明 | 数据源 | API 端点 |
|--------|------|--------|----------|
| [profile](#groups-profile) | 群组基础信息 | HTTP | `GET /api/v1/ca-records/group?name={name}` |
| [history](#groups-history) | 群推荐历史 | HTTP | `GET /api/v1/ca-records/group?name={name}` |
| [ranking](#groups-ranking) | 群热度排行 | WS | `ws://43.254.167.238:3000/token` |
| [realtime](#groups-realtime) | 群实时信号 | WS | `ws://43.254.167.238:3000/token` |

### Tool 3: Tokens（代币信号）

围绕"哪个币被关注"维度，提供代币概览、市场数据、风险评估、社群信号和实时推送。

| Module | 说明 | 数据源 | API 端点 |
|--------|------|--------|----------|
| [overview](#tokens-overview) | 代币综合概览 | HTTP | `GET /api/v1/ca-records/token?token={ca}` |
| [market](#tokens-market) | 市场与交易数据 | WS | `ws://43.254.167.238:3000/token` |
| [risk](#tokens-risk) | 风险评估 | WS | `ws://43.254.167.238:3000/token` |
| [signal](#tokens-signal) | 社群信号聚合 | WS + HTTP | 两个数据源 |
| [realtime](#tokens-realtime) | 实时完整推送 | WS | `ws://43.254.167.238:3000/token` |

---

## Tool 1: People（人物信号）详细定义

### People: profile

成员基础画像信息。

**HTTP 请求**: `GET /api/v1/ca-records/member?name={name}`

**HTTP 响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | 请求状态 (`"success"` / `"fail"`) |
| `win_rate_stats.total_count` | number | 推荐代币总数 |
| `win_rate_stats.success_count` | number | 盈利代币数 |
| `win_rate_stats.failure_count` | number | 亏损代币数 |
| `win_rate_stats.win_rate` | string | 胜率（⚠️ 需修正，见下方） |

**WS 相关字段**:

| 字段 | 类型 | 说明 | 注意 |
|------|------|------|------|
| `sfr` | string | 推荐人 | ⚠️ 约 47% 为空，fallback: `cxr` → `qy_name` → `"未知"` |
| `cxr` | string | 查询人 | 可能含 emoji 乱码 |
| `qy_wxid` | string | 群友微信 ID | |
| `qy_name` | string | 群友名称 | 可能含 emoji 乱码 |

### People: history

成员推荐的所有代币历史记录。

**HTTP 请求**: `GET /api/v1/ca-records/member?name={name}`

**HTTP 响应 `records[]` 字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 记录 ID |
| `token` | string | 代币合约地址 |
| `chain` | string | 所在链 |
| `name` | string | 代币名称 |
| `symbol` | string | 代币符号 |
| `logo_url` | string | Logo 图片 URL |
| `current_price_usd` | string | 当前 USD 价格 |
| `market_cap` | string | 市值 |
| `fdv` | string | 完全稀释估值 |
| `price_change_24h` | number | 24h 涨跌幅(%) |
| `tx_volume_u_24h` | string | 24h 交易量(USD) |
| `holders` | number | 持有人数 |
| `risk_level` | number | 风险等级 |
| `is_honeypot` | string | 是否蜜罐 (`"0"` / `"1"`) |
| `is_lp_not_locked` | string/null | LP 是否未锁定 |
| `has_mint_method` | string/null | 是否有 mint 方法 |
| `is_in_blacklist` | string/null | 是否在黑名单 |
| `token_price_change_5m` | number | 5 分钟价格变化 |
| `token_buy_tx_count_5m` | number | 5 分钟买入笔数 |
| `token_sell_tx_count_5m` | number | 5 分钟卖出笔数 |
| `bundle_wallet_rate` | number/null | 捆绑钱包比例 |
| `insider_wallet_rate` | number/null | 内部人钱包比例 |
| `cluster_wallet_rate` | number/null | 聚集钱包比例 |
| `twitter` | string | Twitter 链接 |
| `website` | string | 官网链接 |
| `qun_name` | string | 推荐所在群名 |
| `created` | string | 记录创建时间（⚠️ 注意区分 `created_at`） |

### People: performance

战绩与胜率统计。

**HTTP 请求**: `GET /api/v1/ca-records/member?name={name}`

**统计字段**:

| 字段 | 类型 | 说明 | 注意 |
|------|------|------|------|
| `win_rate_stats.total_count` | number | 推荐代币总数 | |
| `win_rate_stats.success_count` | number | 盈利代币数 | `increase_data > 0` |
| `win_rate_stats.failure_count` | number | 亏损代币数 | `increase_data < 0` |
| `win_rate_stats.win_rate` | string | 胜率 | ⚠️ 使用错误公式，见修正说明 |

**WS 附带字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `sender_total_tokens` | number | 推荐代币总数 |
| `sender_win_tokens` | string | 盈利代币数 |
| `sender_win_rate` | string | 胜率(%) — ⚠️ 虚高 |
| `sender_best_multiple` | string | 历史最佳倍数 |

**⚠️ 胜率修正**:

API 和 WS 均使用错误公式 `success/(success+failure)`，忽略未结算代币，导致胜率普遍 90%+。

```javascript
// 正确公式
const correctWinRate = (success_count / total_count * 100).toFixed(1);
// 小样本修正：total_count < 20 时，胜率上限 85%
const cappedRate = total_count < 20 ? Math.min(correctWinRate, 85) : correctWinRate;
```

### People: realtime

WS 实时推送中的人物相关字段。

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `sfr` | string | 推荐人 | `"999swap推送"` |
| `sfsj` | string | 推荐时间(UTC+8) | `"2026-02-13 14:02:53"` |
| `sfxx` | string | 推荐信息汇总 | 多行文本 |
| `cxr` | string | 查询人 | `"米多多💰"` |
| `cxrxx` | string | 查询人详情 | 多行文本 |
| `cxrzf` | string | 查询后涨幅 | `"-0.95x"` |
| `zgzf` | string | 查询后最高涨幅 | `"0.01x"` |
| `grcxcs` | number | 个人查询次数 | `4` |
| `sender_total_tokens` | number | 推荐代币总数 | `350` |
| `sender_win_tokens` | string | 盈利代币数 | `"345"` |
| `sender_win_rate` | string | 胜率(%) | `"98.6"` ⚠️ |
| `sender_best_multiple` | string | 最佳倍数 | `"6708.13"` |

---

## Tool 2: Groups（群组信号）详细定义

### Groups: profile

群组基础信息。

**HTTP 请求**: `GET /api/v1/ca-records/group?name={name}`

**HTTP 响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | 请求状态 |
| `win_rate_stats.total_count` | number | 群内推荐代币总数 |
| `win_rate_stats.success_count` | number | 盈利代币数 |
| `win_rate_stats.failure_count` | number | 亏损代币数 |
| `win_rate_stats.win_rate` | string | 群胜率（⚠️ 需修正） |

**WS 相关字段**:

| 字段 | 类型 | 说明 | 注意 |
|------|------|------|------|
| `qun_name` | string | 群名称 | ⚠️ 可能含 emoji 乱码 |
| `qun_id` | string | 群唯一标识 | 格式: `数字@chatroom` |
| `wx_id` | string | 微信数据 ID | |

### Groups: history

群推荐历史记录。

**HTTP 请求**: `GET /api/v1/ca-records/group?name={name}`

**HTTP 响应 `records[]` 字段**: 同 [People: history](#people-history) 的 records 结构。

### Groups: ranking

群热度排行（基于 WS 实时数据累积）。

**WS 相关字段**:

| 字段 | 类型 | 说明 | 注意 |
|------|------|------|------|
| `sqzs` | number | 社群热度指数 | 综合热度分 |
| `cazs` | number | 查询热度指数 | |
| `bqfc` | number | 本群分享次数 | ⚠️ 仅当前群，非全网 |
| `qwfc` | number | 全网覆盖次数 | 跨群累加总次数 |
| `fgq` | number | 覆盖群数 | 不重复群数量 |

**热度排行算法**:

```python
heat_score = sqzs * 0.4 + fgq * 10 * 0.3 + qwfc * 0.2 + cazs * 0.1
```

**信号扩散阶段**:
1. 萌芽期: `fgq <= 2`，1-2 个群出现
2. 扩散期: `fgq` 3-10，多群传播
3. 爆发期: `fgq > 10`，`sqzs` 飙升
4. 衰退期: 新分享减少，`cazs` 下降

### Groups: realtime

WS 推送中的群组相关字段。

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `qun_name` | string | 群名称 | `"999swap 官方禁言通知群"` |
| `qun_id` | string | 群 ID | `"48838324382@chatroom"` |
| `sfqy` | string | 推荐所在社群 | `"999swap 官方禁言通知群"` |
| `bqfc` | number | 本群分享次数 | `3` |
| `qwfc` | number | 全网覆盖次数 | `87` |
| `fgq` | number | 覆盖群数 | `12` |
| `sqzs` | number | 社群热度指数 | `88` |

---

## Tool 3: Tokens（代币信号）详细定义

### Tokens: overview

代币综合概览（HTTP 历史数据）。

**HTTP 请求**: `GET /api/v1/ca-records/token?token={ca}`

**HTTP 响应字段**:

| 分类 | 字段 | 类型 | 说明 |
|------|------|------|------|
| 全局状态 | `status` | string | `"success"` / `"fail"` |
| 胜率统计 | `win_rate_stats.total_count` | number | 推荐该代币的总人数 |
| 胜率统计 | `win_rate_stats.success_count` | number | 盈利人数 |
| 胜率统计 | `win_rate_stats.failure_count` | number | 亏损人数 |
| 胜率统计 | `win_rate_stats.win_rate` | string | 代币胜率（⚠️ 需修正） |
| 代币核心 | `records[].id` | number | 记录 ID |
| 代币核心 | `records[].token` | string | 合约地址 |
| 代币核心 | `records[].chain` | string | 所在链 |
| 代币核心 | `records[].name` | string | 代币名称 |
| 代币核心 | `records[].symbol` | string | 代币符号 |
| 代币核心 | `records[].logo_url` | string | Logo URL |
| 市场数据 | `records[].current_price_usd` | string | 当前价格(USD) |
| 市场数据 | `records[].market_cap` | string | 市值 |
| 市场数据 | `records[].fdv` | string | 完全稀释估值 |
| 市场数据 | `records[].price_change_24h` | number | 24h 涨跌幅(%) |
| 市场数据 | `records[].tx_volume_u_24h` | string | 24h 交易量(USD) |
| 市场数据 | `records[].holders` | number | 持有人数 |
| 风险 | `records[].risk_level` | number | 风险等级 |
| 风险 | `records[].is_honeypot` | string | 是否蜜罐 |
| 风险 | `records[].is_lp_not_locked` | string/null | LP 是否未锁定 |
| 风险 | `records[].has_mint_method` | string/null | 是否有 mint 方法 |
| 风险 | `records[].is_in_blacklist` | string/null | 是否在黑名单 |
| 实时指标 | `records[].token_price_change_5m` | number | 5m 价格变化 |
| 实时指标 | `records[].token_buy_tx_count_5m` | number | 5m 买入笔数 |
| 实时指标 | `records[].token_sell_tx_count_5m` | number | 5m 卖出笔数 |
| 实时指标 | `records[].bundle_wallet_rate` | number/null | 捆绑钱包比例 |
| 实时指标 | `records[].insider_wallet_rate` | number/null | 内部人钱包比例 |
| 实时指标 | `records[].cluster_wallet_rate` | number/null | 聚集钱包比例 |
| 附加信息 | `records[].twitter` | string | Twitter 链接 |
| 附加信息 | `records[].website` | string | 官网链接 |
| 附加信息 | `records[].qun_name` | string | 推荐所在群名 |
| 附加信息 | `records[].created` | string | 记录时间 |

### Tokens: market

市场与交易数据（WS 实时推送）。

**价格数据**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `current_price_usd` | string | 当前 USD 价格 |
| `current_price_eth` | string | 当前 ETH 计价 |
| `launch_price` | string | 发射价格 |
| `price_change_5m` | number | 5 分钟涨跌幅(%) |
| `price_change_1h` | number | 1 小时涨跌幅(%) |
| `price_change_4h` | number | 4 小时涨跌幅(%) |
| `price_change_24h` | number | 24 小时涨跌幅(%) |
| `token_price_change_5m` | number | 代币 5m 价格变化 |
| `token_price_change_1h` | number | 代币 1h 价格变化 |
| `token_price_change_4h` | number | 代币 4h 价格变化 |
| `token_price_change_24h` | number | 代币 24h 价格变化 |

**交易量数据**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `tx_volume_u_24h` | string | 24h 交易量(USD) |
| `volume_u_5m` | number | 5m 交易量(USD) |
| `volume_u_1h` | number | 1h 交易量(USD) |
| `volume_u_4h` | number | 4h 交易量(USD) |
| `volume_u_24h` | number | 24h 交易量(USD) |

**买入数据**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `buy_volume_u_5m` | number | 5m 买入量(USD) |
| `buy_volume_u_1h` | number | 1h 买入量(USD) |
| `buy_volume_u_4h` | number | 4h 买入量(USD) |
| `buy_volume_u_24h` | number | 24h 买入量(USD) |
| `buys_tx_5m_count` | number | 5m 买入笔数 |
| `buys_tx_1h_count` | number | 1h 买入笔数 |
| `buys_tx_4h_count` | number | 4h 买入笔数 |
| `buys_tx_24h_count` | number | 24h 买入笔数 |
| `token_buy_tx_count_5m` | number | 代币 5m 买入笔数 |
| `token_buy_tx_volume_usd_5m` | number | 代币 5m 买入量(USD) |
| `token_buyers_5m` | number | 5m 买入人数 |

**卖出数据**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `sell_volume_u_5m` | number | 5m 卖出量(USD) |
| `sell_volume_u_1h` | number | 1h 卖出量(USD) |
| `sell_volume_u_4h` | number | 4h 卖出量(USD) |
| `sell_volume_u_24h` | number | 24h 卖出量(USD) |
| `sells_tx_5m_count` | number | 5m 卖出笔数 |
| `sells_tx_1h_count` | number | 1h 卖出笔数 |
| `sells_tx_4h_count` | number | 4h 卖出笔数 |
| `sells_tx_24h_count` | number | 24h 卖出笔数 |
| `token_sell_tx_count_5m` | number | 代币 5m 卖出笔数 |
| `token_sell_tx_volume_usd_5m` | number | 代币 5m 卖出量(USD) |
| `token_sellers_5m` | number | 5m 卖出人数 |

**市值与流动性**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `market_cap` | string | 市值(USD) |
| `fdv` | string | 完全稀释估值 |
| `tvl` | string | 总锁仓价值 |
| `main_pair_tvl` | string | 主交易对 TVL |
| `old_market_cap` | string | 推荐时市值 |
| `new_market_cap` | string | 当前市值 |
| `old_market_cap_format` | string | 推荐时市值(格式化) |
| `new_market_cap_format` | string | 当前市值(格式化) |

### Tokens: risk

风险评估数据（WS 实时推送）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `risk_score` | string | 综合风险分(0-100，越高越安全) |
| `risk_level` | number | 风险等级 |
| `ave_risk_level` | number | AVE 风险等级 |
| `is_mintable` | string | 是否可增发(`"0"`/`"1"`) |
| `is_honeypot` | string | 是否蜜罐(`"-1"`/`"0"`/`"1"`) |
| `is_in_blacklist` | string/null | 是否在黑名单 |
| `is_lp_not_locked` | string/null | LP 是否未锁定 |
| `has_mint_method` | string/null | 是否有 mint 方法 |
| `has_black_method` | string/null | 是否有黑名单方法 |
| `has_not_renounced` | string/null | 是否未放弃所有权 |
| `has_not_audited` | string/null | 是否未审计 |
| `has_not_open_source` | string/null | 是否未开源 |
| `phishing_wallet_rate` | number/null | 钓鱼钱包比例(0-1) |
| `bundle_wallet_rate` | number/null | 捆绑钱包比例(0-1) |
| `insider_wallet_rate` | number/null | 内部人钱包比例(0-1) |
| `cluster_wallet_rate` | number/null | 聚集钱包比例(0-1) |
| `rag_risk_rate` | number/null | RAG 风险比例(0-1) |
| `rug_risk_rate` | number/null | Rug Pull 风险比例(0-1) |

### Tokens: signal

社群信号聚合（WS + HTTP 综合）。

**WS 字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `sfzf` | string | 推荐至今倍数(如 `"149.46x"`) |
| `fshzf` | string | 发射后最高倍数 |
| `qwfc` | number | 全网覆盖次数 |
| `fgq` | number | 覆盖群数 |
| `sqzs` | number | 社群热度指数 |
| `cazs` | number | 查询热度指数 |
| `bqfc` | number | 本群分享次数 |
| `sfqy` | string | 推荐所在社群 |
| `sfsj` | string | 推荐时间(UTC+8) |
| `zfzgzf` | string | 最高倍数含描述 |

**HTTP 端点**: `GET /api/v1/ca-records/token?token={ca}` — 获取该代币被所有群/人推荐的完整历史。

### Tokens: realtime

WS 完整代币快照。每条推送约 126+ 字段，包含以上所有维度数据。

**代币基础信息**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | 合约地址 |
| `chain` | string | 所在链(`bsc`/`solana`/`eth`) |
| `symbol` | string | 代币符号 |
| `name` | string | 代币名称 |
| `decimal` | number | 精度位数 |
| `total` | string | 总供应量 |
| `holders` | number | 持有人数 |
| `logo_url` | string | Logo URL |
| `description` | string | AI 生成描述 |
| `intro_cn` | string | 中文简介 |
| `intro_en` | string | 英文简介 |
| `appendix` | string | 附加信息(JSON) |
| `issue_platform` | string | 发射平台 |
| `launch_at` | number | 发射时间(Unix) |
| `created_at` | number | 创建时间(Unix) |
| `updated_at` | number | 更新时间(Unix) |
| `progress` | string | 进度(%) |

**代币供应分布**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `lock_amount` | string | 锁仓数量 |
| `burn_amount` | string | 销毁数量 |
| `other_amount` | string | 其他分配 |
| `locked_percent` | string | 锁仓百分比 |
| `zbbl` | string | 前10持仓比例(`\|`分隔) |
| `zzb` | string | 前10合计占比(%) |

**交易对信息**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `main_pair` | string | 主交易对地址 |
| `token0_symbol` | string | Token0 符号 |
| `token1_symbol` | string | Token1 符号 |
| `reserve0` | string | Token0 储备量 |
| `reserve1` | string | Token1 储备量 |

**社交链接**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `twitter` | string | Twitter/X 链接 |
| `website` | string | 官网链接 |
| `isTwitter` | string | 有 Twitter(`"✅"`/`"❌"`) |
| `isWebsite` | string | 有官网(`"✅"`/`"❌"`) |

---

## 已知数据问题与修正

### 1. 胜率虚高

API 和 WS 的 `win_rate` / `sender_win_rate` 均使用 `success/(success+failure)` 忽略未结算代币。

```javascript
// 正确: success_count / total_count * 100
const correctRate = (success_count / total_count * 100).toFixed(1);
```

### 2. 推荐人字段缺失

`sfr` 约 47% 为空，需 fallback:

```javascript
const caller = token.sfr || token.cxr || token.qy_name || '未知';
```

### 3. 倍数数据缺失

`sfzf`/`fshzf` 可能为空或 0，需多层 fallback:

```javascript
let multiple = parseFloat(token.sfzf) || 0;
if (!multiple && token.current_price_usd && token.launch_price) {
  multiple = parseFloat(token.current_price_usd) / parseFloat(token.launch_price);
}
if (multiple < 0.001) multiple = 0.01; // 默认值
```

### 4. Emoji/Unicode 乱码

`qun_name`/`sfr`/`cxr`/`qy_name` 可能含损坏的 UTF-16 代理对，需清洗。

### 5. 精度丢失

`toFixed(2)` 将 0.0005x 舍入为 0，小值需 `toFixed(6)`。

### 6. 静默断连

WS 连接可能 TCP 存活但不推数据，需 5 分钟心跳检测强制重连。

### 7. 时间戳字段

`created_at` 是代币创建时间（同一代币所有记录相同），`created` 是个别记录时间。

---

## 快速开始

### Node.js

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://43.254.167.238:3000/token');

ws.on('message', (data) => {
  const token = JSON.parse(data);
  const caller = token.sfr || token.cxr || '未知';
  console.log(`${token.symbol} | $${token.current_price_usd} | 来源: ${caller} | 覆盖: ${token.fgq}群`);
});
```

### Python

```python
import asyncio, websockets, json

async def listen():
    async with websockets.connect('ws://43.254.167.238:3000/token') as ws:
        async for message in ws:
            token = json.loads(message)
            caller = token.get('sfr') or token.get('cxr', '未知')
            print(f"{token['symbol']} | ${token['current_price_usd']} | 来源: {caller}")

asyncio.run(listen())
```

### HTTP API 查询

```bash
# 查询某人的推荐历史
curl http://43.254.167.238:3000/api/v1/ca-records/member?name=999swap推送

# 查询某群的推荐历史
curl http://43.254.167.238:3000/api/v1/ca-records/group?name=999swap官方群

# 查询某代币的推荐记录
curl http://43.254.167.238:3000/api/v1/ca-records/token?token=0x53a3fbc07f52ccec...
```
