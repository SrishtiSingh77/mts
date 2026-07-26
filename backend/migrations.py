"""Additive schema reconciliation run at startup.

`Base.metadata.create_all` creates missing tables but never alters existing ones,
so a deployment whose database predates a new column would break on read. This
adds any missing columns in place, which keeps deploys from needing a wiped
database. It only ever ADDs — it never drops or retypes anything.
"""

from typing import List, Optional

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from database import Base


def _literal_default(column) -> Optional[str]:
    """SQL literal for a column's Python-side default, or None if not derivable.

    Callables (uuid4, utcnow) have no static SQL equivalent, so those columns get
    added without a default and stay nullable.
    """
    default = column.default
    if default is None or default.is_callable or default.is_sequence:
        return None

    value = default.arg
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        escaped = value.replace("'", "''")
        return f"'{escaped}'"
    return None


def ensure_schema(engine: Engine) -> List[str]:
    """Add any model columns missing from the live tables. Returns what it added."""
    inspector = inspect(engine)
    added: List[str] = []

    with engine.begin() as connection:
        for table in Base.metadata.sorted_tables:
            if not inspector.has_table(table.name):
                continue

            existing = {col["name"] for col in inspector.get_columns(table.name)}

            for column in table.columns:
                if column.name in existing:
                    continue

                column_type = column.type.compile(engine.dialect)
                default_sql = _literal_default(column)

                clause = f'ADD COLUMN "{column.name}" {column_type}'
                if default_sql is not None:
                    clause += f" DEFAULT {default_sql}"
                    # NOT NULL is only safe once every existing row gets a value.
                    if not column.nullable:
                        clause += " NOT NULL"

                connection.execute(text(f'ALTER TABLE "{table.name}" {clause}'))
                added.append(f"{table.name}.{column.name}")

    if added:
        print(f"Schema updated, added columns: {', '.join(added)}")
    return added
