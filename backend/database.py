import os

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Overridable so a deployment can point SQLite at a persistent volume
# (e.g. DATABASE_URL=sqlite:////data/typeform.db on Render).
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./typeform.db")

IS_SQLITE = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
)


@event.listens_for(Engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    """SQLite ignores foreign keys unless asked to enforce them per connection.

    Without this the ON DELETE CASCADE declarations in models.py are inert, so
    any bulk delete that bypasses the ORM leaves orphaned child rows behind.
    """
    if not IS_SQLITE:
        return
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
