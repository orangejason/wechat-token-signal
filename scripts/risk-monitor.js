#!/usr/bin/env node
/**
 * WeChat Token Signal - 风险预警监控
 * 实时检测蜜罐、高集中度、Rug Pull 等风险代币
 *
 * 用法: node risk-monitor.js
 * 依赖: npm install ws
 */

const WebSocket = require('ws');

const WS_URL = 'ws://43.254.167.238:3000/token';

const RISK_RULES = [
  {
    name: '蜜罐代币',
    level: '极高',
    check: (t) => t.is_honeypot === '1',
  },
  {
    name: '可增发代币',
    level: '高',
    check: (t) => t.is_mintable === '1',
  },
  {
    name: '钓鱼钱包占比过高',
    level: '高',
    check: (t) => (t.phishing_wallet_rate || 0) > 0.1,
    detail: (t) => `钓鱼钱包比例: ${(t.phishing_wallet_rate * 100).toFixed(1)}%`,
  },
  {
    name: '捆绑钱包占比过高',
    level: '高',
    check: (t) => (t.bundle_wallet_rate || 0) > 0.2,
    detail: (t) => `捆绑钱包比例: ${(t.bundle_wallet_rate * 100).toFixed(1)}%`,
  },
  {
    name: 'Rug Pull 风险',
    level: '极高',
    check: (t) => (t.rug_risk_rate || 0) > 0.3,
    detail: (t) => `Rug风险率: ${(t.rug_risk_rate * 100).toFixed(1)}%`,
  },
  {
    name: '持仓过度集中',
    level: '高',
    check: (t) => {
      if (!t.zbbl) return false;
      const top1 = parseFloat(t.zbbl.split('|')[0]) || 0;
      return top1 > 0.5;
    },
    detail: (t) => `TOP1持仓: ${(parseFloat(t.zbbl.split('|')[0]) * 100).toFixed(1)}%`,
  },
  {
    name: '综合风险分极低',
    level: '高',
    check: (t) => parseInt(t.risk_score) < 30 && parseInt(t.risk_score) >= 0,
    detail: (t) => `风险分: ${t.risk_score}/100`,
  },
];

let alertCount = 0;

function connect() {
  const ws = new WebSocket(WS_URL);
  let lastMessage = Date.now();

  ws.on('open', () => {
    console.log('=== 风险预警监控 ===');
    console.log(`监控规则: ${RISK_RULES.length} 条`);
    console.log('等待数据...\n');
  });

  ws.on('message', (data) => {
    try {
      lastMessage = Date.now();
      const token = JSON.parse(data);

      const triggered = RISK_RULES.filter((rule) => rule.check(token));

      if (triggered.length > 0) {
        alertCount++;
        const caller = token.sfr || token.cxr || '未知';
        const group = token.qun_name || token.sfqy || '-';

        console.log(`[预警 #${alertCount}] ${token.symbol} (${token.chain})`);
        console.log(`  合约: ${token.token}`);
        console.log(`  市值: ${token.new_market_cap_format || token.market_cap}`);
        console.log(`  来源: ${caller} | 群: ${group}`);

        triggered.forEach((rule) => {
          const detail = rule.detail ? ` - ${rule.detail(token)}` : '';
          console.log(`  [${rule.level}] ${rule.name}${detail}`);
        });

        console.log('');
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => setTimeout(connect, 5000));
  ws.on('error', () => {});

  // 心跳检测
  const heartbeat = setInterval(() => {
    if (Date.now() - lastMessage > 5 * 60 * 1000) {
      clearInterval(heartbeat);
      ws.terminate();
    }
  }, 60000);

  ws.on('close', () => clearInterval(heartbeat));
}

connect();
