from setting import SETTING
import secrets
import asyncio
from aiohttp_session import setup
from aiohttp_session.cookie_storage import EncryptedCookieStorage
from common import web, app
from request_handlers import mainHandle
import socket_events
from transformer import create_padding_mask, PositionalEncoding, CustomMultiHeadAttention, CustomSchedule, loss_function, accuracy, preprocess_sentence, evaluate, predict
import tensorflow as tf
import tensorflow_datasets as tfds

# 암호화 키 설정
SETTING['SECRET_KEY'] = secrets.token_bytes(32)
# 세션 미들웨어 설정
setup(app, EncryptedCookieStorage(SETTING['SECRET_KEY'], cookie_name=SETTING['COOKIE_NAME']))

# Load the tokenizer and model globally
tokenizer = tfds.deprecated.text.SubwordTextEncoder.load_from_file('tokenizer')
start_token, end_token = [tokenizer.vocab_size], [tokenizer.vocab_size + 1]
max_length = 40

# GPU가 없는 노트북에서는 돌리는데 oneDNN 에러가 날 수 있습니다
model_path = './transformer_chatbot_model.h5'
model = tf.keras.models.load_model(model_path, custom_objects={
    'PositionalEncoding': PositionalEncoding,
    'CustomMultiHeadAttention': CustomMultiHeadAttention,
    'CustomSchedule': CustomSchedule,
    'loss_function': loss_function,
    'accuracy': accuracy
})

def generate_most_probable_response(prompt, model, tokenizer, max_length=40):
    prediction = evaluate(prompt, tokenizer, model, max_length, start_token, end_token)
    predicted_sentence = tokenizer.decode([i for i in prediction if i < tokenizer.vocab_size])
    return predicted_sentence

async def handleChatGPT(request):
    data = await request.json()
    prompt = data.get('prompt', '')
    response_text = generate_most_probable_response(prompt, model, tokenizer)
    return web.json_response({'response': response_text})

async def web_server():
    app.router.add_static('/static/', path='static/', name='static')
    app.router.add_get('/', mainHandle)
    app.router.add_post('/chatgpt', handleChatGPT)  # ChatGPT 처리를 위한 핸들러 등록

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', 5000) # http://본인아이피:5000
    await site.start()

async def main():
    try:
        await web_server()  # 웹 서버 시작
        # 무한 루프로 서버가 계속 실행되도록 유지
        while True:
            await asyncio.sleep(3600)  # 예시로, 1시간마다 대기를 풀고 다시 대기함
    except KeyboardInterrupt:
        print("프로그램이 사용자에 의해 종료됨.")
    except Exception as e:
        print(f"예외 발생: {e}")

if __name__ == '__main__':
    asyncio.run(main())
