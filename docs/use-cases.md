# 应用场景详解

## 场景 1: 早期 Alpha 发现

利用微信社群首发数据，追踪高胜率首发人推荐的新代币。

### 策略

1. 使用**修正后的胜率** > 60%（不要使用原始 `sender_win_rate`，该值严重虚高）
2. 关注 `sfsj` 在 1 小时内的新首发代币
3. 结合 `risk_score >= 60` 过滤高风险项目
4. 检查 `is_honeypot !== '1'` 排除蜜罐
5. `fgq > 3` 确认多群覆盖

### 信号强度评估

| 条件 | 权重 | 说明 |
|------|------|------|
| 修正胜率 > 60% | 高 | 历史表现优秀的推荐者（注意不是原始 90%+） |
| 首发时间 < 30 分钟 | 高 | 极早期发现 |
| 覆盖群数 `fgq` > 5 | 中 | 多个社群同时关注 |
| 风险分 > 70 | 中 | 合约安全性较高 |
| 买入量/卖出量 > 3x | 中 | 买方力量强势 |
| `sender_total_tokens` > 50 | 中 | 样本量足够大，胜率可信 |

### 实现思路

```javascript
ws.on('message', (data) => {
  const t = JSON.parse(data);
  const caller = t.sfr || t.cxr || '未知';

  // 修正胜率计算
  const winTokens = parseInt(t.sender_win_tokens) || 0;
  const totalTokens = t.sender_total_tokens || 0;
  const correctedWinRate = totalTokens > 0 ? (winTokens / totalTokens * 100) : 0;

  const launchMinutesAgo = (Date.now() - new Date(t.sfsj).getTime()) / 60000;

  if (correctedWinRate > 60 && totalTokens > 50 &&
      launchMinutesAgo < 60 && parseInt(t.risk_score) >= 60 && t.fgq > 3) {
    console.log(`Alpha: ${t.symbol} by ${caller}`);
    console.log(`  修正胜率: ${correctedWinRate.toFixed(1)}% (原始: ${t.sender_win_rate}%)`);
    console.log(`  覆盖: ${t.fgq}群 ${t.qwfc}次`);
    // 发送告警通知
  }
});
```

---

## 场景 2: Meme 代币实时监控看板

构建实时仪表板展示代币核心指标。

### 展示维度

- **价格变动**: 5m / 1h / 4h / 24h 多时间维度
- **买卖力度对比**: 实时买入量 vs 卖出量
- **市值变化趋势**: `old_market_cap` → `new_market_cap`
- **社群热度排名**: `sqzs` 社群指数排序
- **首发人排行**: 按修正胜率和推荐数量排序

### 关键指标卡片

| 指标 | 数据源 | 刷新频率 |
|------|--------|----------|
| 实时价格 | `current_price_usd` | 每条推送 |
| 5m 涨幅 | `price_change_5m` | 每条推送 |
| 买卖比 | `buy_volume_u_5m / sell_volume_u_5m` | 每条推送 |
| 持有人数 | `holders` | 每条推送 |
| 覆盖群数 | `fgq` | 每条推送 |
| 全网喊单次数 | `qwfc` | 每条推送 |
| 首发倍数 | `sfzf` | 需 `parseFloat()` 且可能为空 |

### 数据持久化建议

WS 推送是实时快照，不包含历史。构建看板需：
- 自行累积 WS 推送数据，建立历史时间线
- 设置 60 秒去重窗口避免重复记录
- 大文件（400MB+）使用流式写入或 worker threads 避免阻塞

---

## 场景 3: 风控预警系统

基于风险字段构建实时预警系统。

### 预警规则

| 规则 | 触发条件 | 风险等级 |
|------|----------|----------|
| 蜜罐检测 | `is_honeypot === '1'` | 极高 |
| 可增发代币 | `is_mintable === '1'` | 高 |
| 钓鱼钱包占比高 | `phishing_wallet_rate > 0.1` | 高 |
| 捆绑钱包占比高 | `bundle_wallet_rate > 0.2` | 高 |
| Rug Pull 风险 | `rug_risk_rate > 0.3` | 极高 |
| 持仓过度集中 | TOP1 `zbbl > 50%` | 高 |
| LP 未锁定 | `is_lp_not_locked === '1'` | 中 |
| 未放弃所有权 | `has_not_renounced === '1'` | 中 |
| 未审计 | `has_not_audited === '1'` | 低 |

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

## 场景 4: 社群信号聚合

跨多个微信社群聚合信号，发现正在传播的热门代币。

### 核心指标

| 指标 | 字段 | 含义 |
|------|------|------|
| 扩散速度 | `fgq` | 覆盖群数越多，传播越广 |
| 传播广度 | `qwfc` | 全网喊单总次数 |
| 社群热度 | `sqzs` | 社群综合热度指数 |
| 查询热度 | `cazs` | 被查询的频率 |

> **注意**: `bqfc` 是当前群的分享次数，不要用它评估全网热度。应使用 `qwfc` 和 `fgq`。

### 热度排行算法

```python
heat_score = (sqzs * 0.4) + (fgq * 10 * 0.3) + (qwfc * 0.2) + (cazs * 0.1)
```

### 信号扩散阶段

1. **萌芽期**: 1-2 个群出现，`fgq <= 2`
2. **扩散期**: 3-10 个群传播，`fgq` 快速增长
3. **爆发期**: 10+ 个群热议，`sqzs` 大幅飙升
4. **衰退期**: 新分享减少，`cazs` 下降

---

## 场景 5: 首发人跟踪系统

建立首发人画像，跟踪高质量推荐者。

### 首发人评估维度

| 维度 | 字段 | 权重 | 说明 |
|------|------|------|------|
| 修正胜率 | `sender_win_tokens / sender_total_tokens` | 40% | **不要使用** `sender_win_rate` |
| 推荐数量 | `sender_total_tokens` | 20% | 样本量越大越可靠 |
| 最佳倍数 | `sender_best_multiple` | 20% | |
| 成功数量 | `sender_win_tokens` | 20% | |

### 首发人分级

| 等级 | 条件 |
|------|------|
| S 级 | **修正**胜率 > 65% 且推荐 > 100 个 且最佳 > 1000x |
| A 级 | **修正**胜率 > 55% 且推荐 > 50 个 |
| B 级 | **修正**胜率 > 45% 且推荐 > 20 个 |
| C 级 | 其他 |

> 注意分级标准已根据修正后的胜率调整。原始数据的 90%+ 胜率会导致几乎所有首发人都是 S 级，没有区分度。

### `sfr` 为空的处理

约 47% 的代币 `sfr` 字段为空。构建首发人系统时必须：

```javascript
const caller = token.sfr || token.cxr || token.qy_name || '未知';
```

同时注意 `sfr` 和 `cxr` 字段可能包含 emoji 乱码，建议使用 `fixSurrogates()` 清洗后再作为 key 使用。

---

## 场景 6: 三维关系追踪（用户 × 代币 × 社群）

追踪"谁在哪个群推荐了哪个币"的完整链路。

### 数据模型

```
用户（sfr/cxr/qy_wxid）
  └─ 推荐了代币（token）
       └─ 在社群（qun_id/qun_name）
            └─ 时间（sfsj/dqsj）
```

### 实现要点

- 每条 WS 推送只携带一个用户和一个群的信息
- 需要自行累积数据建立完整的关系图
- 建议用 `Map` 结构: `userTokenGroupRelations.set(key, {...})`，key 为 `${qy_wxid}_${token}_${qun_id}`
- 通过 CA API 的 `/token` 端点可以获取某个代币的全部历史喊单记录
- 通过 CA API 的 `/member` 端点可以获取某个用户的全部历史推荐记录

### 查询维度

| 查询 | API 端点 | 说明 |
|------|----------|------|
| 某代币被谁喊单 | `/api/v1/ca-records/token` | 返回所有推荐过该代币的用户和群 |
| 某用户推荐过什么 | `/api/v1/ca-records/member` | 返回该用户的全部推荐历史 |
| 某群的推荐记录 | `/api/v1/ca-records/group` | 返回该群的全部 CA 记录 |
