---
name: wechat-token-signal
description: "实时推送链上代币数据的 WebSocket Skill，包含微信社群首发信号、价格变动、交易量、风险评估、市值等 126 个字段。支持 BSC / Solana 等多链代币实时监控，核心亮点为微信社群首发数据（首发人、首发社群、首发倍数、发射后最高倍数），是发现早期 Meme 代币的关键数据源。"
license: MIT
metadata:
  author: SmallClaw
  version: "1.0.0"
  homepage: "https://github.com/orangejason/wechat-token-signal"
---

# WeChat Token Signal API

实时 WebSocket 推送链上代币完整快照，**126 个字段**覆盖代币基础信息、价格、交易量、市值、风险评估、LP 流动性和**微信社群首发数据**。

**WebSocket URL**: `ws://43.254.167.238:3000/token`

**推送频率**: 约每 3 秒推送一条代币完整快照（JSON 格式）

**无需认证**: 直接连接即可接收数据，无需 API Key

---

## 目录

1. [快速开始](#快速开始)
2. [微信社群首发数据（核心）](#微信社群首发数据核心)
3. [数据字段完整索引](#数据字段完整索引)
4. [字段详细说明](#字段详细说明)
5. [代码示例](#代码示例)
6. [数据应用场景](#数据应用场景)
7. [注意事项](#注意事项)

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

### 数据格式

每条推送为一个 JSON 对象，代表一个代币的完整快照：

```json
{
  "token": "0x53a3fbc07f52ccec...",
  "chain": "bsc",
  "symbol": "LABUBU",
  "current_price_usd": "0.0020105",
  "market_cap": "1985428.97",
  "sfr": "999swap推送",
  "sfsj": "2026-02-13 14:02:53",
  "sfqy": "999swap 官方禁言通知群",
  "sfzf": "149.46x",
  "fshzf": "14946.40",
  "risk_score": "55",
  "holders": 178178
}
```

---

## 微信社群首发数据（核心）

微信社群首发数据是本 Skill 最核心的数据维度，记录了代币在微信社群中被首次发现和推荐的完整信息，是发现早期 Alpha 代币的关键信号。

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `qun_name` | string | 首发微信群名称 | `"999swap 官方禁言通知群"` |
| `qun_id` | string | 微信群 ID | `"1074947846"` |
| `sfr` | string | **首发人** — 最早在微信群中推荐该代币的人 | `"999swap推送"` |
| `sfsj` | string | **首发时间** — 代币首次在微信群出现的时间 | `"2026-02-13 14:02:53"` |
| `sfqy` | string | **首发社群** — 代币最早出现的微信社群 | `"999swap 官方禁言通知群"` |
| `sfzf` | string | **首发至今倍数** — 从首发价到当前价的涨幅倍数 | `"149.46x"` |
| `fshzf` | string | **发射后最高倍数** — 代币发射后达到的历史最高倍数 | `"14946.40"` |
| `sfxx` | string | **首发信息汇总** — 包含首发人、最高倍数、当前倍数、市值变化的完整摘要 | 见下方 |
| `wx_id` | string | 微信数据 ID | `"2008471"` |
| `qy_wxid` | string | 首发群友微信 ID | `"3914182909"` |
| `qy_name` | string | 首发群友名称 | `"999swap推送"` |
| `zfzgzf` | string | 最高倍数含描述 | `"2996.83x."` |

### 首发信息汇总示例 (`sfxx`)

```
首发大神: 999swap推送
├ 最高:2996.83x.现在:149.46x
├ 变化: $13K → $2M
└ 首间: 2026-02-13 14:02:53
```

### 首发人战绩统计

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `sender_total_tokens` | number | 该首发人历史推荐代币总数 | `350` |
| `sender_win_tokens` | string | 推荐成功（盈利）的代币数 | `"345"` |
| `sender_win_rate` | string | 推荐胜率（百分比） | `"98.6"` |
| `sender_best_multiple` | string | 历史最佳倍数 | `"6708.13"` |

### 查询人信息

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `cxr` | string | 最近查询该代币的用户昵称 | `"米多多💰¹³¹⁴-发财版"` |
| `cxrxx` | string | 查询人详细信息 | `"查询人: 米多多💰¹³¹⁴-发财版 (4)\n└ 首查后 0.01x 现 -0.95x"` |
| `cxrzf` | string | 查询后至今涨幅 | `"-0.95x"` |
| `zgzf` | string | 查询后最高涨幅 | `"0.01x"` |
| `grcxcs` | number | 个人查询次数 | `4` |

---

## 数据字段完整索引

### 1. 代币基础信息

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
| `issue_platform` | string | 发射平台（如 `four_meme`） |
| `launch_at` | number | 发射时间（Unix 时间戳） |
| `created_at` | number | 创建时间（Unix 时间戳） |
| `updated_at` | number | 最后更新时间（Unix 时间戳） |
| `dqsj` | string | 当前时间（格式化字符串） |
| `progress` | string | 进度百分比（如 `"100.00"` 表示已完成） |
| `statusText` | string | 状态文本（如 `"状态:已发射"`） |

### 2. 价格数据

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

### 3. 交易量数据

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

### 4. 买入数据

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

### 5. 卖出数据

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

### 6. 市值与流动性

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

### 7. 交易对信息

| 字段 | 类型 | 说明 |
|------|------|------|
| `main_pair` | string | 主交易对合约地址 |
| `token0_symbol` | string | 交易对 Token0 符号 |
| `token1_symbol` | string | 交易对 Token1 符号 |
| `reserve0` | string | Token0 储备量 |
| `reserve1` | string | Token1 储备量 |

### 8. 风险评估

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
| `phishing_wallet_rate` | number/null | 钓鱼钱包比例 |
| `bundle_wallet_rate` | number/null | 捆绑钱包比例 |
| `insider_wallet_rate` | number/null | 内部人钱包比例 |
| `cluster_wallet_rate` | number/null | 聚集钱包比例 |
| `rag_risk_rate` | number/null | RAG 风险比例 |
| `rug_risk_rate` | number/null | Rug Pull 风险比例 |

### 9. 代币供应分布

| 字段 | 类型 | 说明 |
|------|------|------|
| `lock_amount` | string | 锁仓数量 |
| `burn_amount` | string | 销毁数量 |
| `other_amount` | string | 其他分配数量 |
| `locked_percent` | string | 锁仓百分比 |
| `zbbl` | string | 前 10 持仓比例（以 `\|` 分隔） |
| `zzb` | string | 前 10 合计占比（%） |

### 10. 社区热度指标

| 字段 | 类型 | 说明 |
|------|------|------|
| `cazs` | number | 查询热度指数 |
| `sqzs` | number | 社群热度指数 |
| `bqfc` | number | 本群分享次数 |
| `qwfc` | number | 全网分享次数 |
| `fgq` | number | 覆盖群数 |
| `jy` | number | 交易标记 |
| `xwb` | string | 新闻播报 |

### 11. 社交链接

| 字段 | 类型 | 说明 |
|------|------|------|
| `twitter` | string | Twitter/X 链接 |
| `website` | string | 官网链接 |
| `isTwitter` | string | 是否有 Twitter（✅/❌） |
| `isWebsite` | string | 是否有官网（✅/❌） |

---

## 字段详细说明

### 微信社群首发缩写对照表

| 缩写 | 全称 | 说明 |
|------|------|------|
| `sfr` | 首发人 | 最早在微信群推荐该代币的人 |
| `sfsj` | 首发时间 | 代币首次在微信群出现的时间 |
| `sfqy` | 首发社群 | 代币最早出现的微信社群名称 |
| `sfzf` | 首发至今倍数 | 从首发时价格到当前价格的倍数 |
| `fshzf` | 发射后最高倍数 | 代币从发射到历史最高价的倍数 |
| `sfxx` | 首发信息 | 完整的首发信息摘要 |
| `zfzgzf` | 至今最高倍数 | 最高倍数含文字描述 |
| `dqsj` | 当前时间 | 数据快照时间 |
| `cazs` | 查询指数 | 被查询的热度 |
| `sqzs` | 社群指数 | 在微信社群中的热度 |
| `bqfc` | 本群分享次数 | 在当前群的分享数 |
| `qwfc` | 全网分享次数 | 全部微信群的分享数 |
| `fgq` | 覆盖群数 | 该代币被分享到的群总数 |
| `zbbl` | 占比比例 | 前 10 大持仓地址各自占比 |
| `zzb` | 总占比 | 前 10 大持仓合计占比 |
| `cxr` | 查询人 | 最近查询该代币的人 |
| `cxrzf` | 查询人至今倍数 | 查询后到现在的涨幅 |
| `zgzf` | 最高涨幅 | 查询后的最高涨幅 |
| `grcxcs` | 个人查询次数 | 该用户查询该代币的次数 |

### 持仓分布 (`zbbl`) 解析

`zbbl` 字段以 `|` 分隔，表示前 10 大持仓地址的占比：

```
"0.38|0.03|0.02|0.01|0.01|0.01|0.01|0.01|0.01|0.01"
```

解析示例：

```javascript
const zbbl = token.zbbl.split('|').map(Number);
// [0.38, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
// 第一名持仓 0.38%，前10合计 zzb = 50.79%
```

### 附加信息 (`appendix`) 解析

`appendix` 是一个 JSON 字符串，包含代币的社交媒体、官网等扩展信息：

```javascript
const info = JSON.parse(token.appendix);
// info.twitter → "https://x.com/..."
// info.telegram → "https://t.me/..."
// info.description → 代币完整描述
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

  // 筛选：首发至今超过 10 倍的代币
  if (multiple >= 10) {
    console.log(`🔥 ${token.symbol}`);
    console.log(`   合约: ${token.token}`);
    console.log(`   链: ${token.chain}`);
    console.log(`   首发倍数: ${token.sfzf}`);
    console.log(`   最高倍数: ${token.fshzf}x`);
    console.log(`   首发人: ${token.sfr}`);
    console.log(`   首发社群: ${token.sfqy}`);
    console.log(`   首发时间: ${token.sfsj}`);
    console.log(`   当前价: $${token.current_price_usd}`);
    console.log(`   市值: $${token.new_market_cap_format}`);
    console.log(`   持有人: ${token.holders}`);
    console.log(`   风险分: ${token.risk_score}`);
    console.log('---');
  }
});
```

### 2. 高胜率首发人追踪

```javascript
ws.on('message', (data) => {
  const token = JSON.parse(data);
  const winRate = parseFloat(token.sender_win_rate);
  const totalTokens = token.sender_total_tokens;

  // 筛选胜率 > 90% 且推荐超过 50 个代币的首发人
  if (winRate > 90 && totalTokens > 50) {
    console.log(`⭐ 优质首发人: ${token.sfr}`);
    console.log(`   胜率: ${token.sender_win_rate}%`);
    console.log(`   推荐总数: ${totalTokens}`);
    console.log(`   最佳倍数: ${token.sender_best_multiple}x`);
    console.log(`   本次推荐: ${token.symbol} (${token.sfzf})`);
  }
});
```

### 3. 风险筛选过滤

```javascript
ws.on('message', (data) => {
  const token = JSON.parse(data);

  // 安全条件
  const isSafe =
    parseInt(token.risk_score) >= 60 &&    // 风险分 >= 60
    token.is_mintable === '0' &&            // 不可增发
    token.is_honeypot !== '1' &&            // 非蜜罐
    token.holders > 100 &&                  // 持有人 > 100
    parseFloat(token.locked_percent) > 0;   // 有锁仓

  if (isSafe) {
    console.log(`✅ 安全代币: ${token.symbol} | 风险分: ${token.risk_score}`);
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

  // 5 分钟内买入量是卖出量的 3 倍以上
  if (ratio >= 3 && buyVol5m > 100) {
    console.log(`📈 强势买入: ${token.symbol}`);
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
                'sqzs': t.get('sqzs', 0),       # 社群热度
                'cazs': t.get('cazs', 0),       # 查询热度
                'qwfc': t.get('qwfc', 0),       # 全网分享次数
                'fgq': t.get('fgq', 0),         # 覆盖群数
                'sfzf': t.get('sfzf', '0x'),    # 首发倍数
                'chain': t.get('chain', ''),
            }

            # 每 100 条数据输出一次排行
            if len(token_heat) % 100 == 0:
                ranked = sorted(token_heat.items(),
                    key=lambda x: x[1].get('sqzs', 0), reverse=True)
                print("\n=== 社群热度 TOP 10 ===")
                for i, (sym, data) in enumerate(ranked[:10]):
                    print(f"{i+1}. {sym} | 社群指数:{data['sqzs']} | "
                          f"覆盖{data['fgq']}群 | 倍数:{data['sfzf']}")

asyncio.run(track_community_heat())
```

---

## 数据应用场景

### 场景 1: 早期 Alpha 发现

利用微信社群首发数据，追踪高胜率首发人推荐的新代币：
- 筛选 `sender_win_rate > 90%` 的首发人
- 关注 `sfsj` 在 1 小时内的新首发代币
- 结合 `risk_score` 过滤高风险项目

### 场景 2: Meme 代币监控看板

实时展示代币核心指标：
- 价格变动（5m / 1h / 4h / 24h）
- 买卖力度对比
- 市值变化趋势
- 社群热度排名

### 场景 3: 风控预警系统

基于风险字段构建实时预警：
- `is_honeypot` 蜜罐检测
- `phishing_wallet_rate` / `bundle_wallet_rate` 异常钱包比例
- `rug_risk_rate` Rug Pull 风险
- `zbbl` 持仓集中度

### 场景 4: 社群信号聚合

跨多个微信社群聚合信号：
- `fgq`（覆盖群数）反映代币在社群中的扩散速度
- `qwfc`（全网分享次数）衡量传播广度
- `sqzs`（社群指数）量化社群热度

---

## 注意事项

1. **连接稳定性**: WebSocket 为长连接，建议实现断线重连机制
2. **数据频率**: 约每 3 秒推送一条数据，需考虑处理性能
3. **字段可空**: 部分字段可能为 `null`、空字符串或不存在，请做好空值处理
4. **价格精度**: 价格字段为字符串类型，计算时需转换为数值
5. **时间格式**: `sfsj`、`dqsj` 为中国时区（UTC+8）格式化字符串，`launch_at`、`created_at`、`updated_at` 为 Unix 时间戳
6. **风险分数**: `risk_score` 范围 0-100，越高越安全；部分风险字段可能为 `null` 表示未评估
7. **首发倍数**: `sfzf` 格式为 `"149.46x"`，使用前需 `parseFloat()` 提取数值
