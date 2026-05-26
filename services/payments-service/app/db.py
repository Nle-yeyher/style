import aiomysql
import os
from dotenv import load_dotenv

load_dotenv()

_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        _pool = await aiomysql.create_pool(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            db=os.getenv("MYSQL_DATABASE", "style_db"),
            autocommit=True,
            minsize=1,
            maxsize=5,
        )
    return _pool

async def close_pool():
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None