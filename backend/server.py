from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Sistema de Propostas API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Enums
class TipoCobranca(str, Enum):
    REMOTO = "remoto"
    PRESENCIAL = "presencial"
    FIXO = "fixo" 
    PROJETO = "projeto"

class TipoAtendimento(str, Enum):
    REMOTO = "remoto"
    PRESENCIAL = "presencial"

class StatusProposta(str, Enum):
    RASCUNHO = "rascunho"
    ENVIADA = "enviada"
    APROVADA = "aprovada"
    REJEITADA = "rejeitada"


# Models
class Servico(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    categoria: str
    tipo_cobranca: TipoCobranca
    valor_remoto: Optional[float] = 0.0
    valor_presencial: Optional[float] = 0.0
    valor_fixo: Optional[float] = 0.0
    valor_base_projeto: Optional[float] = 0.0
    ativo: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ServicoCreate(BaseModel):
    nome: str
    categoria: str
    tipo_cobranca: TipoCobranca
    valor_remoto: Optional[float] = 0.0
    valor_presencial: Optional[float] = 0.0
    valor_fixo: Optional[float] = 0.0
    valor_base_projeto: Optional[float] = 0.0

class ServicoUpdate(BaseModel):
    nome: Optional[str] = None
    categoria: Optional[str] = None
    tipo_cobranca: Optional[TipoCobranca] = None
    valor_remoto: Optional[float] = None
    valor_presencial: Optional[float] = None
    valor_fixo: Optional[float] = None
    valor_base_projeto: Optional[float] = None
    ativo: Optional[bool] = None


class DadosEmpresa(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    cnpj_cpf: str
    endereco: str
    telefone: str
    email: str
    logo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DadosEmpresaCreate(BaseModel):
    nome: str
    cnpj_cpf: str
    endereco: str
    telefone: str
    email: str
    logo_url: Optional[str] = None

class DadosEmpresaUpdate(BaseModel):
    nome: Optional[str] = None
    cnpj_cpf: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None


class Configuracoes(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    percentual_urgencia: float = 0.0
    deslocamento_fixo: float = 0.0
    deslocamento_por_km: float = 0.0
    valor_plantao_hora: float = 0.0
    percentual_imposto: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ConfiguracoesCreate(BaseModel):
    percentual_urgencia: Optional[float] = 0.0
    deslocamento_fixo: Optional[float] = 0.0
    deslocamento_por_km: Optional[float] = 0.0
    valor_plantao_hora: Optional[float] = 0.0
    percentual_imposto: Optional[float] = 0.0


class ItemProposta(BaseModel):
    servico_id: str
    servico_nome: str
    servico_categoria: str
    tipo_atendimento: TipoAtendimento
    quantidade: float
    valor_unitario: float
    subtotal: float
    urgencia_aplicada: bool = False
    valor_urgencia: float = 0.0
    observacoes: Optional[str] = None

class Proposta(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero: str
    cliente_nome: str
    cliente_email: Optional[str] = None
    cliente_telefone: Optional[str] = None
    cliente_endereco: Optional[str] = None
    
    itens: List[ItemProposta]
    
    # Adicionais
    deslocamento_km: float = 0.0
    horas_plantao: float = 0.0
    urgencia_global: bool = False
    
    # Valores calculados
    subtotal_servicos: float = 0.0
    valor_urgencia_total: float = 0.0
    valor_deslocamento: float = 0.0
    valor_plantao: float = 0.0
    subtotal_adicionais: float = 0.0
    
    # Desconto
    desconto_tipo: str = "fixo"  # "fixo" ou "percentual"
    desconto_valor: float = 0.0
    desconto_aplicado: float = 0.0
    
    # Impostos
    valor_impostos: float = 0.0
    
    # Total final
    valor_total: float = 0.0
    
    observacoes_gerais: Optional[str] = None
    status: StatusProposta = StatusProposta.RASCUNHO
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PropostaCreate(BaseModel):
    cliente_nome: str
    cliente_email: Optional[str] = None
    cliente_telefone: Optional[str] = None
    cliente_endereco: Optional[str] = None
    itens: List[Dict[str, Any]]
    deslocamento_km: Optional[float] = 0.0
    horas_plantao: Optional[float] = 0.0
    urgencia_global: Optional[bool] = False
    desconto_tipo: Optional[str] = "fixo"
    desconto_valor: Optional[float] = 0.0
    observacoes_gerais: Optional[str] = None

class PropostaUpdate(BaseModel):
    cliente_nome: Optional[str] = None
    cliente_email: Optional[str] = None
    cliente_telefone: Optional[str] = None
    cliente_endereco: Optional[str] = None
    itens: Optional[List[Dict[str, Any]]] = None
    deslocamento_km: Optional[float] = None
    horas_plantao: Optional[float] = None
    urgencia_global: Optional[bool] = None
    desconto_tipo: Optional[str] = None
    desconto_valor: Optional[float] = None
    observacoes_gerais: Optional[str] = None
    status: Optional[StatusProposta] = None


# Helper Functions
def calcular_proposta(itens_data: List[Dict[str, Any]], configuracoes: Configuracoes, 
                     deslocamento_km: float = 0.0, horas_plantao: float = 0.0,
                     urgencia_global: bool = False, desconto_tipo: str = "fixo", 
                     desconto_valor: float = 0.0) -> Dict[str, float]:
    """Calcula todos os valores da proposta"""
    
    # Cálculo dos itens
    subtotal_servicos = 0.0
    valor_urgencia_total = 0.0
    
    for item_data in itens_data:
        quantidade = item_data.get('quantidade', 1)
        valor_unitario = item_data.get('valor_unitario', 0.0)
        urgencia_item = item_data.get('urgencia_aplicada', False)
        
        subtotal_item = quantidade * valor_unitario
        subtotal_servicos += subtotal_item
        
        # Urgência por item ou global
        if urgencia_item or urgencia_global:
            valor_urgencia_item = subtotal_item * (configuracoes.percentual_urgencia / 100)
            valor_urgencia_total += valor_urgencia_item
    
    # Adicionais
    valor_deslocamento = 0.0
    if deslocamento_km > 0:
        if configuracoes.deslocamento_fixo > 0:
            valor_deslocamento = configuracoes.deslocamento_fixo
        else:
            valor_deslocamento = deslocamento_km * configuracoes.deslocamento_por_km
    
    valor_plantao = horas_plantao * configuracoes.valor_plantao_hora
    
    subtotal_adicionais = valor_urgencia_total + valor_deslocamento + valor_plantao
    
    # Subtotal antes do desconto
    subtotal_antes_desconto = subtotal_servicos + subtotal_adicionais
    
    # Cálculo do desconto
    desconto_aplicado = 0.0
    if desconto_valor > 0:
        if desconto_tipo == "percentual":
            desconto_aplicado = subtotal_antes_desconto * (desconto_valor / 100)
        else:
            desconto_aplicado = desconto_valor
    
    # Subtotal após desconto
    subtotal_apos_desconto = subtotal_antes_desconto - desconto_aplicado
    
    # Cálculo dos impostos (sobre o valor após desconto)
    valor_impostos = subtotal_apos_desconto * (configuracoes.percentual_imposto / 100)
    
    # Valor total
    valor_total = subtotal_apos_desconto + valor_impostos
    
    return {
        'subtotal_servicos': subtotal_servicos,
        'valor_urgencia_total': valor_urgencia_total,
        'valor_deslocamento': valor_deslocamento,
        'valor_plantao': valor_plantao,
        'subtotal_adicionais': subtotal_adicionais,
        'desconto_aplicado': desconto_aplicado,
        'valor_impostos': valor_impostos,
        'valor_total': valor_total
    }

async def get_configuracoes() -> Configuracoes:
    """Busca ou cria configurações padrão"""
    config = await db.configuracoes.find_one()
    if not config:
        config_default = Configuracoes()
        await db.configuracoes.insert_one(config_default.dict())
        return config_default
    return Configuracoes(**config)

def gerar_numero_proposta() -> str:
    """Gera número sequencial para proposta"""
    import time
    timestamp = int(time.time())
    return f"PROP-{timestamp}"


# ================================
# ROUTES - SERVIÇOS
# ================================

@api_router.get("/servicos", response_model=List[Servico])
async def listar_servicos(ativo: Optional[bool] = None, categoria: Optional[str] = None):
    """Lista todos os serviços com filtros opcionais"""
    filtros = {}
    if ativo is not None:
        filtros["ativo"] = ativo
    if categoria:
        filtros["categoria"] = categoria
        
    servicos = await db.servicos.find(filtros).to_list(1000)
    return [Servico(**servico) for servico in servicos]

@api_router.post("/servicos", response_model=Servico)
async def criar_servico(servico: ServicoCreate):
    """Cria um novo serviço"""
    servico_obj = Servico(**servico.dict())
    await db.servicos.insert_one(servico_obj.dict())
    return servico_obj

@api_router.get("/servicos/{servico_id}", response_model=Servico)
async def buscar_servico(servico_id: str):
    """Busca um serviço por ID"""
    servico = await db.servicos.find_one({"id": servico_id})
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return Servico(**servico)

@api_router.put("/servicos/{servico_id}", response_model=Servico)
async def atualizar_servico(servico_id: str, servico_update: ServicoUpdate):
    """Atualiza um serviço"""
    servico_atual = await db.servicos.find_one({"id": servico_id})
    if not servico_atual:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    update_data = servico_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.servicos.update_one({"id": servico_id}, {"$set": update_data})
    
    servico_atualizado = await db.servicos.find_one({"id": servico_id})
    return Servico(**servico_atualizado)

@api_router.delete("/servicos/{servico_id}")
async def deletar_servico(servico_id: str):
    """Marca um serviço como inativo"""
    result = await db.servicos.update_one(
        {"id": servico_id}, 
        {"$set": {"ativo": False, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return {"message": "Serviço desativado com sucesso"}


# ================================
# ROUTES - DADOS DA EMPRESA
# ================================

@api_router.get("/empresa", response_model=DadosEmpresa)
async def buscar_dados_empresa():
    """Busca dados da empresa"""
    empresa = await db.empresa.find_one()
    if not empresa:
        raise HTTPException(status_code=404, detail="Dados da empresa não encontrados")
    return DadosEmpresa(**empresa)

@api_router.post("/empresa", response_model=DadosEmpresa)
async def criar_dados_empresa(empresa: DadosEmpresaCreate):
    """Cria ou atualiza dados da empresa"""
    # Verifica se já existe
    empresa_existente = await db.empresa.find_one()
    
    if empresa_existente:
        # Atualiza
        update_data = empresa.dict()
        update_data["updated_at"] = datetime.utcnow()
        await db.empresa.update_one({"id": empresa_existente["id"]}, {"$set": update_data})
        empresa_atualizada = await db.empresa.find_one({"id": empresa_existente["id"]})
        return DadosEmpresa(**empresa_atualizada)
    else:
        # Cria novo
        empresa_obj = DadosEmpresa(**empresa.dict())
        await db.empresa.insert_one(empresa_obj.dict())
        return empresa_obj

@api_router.put("/empresa", response_model=DadosEmpresa)
async def atualizar_dados_empresa(empresa_update: DadosEmpresaUpdate):
    """Atualiza dados da empresa"""
    empresa_atual = await db.empresa.find_one()
    if not empresa_atual:
        raise HTTPException(status_code=404, detail="Dados da empresa não encontrados")
    
    update_data = empresa_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.empresa.update_one({"id": empresa_atual["id"]}, {"$set": update_data})
    
    empresa_atualizada = await db.empresa.find_one({"id": empresa_atual["id"]})
    return DadosEmpresa(**empresa_atualizada)


# ================================
# ROUTES - CONFIGURAÇÕES
# ================================

@api_router.get("/configuracoes", response_model=Configuracoes)
async def buscar_configuracoes():
    """Busca configurações do sistema"""
    return await get_configuracoes()

@api_router.post("/configuracoes", response_model=Configuracoes)
async def criar_configuracoes(config: ConfiguracoesCreate):
    """Cria ou atualiza configurações"""
    config_existente = await db.configuracoes.find_one()
    
    if config_existente:
        # Atualiza
        update_data = config.dict()
        update_data["updated_at"] = datetime.utcnow()
        await db.configuracoes.update_one({"id": config_existente["id"]}, {"$set": update_data})
        config_atualizada = await db.configuracoes.find_one({"id": config_existente["id"]})
        return Configuracoes(**config_atualizada)
    else:
        # Cria nova
        config_obj = Configuracoes(**config.dict())
        await db.configuracoes.insert_one(config_obj.dict())
        return config_obj


# ================================
# ROUTES - PROPOSTAS
# ================================

@api_router.get("/propostas", response_model=List[Proposta])
async def listar_propostas(
    status: Optional[StatusProposta] = None,
    cliente_nome: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    """Lista propostas com filtros"""
    filtros = {}
    if status:
        filtros["status"] = status
    if cliente_nome:
        filtros["cliente_nome"] = {"$regex": cliente_nome, "$options": "i"}
    
    propostas = await db.propostas.find(filtros).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [Proposta(**proposta) for proposta in propostas]

@api_router.post("/propostas", response_model=Proposta)
async def criar_proposta(proposta: PropostaCreate):
    """Cria uma nova proposta"""
    configuracoes = await get_configuracoes()
    
    # Processa os itens e calcula valores
    itens_processados = []
    for item_data in proposta.itens:
        # Busca dados do serviço
        servico = await db.servicos.find_one({"id": item_data["servico_id"]})
        if not servico:
            raise HTTPException(status_code=400, detail=f"Serviço {item_data['servico_id']} não encontrado")
        
        # Determina valor unitário baseado no tipo de atendimento
        tipo_atendimento = item_data.get("tipo_atendimento", "remoto")
        valor_unitario = 0.0
        
        if servico["tipo_cobranca"] == "remoto" and tipo_atendimento == "remoto":
            valor_unitario = servico["valor_remoto"]
        elif servico["tipo_cobranca"] == "presencial" and tipo_atendimento == "presencial":
            valor_unitario = servico["valor_presencial"]
        elif servico["tipo_cobranca"] == "fixo":
            valor_unitario = servico["valor_fixo"]
        elif servico["tipo_cobranca"] == "projeto":
            valor_unitario = servico["valor_base_projeto"]
        
        quantidade = item_data.get("quantidade", 1)
        subtotal = quantidade * valor_unitario
        
        item_processado = ItemProposta(
            servico_id=item_data["servico_id"],
            servico_nome=servico["nome"],
            servico_categoria=servico["categoria"],
            tipo_atendimento=tipo_atendimento,
            quantidade=quantidade,
            valor_unitario=valor_unitario,
            subtotal=subtotal,
            urgencia_aplicada=item_data.get("urgencia_aplicada", False),
            observacoes=item_data.get("observacoes")
        )
        itens_processados.append(item_processado)
    
    # Calcula valores da proposta
    calculos = calcular_proposta(
        proposta.itens,
        configuracoes,
        proposta.deslocamento_km or 0.0,
        proposta.horas_plantao or 0.0,
        proposta.urgencia_global or False,
        proposta.desconto_tipo or "fixo",
        proposta.desconto_valor or 0.0
    )
    
    # Cria proposta
    proposta_obj = Proposta(
        numero=gerar_numero_proposta(),
        cliente_nome=proposta.cliente_nome,
        cliente_email=proposta.cliente_email,
        cliente_telefone=proposta.cliente_telefone,
        cliente_endereco=proposta.cliente_endereco,
        itens=itens_processados,
        deslocamento_km=proposta.deslocamento_km or 0.0,
        horas_plantao=proposta.horas_plantao or 0.0,
        urgencia_global=proposta.urgencia_global or False,
        desconto_tipo=proposta.desconto_tipo or "fixo",
        desconto_valor=proposta.desconto_valor or 0.0,
        observacoes_gerais=proposta.observacoes_gerais,
        **calculos
    )
    
    await db.propostas.insert_one(proposta_obj.dict())
    return proposta_obj

@api_router.get("/propostas/{proposta_id}", response_model=Proposta)
async def buscar_proposta(proposta_id: str):
    """Busca uma proposta por ID"""
    proposta = await db.propostas.find_one({"id": proposta_id})
    if not proposta:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
    return Proposta(**proposta)

@api_router.put("/propostas/{proposta_id}", response_model=Proposta)
async def atualizar_proposta(proposta_id: str, proposta_update: PropostaUpdate):
    """Atualiza uma proposta"""
    proposta_atual = await db.propostas.find_one({"id": proposta_id})
    if not proposta_atual:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
    
    update_data = proposta_update.dict(exclude_unset=True)
    
    # Se foram alterados itens ou valores, recalcula
    if any(key in update_data for key in ['itens', 'deslocamento_km', 'horas_plantao', 'urgencia_global', 'desconto_tipo', 'desconto_valor']):
        configuracoes = await get_configuracoes()
        
        itens_data = update_data.get('itens', proposta_atual.get('itens', []))
        
        calculos = calcular_proposta(
            itens_data,
            configuracoes,
            update_data.get('deslocamento_km', proposta_atual.get('deslocamento_km', 0.0)),
            update_data.get('horas_plantao', proposta_atual.get('horas_plantao', 0.0)),
            update_data.get('urgencia_global', proposta_atual.get('urgencia_global', False)),
            update_data.get('desconto_tipo', proposta_atual.get('desconto_tipo', 'fixo')),
            update_data.get('desconto_valor', proposta_atual.get('desconto_valor', 0.0))
        )
        
        update_data.update(calculos)
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.propostas.update_one({"id": proposta_id}, {"$set": update_data})
    
    proposta_atualizada = await db.propostas.find_one({"id": proposta_id})
    return Proposta(**proposta_atualizada)

@api_router.delete("/propostas/{proposta_id}")
async def deletar_proposta(proposta_id: str):
    """Deleta uma proposta"""
    result = await db.propostas.delete_one({"id": proposta_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
    return {"message": "Proposta deletada com sucesso"}

@api_router.post("/propostas/{proposta_id}/duplicar", response_model=Proposta)
async def duplicar_proposta(proposta_id: str):
    """Duplica uma proposta existente"""
    proposta_original = await db.propostas.find_one({"id": proposta_id})
    if not proposta_original:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
    
    # Remove campos únicos e cria nova proposta
    proposta_dict = dict(proposta_original)
    del proposta_dict["id"]
    del proposta_dict["numero"]
    del proposta_dict["created_at"]
    del proposta_dict["updated_at"]
    
    proposta_nova = Proposta(
        numero=gerar_numero_proposta(),
        cliente_nome=f"CÓPIA - {proposta_dict['cliente_nome']}",
        status=StatusProposta.RASCUNHO,
        **proposta_dict
    )
    
    await db.propostas.insert_one(proposta_nova.dict())
    return proposta_nova

# Calcular Preview
@api_router.post("/propostas/calcular-preview")
async def calcular_preview_proposta(dados: Dict[str, Any]):
    """Calcula preview da proposta sem salvar"""
    configuracoes = await get_configuracoes()
    
    itens_data = dados.get('itens', [])
    deslocamento_km = dados.get('deslocamento_km', 0.0)
    horas_plantao = dados.get('horas_plantao', 0.0)
    urgencia_global = dados.get('urgencia_global', False)
    desconto_tipo = dados.get('desconto_tipo', 'fixo')
    desconto_valor = dados.get('desconto_valor', 0.0)
    
    calculos = calcular_proposta(
        itens_data,
        configuracoes,
        deslocamento_km,
        horas_plantao,
        urgencia_global,
        desconto_tipo,
        desconto_valor
    )
    
    return calculos


# ================================
# ROUTES - UTILITÁRIOS
# ================================

@api_router.get("/")
async def root():
    return {"message": "Sistema de Propostas API - Online"}

@api_router.get("/categorias")
async def listar_categorias():
    """Lista todas as categorias de serviços cadastradas"""
    pipeline = [
        {"$match": {"ativo": True}},
        {"$group": {"_id": "$categoria", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    categorias = await db.servicos.aggregate(pipeline).to_list(100)
    return [{"nome": cat["_id"], "total_servicos": cat["count"]} for cat in categorias]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()