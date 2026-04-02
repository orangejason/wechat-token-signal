---
name: wechat-token-signal
description: "实时推送链上代币数据的 WebSocket Skill，包含微信社群首发信号、价格变动、交易量、风险评估、市值等 126+ 个字段。支持 BSC / Solana / ETH 等多链代币实时监控，核心亮点为微信社群首发喊单数据（首发人、首发社群、首发倍数、发射后最高倍数、喊单人胜率），是发现早期 Meme 代币的关键数据源。"
license: MIT
metadata:
  author: SmallClaw
  version: "2.0.0"
  homepage: "https://github.com/orangejason/wechat-token-signal"
---

# WeChat Token Signal API

实时 WebSocket 推送链上代币完整快照，**126+ 个字段**覆盖代币基础信息、价格、交易量、市值、风险评估、LP 流动性和**微信社群首发喊单数据**。

**WebSocket URL**: `ws://43.254.167.238:3000/token`

**推送频率**: 约每 3 秒推送一条代币完整快照（JSON 格式）

**无需认证**: 直接连接即可接收数据，无需 API Key

---

## 目录

1. [快速开始](#快速开始)
2. [微信社群首发数据（核心）](#微信社群首发数据核心)
3. [数据字段完整索引](#数据字段完整索引)
4. [字段详细说明](#字段详细说明)
5. [已知数据问题与修正指南](#已知数据问题与修正指南)
6. [代码示例](#代码示例)
7. [数据应用场景](#数据应用场景)
8. [历史 CA 记录 REST API](#历史-ca-记录-rest-api)
9. [注意事项](#注意事项)

---

## 快速开始

### 连接方式

WebSocket 长连接，连接后自动接收推送数据，无需发送订阅消息。

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://43.254.167.238:3000/token');

ws.on('open', () => console.log('已连接'));
ws.on('message', (data) => {
  const token = JSON.parse(data);
  console.log(`${token.symbol} | $${token.current_price_usd} | 首发: ${token.sfr}`);
});
```

### Python 示例

```python
import asyncio, websockets, json

async def listen():
    async with websockets.connect('ws://43.254.167.238:3000/token') as ws:
        async for message in ws:
            token = json.loads(message)
            print(f"{token['symbol']} | ${token['current_price_usd']} | 首发: {token.get('sfr', 'N/A')}")

asyncio.run(listen())
```

### 断线重连（推荐）

WebSocket 连接可能因网络波动断开。**必须实现断线重连和心跳检测**：

```javascript
function connect() {
  const ws = new WebSocket('ws://43.254.167.238:3000/token');
  let lastMessage = Date.now();

  ws.on('message', (data) => {
    lastMessage = Date.now();
    const token = JSON.parse(data);
    // 处理数据...
  });

  ws.on('close', () => {
    console.log('连接断开，5秒后重连...');
    setTimeout(connect, 5000);
  });

  ws.on('error', (err) => {
    console.error('连接错误:', err.message);
    ws.close();
  });

  // 心跳检测：5分钟无数据视为连接死亡
  const heartbeat = setInterval(() => {
    if (Date.now() - lastMessage > 5 * 60 * 1000) {
      console.log('心跳超时，强制重连');
      clearInterval(heartbeat);
      ws.terminate();
    }
  }, 60000);

  ws.on('close', () => clearInterval(heartbeat));
}
connect();
```

> **重要**: WS 连接可能出现"静默死亡"——TCP 连接还在但不再收到数据。必须实现心跳检测，建议 5 分钟无数据即强制重连。

### 数据格式

每条推送为一个 JSON 对象，代表一个代币的完整快照：

```json
{
  "token": "0x53a3fbc07f52ccec...",
  "chain": "bsc",
  "symbol": "LABUBU",
  "current_price_usd": "0.0020105",
  "launch_price": "0.00000001346",
  "market_cap": "1985428.97",
  "sfr": "999swap推送",
  "sfsj": "2026-02-13 14:02:53",
  "sfqy": "999swap 官方禁言通知群",
  "sfzf": "149.46x",
  "fshzf": "14946.40",
  "qwfc": 87,
  "fgq": 12,
  "sender_win_rate": "98.6",
  "sender_total_tokens": 350,
  "risk_score": "55",
  "holders": 178178
}
```

---

## 微信社群首发数据（核心）

微信社群首发数据是本 Skill 最核心的数据维度，记录了代币在微信社群中被首次发现和推荐（"喊单"）的完整信息，是发现早期 Alpha 代币的关键信号。

### 核心关系模型

数据源围绕 **用户（首发人/查询人）× 代币（CA）× 社群（微信群）** 三维关系：

- 每条 WS 推送携带一个 `sfr`（首发人）+ `qun_name`（群名），代表**当前这一次喊单**的人和群
- 一个代币可能被**多个人**在**多个群**中喊单多次
- `qwfc`（全网覆盖次数）= 该代币被所有人在所有群中喊单的总次数
- `fgq`（覆盖群数）= 该代币被分享到的**不重复**群总数

> **注意**: 每条 WS 推送只包含**最近一次**喊单的 `sfr` 和 `qun_name`，不包含历史全部喊单记录。要获取完整的喊单时间线，需要自行累积 WS 数据或查询历史 CA 记录 REST API。

### 首发人/查询人字段

| 字段 | 类型 | 说明 | 约束与注意 | 示例 |
|------|------|------|-----------|------|
| `sfr` | string | **首发人** — 最早在微信群中推荐该代币的人 | ⚠️ 约 47% 的代币此字段为空，可用 `cxr` 作为 fallback | `"999swap推送"` |
| `sfsj` | string | **首发时间** — 代币首次在微信群出现的时间 | UTC+8 格式化字符串 | `"2026-02-13 14:02:53"` |
| `sfqy` | string | **首发社群** — 代币最早出现的微信社群 | | `"999swap 官方禁言通知群"` |
| `sfzf` | string | **首发至今倍数** — 从首发时价格到当前价格的涨幅倍数 | 格式 `"149.46x"`，需 `parseFloat()` 提取数值。⚠️ 该值可能过时或缺失，更准确的算法见下方 | `"149.46x"` |
| `fshzf` | string | **发射后最高倍数** — 代币从发射到历史最高价的倍数 | 无单位后缀的纯数字字符串。⚠️ 部分代币为空或 `"0"` | `"14946.40"` |
| `sfxx` | string | **首发信息汇总** — 包含首发人、最高倍数、当前倍数、市值变化的完整摘要 | 多行文本，格式见下方 | 见下方 |
| `zfzgzf` | string | 最高倍数含描述 | | `"2996.83x."` |
| `cxr` | string | **查询人** — 最近查询该代币的用户 | ⚠️ 当 `sfr` 为空时，`cxr` 是唯一的用户标识。字段可能含 emoji 乱码 | `"米多多💰"` |
| `cxrxx` | string | 查询人详细信息 | 多行文本 | `"查询人: 米多多 (4)\n└ 首查后 0.01x 现 -0.95x"` |
| `cxrzf` | string | 查询后至今涨幅 | | `"-0.95x"` |
| `zgzf` | string | 查询后最高涨幅 | | `"0.01x"` |
| `grcxcs` | number | 个人查询次数 | | `4` |

#### `sfr` 为空的处理

约 47% 的代币 `sfr` 字段为空字符串或缺失。推荐 fallback 逻辑：

```javascript
const caller = token.sfr || token.cxr || token.qy_name || '未知';
```

#### 首发信息汇总示例 (`sfxx`)

```
首发大神: 999swap推送
├ 最高:2996.83x.现在:149.46x
├ 变化: $13K → $2M
└ 首间: 2026-02-13 14:02:53
```

### 首发人战绩统计

| 字段 | 类型 | 说明 | 约束与注意 | 示例 |
|------|------|------|-----------|------|
| `sender_total_tokens` | number | 该首发人历史推荐代币总数 | | `350` |
| `sender_win_tokens` | string | 推荐成功（盈利 > 0）的代币数 | | `"345"` |
| `sender_win_rate` | string | 推荐胜率（百分比） | ⚠️ **严重注意**：此值严重虚高，详见下方修正指南 | `"98.6"` |
| `sender_best_multiple` | string | 历史最佳倍数 | | `"6708.13"` |

#### ⚠️ 胜率数据严重虚高

WS 推送的 `sender_win_rate` 和 CA API 的 `win_rate_stats.win_rate` 均使用以下**错误公式**：

```
错误公式: win_rate = success_count / (success_count + failure_count) * 100
```

该公式**忽略了大量未结算代币**（`increase_data` 为 0 或 null 的代币不计入 success 也不计入 failure），导致胜率普遍虚高到 90%+。

**正确公式**：

```javascript
// 正确胜率 = 成功数 / 总代币数 * 100
const correctWinRate = (success_count / total_count * 100).toFixed(1);
```

- `total_count` = 该用户推荐的所有代币数（包括未结算的）
- `success_count` = `increase_data > 0` 的代币数
- `failure_count` = `increase_data < 0` 的代币数
- 未结算 = `increase_data === 0` 或 `null` 的代币（不应忽略）

> 实际修正后胜率一般在 40-70% 之间，而非原始数据显示的 90%+。

### 微信群信息

| 字段 | 类型 | 说明 | 约束与注意 | 示例 |
|------|------|------|-----------|------|
| `qun_name` | string | 首发微信群名称 | ⚠️ 可能包含 emoji 乱码（见下方编码问题） | `"999swap 官方禁言通知群"` |
| `qun_id` | string | 微信群唯一标识 | 格式为数字或 `数字@chatroom` | `"48838324382@chatroom"` |
| `wx_id` | string | 微信数据 ID | | `"2008471"` |
| `qy_wxid` | string | 首发群友微信 ID | | `"3914182909"` |
| `qy_name` | string | 首发群友名称 | | `"999swap推送"` |

### 社区热度指标

| 字段 | 类型 | 说明 | 约束与注意 | 示例 |
|------|------|------|-----------|------|
| `cazs` | number | 查询热度指数 | 被查询的次数 | `15` |
| `sqzs` | number | 社群热度指数 | 综合热度分 | `88` |
| `bqfc` | number | 本群分享次数 | **当前这条消息所在群**的分享次数，不是全网 | `3` |
| `qwfc` | number | **全网覆盖次数** | 该代币在**所有微信群**被提及的总次数 | `87` |
| `fgq` | number | **覆盖群数** | 该代币被分享到的**不重复**微信群总数 | `12` |
| `jy` | number | 交易标记 | | `1` |
| `xwb` | string | 新闻播报 | 相关新闻内容 | |

> **`bqfc` vs `qwfc` vs `fgq`**: `bqfc` 是当前群的分享次数，`qwfc` 是全网总次数（跨群累加），`fgq` 是覆盖到的不重复群数。要评估代币热度应看 `qwfc` 和 `fgq`，不要看 `bqfc`。

---

## 数据字段完整索引

### 1. 代币基础信息（18 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | 代币合约地址 |
| `chain` | string | 所在链（如 `bsc`, `solana`, `eth`） |
| `symbol` | string | 代币符号 |
| `name` | string | 代币名称 |
| `decimal` | number | 精度位数 |
| `total` | string | 总供应量 |
| `holders` | number | 持有人数 |
| `logo_url` | string | 代币 Logo 图片 URL |
| `description` | string | 代币描述（AI 生成） |
| `intro_cn` | string | 中文简介 |
| `intro_en` | string | 英文简介 |
| `appendix` | string | 附加信息（JSON 字符串，含社交链接等） |
| `issue_platform` | string | 发射平台（如 `four_meme`, `pump_fun`） |
| `launch_at` | number | 发射时间（Unix 时间戳） |
| `created_at` | number | 创建时间（Unix 时间戳） |
| `updated_at` | number | 最后更新时间（Unix 时间戳） |
| `dqsj` | string | 当前时间（UTC+8 格式化字符串） |
| `progress` | string | 进度百分比（如 `"100.00"` 表示已完成） |
| `statusText` | string | 状态文本（如 `"状态:已发射"`） |

### 2. 价格数据（12 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `current_price_usd` | string | 当前 USD 价格 |
| `current_price_eth` | string | 当前 ETH 计价 |
| `launch_price` | string | 发射价格 |
| `price_change_5m` | number | 5 分钟涨跌幅（%） |
| `price_change_1h` | number | 1 小时涨跌幅（%） |
| `price_change_4h` | number | 4 小时涨跌幅（%） |
| `price_change_24h` | number | 24 小时涨跌幅（%） |
| `price_change_1d` | string | 1 日涨跌幅（%） |
| `token_price_change_5m` | number | 代币 5 分钟价格变化 |
| `token_price_change_1h` | number | 代币 1 小时价格变化 |
| `token_price_change_4h` | number | 代币 4 小时价格变化 |
| `token_price_change_24h` | number | 代币 24 小时价格变化 |

### 3. 交易量数据（8 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `tx_volume_u_24h` | string | 24h 交易量（USD） |
| `tx_amount_24h` | string | 24h 交易金额 |
| `tx_count_24h` | number | 24h 交易笔数 |
| `volume_u_5m` | number | 5 分钟交易量（USD） |
| `volume_u_1h` | number | 1 小时交易量（USD） |
| `volume_u_4h` | number | 4 小时交易量（USD） |
| `volume_u_24h` | number | 24 小时交易量（USD） |
| `volume_u_24h_format` | string | 24h 交易量格式化（如 `"7K"`） |

### 4. 买入数据（12 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `buy_volume_u_5m` | number | 5 分钟买入量（USD） |
| `buy_volume_u_1h` | number | 1 小时买入量（USD） |
| `buy_volume_u_4h` | number | 4 小时买入量（USD） |
| `buy_volume_u_24h` | number | 24 小时买入量（USD） |
| `buys_tx_5m_count` | number | 5 分钟买入笔数 |
| `buys_tx_1h_count` | number | 1 小时买入笔数 |
| `buys_tx_4h_count` | number | 4 小时买入笔数 |
| `buys_tx_24h_count` | number | 24 小时买入笔数 |
| `token_buy_tx_count_5m` | number | 代币 5 分钟买入笔数 |
| `token_buy_tx_volume_usd_5m` | number | 代币 5 分钟买入量（USD） |
| `token_buyers_5m` | number | 5 分钟内买入人数 |
| `buy_tx` | string | 买卖比（买入） |

### 5. 卖出数据（11 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `sell_volume_u_5m` | number | 5 分钟卖出量（USD） |
| `sell_volume_u_1h` | number | 1 小时卖出量（USD） |
| `sell_volume_u_4h` | number | 4 小时卖出量（USD） |
| `sell_volume_u_24h` | number | 24 小时卖出量（USD） |
| `sells_tx_5m_count` | number | 5 分钟卖出笔数 |
| `sells_tx_1h_count` | number | 1 小时卖出笔数 |
| `sells_tx_4h_count` | number | 4 小时卖出笔数 |
| `sells_tx_24h_count` | number | 24 小时卖出笔数 |
| `token_sell_tx_count_5m` | number | 代币 5 分钟卖出笔数 |
| `token_sell_tx_volume_usd_5m` | number | 代币 5 分钟卖出量（USD） |
| `token_sellers_5m` | number | 5 分钟内卖出人数 |

### 6. 市值与流动性（9 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `market_cap` | string | 市值（USD） |
| `fdv` | string | 完全稀释估值（USD） |
| `tvl` | string | 总锁仓价值（格式化，如 `"136K"`） |
| `tvl1` | string | 配对代币 TVL |
| `main_pair_tvl` | string | 主交易对 TVL |
| `old_market_cap` | string | 首发时市值 |
| `new_market_cap` | string | 当前市值 |
| `old_market_cap_format` | string | 首发市值格式化（如 `"13K"`） |
| `new_market_cap_format` | string | 当前市值格式化（如 `"2M"`） |

### 7. 交易对信息（5 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `main_pair` | string | 主交易对合约地址 |
| `token0_symbol` | string | 交易对 Token0 符号 |
| `token1_symbol` | string | 交易对 Token1 符号 |
| `reserve0` | string | Token0 储备量 |
| `reserve1` | string | Token1 储备量 |

### 8. 风险评估（18 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `risk_score` | string | 综合风险分数（0-100，越高越安全） |
| `risk_level` | number | 风险等级 |
| `ave_risk_level` | number | AVE 风险等级 |
| `is_mintable` | string | 是否可增发（`"0"` 否 / `"1"` 是） |
| `is_honeypot` | string | 是否蜜罐（`"-1"` 未知 / `"0"` 否 / `"1"` 是） |
| `is_in_blacklist` | string/null | 是否在黑名单 |
| `is_lp_not_locked` | string/null | LP 是否未锁定 |
| `has_mint_method` | string/null | 是否有 mint 方法 |
| `has_black_method` | string/null | 是否有黑名单方法 |
| `has_not_renounced` | string/null | 是否未放弃所有权 |
| `has_not_audited` | string/null | 是否未审计 |
| `has_not_open_source` | string/null | 是否未开源 |
| `phishing_wallet_rate` | number/null | 钓鱼钱包比例（0-1） |
| `bundle_wallet_rate` | number/null | 捆绑钱包比例（0-1） |
| `insider_wallet_rate` | number/null | 内部人钱包比例（0-1） |
| `cluster_wallet_rate` | number/null | 聚集钱包比例（0-1） |
| `rag_risk_rate` | number/null | RAG 风险比例（0-1） |
| `rug_risk_rate` | number/null | Rug Pull 风险比例（0-1） |

### 9. 代币供应分布（6 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `lock_amount` | string | 锁仓数量 |
| `burn_amount` | string | 销毁数量 |
| `other_amount` | string | 其他分配数量 |
| `locked_percent` | string | 锁仓百分比 |
| `zbbl` | string | 前 10 持仓比例（以 `\|` 分隔，如 `"0.38\|0.03\|0.02\|..."`) |
| `zzb` | string | 前 10 合计占比（%） |

### 10. 社交链接

| 字段 | 类型 | 说明 |
|------|------|------|
| `twitter` | string | Twitter/X 链接 |
| `website` | string | 官网链接 |
| `isTwitter` | string | 是否有 Twitter（`"✅"` / `"❌"`） |
| `isWebsite` | string | 是否有官网（`"✅"` / `"❌"`） |

---

## 字段详细说明

### 中文缩写对照表

| 缩写 | 全称 | 英文 | 说明 |
|------|------|------|------|
| `sfr` | 首发人 | First Caller | 最早在微信群推荐该代币的人。⚠️ 47% 为空，需 fallback 到 `cxr` |
| `sfsj` | 首发时间 | First Call Time | 代币首次在微信群出现的时间（UTC+8） |
| `sfqy` | 首发社群 | First Call Community | 代币最早出现的微信社群 |
| `sfzf` | 首发至今倍数 | First Call Multiple | 从首发价到当前价的倍数。格式 `"149.46x"` |
| `fshzf` | 发射后最高倍数 | Post-Launch Peak Multiple | 发射后达到的历史最高倍数 |
| `sfxx` | 首发信息 | First Call Summary | 首发人、倍数、市值变化的汇总文本 |
| `zfzgzf` | 至今最高倍数 | Peak Multiple to Date | 最高倍数含文字描述 |
| `dqsj` | 当前时间 | Current Time | 数据快照的时间戳（UTC+8） |
| `cazs` | 查询指数 | Query Index | 被查询的热度指标 |
| `sqzs` | 社群指数 | Community Index | 在微信社群中的综合热度 |
| `bqfc` | 本群分享次数 | Group Share Count | 在**当前群**的分享次数（非全网） |
| `qwfc` | 全网覆盖次数 | Network Mention Count | 全部微信群的喊单总次数 |
| `fgq` | 覆盖群数 | Coverage Groups | 该代币被分享到的不重复群总数 |
| `zbbl` | 占比比例 | Holding Ratio | 前 10 大持仓地址各自占比（`\|` 分隔） |
| `zzb` | 总占比 | Total Ratio | 前 10 大持仓合计占比（%） |
| `cxr` | 查询人 | Querier | 最近查询该代币的用户 |
| `cxrxx` | 查询人信息 | Querier Info | 查询人的详细信息文本 |
| `cxrzf` | 查询人至今涨幅 | Querier Return | 查询后到当前的涨幅 |
| `zgzf` | 最高涨幅 | Peak Return | 查询后的最高涨幅 |
| `grcxcs` | 个人查询次数 | Personal Query Count | 该用户查询该代币的次数 |

### 持仓分布 (`zbbl`) 解析

`zbbl` 字段以 `|` 分隔，表示前 10 大持仓地址的占比：

```javascript
const zbbl = token.zbbl.split('|').map(Number);
// [0.38, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
// 第一名持仓 0.38%，前10合计 zzb = "50.79"
```

### 附加信息 (`appendix`) 解析

`appendix` 是一个 JSON 字符串，包含代币的社交媒体、官网等扩展信息：

```javascript
const info = JSON.parse(token.appendix);
// info.twitter → "https://x.com/..."
// info.telegram → "https://t.me/..."
// info.website → "https://..."
// info.description → 代币完整描述
```

---

## 已知数据问题与修正指南

在实际使用中，我们发现以下数据问题，开发者**必须**了解并做相应处理：

### 1. 胜率严重虚高

**问题**: `sender_win_rate` 和 CA API 的 `win_rate_stats.win_rate` 计算公式为 `success / (success + failure)`，忽略了大量未结算代币（`increase_data` 为 0 或 null），导致胜率普遍虚高到 90%+。

**修正**:
```javascript
function getAccurateWinRate(stats) {
  const { total_count, success_count } = stats;
  if (!total_count || total_count === 0) return 0;
  return (success_count / total_count * 100).toFixed(1);
}
// 原始 win_rate: 93.99% → 修正后: 70.1%
```

### 2. 首发人 (`sfr`) 大量为空

**问题**: 约 47% 的代币 `sfr` 字段为空字符串。

**修正**:
```javascript
const caller = token.sfr || token.cxr || token.qy_name || '未知';
```

### 3. 倍数数据缺失或为 0

**问题**: `sfzf`（首发至今倍数）和 `fshzf`（发射后最高倍数）在很多代币上为空、`"0"` 或 `"0x"`。CA API 的 `increase_data` 也可能为 0 或 null。

**修正** — 多层 fallback 计算倍数:
```javascript
function getMultiplier(token) {
  // 优先级1: CA API 的 increase_data
  if (token.increase_data && token.increase_data !== 0) {
    return token.increase_data;
  }
  // 优先级2: 用价格计算
  const current = parseFloat(token.current_price_usd);
  const launch = parseFloat(token.launch_price);
  if (current > 0 && launch > 0) {
    const mult = current / launch;
    // 小数精度: < 0.01 用 toFixed(6), 否则 toFixed(2)
    return mult < 0.01 ? parseFloat(mult.toFixed(6)) : parseFloat(mult.toFixed(2));
  }
  // 优先级3: WS 的 sfzf 字段
  const sfzf = parseFloat(token.sfzf);
  if (sfzf > 0) return sfzf;
  // 最终 fallback
  return 0.01;
}
```

> **精度陷阱**: `toFixed(2)` 会将 0.0005x 这样的小倍数舍入为 `"0.00"` → 0。对于 < 0.01 的值，必须用 `toFixed(6)` 保留精度。

### 4. 喊单人数/群数量全部显示为 1

**问题**: 每条 WS 推送只包含一个 `sfr` + `qun_name`，如果只看单条消息，会误以为每个代币只有 1 个喊单人和 1 个群。

**修正**: 使用 WS 提供的聚合字段:
- `fgq`（覆盖群数）= 实际被分享到的不重复群数
- `qwfc`（全网覆盖次数）= 全网被喊单的总次数

不要用 `sfr` 去 count 喊单人数，应该自行累积历史或查询 CA API。

### 5. Unicode/Emoji 乱码

**问题**: `qun_name`、`sfr`、`cxr` 等文本字段可能包含损坏的 Unicode 编码：
- `\uD83D\uDC8B` — UTF-16 代理对，在 JS 字符串中直接使用会乱码
- `uD83DuDC8B` — 无反斜杠的代理对标记
- `\uE134` — 私有域 Unicode 字符

**修正**:
```javascript
function fixSurrogates(str) {
  if (!str) return str;
  // 修复 \uD83D\uDC8B 格式的代理对
  str = str.replace(/\\u(D[89AB][0-9A-F]{2})\\u(D[C-F][0-9A-F]{2})/gi, (_, hi, lo) => {
    return String.fromCodePoint(
      (parseInt(hi, 16) - 0xD800) * 0x400 + (parseInt(lo, 16) - 0xDC00) + 0x10000
    );
  });
  // 修复 uD83DuDC8B 格式（无反斜杠）
  str = str.replace(/u(D[89AB][0-9A-F]{2})u(D[C-F][0-9A-F]{2})/gi, (_, hi, lo) => {
    return String.fromCodePoint(
      (parseInt(hi, 16) - 0xD800) * 0x400 + (parseInt(lo, 16) - 0xDC00) + 0x10000
    );
  });
  // 移除私有域字符
  str = str.replace(/[\uE000-\uF8FF]/g, '');
  return str.trim();
}
```

### 6. 喊单时间线去重

**问题**: WS 每 3 秒推送同一代币的价格更新，如果每条都记录为一次"喊单"，会产生大量重复的时间线条目。

**修正**: 对同一代币的同一喊单人，设置 60 秒去重窗口:
```javascript
const DEDUP_WINDOW = 60 * 1000; // 60 秒
const lastMention = new Map(); // key: `${token}_${caller}`

function shouldRecord(tokenAddress, caller) {
  const key = `${tokenAddress}_${caller}`;
  const now = Date.now();
  const last = lastMention.get(key) || 0;
  if (now - last < DEDUP_WINDOW) return false;
  lastMention.set(key, now);
  return true;
}
```

### 7. CA API 时间戳字段名不一致

**问题**: CA API 历史记录中，有些版本返回 `created_at`，有些返回 `created`（无 `_at` 后缀）。

**修正**:
```javascript
const timestamp = record.created_at || record.created || record.updated_at;
```

---

## 代码示例

### 1. 实时监控高倍数首发代币

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://43.254.167.238:3000/token');

ws.on('message', (data) => {
  const token = JSON.parse(data);
  const multiple = parseFloat(token.sfzf);

  if (multiple >= 10) {
    const caller = token.sfr || token.cxr || '未知';
    console.log(`${token.symbol}`);
    console.log(`   合约: ${token.token}`);
    console.log(`   链: ${token.chain}`);
    console.log(`   首发倍数: ${token.sfzf}`);
    console.log(`   最高倍数: ${token.fshzf}x`);
    console.log(`   首发人: ${caller}`);
    console.log(`   首发社群: ${token.sfqy}`);
    console.log(`   首发时间: ${token.sfsj}`);
    console.log(`   当前价: $${token.current_price_usd}`);
    console.log(`   市值: $${token.new_market_cap_format}`);
    console.log(`   覆盖: ${token.fgq}群 ${token.qwfc}次`);
    console.log(`   持有人: ${token.holders}`);
    console.log(`   风险分: ${token.risk_score}`);
    console.log('---');
  }
});
```

### 2. 首发人追踪（修正胜率版）

```javascript
ws.on('message', (data) => {
  const token = JSON.parse(data);
  const totalTokens = token.sender_total_tokens;
  const winTokens = parseInt(token.sender_win_tokens) || 0;

  // 使用修正后的胜率公式
  const correctedWinRate = totalTokens > 0 ? (winTokens / totalTokens * 100).toFixed(1) : 0;
  const caller = token.sfr || token.cxr || '未知';

  if (correctedWinRate > 60 && totalTokens > 50) {
    console.log(`优质首发人: ${caller}`);
    console.log(`   修正胜率: ${correctedWinRate}% (原始: ${token.sender_win_rate}%)`);
    console.log(`   推荐总数: ${totalTokens} (成功: ${winTokens})`);
    console.log(`   最佳倍数: ${token.sender_best_multiple}x`);
    console.log(`   本次推荐: ${token.symbol} (${token.sfzf})`);
  }
});
```

### 3. 风险筛选过滤

```javascript
ws.on('message', (data) => {
  const token = JSON.parse(data);

  const isSafe =
    parseInt(token.risk_score) >= 60 &&
    token.is_mintable === '0' &&
    token.is_honeypot !== '1' &&
    token.holders > 100 &&
    parseFloat(token.locked_percent) > 0;

  if (isSafe) {
    console.log(`安全代币: ${token.symbol} | 风险分: ${token.risk_score}`);
  }
});
```

### 4. 买卖力度实时监控

```javascript
ws.on('message', (data) => {
  const token = JSON.parse(data);

  const buyVol5m = token.buy_volume_u_5m || 0;
  const sellVol5m = token.sell_volume_u_5m || 0;
  const ratio = sellVol5m > 0 ? buyVol5m / sellVol5m : Infinity;

  if (ratio >= 3 && buyVol5m > 100) {
    console.log(`强势买入: ${token.symbol}`);
    console.log(`   5m买入: $${buyVol5m.toFixed(2)} | 卖出: $${sellVol5m.toFixed(2)}`);
    console.log(`   买卖比: ${ratio.toFixed(1)}x`);
    console.log(`   价格变化5m: ${token.price_change_5m}%`);
  }
});
```

### 5. Python: 社群热度排行

```python
import asyncio, websockets, json
from collections import defaultdict

token_heat = defaultdict(dict)

async def track_community_heat():
    async with websockets.connect('ws://43.254.167.238:3000/token') as ws:
        async for message in ws:
            t = json.loads(message)
            token_heat[t['symbol']] = {
                'sqzs': t.get('sqzs', 0),
                'cazs': t.get('cazs', 0),
                'qwfc': t.get('qwfc', 0),
                'fgq': t.get('fgq', 0),
                'sfzf': t.get('sfzf', '0x'),
                'chain': t.get('chain', ''),
            }

            if len(token_heat) % 100 == 0:
                ranked = sorted(token_heat.items(),
                    key=lambda x: x[1].get('sqzs', 0), reverse=True)
                print("\n=== 社群热度 TOP 10 ===")
                for i, (sym, data) in enumerate(ranked[:10]):
                    print(f"{i+1}. {sym} | 社群指数:{data['sqzs']} | "
                          f"覆盖{data['fgq']}群 {data['qwfc']}次 | 倍数:{data['sfzf']}")

asyncio.run(track_community_heat())
```

---

## 数据应用场景

### 场景 1: 早期 Alpha 发现

利用微信社群首发数据，追踪高胜率首发人推荐的新代币：
- 使用**修正后的胜率** > 60%（不要使用原始的 `sender_win_rate`）
- 关注 `sfsj` 在 1 小时内的新首发代币
- 结合 `risk_score >= 60` 过滤高风险项目
- 检查 `fgq > 3` 确认有多群覆盖

### 场景 2: Meme 代币监控看板

实时展示代币核心指标：
- 价格变动（5m / 1h / 4h / 24h）
- 买卖力度对比
- 市值变化趋势（`old_market_cap` → `new_market_cap`）
- 社群热度排名（`sqzs` 社群指数）
- 首发人排行（按修正胜率和推荐数量排序）

### 场景 3: 风控预警系统

基于风险字段构建实时预警：
- `is_honeypot === '1'` 蜜罐检测
- `phishing_wallet_rate > 0.1` / `bundle_wallet_rate > 0.2` 异常钱包比例
- `rug_risk_rate > 0.3` Rug Pull 风险
- `zbbl` 持仓集中度（第一名占比 > 50% 高风险）

### 场景 4: 社群信号聚合

跨多个微信社群聚合信号，发现正在传播的热门代币：
- `fgq`（覆盖群数）反映代币在社群中的扩散速度
- `qwfc`（全网覆盖次数）衡量传播广度
- `sqzs`（社群指数）量化社群热度

信号扩散阶段：
1. **萌芽期**: 1-2 个群出现，`fgq <= 2`
2. **扩散期**: 3-10 个群传播，`fgq` 快速增长
3. **爆发期**: 10+ 个群热议，`sqzs` 大幅飙升
4. **衰退期**: 新分享减少，`cazs` 下降

### 场景 5: 首发人跟踪系统

建立首发人画像，跟踪高质量推荐者：

| 维度 | 字段 | 说明 |
|------|------|------|
| 修正胜率 | 计算自 `sender_win_tokens / sender_total_tokens` | 不要使用原始 `sender_win_rate` |
| 推荐数量 | `sender_total_tokens` | 样本量越大越可靠 |
| 最佳倍数 | `sender_best_multiple` | 历史最佳表现 |
| 覆盖力 | 累积 `fgq` | 推荐代币平均覆盖群数 |

---

## 历史 CA 记录 REST API

除了实时 WebSocket 推送外，还提供 REST API 查询群友和群的历史 CA（合约地址）记录，包含历史胜率、代币详情等完整数据。

**Base URL**: `http://43.254.167.238:3000`

### 1. 群友 CA 记录

查询某个群友的历史 CA 查询记录及胜率统计。

```
GET /api/v1/ca-records/member?qy_wxid={wxid}&days={days}&page={page}&limit={limit}
```

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `qy_wxid` | string | 是 | - | 群友微信 ID（如 `wxid_xvn49ppq7qfd12`） |
| `days` | number | 否 | 7 | 查询天数（建议 7-30） |
| `page` | number | 否 | 1 | 页码 |
| `limit` | number | 否 | 20 | 每页条数（最大 100） |

### 2. 群 CA 记录

查询某个微信群的历史 CA 查询记录及胜率统计。

```
GET /api/v1/ca-records/group?qun_id={qun_id}&days={days}&page={page}&limit={limit}
```

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `qun_id` | string | 是 | - | 微信群 ID（如 `48838324382@chatroom`） |
| `days` | number | 否 | 7 | 查询天数 |
| `page` | number | 否 | 1 | 页码 |
| `limit` | number | 否 | 20 | 每页条数（最大 100） |

### 3. 代币 CA 记录

查询某个代币在所有群的历史喊单记录。

```
GET /api/v1/ca-records/token?token={address}&days={days}&page={page}&limit={limit}
```

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `token` | string | 是 | - | 代币合约地址 |
| `days` | number | 否 | 7 | 查询天数 |
| `page` | number | 否 | 1 | 页码 |
| `limit` | number | 否 | 20 | 每页条数 |

### 响应结构

```json
{
  "status": "success",
  "win_rate_stats": {
    "total_count": 602,
    "success_count": 422,
    "failure_count": 27,
    "win_rate": 93.99
  },
  "data": [
    {
      "id": 905745,
      "token": "99RtLpiXfU57Xoedwnxg2D6UKjk8BsG3ES876z2kpump",
      "chain": "solana",
      "symbol": "BUDDY",
      "market_cap": "384439.46",
      "price_change_24h": "1058.8",
      "risk_score": "55",
      "holders": 1214,
      "launch_price": "0.00000001",
      "current_price_usd": "0.00038",
      "increase_data": -0.19,
      "max_price": "0.001",
      "qy_wxid": "wxid_xvn49ppq7qfd12",
      "qy_name": "佳奇",
      "qun_id": "48838324382@chatroom",
      "qun_name": "招财喵喵喵",
      "created_at": 1707823200,
      "description": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 602, "pages": 31 }
}
```

> **重要**: 响应中的 `win_rate_stats.win_rate` 使用了**错误公式** `success / (success + failure)`，忽略了 `total_count - success_count - failure_count` 个未结算代币。请自行使用 `success_count / total_count * 100` 计算修正胜率。

### CA 记录关键字段

| 字段 | 类型 | 说明 | 注意 |
|------|------|------|------|
| `id` | number | 记录 ID | |
| `token` | string | 合约地址 | |
| `chain` | string | 所在链 | `solana`, `bsc`, `eth` |
| `symbol` | string | 代币符号 | |
| `name` | string | 代币名称 | |
| `market_cap` | string | 市值 | |
| `fdv` | string | 全流通市值 | |
| `tvl` | string | 总锁仓值 | |
| `holders` | number | 持有人数 | |
| `risk_score` | string | 风险分数 | |
| `ave_risk_level` | number | 综合风险等级 | |
| `price_change_24h` | string | 24h 涨跌幅 | |
| `launch_price` | string | 发射价格 | 用于计算倍数 |
| `current_price_usd` | string | 当前价格 | 用于计算倍数 |
| `increase_data` | number | 收益倍数 | ⚠️ 可能为 0 或 null，需 fallback |
| `max_price` | string | 历史最高价 | 用于计算最高倍数 |
| `qy_wxid` | string | 群友微信 ID | |
| `qy_name` | string | 群友名称 | 可能含 emoji 乱码 |
| `qun_id` | string | 群 ID | |
| `qun_name` | string | 群名称 | 可能含 emoji 乱码 |
| `description` | string | 代币描述 | |
| `appendix` | object | 附加信息（含 twitter 等链接） | |
| `created_at` / `created` | number | 创建时间（Unix） | ⚠️ 字段名不一致，部分记录用 `created` |
| `updated_at` | number | 更新时间（Unix） | |

### 代码示例：获取群历史数据

```javascript
async function getGroupHistory(qunId, days = 30) {
  const allRecords = [];
  let page = 1;
  let winRateStats = null;

  while (true) {
    const url = `http://43.254.167.238:3000/api/v1/ca-records/group?qun_id=${encodeURIComponent(qunId)}&days=${days}&page=${page}&limit=100`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'success' || !data.data?.length) break;
    if (!winRateStats) winRateStats = data.win_rate_stats;

    allRecords.push(...data.data);
    if (page >= data.pagination.pages) break;
    page++;
  }

  // 使用修正后的胜率
  const correctedWinRate = winRateStats
    ? (winRateStats.success_count / winRateStats.total_count * 100).toFixed(1)
    : 0;

  console.log(`群 ${qunId}: ${allRecords.length} 条记录`);
  console.log(`修正胜率: ${correctedWinRate}% (原始: ${winRateStats?.win_rate}%)`);
  return allRecords;
}
```

### 代码示例：计算代币倍数（多层 fallback）

```javascript
function enrichMultiplier(record) {
  // 1. CA API increase_data
  if (record.increase_data && record.increase_data !== 0) {
    return record.increase_data;
  }
  // 2. current_price / launch_price
  const current = parseFloat(record.current_price_usd);
  const launch = parseFloat(record.launch_price);
  if (current > 0 && launch > 0) {
    const mult = current / launch;
    return mult < 0.01 ? parseFloat(mult.toFixed(6)) : parseFloat(mult.toFixed(2));
  }
  // 3. max_price / launch_price (最高倍数)
  const maxPrice = parseFloat(record.max_price);
  if (maxPrice > 0 && launch > 0) {
    return parseFloat((maxPrice / launch).toFixed(2));
  }
  return 0.01; // 最终默认值
}
```

---

## 注意事项

1. **连接稳定性**: WebSocket 为长连接，**必须**实现断线重连和心跳检测（5 分钟无数据强制重连）
2. **静默断连**: TCP 连接可能存活但不再推送数据，仅靠 `close` 事件不够，需要心跳超时检测
3. **数据频率**: 约每 3 秒推送一条数据，长时间运行需考虑内存和存储管理
4. **字段可空**: 部分字段可能为 `null`、空字符串、`"0"` 或不存在，请做好空值处理
5. **价格精度**: 价格字段为字符串类型，计算时需转换为数值。小数精度需注意 `toFixed()` 的舍入问题
6. **时间格式**: `sfsj`、`dqsj` 为中国时区（UTC+8）格式化字符串；`launch_at`、`created_at`、`updated_at` 为 Unix 时间戳
7. **风险分数**: `risk_score` 范围 0-100，越高越安全；`null` 表示未评估
8. **首发倍数**: `sfzf` 格式为 `"149.46x"`，使用前需 `parseFloat()` 提取数值
9. **胜率修正**: 原始 `sender_win_rate` 和 CA API 的 `win_rate` 严重虚高，必须使用 `success_count / total_count * 100` 修正
10. **首发人为空**: `sfr` 约 47% 为空，必须 fallback 到 `cxr` 或 `qy_name`
11. **Emoji 乱码**: `qun_name`、`sfr`、`cxr` 字段可能包含损坏的 Unicode 代理对，需要修复处理
12. **CA API 时间戳**: `created_at` 和 `created` 字段名不一致，取值时两个都要检查
13. **倍数为 0**: CA API 的 `increase_data` 可能为 0 或 null，需要多层 fallback 计算
14. **大数据量**: 历史数据 JSON 文件可能超过 400MB，处理时建议使用流式读写或 worker threads
15. **喊单去重**: WS 每 3 秒推送同一代币更新，记录喊单时间线需设置去重窗口（建议 60 秒）
