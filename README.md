# WeChat Token Signal

微信社群代币信号数据平台，围绕 **人（People）× 群（Groups）× 代币（Tokens）** 三个维度提供完整的链上代币社群信号数据。

## 核心亮点

- **三维数据模型**: 人 × 群 × 代币，完整追踪"谁在哪个群推荐了哪个币"
- **双数据源**: WebSocket 实时推送 + HTTP REST API 历史查询
- **126+ 字段**: 价格、交易量、市值、风险评估、社群信号全覆盖
- **多链支持**: BSC / Solana / ETH 等多链代币实时监控
- **零认证**: WebSocket 直接连接，无需 API Key

## 数据源

| 类型 | 协议 | 地址 | 说明 |
|------|------|------|------|
| 实时数据 | WebSocket | `ws://43.254.167.238:3000/token` | 约每 3 秒推送，自动接收 |
| 历史数据 | HTTP REST | `http://43.254.167.238:3000/api/v1/ca-records/` | 成员/群组/代币历史记录 |

## 三大工具

### Tool 1: People（人物信号）

| Module | 说明 | 数据源 |
|--------|------|--------|
| profile | 成员基础画像 | HTTP |
| history | 推荐历史记录 | HTTP |
| performance | 战绩与胜率统计 | HTTP + WS |
| realtime | 实时推荐信号 | WS |

### Tool 2: Groups（群组信号）

| Module | 说明 | 数据源 |
|--------|------|--------|
| profile | 群组基础信息 | HTTP |
| history | 群推荐历史 | HTTP |
| ranking | 群热度排行 | WS |
| realtime | 群实时信号 | WS |

### Tool 3: Tokens（代币信号）

| Module | 说明 | 数据源 |
|--------|------|--------|
| overview | 代币综合概览 | HTTP |
| market | 市场与交易数据 | WS |
| risk | 风险评估 | WS |
| signal | 社群信号聚合 | WS + HTTP |
| realtime | 实时完整推送 | WS |

## 快速开始

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://43.254.167.238:3000/token');

ws.on('message', (data) => {
  const token = JSON.parse(data);
  const caller = token.sfr || token.cxr || '未知';
  console.log(`${token.symbol} | $${token.current_price_usd} | 来源: ${caller} | 覆盖: ${token.fgq}群`);
});
```

```bash
# HTTP API 查询
curl http://43.254.167.238:3000/api/v1/ca-records/member?name=用户名
curl http://43.254.167.238:3000/api/v1/ca-records/group?name=群名
curl http://43.254.167.238:3000/api/v1/ca-records/token?token=合约地址
```

## 项目结构

```
wechat-token-signal/
├── README.md                   # 项目说明
├── SKILL.md                    # Skill 规范（完整字段定义）
├── LICENSE                     # MIT 开源协议
├── tools/
│   ├── people.md               # Tool 1: 人物信号
│   ├── groups.md               # Tool 2: 群组信号
│   └── tokens.md               # Tool 3: 代币信号
├── docs/
│   ├── ws-data-format.md       # WebSocket 实时数据格式
│   ├── http-api-reference.md   # HTTP REST API 参考
│   ├── field-dictionary.md     # 字段缩写对照字典
│   └── use-cases.md            # 应用场景详解
└── scripts/
    ├── connect.js              # Node.js 基础连接
    ├── connect.py              # Python 异步连接
    ├── people-rank.js          # 人物推荐排行
    ├── group-rank.py           # 群热度排行
    ├── token-filter.js         # 代币信号筛选
    └── risk-monitor.js         # 风险预警监控
```

## 文档

- [SKILL.md](SKILL.md) — 完整 Skill 规范，三大工具详细定义
- [Tools: People](tools/people.md) — 人物信号工具详细文档
- [Tools: Groups](tools/groups.md) — 群组信号工具详细文档
- [Tools: Tokens](tools/tokens.md) — 代币信号工具详细文档
- [WS 数据格式](docs/ws-data-format.md) — WebSocket 实时推送数据格式
- [HTTP API 参考](docs/http-api-reference.md) — REST API 完整参考
- [字段缩写字典](docs/field-dictionary.md) — 中文缩写字段对照表
- [应用场景](docs/use-cases.md) — Alpha 发现、风控预警、社群聚合等

## 许可证

[MIT](LICENSE)
