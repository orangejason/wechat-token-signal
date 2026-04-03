# WebSocket 实时数据格式

## 连接信息

| 项目 | 值 |
|------|-----|
| 协议 | WebSocket |
| 地址 | `ws://43.254.167.238:3000/token` |
| 认证 | 无需认证，直接连接 |
| 推送频率 | 约每 3 秒一条 |
| 数据格式 | JSON |
| 编码 | UTF-8 |

## 数据特点

- 每条推送为一个 JSON 对象，代表一个代币的**完整快照**（126+ 字段）
- 连接后自动接收推送，无需发送订阅消息
- 数据为实时快照，不包含历史。需自行累积建立时间线
- 同一代币可能在短时间内多次推送（不同群/人触发）

## 推送示例

```json
{
  "token": "0x53a3fbc07f52ccec...",
  "chain": "bsc",
  "symbol": "LABUBU",
  "name": "Labubu Token",
  "current_price_usd": "0.0020105",
  "launch_price": "0.00000001346",
  "market_cap": "1985428.97",
  "fdv": "2010500.00",
  "holders": 178178,
  "risk_score": "55",
  "sfr": "999swap推送",
  "sfsj": "2026-02-13 14:02:53",
  "sfqy": "999swap 官方禁言通知群",
  "sfzf": "149.46x",
  "fshzf": "14946.40",
  "qwfc": 87,
  "fgq": 12,
  "qun_name": "999swap 官方禁言通知群",
  "sender_win_rate": "98.6",
  "sender_total_tokens": 350
}
```

## 字段分类

### 人（People）相关字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `sfr` | string | 推荐人（⚠️ 47% 为空） |
| `sfsj` | string | 推荐时间(UTC+8) |
| `sfxx` | string | 推荐信息汇总 |
| `cxr` | string | 查询人 |
| `cxrxx` | string | 查询人详情 |
| `cxrzf` | string | 查询后涨幅 |
| `zgzf` | string | 查询后最高涨幅 |
| `grcxcs` | number | 个人查询次数 |
| `qy_wxid` | string | 群友微信 ID |
| `qy_name` | string | 群友名称 |
| `sender_total_tokens` | number | 推荐代币总数 |
| `sender_win_tokens` | string | 盈利代币数 |
| `sender_win_rate` | string | 胜率(%) ⚠️ 虚高 |
| `sender_best_multiple` | string | 最佳倍数 |

### 群（Groups）相关字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `qun_name` | string | 群名称 |
| `qun_id` | string | 群 ID |
| `wx_id` | string | 微信数据 ID |
| `sfqy` | string | 推荐所在社群 |
| `sqzs` | number | 社群热度指数 |
| `cazs` | number | 查询热度指数 |
| `bqfc` | number | 本群分享次数 |
| `qwfc` | number | 全网覆盖次数 |
| `fgq` | number | 覆盖群数 |

### 代币（Tokens）核心字段

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
| `issue_platform` | string | 发射平台 |
| `launch_at` | number | 发射时间(Unix) |
| `progress` | string | 进度(%) |

### 代币价格字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `current_price_usd` | string | 当前 USD 价格 |
| `current_price_eth` | string | ETH 计价 |
| `launch_price` | string | 发射价格 |
| `price_change_5m` | number | 5m 涨跌幅(%) |
| `price_change_1h` | number | 1h 涨跌幅(%) |
| `price_change_4h` | number | 4h 涨跌幅(%) |
| `price_change_24h` | number | 24h 涨跌幅(%) |

### 代币交易量字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `volume_u_5m` | number | 5m 交易量(USD) |
| `volume_u_1h` | number | 1h 交易量(USD) |
| `volume_u_4h` | number | 4h 交易量(USD) |
| `volume_u_24h` | number | 24h 交易量(USD) |
| `buy_volume_u_5m/1h/4h/24h` | number | 买入量 |
| `sell_volume_u_5m/1h/4h/24h` | number | 卖出量 |
| `buys_tx_5m/1h/4h/24h_count` | number | 买入笔数 |
| `sells_tx_5m/1h/4h/24h_count` | number | 卖出笔数 |

### 代币风险字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `risk_score` | string | 风险分(0-100) |
| `is_honeypot` | string | 蜜罐 |
| `is_mintable` | string | 可增发 |
| `phishing_wallet_rate` | number/null | 钓鱼钱包比例 |
| `bundle_wallet_rate` | number/null | 捆绑钱包比例 |
| `rug_risk_rate` | number/null | Rug 风险比例 |

### 代币信号字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `sfzf` | string | 推荐至今倍数 |
| `fshzf` | string | 发射后最高倍数 |
| `zfzgzf` | string | 最高倍数含描述 |
| `old_market_cap` | string | 推荐时市值 |
| `new_market_cap` | string | 当前市值 |

## 连接最佳实践

### 断线重连 + 心跳检测

```javascript
function connect() {
  const ws = new WebSocket('ws://43.254.167.238:3000/token');
  let lastMessage = Date.now();

  ws.on('message', (data) => {
    lastMessage = Date.now();
    const token = JSON.parse(data);
    // 处理数据...
  });

  ws.on('close', () => setTimeout(connect, 5000));
  ws.on('error', (err) => ws.close());

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

## 数据持久化建议

- 设置 60 秒去重窗口（同一 `sfr` + `qun_name` 组合）
- 大文件（400MB+）使用 Worker Threads 异步读写
- 流式 JSON 序列化避免阻塞事件循环
