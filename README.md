# WeChat Token Signal

实时 WebSocket 推送链上代币完整数据，**126 个字段**覆盖代币基础信息、价格、交易量、市值、风险评估、LP 流动性和**微信社群首发数据**。

## 核心亮点

- **微信社群首发信号**: 追踪代币在微信社群中被首次发现和推荐的完整链路（首发人、首发社群、首发倍数、发射后最高倍数）
- **多链支持**: BSC / Solana / ETH 等多链代币实时监控
- **126 个字段**: 11 大数据维度全方位覆盖
- **零认证**: 直接 WebSocket 连接，无需 API Key
- **实时推送**: 约每 3 秒推送一条代币完整快照

## 快速开始

### 安装依赖

```bash
# Node.js
npm install ws

# Python
pip install websockets
```

### Node.js 连接

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://43.254.167.238:3000/token');

ws.on('open', () => console.log('已连接'));
ws.on('message', (data) => {
  const token = JSON.parse(data);
  console.log(`${token.symbol} | $${token.current_price_usd} | 首发: ${token.sfr}`);
});
```

### Python 连接

```python
import asyncio, websockets, json

async def listen():
    async with websockets.connect('ws://43.254.167.238:3000/token') as ws:
        async for message in ws:
            token = json.loads(message)
            print(f"{token['symbol']} | ${token['current_price_usd']} | 首发: {token.get('sfr', 'N/A')}")

asyncio.run(listen())
```

## 数据维度

| 维度 | 字段数 | 说明 |
|------|--------|------|
| 代币基础信息 | 18 | 合约、链、符号、名称、发射平台等 |
| 价格数据 | 12 | 多时间维度价格变动（5m/1h/4h/24h） |
| 交易量 | 8 | USD 交易量按时间维度细分 |
| 买入数据 | 12 | 买入量、笔数、人数（多时间维度） |
| 卖出数据 | 11 | 卖出量、笔数、人数（多时间维度） |
| 市值与流动性 | 9 | MC、FDV、TVL、市值变化 |
| 交易对信息 | 5 | 交易对地址、储备量 |
| 风险评估 | 18 | 蜜罐、增发、钓鱼钱包、Rug 风险等 |
| 代币供应分布 | 6 | 锁仓、销毁、前10持仓占比 |
| 微信社群首发 | 20 | 首发人、首发社群、首发倍数、战绩统计 |
| 社区热度指标 | 7 | 查询热度、社群热度、覆盖群数 |

## 微信社群首发数据（核心）

这是本 Skill 最核心的数据维度。追踪代币在微信社群中被首次推荐的完整信息。

| 字段 | 含义 | 示例 |
|------|------|------|
| `sfr` | 首发人 | `"999swap推送"` |
| `sfsj` | 首发时间 | `"2026-02-13 14:02:53"` |
| `sfqy` | 首发社群 | `"999swap 官方禁言通知群"` |
| `sfzf` | 首发至今倍数 | `"149.46x"` |
| `fshzf` | 发射后最高倍数 | `"14946.40"` |
| `sender_win_rate` | 首发人胜率 | `"98.6"` |
| `sender_best_multiple` | 首发人历史最佳倍数 | `"6708.13"` |

## 项目结构

```
wechat-token-signal/
├── README.md           # 项目说明（本文件）
├── SKILL.md            # OpenClaw Skill 规范文件（完整字段定义）
├── LICENSE             # MIT 开源协议
├── docs/
│   ├── api-reference.md    # API 完整参考文档
│   ├── field-dictionary.md # 字段缩写对照字典
│   └── use-cases.md        # 应用场景详解
└── scripts/
    ├── connect.js          # Node.js 连接示例
    ├── connect.py          # Python 连接示例
    ├── filter-alpha.js     # 高倍数 Alpha 代币筛选
    ├── risk-monitor.js     # 风险预警监控
    └── community-rank.py   # 社群热度排行
```

## 文档

- [API 完整参考](docs/api-reference.md) — 连接方式、数据格式、全部 126 字段详解
- [字段缩写字典](docs/field-dictionary.md) — 中文缩写字段对照表
- [应用场景](docs/use-cases.md) — 早期 Alpha 发现、风控预警、社群信号聚合等

## 脚本工具

- `scripts/connect.js` — 快速连接并打印实时数据
- `scripts/connect.py` — Python 异步连接示例
- `scripts/filter-alpha.js` — 筛选高倍数首发代币（可配置阈值）
- `scripts/risk-monitor.js` — 实时风险预警（蜜罐、高集中度、Rug 风险）
- `scripts/community-rank.py` — 社群热度 TOP N 排行统计

## 许可证

[MIT](LICENSE)
