from common import get_system_info, sio  # common.py에서 get_system_info 함수, sio 변수를 가져옵니다.
@sio.event
async def connect(sid, environ):
    print('클라이언트 연결', sid)
@sio.event
async def disconnect(sid):
    print('클라이언트 종료', sid)
@sio.on('get_system_info')
async def on_get_system_info(sid, data):
    systemInfo = get_system_info()
    await sio.emit('ret_system_info', systemInfo, room=sid)