import psutil
import subprocess
import aiohttp
import genId
from aiohttp import web
from aiohttp_session import get_session
import socketio
from jinja2 import Environment, FileSystemLoader
from setting import SETTING
import wmi
import random

app = aiohttp.web.Application()
sio = socketio.AsyncServer(cors_allowed_origins='*')
sio.attach(app) #http와 socket.io 통합

async def session_check(request):
    session = await get_session(request)
    if 'authenticated' not in session:
        raise web.HTTPFound('/login')
    return session

def response_html(page, data=None):
    global SETTING
    try:
        rand = genId.generate_hash()
        template_loader = FileSystemLoader('html')
        template_env = Environment(loader=template_loader)
        template = template_env.get_template(page)
        if data:
            rendered_template = template.render(system_mode=SETTING['SYSTEM_MODE'], rand=rand, data=data)
        else:
            rendered_template = template.render(system_mode=SETTING['SYSTEM_MODE'], rand=rand)
        return web.Response(text=rendered_template, content_type='text/html')
    except Exception as e:
        # 오류 발생 시의 응답
        return aiohttp.web.Response(text=str(e), status=500)

''' CPU 온도를 얻는 함수 '''
def get_cpu_temperature():
    # w = wmi.WMI(namespace="root\wmi")
    # temperature_info = w.MSAcpi_ThermalZoneTemperature()[0]
    # temperature = (temperature_info.CurrentTemperature / 10.0) -273.15
    
    return random.uniform(40.0 , 80.0)

''' 디스크 사용량을 얻는 함수 '''
def get_disk_usage():
    disk_usage = psutil.disk_usage('C:\\')
    total_disk = disk_usage.total
    used_disk = disk_usage.used
    disk_percent = disk_usage.percent
    disk_free = disk_usage.free
    return total_disk,used_disk,disk_percent,disk_free
''' 시스템 전방적인 사용량 확인 함수 '''
def get_system_info():
    cpu_percent = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    total_memory = memory.total
    used_memory = memory.used
    memory_percent = memory.percent
    cpu_temp = get_cpu_temperature()
    total_disk, used_disk, disk_percent, disk_free = get_disk_usage()

    system_info = {
        'cpu_percent': cpu_percent,
        'total_memory': total_memory,
        'used_memory': used_memory,
        'memory_percent': memory_percent,
        'total_disk': total_disk,
        'used_disk': used_disk,
        'disk_percent': disk_percent,
        'cpu_temp': cpu_temp
    }

    return system_info