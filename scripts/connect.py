#!/usr/bin/env python3
"""
WeChat Token Signal - Python 异步连接示例
连接 WebSocket 并按三维数据模型打印实时数据

用法: python connect.py
依赖: pip install websockets
"""

import asyncio
import json
import websockets

WS_URL = 'ws://43.254.167.238:3000/token'


async def listen():
    count = 0
    while True:
        try:
            async with websockets.connect(WS_URL) as ws:
                print(f'已连接 {WS_URL}，等待数据推送...\n')
                async for message in ws:
                    try:
                        token = json.loads(message)
                        count += 1

                        # 三维数据: 人 × 群 × 代币
                        caller = token.get('sfr') or token.get('cxr') or token.get('qy_name', '未知')
                        group = token.get('qun_name') or token.get('sfqy', '-')
                        multiple = f" | 倍数: {token['sfzf']}" if token.get('sfzf') else ''
                        risk = f" | 风险分: {token['risk_score']}" if token.get('risk_score') else ''

                        print(
                            f"[{count}] {token.get('symbol', '?')} | "
                            f"{token.get('chain', '?')} | "
                            f"${token.get('current_price_usd', '?')} | "
                            f"市值: {token.get('new_market_cap_format', token.get('market_cap', '?'))} | "
                            f"来源: {caller} | 群: {group} | "
                            f"覆盖: {token.get('fgq', 0)}群"
                            f"{multiple}{risk}"
                        )
                    except json.JSONDecodeError as e:
                        print(f'数据解析错误: {e}')

        except (websockets.ConnectionClosed, ConnectionRefusedError, OSError) as e:
            print(f'\n连接断开 ({e})，5秒后重连...')
            await asyncio.sleep(5)


if __name__ == '__main__':
    asyncio.run(listen())
