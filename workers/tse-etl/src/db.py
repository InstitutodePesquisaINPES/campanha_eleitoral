import psycopg
from psycopg.rows import dict_row
import clickhouse_connect
from minio import Minio
import os
import io

from src.config import (
    DATABASE_URL, 
    CLICKHOUSE_HOST, CLICKHOUSE_PORT, CLICKHOUSE_USER, CLICKHOUSE_PASSWORD, CLICKHOUSE_DB,
    MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_SECURE
)

def get_connection():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)

def get_clickhouse_client():
    client = clickhouse_connect.get_client(
        host=CLICKHOUSE_HOST,
        port=CLICKHOUSE_PORT,
        username=CLICKHOUSE_USER,
        password=CLICKHOUSE_PASSWORD,
        database=CLICKHOUSE_DB
    )
    # Ensure database and tables exist
    init_clickhouse(client)
    return client

def get_minio_client():
    client = Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE
    )
    # Ensure bucket exists
    if not client.bucket_exists("tse-bronze"):
        client.make_bucket("tse-bronze")
    return client

def init_clickhouse(client):
    client.command(f"CREATE DATABASE IF NOT EXISTS {CLICKHOUSE_DB}")
    
    # Eleitorado
    client.command("""
        CREATE TABLE IF NOT EXISTS tse_eleitorado (
            ano UInt16,
            uf FixedString(2),
            cod_municipio_tse String,
            zona Nullable(UInt16),
            secao Nullable(UInt16),
            total_eleitores UInt32,
            genero String,
            faixa_etaria String,
            escolaridade String,
            estado_civil String
        ) ENGINE = MergeTree()
        PARTITION BY ano
        ORDER BY (uf, cod_municipio_tse)
    """)
    
    # Locais
    client.command("""
        CREATE TABLE IF NOT EXISTS tse_locais_votacao (
            ano UInt16,
            uf FixedString(2),
            cod_municipio_tse String,
            codigo_local String,
            nome_local String,
            endereco String,
            bairro String,
            cep String,
            zona Nullable(UInt16),
            latitude Nullable(Float32),
            longitude Nullable(Float32)
        ) ENGINE = MergeTree()
        PARTITION BY ano
        ORDER BY (uf, cod_municipio_tse)
    """)
    
    # Candidatos
    client.command("""
        CREATE TABLE IF NOT EXISTS tse_candidatos (
            ano UInt16,
            uf FixedString(2),
            turno UInt8,
            cargo String,
            numero_urna String,
            nome_urna String,
            nome_completo String,
            cpf String,
            partido_sigla String,
            partido_numero String,
            coligacao String,
            genero String,
            ocupacao String,
            situacao_candidatura String,
            situacao_eleicao String,
            eleito UInt8,
            cod_municipio_tse String
        ) ENGINE = MergeTree()
        PARTITION BY ano
        ORDER BY (uf, cargo, turno)
    """)
    
    # Resultados
    client.command("""
        CREATE TABLE IF NOT EXISTS tse_resultados_secao (
            ano UInt16,
            uf FixedString(2),
            turno UInt8,
            cargo String,
            cod_municipio_tse String,
            zona Nullable(UInt16),
            secao Nullable(UInt16),
            numero_votavel String,
            partido_sigla String,
            votos UInt32
        ) ENGINE = MergeTree()
        PARTITION BY ano
        ORDER BY (uf, cod_municipio_tse, zona, secao)
    """)

def upload_to_minio(file_path: str, bucket: str, object_name: str):
    client = get_minio_client()
    client.fput_object(bucket, object_name, file_path)

def update_job_status(job_id: str, status: str, progress: float = None, error_msg: str = None, total: int = None, processed: int = None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            updates = ["status = %s"]
            params = [status]
            
            if progress is not None:
                updates.append("progress_pct = %s")
                params.append(progress)
            if error_msg is not None:
                updates.append("error_msg = %s")
                params.append(error_msg)
            if total is not None:
                updates.append("total_registros = %s")
                params.append(total)
            if processed is not None:
                updates.append("registros_processados = %s")
                params.append(processed)
            if status == "completed" or status == "error":
                updates.append("finished_at = NOW()")
                
            query = f"UPDATE tse_import_jobs SET {', '.join(updates)} WHERE id = %s"
            params.append(job_id)
            cur.execute(query, params)
            conn.commit()

def log_job(job_id: str, level: str, message: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO tse_import_logs (job_id, level, message) VALUES (%s, %s, %s)",
                (job_id, level, message)
            )
            conn.commit()

def fetch_next_job() -> dict:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, tipo, ano, uf 
                FROM tse_import_jobs 
                WHERE status = 'queued' 
                ORDER BY created_at ASC 
                LIMIT 1 
                FOR UPDATE SKIP LOCKED
            """)
            job = cur.fetchone()
            if job:
                cur.execute(
                    "UPDATE tse_import_jobs SET status = 'running', started_at = NOW() WHERE id = %s",
                    (job['id'],)
                )
                conn.commit()
                return job
            return None
