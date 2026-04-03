# Tool 3: Tokens（代币信号）

围绕"哪个币被关注"维度，提供代币概览、市场数据、风险评估、社群信号和实时推送。

## Module 1: overview — 代币综合概览

**数据源**: HTTP
**端点**: `GET /api/v1/ca-records/token?token={ca}`

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `token` | string | 是 | 代币合约地址 |

### 响应字段

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
| 风险 | `records[].is_lp_not_locked` | string/null | LP 未锁定 |
| 风险 | `records[].has_mint_method` | string/null | 有 mint 方法 |
| 风险 | `records[].is_in_blacklist` | string/null | 在黑名单 |
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

---

## Module 2: market — 市场与交易数据

**数据源**: WS
**端点**: `ws://43.254.167.238:3000/token`

### 价格数据

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

### 交易量数据

| 字段 | 类型 | 说明 |
|------|------|------|
| `tx_volume_u_24h` | string | 24h 交易量(USD) |
| `volume_u_5m` | number | 5m 交易量(USD) |
| `volume_u_1h` | number | 1h 交易量(USD) |
| `volume_u_4h` | number | 4h 交易量(USD) |
| `volume_u_24h` | number | 24h 交易量(USD) |

### 买入数据

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

### 卖出数据

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

### 市值与流动性

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

---

## Module 3: risk — 风险评估

**数据源**: WS
**端点**: `ws://43.254.167.238:3000/token`

### 风险字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `risk_score` | string | 综合风险分(0-100，越高越安全) |
| `risk_level` | number | 风险等级 |
| `ave_risk_level` | number | AVE 风险等级 |
| `is_mintable` | string | 可增发(`"0"`/`"1"`) |
| `is_honeypot` | string | 蜜罐(`"-1"`/`"0"`/`"1"`) |
| `is_in_blacklist` | string/null | 在黑名单 |
| `is_lp_not_locked` | string/null | LP 未锁定 |
| `has_mint_method` | string/null | 有 mint 方法 |
| `has_black_method` | string/null | 有黑名单方法 |
| `has_not_renounced` | string/null | 未放弃所有权 |
| `has_not_audited` | string/null | 未审计 |
| `has_not_open_source` | string/null | 未开源 |
| `phishing_wallet_rate` | number/null | 钓鱼钱包比例(0-1) |
| `bundle_wallet_rate` | number/null | 捆绑钱包比例(0-1) |
| `insider_wallet_rate` | number/null | 内部人钱包比例(0-1) |
| `cluster_wallet_rate` | number/null | 聚集钱包比例(0-1) |
| `rag_risk_rate` | number/null | RAG 风险比例(0-1) |
| `rug_risk_rate` | number/null | Rug Pull 风险比例(0-1) |

### 预警规则

| 规则 | 触发条件 | 风险等级 |
|------|----------|----------|
| 蜜罐 | `is_honeypot === '1'` | 极高 |
| 可增发 | `is_mintable === '1'` | 高 |
| 钓鱼钱包 | `phishing_wallet_rate > 0.1` | 高 |
| 捆绑钱包 | `bundle_wallet_rate > 0.2` | 高 |
| Rug Pull | `rug_risk_rate > 0.3` | 极高 |
| 持仓集中 | TOP1 `zbbl > 50%` | 高 |
| LP 未锁 | `is_lp_not_locked === '1'` | 中 |

### 综合安全评分

```javascript
function calcSafetyScore(token) {
  let score = parseInt(token.risk_score) || 0;
  if (token.is_honeypot === '1') score -= 50;
  if (token.is_mintable === '1') score -= 20;
  if (token.phishing_wallet_rate > 0.1) score -= 15;
  if (token.bundle_wallet_rate > 0.2) score -= 15;
  if (token.rug_risk_rate > 0.3) score -= 30;
  return Math.max(0, Math.min(100, score));
}
```

---

## Module 4: signal — 社群信号聚合

**数据源**: WS + HTTP

### WS 信号字段

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

### HTTP 端点

`GET /api/v1/ca-records/token?token={ca}` — 返回该代币被所有群/人推荐的完整历史。

### 倍数修正

`sfzf`/`fshzf` 可能缺失，需多层 fallback:

```javascript
let multiple = parseFloat(token.sfzf) || 0;
if (!multiple && token.current_price_usd && token.launch_price) {
  multiple = parseFloat(token.current_price_usd) / parseFloat(token.launch_price);
}
if (multiple < 0.001) multiple = 0.01;
// 小值精度
const display = multiple < 0.01 ? multiple.toFixed(6) : multiple.toFixed(2);
```

---

## Module 5: realtime — 实时完整推送

**数据源**: WS
**端点**: `ws://43.254.167.238:3000/token`

每条 WS 推送为一个 JSON 对象，约 126+ 字段的完整代币快照。

### 代币基础信息

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | 合约地址 |
| `chain` | string | 所在链 |
| `symbol` | string | 代币符号 |
| `name` | string | 代币名称 |
| `decimal` | number | 精度位数 |
| `total` | string | 总供应量 |
| `holders` | number | 持有人数 |
| `logo_url` | string | Logo URL |
| `description` | string | AI 描述 |
| `intro_cn` | string | 中文简介 |
| `intro_en` | string | 英文简介 |
| `appendix` | string | 附加信息(JSON) |
| `issue_platform` | string | 发射平台 |
| `launch_at` | number | 发射时间(Unix) |
| `created_at` | number | 创建时间(Unix) |
| `updated_at` | number | 更新时间(Unix) |
| `progress` | string | 进度(%) |

### 供应分布

| 字段 | 类型 | 说明 |
|------|------|------|
| `lock_amount` | string | 锁仓数量 |
| `burn_amount` | string | 销毁数量 |
| `other_amount` | string | 其他分配 |
| `locked_percent` | string | 锁仓百分比 |
| `zbbl` | string | 前10持仓比例(`\|`分隔) |
| `zzb` | string | 前10合计占比(%) |

### 交易对信息

| 字段 | 类型 | 说明 |
|------|------|------|
| `main_pair` | string | 主交易对地址 |
| `token0_symbol` | string | Token0 符号 |
| `token1_symbol` | string | Token1 符号 |
| `reserve0` | string | Token0 储备量 |
| `reserve1` | string | Token1 储备量 |

### 社交链接

| 字段 | 类型 | 说明 |
|------|------|------|
| `twitter` | string | Twitter/X 链接 |
| `website` | string | 官网链接 |
| `isTwitter` | string | 有 Twitter(`"✅"`/`"❌"`) |
| `isWebsite` | string | 有官网(`"✅"`/`"❌"`) |

### WS 推送示例

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
  "risk_score": "55",
  "holders": 178178
}
```

### 连接与心跳

```javascript
function connect() {
  const ws = new WebSocket('ws://43.254.167.238:3000/token');
  let lastMessage = Date.now();

  ws.on('message', (data) => {
    lastMessage = Date.now();
    const token = JSON.parse(data);
    // 处理完整快照...
  });

  ws.on('close', () => setTimeout(connect, 5000));
  ws.on('error', (err) => ws.close());

  // 5 分钟心跳检测
  const heartbeat = setInterval(() => {
    if (Date.now() - lastMessage > 5 * 60 * 1000) {
      clearInterval(heartbeat);
      ws.terminate();
    }
  }, 60000);

  ws.on('close', () => clearInterval(heartbeat));
}
connect();
```
