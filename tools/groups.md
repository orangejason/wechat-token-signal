# Tool 2: Groups（群组信号）

围绕"哪个群在讨论"维度，提供群组画像、推荐历史、热度排行和实时信号。

## Module 1: profile — 群组基础信息

**数据源**: HTTP
**端点**: `GET /api/v1/ca-records/group?name={name}`

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 群名称 |

### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | 请求状态 (`"success"` / `"fail"`) |
| `win_rate_stats.total_count` | number | 群内推荐代币总数 |
| `win_rate_stats.success_count` | number | 盈利代币数 |
| `win_rate_stats.failure_count` | number | 亏损代币数 |
| `win_rate_stats.win_rate` | string | 群胜率（⚠️ 需修正） |

### WS 群标识字段

| 字段 | 类型 | 说明 | 注意 |
|------|------|------|------|
| `qun_name` | string | 群名称 | ⚠️ 可能含 emoji 乱码 |
| `qun_id` | string | 群唯一标识 | 格式: `数字@chatroom` |
| `wx_id` | string | 微信数据 ID | |

---

## Module 2: history — 群推荐历史

**数据源**: HTTP
**端点**: `GET /api/v1/ca-records/group?name={name}`

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
| `created` | string | 记录时间 |

---

## Module 3: ranking — 群热度排行

**数据源**: WS（需自行累积数据）
**端点**: `ws://43.254.167.238:3000/token`

### WS 热度字段

| 字段 | 类型 | 说明 | 注意 |
|------|------|------|------|
| `sqzs` | number | 社群热度指数 | 综合热度分 |
| `cazs` | number | 查询热度指数 | 被查询频率 |
| `bqfc` | number | 本群分享次数 | ⚠️ 仅当前群，非全网 |
| `qwfc` | number | 全网覆盖次数 | 跨群累加总次数 |
| `fgq` | number | 覆盖群数 | 不重复群数量 |

> **关键区分**: `bqfc` = 单群次数，`qwfc` = 全网总次数，`fgq` = 不重复群数。

### 热度排行算法

```python
heat_score = sqzs * 0.4 + fgq * 10 * 0.3 + qwfc * 0.2 + cazs * 0.1
```

### 信号扩散阶段

| 阶段 | 条件 | 说明 |
|------|------|------|
| 萌芽期 | `fgq <= 2` | 1-2 个群出现 |
| 扩散期 | `fgq` 3-10 | 多群传播 |
| 爆发期 | `fgq > 10` | `sqzs` 飙升 |
| 衰退期 | 新分享减少 | `cazs` 下降 |

---

## Module 4: realtime — 群实时信号

**数据源**: WS
**端点**: `ws://43.254.167.238:3000/token`

### WS 字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `qun_name` | string | 群名称 | `"999swap 官方禁言通知群"` |
| `qun_id` | string | 群 ID | `"48838324382@chatroom"` |
| `sfqy` | string | 推荐所在社群 | `"999swap 官方禁言通知群"` |
| `bqfc` | number | 本群分享次数 | `3` |
| `qwfc` | number | 全网覆盖次数 | `87` |
| `fgq` | number | 覆盖群数 | `12` |
| `sqzs` | number | 社群热度指数 | `88` |
| `cazs` | number | 查询热度指数 | `15` |

### 示例代码

```javascript
const groupStats = {};

ws.on('message', (data) => {
  const t = JSON.parse(data);
  const group = t.qun_name || t.sfqy;
  if (!group) return;

  if (!groupStats[group]) groupStats[group] = { tokens: new Set(), mentions: 0 };
  groupStats[group].tokens.add(t.token);
  groupStats[group].mentions++;
  groupStats[group].sqzs = t.sqzs || 0;
  groupStats[group].fgq = t.fgq || 0;
});
```
