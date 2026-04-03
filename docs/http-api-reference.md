# HTTP REST API 参考

## 基础信息

| 项目 | 值 |
|------|-----|
| 协议 | HTTP |
| 基础 URL | `http://43.254.167.238:3000/api/v1/ca-records` |
| 认证 | 无需认证 |
| 数据格式 | JSON |

## 端点列表

| 端点 | 说明 | 对应 Tool |
|------|------|-----------|
| `/member?name={name}` | 查询成员的推荐历史和胜率 | People |
| `/group?name={name}` | 查询群组的推荐历史和胜率 | Groups |
| `/token?token={ca}` | 查询代币被推荐的完整历史 | Tokens |

---

## 1. Member（成员查询）

### 请求

```
GET /api/v1/ca-records/member?name={name}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 成员名称（URL 编码） |

### 响应

```json
{
  "status": "success",
  "win_rate_stats": {
    "total_count": 350,
    "success_count": 210,
    "failure_count": 85,
    "win_rate": "71.2"
  },
  "records": [
    {
      "id": 12345,
      "token": "0x53a3fbc07f52ccec...",
      "chain": "bsc",
      "name": "Labubu Token",
      "symbol": "LABUBU",
      "logo_url": "https://...",
      "current_price_usd": "0.0020105",
      "market_cap": "1985428.97",
      "fdv": "2010500.00",
      "price_change_24h": 15.3,
      "tx_volume_u_24h": "125000",
      "holders": 178178,
      "risk_level": 2,
      "is_honeypot": "0",
      "is_lp_not_locked": null,
      "has_mint_method": null,
      "is_in_blacklist": null,
      "token_price_change_5m": 2.5,
      "token_buy_tx_count_5m": 15,
      "token_sell_tx_count_5m": 3,
      "bundle_wallet_rate": 0.05,
      "insider_wallet_rate": null,
      "cluster_wallet_rate": null,
      "twitter": "https://x.com/...",
      "website": "https://...",
      "qun_name": "999swap 官方群",
      "created": "2026-02-13T06:02:53.000Z"
    }
  ]
}
```

### 响应字段详解

**全局字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | `"success"` 或 `"fail"` |

**胜率统计 `win_rate_stats`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `total_count` | number | 推荐代币总数 |
| `success_count` | number | 盈利代币数（`increase_data > 0`） |
| `failure_count` | number | 亏损代币数（`increase_data < 0`） |
| `win_rate` | string | 胜率 ⚠️ 使用 `success/(success+failure)` 错误公式 |

**记录 `records[]`**:

| 分类 | 字段 | 类型 | 说明 |
|------|------|------|------|
| 代币核心 | `id` | number | 记录 ID |
| 代币核心 | `token` | string | 合约地址 |
| 代币核心 | `chain` | string | 所在链 |
| 代币核心 | `name` | string | 代币名称 |
| 代币核心 | `symbol` | string | 代币符号 |
| 代币核心 | `logo_url` | string | Logo URL |
| 市场数据 | `current_price_usd` | string | 当前价格(USD) |
| 市场数据 | `market_cap` | string | 市值 |
| 市场数据 | `fdv` | string | 完全稀释估值 |
| 市场数据 | `price_change_24h` | number | 24h 涨跌幅(%) |
| 市场数据 | `tx_volume_u_24h` | string | 24h 交易量(USD) |
| 市场数据 | `holders` | number | 持有人数 |
| 风险 | `risk_level` | number | 风险等级 |
| 风险 | `is_honeypot` | string | 蜜罐 (`"0"` / `"1"`) |
| 风险 | `is_lp_not_locked` | string/null | LP 未锁定 |
| 风险 | `has_mint_method` | string/null | 有 mint 方法 |
| 风险 | `is_in_blacklist` | string/null | 在黑名单 |
| 实时指标 | `token_price_change_5m` | number | 5m 价格变化 |
| 实时指标 | `token_buy_tx_count_5m` | number | 5m 买入笔数 |
| 实时指标 | `token_sell_tx_count_5m` | number | 5m 卖出笔数 |
| 实时指标 | `bundle_wallet_rate` | number/null | 捆绑钱包比例 |
| 实时指标 | `insider_wallet_rate` | number/null | 内部人钱包比例 |
| 实时指标 | `cluster_wallet_rate` | number/null | 聚集钱包比例 |
| 附加信息 | `twitter` | string | Twitter 链接 |
| 附加信息 | `website` | string | 官网链接 |
| 附加信息 | `qun_name` | string | 推荐所在群名 |
| 附加信息 | `created` | string | 记录时间 |

---

## 2. Group（群组查询）

### 请求

```
GET /api/v1/ca-records/group?name={name}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 群名称（URL 编码） |

### 响应

与 Member 响应结构完全一致（`status` + `win_rate_stats` + `records[]`），`records` 返回该群内所有代币推荐记录。

---

## 3. Token（代币查询）

### 请求

```
GET /api/v1/ca-records/token?token={ca}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `token` | string | 是 | 代币合约地址 |

### 响应

与 Member 响应结构完全一致（`status` + `win_rate_stats` + `records[]`），`records` 返回该代币被所有群/人推荐的完整历史。每条 record 的 `qun_name` 字段标明推荐来自哪个群。

---

## 通用注意事项

### 胜率修正

所有端点的 `win_rate_stats.win_rate` 使用错误公式 `success/(success+failure)`，忽略未结算代币。

```javascript
// 正确公式
const correctRate = (win_rate_stats.success_count / win_rate_stats.total_count * 100).toFixed(1);
```

### 时间戳字段

- `created_at` — 代币创建时间（同一代币所有记录相同）
- `created` — 个别记录的推荐时间（每条记录不同）

查询推荐时间应使用 `created`，不要使用 `created_at`。

### 请求示例

```bash
# 查询成员
curl "http://43.254.167.238:3000/api/v1/ca-records/member?name=999swap%E6%8E%A8%E9%80%81"

# 查询群组
curl "http://43.254.167.238:3000/api/v1/ca-records/group?name=999swap%E5%AE%98%E6%96%B9%E7%BE%A4"

# 查询代币
curl "http://43.254.167.238:3000/api/v1/ca-records/token?token=0x53a3fbc07f52ccec"
```

### 错误处理

- API 可能偶尔返回 "Gone" 状态（服务器临时不可用），建议实现重试
- 大量数据（如高频推荐人）返回可能较慢，建议设置 30 秒超时
