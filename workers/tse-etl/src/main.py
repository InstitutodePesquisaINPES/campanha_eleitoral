import argparse
import tempfile
import uuid
import time
import os
from src.downloader import download_and_extract
from src.processor import process_file
from src.db import get_connection, log_job, fetch_next_job, update_job_status
from src.config import POLL_INTERVAL

def start_manual_job(tipo: str, ano: int, uf: str) -> dict:
    job_id = str(uuid.uuid4())
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO tse_import_jobs (id, tipo, uf, ano, status, progress_pct, started_at)
                VALUES (%s, %s, %s, %s, 'running', 0, NOW())
                """,
                (job_id, tipo, uf, ano)
            )
            conn.commit()
    return {"id": job_id, "tipo": tipo, "ano": ano, "uf": uf}

def run_job(job: dict):
    job_id = job["id"]
    tipo = job["tipo"]
    ano = job["ano"]
    uf = job["uf"]
    
    print(f"Iniciando Job {job_id} para {tipo} {ano} {uf}")
    
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            extracted_files = download_and_extract(tipo, ano, uf, tmpdir)
            total_inserted = 0
            for csv_file in extracted_files:
                inserted = process_file(csv_file, tipo, uf, ano, job_id)
                total_inserted += inserted
                
        update_job_status(job_id, "completed", progress=100.0)
        print(f"Job {job_id} concluído com sucesso. {total_inserted} registros inseridos.")
        
    except Exception as e:
        print(f"Erro fatal no job {job_id}: {e}")
        update_job_status(job_id, "error", error_msg=str(e))

def worker_loop():
    print(f"Iniciando Worker TSE em modo contínuo (polling a cada {POLL_INTERVAL}s)...")
    while True:
        try:
            job = fetch_next_job()
            if job:
                run_job(job)
            else:
                time.sleep(POLL_INTERVAL)
        except Exception as e:
            print(f"Erro no loop do worker: {e}")
            time.sleep(POLL_INTERVAL)

def main():
    parser = argparse.ArgumentParser(description="TSE ETL Worker")
    parser.add_argument("--run-worker", action="store_true", help="Rodar em modo daemon sondando o banco")
    parser.add_argument("--tipo", choices=["eleitorado", "locais", "candidatos", "resultados"])
    parser.add_argument("--ano", type=int, default=2024)
    parser.add_argument("--uf", default="BA", help="UF ou BR para nacional")
    
    args = parser.parse_args()
    
    # Se chamado com --run-worker (modo coolify/docker)
    if args.run_worker or os.environ.get("RUN_WORKER") == "true":
        worker_loop()
    elif args.tipo:
        # Modo manual via CLI
        job = start_manual_job(args.tipo, args.ano, args.uf)
        run_job(job)
    else:
        parser.print_help()
        
if __name__ == "__main__":
    main()
