# WeChat Token Signal

实时 WebSocket 推送链上代币完整数据，**126+ 个字段**覆盖代币基础信息、价格、交易量、市值、风险评估、LP 流动性和**微信社群首发喊单数据**。

## 核心亮点

- **微信社群首发信号**: 追踪代币在微信社群中被首次发现和推荐的完整链路（首发人、首发社群、首发倍数、覆盖群数、喊单次数）
- **三维关系追踪**: 用户（首发人/查询人）× 代币（CA）× 社群（微信群）的完整关系图
- **多链支持**: BSC / Solana / ETH 等多链代币实时监控
- **126+ 个字段**: 11 大数据维度全方位覆盖
- **历史 CA 记录**: REST API 查询群友/群/代币的历史推荐记录和胜率统计
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
  const caller = token.sfr || token.cxr || '未知';
  console.log(`${token.symbol} | $${token.current_price_usd} | 首发: ${caller} | 覆盖: ${token.fgq}群`);
});
```

### Python 连接

```python
import asyncio, websockets, json

async def listen():
    async with websockets.connect('ws://43.254.167.238:3000/token') as ws:
        async for message in ws:
            token = json.loads(message)
            caller = token.get('sfr') or token.get('cxr', 'N/A')
            print(f"{token['symbol']} | ${token['current_price_usd']} | 首发: {caller}")

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
| 社区热度指标 | 7 | 查询热度、社群热度、覆盖群数、全网喊单次数 |

## 微信社群首发数据（核心）

这是本 Skill 最核心的数据维度。追踪代币在微信社群中被首次推荐的完整信息。

| 字段 | 含义 | 示例 | 注意 |
|------|------|------|------|
| `sfr` | 首发人 | `"999swap推送"` | 47% 为空，需 fallback 到 `cxr` |
| `sfsj` | 首发时间 | `"2026-02-13 14:02:53"` | UTC+8 |
| `sfqy` | 首发社群 | `"999swap 官方禁言通知群"` | |
| `sfzf` | 首发至今倍数 | `"149.46x"` | 可能为空，需 `parseFloat()` |
| `fshzf` | 发射后最高倍数 | `"14946.40"` | 可能为空或 `"0"` |
| `qwfc` | 全网喊单次数 | `87` | 跨群累加总次数 |
| `fgq` | 覆盖群数 | `12` | 不重复群数量 |
| `sender_win_rate` | 首发人胜率 | `"98.6"` | ⚠️ 严重虚高，需修正 |
| `sender_best_multiple` | 首发人历史最佳倍数 | `"6708.13"` | |

> **胜率修正**: `sender_win_rate` 使用错误公式 `success/(success+failure)` 忽略未结算代币，实际胜率需用 `sender_win_tokens / sender_total_tokens * 100` 修正。

## 已知数据问题

使用本 API 时请注意以下经过实战验证的数据问题：

1. **胜率虚高**: `sender_win_rate` 和 CA API 的 `win_rate` 忽略未结算代币，需修正为 `success_count / total_count * 100`
2. **首发人为空**: `sfr` 约 47% 为空，fallback 到 `cxr` → `qy_name` → `"未知"`
3. **倍数缺失**: `sfzf`/`fshzf`/`increase_data` 可能为空或 0，需多层 fallback 计算
4. **Emoji 乱码**: `qun_name`/`sfr`/`cxr` 可能含损坏的 Unicode 代理对
5. **精度丢失**: `toFixed(2)` 会将 0.0005x 舍入为 0，小值需 `toFixed(6)`
6. **静默断连**: WS 连接可能 TCP 存活但不推送数据，需心跳检测
7. **CA API 时间戳**: `created_at` 和 `created` 字段名不一致

详细说明和修正代码见 [SKILL.md](SKILL.md) 的"已知数据问题与修正指南"章节。

## 项目结构

```
wechat-token-signal/
├── README.md           # 项目说明（本文件）
├── SKILL.md            # OpenClaw Skill 规范文件（完整字段定义 + 数据修正指南）
├── LICENSE             # MIT 开源协议
├── docs/
│   ├── api-reference.md    # API 完整参考文档
│   ├── field-dictionary.md # 字段缩写对照字典（含约束和注意事项）
│   └── use-cases.md        # 应用场景详解
└── scripts/
    ├── connect.js          # Node.js 连接示例
    ├── connect.py          # Python 连接示例
    ├── filter-alpha.js     # 高倍数 Alpha 代币筛选
    ├── risk-monitor.js     # 风险预警监控
    └── community-rank.py   # 社群热度排行
```

## 文档

- [SKILL.md](SKILL.md) — 完整 Skill 规范，含 126+ 字段详解、已知数据问题修正指南
- [API 完整参考](docs/api-reference.md) — WS 连接方式、REST API、全部字段详解
- [字段缩写字典](docs/field-dictionary.md) — 中文缩写字段对照表，含约束和注意事项
- [应用场景](docs/use-cases.md) — 早期 Alpha 发现、风控预警、社群信号聚合、三维关系追踪等

## 脚本工具

- `scripts/connect.js` — 快速连接并打印实时数据
- `scripts/connect.py` — Python 异步连接示例
- `scripts/filter-alpha.js` — 筛选高倍数首发代币（可配置阈值）
- `scripts/risk-monitor.js` — 实时风险预警（蜜罐、高集中度、Rug 风险）
- `scripts/community-rank.py` — 社群热度 TOP N 排行统计

## 许可证

[MIT](LICENSE)
