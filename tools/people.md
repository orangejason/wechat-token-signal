# Tool 1: People（人物信号）

围绕"谁在推荐"维度，提供成员画像、推荐历史、战绩统计和实时信号。

## Module 1: profile — 成员基础画像

**数据源**: HTTP
**端点**: `GET /api/v1/ca-records/member?name={name}`

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 成员名称 |

### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | 请求状态 (`"success"` / `"fail"`) |
| `win_rate_stats.total_count` | number | 推荐代币总数 |
| `win_rate_stats.success_count` | number | 盈利代币数 |
| `win_rate_stats.failure_count` | number | 亏损代币数 |
| `win_rate_stats.win_rate` | string | 胜率（⚠️ 需修正） |

### WS 识别字段

| 字段 | 类型 | 说明 | 注意 |
|------|------|------|------|
| `sfr` | string | 推荐人 | ⚠️ 约 47% 为空 |
| `cxr` | string | 查询人 | 可能含 emoji 乱码 |
| `qy_wxid` | string | 群友微信 ID | |
| `qy_name` | string | 群友名称 | 可能含 emoji 乱码 |

### 用户识别 Fallback

```javascript
const caller = token.sfr || token.cxr || token.qy_name || '未知';
```

---

## Module 2: history — 推荐历史记录

**数据源**: HTTP
**端点**: `GET /api/v1/ca-records/member?name={name}`

### 响应 records[] 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 记录 ID |
| `token` | string | 代币合约地址 |
| `chain` | string | 所在链 |
| `name` | string | 代币名称 |
| `symbol` | string | 代币符号 |
| `logo_url` | string | Logo URL |
| `current_price_usd` | string | 当前价格(USD) |
| `market_cap` | string | 市值 |
| `fdv` | string | 完全稀释估值 |
| `price_change_24h` | number | 24h 涨跌幅(%) |
| `tx_volume_u_24h` | string | 24h 交易量(USD) |
| `holders` | number | 持有人数 |
| `risk_level` | number | 风险等级 |
| `is_honeypot` | string | 是否蜜罐 |
| `is_lp_not_locked` | string/null | LP 未锁定 |
| `has_mint_method` | string/null | 有 mint 方法 |
| `is_in_blacklist` | string/null | 在黑名单 |
| `token_price_change_5m` | number | 5m 价格变化 |
| `token_buy_tx_count_5m` | number | 5m 买入笔数 |
| `token_sell_tx_count_5m` | number | 5m 卖出笔数 |
| `bundle_wallet_rate` | number/null | 捆绑钱包比例 |
| `insider_wallet_rate` | number/null | 内部人钱包比例 |
| `cluster_wallet_rate` | number/null | 聚集钱包比例 |
| `twitter` | string | Twitter 链接 |
| `website` | string | 官网链接 |
| `qun_name` | string | 推荐所在群名 |
| `created` | string | 记录时间（⚠️ 非 `created_at`） |

---

## Module 3: performance — 战绩与胜率统计

**数据源**: HTTP + WS

### HTTP 统计字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `win_rate_stats.total_count` | number | 推荐代币总数 |
| `win_rate_stats.success_count` | number | 盈利代币数 |
| `win_rate_stats.failure_count` | number | 亏损代币数 |
| `win_rate_stats.win_rate` | string | 胜率 ⚠️ |

### WS 统计字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `sender_total_tokens` | number | 推荐代币总数 |
| `sender_win_tokens` | string | 盈利代币数 |
| `sender_win_rate` | string | 胜率(%) ⚠️ |
| `sender_best_multiple` | string | 历史最佳倍数 |

### ⚠️ 胜率修正

API 和 WS 使用 `success/(success+failure)` 忽略未结算代币，胜率虚高到 90%+。

```javascript
// 正确公式
const correctRate = (success_count / total_count * 100).toFixed(1);
// 小样本修正
const cappedRate = total_count < 20 ? Math.min(correctRate, 85) : correctRate;
```

### 人物分级

| 等级 | 条件 |
|------|------|
| S 级 | 修正胜率 > 65% 且推荐 > 100 且最佳 > 1000x |
| A 级 | 修正胜率 > 55% 且推荐 > 50 |
| B 级 | 修正胜率 > 45% 且推荐 > 20 |
| C 级 | 其他 |

---

## Module 4: realtime — 实时推荐信号

**数据源**: WS
**端点**: `ws://43.254.167.238:3000/token`

### WS 字段

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

### 示例代码

```javascript
ws.on('message', (data) => {
  const t = JSON.parse(data);
  const caller = t.sfr || t.cxr || t.qy_name || '未知';
  const winTokens = parseInt(t.sender_win_tokens) || 0;
  const totalTokens = t.sender_total_tokens || 0;
  const correctedWinRate = totalTokens > 0 ? (winTokens / totalTokens * 100).toFixed(1) : '0';

  console.log(`来源: ${caller} | 修正胜率: ${correctedWinRate}% | 推荐: ${t.symbol}`);
});
```
