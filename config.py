"""
Configuração centralizada via variáveis de ambiente.

NUNCA hardcode segredos aqui. Em desenvolvimento local, os valores vêm de
um arquivo .env (nunca commitado — já está no .gitignore). Em produção,
as mesmas variáveis devem ser injetadas pelo gerenciador de segredos da
plataforma de deploy — ver README, seção "Variáveis de ambiente".

Todos os campos abaixo são opcionais de propósito: nenhum módulo deste
protótipo efetivamente USA essas variáveis ainda (DATABASE_URL não tem
camada de persistência implementada; SOCIAL_OAUTH_* aguarda a integração
real em ingestion/social_connector.py; ENCRYPTION_KEY aguarda decisão de
onde/como dados em repouso serão criptografados). Cada módulo que passar
a usar uma variável deve validar sua própria presença no momento do uso
(ex.: com Settings.require("database_url")), não na importação — isso
evita que rodar os testes ou subir a API para desenvolvimento exija
configurar segredos que ainda não são consumidos por nada.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: Optional[str] = None
    social_oauth_client_id: Optional[str] = None
    social_oauth_client_secret: Optional[str] = None
    encryption_key: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    def require(self, field_name: str) -> str:
        """Usar no ponto de uso real (não na importação) para falhar com
        uma mensagem clara quando o módulo que precisa da variável for
        efetivamente implementado e chamado sem ela configurada."""
        value = getattr(self, field_name, None)
        if not value:
            raise RuntimeError(
                f"Variável de ambiente obrigatória ausente para esta operação: "
                f"{field_name.upper()}. Configure-a no .env (dev) ou no "
                f"gerenciador de segredos da plataforma (produção)."
            )
        return value


settings = Settings()
