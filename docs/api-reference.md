# API 完整参考文档

## 连接信息

| 项目 | 值 |
|------|-----|
| 协议 | WebSocket |
| 地址 | `ws://43.254.167.238:3000/token` |
| 认证 | 无需认证，直接连接 |
| 推送频率 | 约每 3 秒一条 |
| 数据格式 | JSON |
| 编码 | UTF-8 |

## 连接方式

WebSocket 长连接，连接后自动接收推送数据，无需发送订阅消息。

```javascript
const ws = new WebSocket('ws://43.254.167.238:3000/token');
```

## 数据格式

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

## 断线重连

WebSocket 为长连接，建议实现断线重连：

```javascript
function connect() {
  const ws = new WebSocket('ws://43.254.167.238:3000/token');
  ws.on('close', () => {
    console.log('连接断开，5秒后重连...');
    setTimeout(connect, 5000);
  });
  ws.on('error', (err) => {
    console.error('连接错误:', err.message);
    ws.close();
  });
  ws.on('message', (data) => {
    const token = JSON.parse(data);
    // 处理数据...
  });
}
connect();
```

---

## 完整字段列表

### 1. 代币基础信息（18 字段）

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `token` | string | 代币合约地址 | `"0x53a3fbc07f52ccec..."` |
| `chain` | string | 所在链 | `"bsc"`, `"solana"`, `"eth"` |
| `symbol` | string | 代币符号 | `"LABUBU"` |
| `name` | string | 代币名称 | `"Labubu Token"` |
| `decimal` | number | 精度位数 | `18` |
| `total` | string | 总供应量 | `"1000000000"` |
| `holders` | number | 持有人数 | `178178` |
| `logo_url` | string | Logo 图片 URL | `"https://..."` |
| `description` | string | 代币描述 | `"AI生成的描述"` |
| `intro_cn` | string | 中文简介 | |
| `intro_en` | string | 英文简介 | |
| `appendix` | string | 附加信息（JSON字符串） | 见下方 |
| `issue_platform` | string | 发射平台 | `"four_meme"`, `"pump_fun"` |
| `launch_at` | number | 发射时间（Unix） | `1707823200` |
| `created_at` | number | 创建时间（Unix） | `1707820000` |
| `updated_at` | number | 更新时间（Unix） | `1707830000` |
| `dqsj` | string | 当前时间（UTC+8格式化） | `"2026-02-13 15:00:00"` |
| `progress` | string | 进度百分比 | `"100.00"` |
| `statusText` | string | 状态文本 | `"状态:已发射"` |

#### `appendix` 解析

```javascript
const info = JSON.parse(token.appendix);
// info.twitter → "https://x.com/..."
// info.telegram → "https://t.me/..."
// info.website → "https://..."
// info.description → 完整描述
```

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
| `volume_u_24h_format` | string | 24h 交易量格式化 |

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
| `tvl` | string | 总锁仓价值（格式化） |
| `tvl1` | string | 配对代币 TVL |
| `main_pair_tvl` | string | 主交易对 TVL |
| `old_market_cap` | string | 首发时市值 |
| `new_market_cap` | string | 当前市值 |
| `old_market_cap_format` | string | 首发市值格式化 |
| `new_market_cap_format` | string | 当前市值格式化 |

### 7. 交易对信息（5 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `main_pair` | string | 主交易对合约地址 |
| `token0_symbol` | string | Token0 符号 |
| `token1_symbol` | string | Token1 符号 |
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
| `phishing_wallet_rate` | number/null | 钓鱼钱包比例 |
| `bundle_wallet_rate` | number/null | 捆绑钱包比例 |
| `insider_wallet_rate` | number/null | 内部人钱包比例 |
| `cluster_wallet_rate` | number/null | 聚集钱包比例 |
| `rag_risk_rate` | number/null | RAG 风险比例 |
| `rug_risk_rate` | number/null | Rug Pull 风险比例 |

### 9. 代币供应分布（6 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `lock_amount` | string | 锁仓数量 |
| `burn_amount` | string | 销毁数量 |
| `other_amount` | string | 其他分配数量 |
| `locked_percent` | string | 锁仓百分比 |
| `zbbl` | string | 前 10 持仓比例（`\|` 分隔） |
| `zzb` | string | 前 10 合计占比（%） |

### 10. 微信社群首发数据（20 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `qun_name` | string | 首发微信群名称 |
| `qun_id` | string | 微信群 ID |
| `sfr` | string | 首发人 |
| `sfsj` | string | 首发时间 |
| `sfqy` | string | 首发社群 |
| `sfzf` | string | 首发至今倍数 |
| `fshzf` | string | 发射后最高倍数 |
| `sfxx` | string | 首发信息汇总 |
| `wx_id` | string | 微信数据 ID |
| `qy_wxid` | string | 首发群友微信 ID |
| `qy_name` | string | 首发群友名称 |
| `zfzgzf` | string | 最高倍数含描述 |
| `sender_total_tokens` | number | 首发人推荐代币总数 |
| `sender_win_tokens` | string | 推荐成功代币数 |
| `sender_win_rate` | string | 推荐胜率（%） |
| `sender_best_multiple` | string | 历史最佳倍数 |
| `cxr` | string | 最近查询人 |
| `cxrxx` | string | 查询人详细信息 |
| `cxrzf` | string | 查询后至今涨幅 |
| `zgzf` | string | 查询后最高涨幅 |

### 11. 社区热度指标（7 字段）

| 字段 | 类型 | 说明 |
|------|------|------|
| `cazs` | number | 查询热度指数 |
| `sqzs` | number | 社群热度指数 |
| `bqfc` | number | 本群分享次数 |
| `qwfc` | number | 全网分享次数 |
| `fgq` | number | 覆盖群数 |
| `jy` | number | 交易标记 |
| `xwb` | string | 新闻播报 |

### 12. 社交链接

| 字段 | 类型 | 说明 |
|------|------|------|
| `twitter` | string | Twitter/X 链接 |
| `website` | string | 官网链接 |
| `isTwitter` | string | 是否有 Twitter |
| `isWebsite` | string | 是否有官网 |

---

## 注意事项

1. **连接稳定性**: 建议实现断线重连（参见上方示例）
2. **数据频率**: 约每 3 秒推送一条，需考虑处理性能
3. **字段可空**: 部分字段可能为 `null`、空字符串或不存在
4. **价格精度**: 价格字段为 string 类型，计算时需转数值
5. **时间格式**: `sfsj`/`dqsj` 为 UTC+8 格式化字符串；`launch_at`/`created_at`/`updated_at` 为 Unix 时间戳
6. **风险分数**: 0-100，越高越安全；`null` 表示未评估
7. **首发倍数**: `sfzf` 格式为 `"149.46x"`，需 `parseFloat()` 提取数值
