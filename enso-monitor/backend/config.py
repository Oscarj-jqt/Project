import os
from dataclasses import dataclass
from urllib.parse import quote
from dotenv import load_dotenv

# Charger le fichier .env au démarrage du module
load_dotenv()


@dataclass(frozen=True)
class DatabaseConfig:

    host: str
    port: int
    database: str
    user: str
    password: str

    @property
    def connection_string(self) -> str:
        # URL-encoder le mot de passe au cas où il contient des caractères spéciaux
        encoded_password = quote(self.password, safe="")
        return (
            f"postgresql://{self.user}:{encoded_password}@"
            f"{self.host}:{self.port}/{self.database}"
        )

    @classmethod
    def from_environment(cls) -> "DatabaseConfig":
        password = os.environ.get("POSTGRES_PASSWORD")
        if not password:
            raise ValueError("POSTGRES_PASSWORD n'est pas défini dans l'environnement")

        return cls(
            host=os.environ.get("POSTGRES_HOST", "127.0.0.1"),
            port=int(os.environ.get("POSTGRES_PORT", "5432")),
            database=os.environ.get("POSTGRES_DB", "enso_monitor"),
            user=os.environ.get("POSTGRES_USER", "enso_app"),
            password=password,
        )


def get_database_config() -> DatabaseConfig:
    return DatabaseConfig.from_environment()

