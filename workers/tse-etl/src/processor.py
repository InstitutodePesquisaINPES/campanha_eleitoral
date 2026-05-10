import polars as pl
from typing import List, Dict, Any
from src.db import get_clickhouse_client, log_job, update_job_status
from src.config import CHUNK_SIZE
import json

def process_file(file_path: str, tipo: str, uf: str, ano: int, job_id: str):
    log_job(job_id, "info", f"Iniciando processamento (Polars -> ClickHouse) do arquivo {file_path}")
    
    try:
        lf = pl.scan_csv(
            file_path,
            separator=";",
            encoding="latin1",
            infer_schema_length=10000,
            ignore_errors=True
        )
        
        columns = lf.collect_schema().names()
        uf_col = next((c for c in ["SG_UF", "UF", "SG_UE"] if c in columns), None)
        
        if uf != "BR" and uf_col:
            lf = lf.filter(pl.col(uf_col) == uf)

        df = lf.collect()
        total_rows = df.height
        log_job(job_id, "info", f"Total de linhas a processar: {total_rows}")
        update_job_status(job_id, "processing", total=total_rows, processed=0)
        
        processed = 0
        client = get_clickhouse_client()
        
        for i in range(0, total_rows, CHUNK_SIZE):
            chunk = df.slice(i, CHUNK_SIZE)
            records = map_chunk(chunk.to_dicts(), tipo, ano, uf)
            
            if records:
                insert_records_clickhouse(client, tipo, records)
                
            processed += len(records)
            update_job_status(job_id, "processing", progress=(processed / total_rows) * 100, processed=processed)
            
        log_job(job_id, "info", f"Arquivo {file_path} concluído. Inseridos {processed} registros no ClickHouse.")
        return processed
        
    except Exception as e:
        log_job(job_id, "error", f"Falha ao processar {file_path}: {str(e)}")
        raise e

def map_chunk(rows: List[Dict[str, Any]], tipo: str, ano: int, default_uf: str) -> List[tuple]:
    records = []
    for row in rows:
        uf_row = row.get("SG_UF") or row.get("UF") or row.get("SG_UE") or default_uf
        if default_uf != "BR" and uf_row != default_uf:
            continue
            
        if tipo == "eleitorado":
            records.append((
                ano,
                uf_row,
                row.get("CD_MUNICIPIO") or row.get("CD_MUNIC_TSE") or "",
                int(row.get("NR_ZONA", 0)) if row.get("NR_ZONA") else None,
                int(row.get("NR_SECAO", 0)) if row.get("NR_SECAO") else None,
                int(row.get("QT_ELEITORES_PERFIL") or row.get("QT_ELEITORES") or 0),
                json.dumps({row.get("DS_GENERO"): 1}) if row.get("DS_GENERO") else "",
                json.dumps({row.get("DS_FAIXA_ETARIA"): 1}) if row.get("DS_FAIXA_ETARIA") else "",
                json.dumps({row.get("DS_GRAU_ESCOLARIDADE"): 1}) if row.get("DS_GRAU_ESCOLARIDADE") else "",
                json.dumps({row.get("DS_ESTADO_CIVIL"): 1}) if row.get("DS_ESTADO_CIVIL") else ""
            ))
        elif tipo == "locais":
            records.append((
                ano,
                uf_row,
                row.get("CD_MUNICIPIO") or "",
                str(row.get("NR_LOCAL_VOTACAO") or row.get("CD_LOCAL_VOTACAO") or ""),
                row.get("NM_LOCAL_VOTACAO") or "",
                row.get("DS_ENDERECO") or "",
                row.get("NM_BAIRRO") or "",
                row.get("NR_CEP") or "",
                int(row.get("NR_ZONA", 0)) if row.get("NR_ZONA") else None,
                float(row.get("NR_LATITUDE")) if row.get("NR_LATITUDE") else None,
                float(row.get("NR_LONGITUDE")) if row.get("NR_LONGITUDE") else None
            ))
        elif tipo == "candidatos":
            records.append((
                ano,
                uf_row,
                int(row.get("NR_TURNO", 1)),
                row.get("DS_CARGO") or row.get("CD_CARGO") or "",
                str(row.get("NR_CANDIDATO", "")),
                row.get("NM_URNA_CANDIDATO") or "",
                row.get("NM_CANDIDATO") or "",
                row.get("NR_CPF_CANDIDATO") or "",
                row.get("SG_PARTIDO") or "",
                row.get("NR_PARTIDO") or "",
                row.get("NM_COLIGACAO") or "",
                row.get("DS_GENERO") or "",
                row.get("DS_OCUPACAO") or "",
                row.get("DS_SITUACAO_CANDIDATURA") or "",
                row.get("DS_SIT_TOT_TURNO") or "",
                1 if "ELEITO" in str(row.get("DS_SIT_TOT_TURNO", "")).upper() else 0,
                row.get("SG_UE") or ""
            ))
        elif tipo == "resultados":
            records.append((
                ano,
                uf_row,
                int(row.get("NR_TURNO", 1)),
                row.get("DS_CARGO") or "",
                row.get("CD_MUNICIPIO") or "",
                int(row.get("NR_ZONA", 0)) if row.get("NR_ZONA") else None,
                int(row.get("NR_SECAO", 0)) if row.get("NR_SECAO") else None,
                str(row.get("NR_VOTAVEL", "")),
                row.get("SG_PARTIDO") or "",
                int(row.get("QT_VOTOS", 0))
            ))
            
    return records

def insert_records_clickhouse(client, tipo: str, records: List[tuple]):
    table_map = {
        "eleitorado": "tse_eleitorado",
        "locais": "tse_locais_votacao",
        "candidatos": "tse_candidatos",
        "resultados": "tse_resultados_secao"
    }
    
    col_map = {
        "eleitorado": ['ano', 'uf', 'cod_municipio_tse', 'zona', 'secao', 'total_eleitores', 'genero', 'faixa_etaria', 'escolaridade', 'estado_civil'],
        "locais": ['ano', 'uf', 'cod_municipio_tse', 'codigo_local', 'nome_local', 'endereco', 'bairro', 'cep', 'zona', 'latitude', 'longitude'],
        "candidatos": ['ano', 'uf', 'turno', 'cargo', 'numero_urna', 'nome_urna', 'nome_completo', 'cpf', 'partido_sigla', 'partido_numero', 'coligacao', 'genero', 'ocupacao', 'situacao_candidatura', 'situacao_eleicao', 'eleito', 'cod_municipio_tse'],
        "resultados": ['ano', 'uf', 'turno', 'cargo', 'cod_municipio_tse', 'zona', 'secao', 'numero_votavel', 'partido_sigla', 'votos']
    }

    client.insert(
        table_map[tipo],
        records,
        column_names=col_map[tipo]
    )
