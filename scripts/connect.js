#!/usr/bin/env node
/**
 * WeChat Token Signal - 基础连接示例
 * 连接 WebSocket 并按三维数据模型打印实时数据
 *
 * 用法: node connect.js
 * 依赖: npm install ws
 */

const WebSocket = require('ws');

const WS_URL = 'ws://43.254.167.238:3000/token';
let reconnectDelay = 5000;
let messageCount = 0;

function connect() {
  console.log(`正在连接 ${WS_URL} ...`);
  const ws = new WebSocket(WS_URL);
  let lastMessage = Date.now();

  ws.on('open', () => {
    console.log('已连接，等待数据推送...\n');
    reconnectDelay = 5000;
  });

  ws.on('message', (data) => {
    try {
      lastMessage = Date.now();
      const token = JSON.parse(data);
      messageCount++;

      // 三维数据: 人 × 群 × 代币
      const caller = token.sfr || token.cxr || token.qy_name || '未知';
      const group = token.qun_name || token.sfqy || '-';
      const multiple = token.sfzf ? ` | 倍数: ${token.sfzf}` : '';
      const risk = token.risk_score ? ` | 风险分: ${token.risk_score}` : '';

      console.log(
        `[${messageCount}] ${token.symbol} | ${token.chain} | ` +
        `$${token.current_price_usd} | 市值: ${token.new_market_cap_format || token.market_cap}` +
        ` | 来源: ${caller} | 群: ${group}` +
        ` | 覆盖: ${token.fgq || 0}群${multiple}${risk}`
      );
    } catch (e) {
      console.error('数据解析错误:', e.message);
    }
  });

  ws.on('close', () => {
    console.log(`\n连接断开，${reconnectDelay / 1000}秒后重连...`);
    setTimeout(connect, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
  });

  ws.on('error', (err) => {
    console.error('连接错误:', err.message);
  });

  // 5分钟心跳检测
  const heartbeat = setInterval(() => {
    if (Date.now() - lastMessage > 5 * 60 * 1000) {
      console.log('心跳超时，强制重连');
      clearInterval(heartbeat);
      ws.terminate();
    }
  }, 60000);

  ws.on('close', () => clearInterval(heartbeat));
}

connect();
