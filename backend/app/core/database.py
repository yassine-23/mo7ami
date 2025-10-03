"""
Database connection and initialization
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from loguru import logger

from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def init_db():
    """Initialize database and create tables"""
    try:
        async with engine.begin() as conn:
            # Enable pgvector extension
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            logger.info("✅ pgvector extension enabled")

            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            logger.info("✅ Database tables created")

    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise


async def get_db() -> AsyncSession:
    """Dependency for getting database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
