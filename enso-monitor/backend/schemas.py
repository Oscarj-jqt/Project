"""
Modèles Pydantic pour la sérialisation des observations ONI.
"""

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ONIObservationResponse(BaseModel):
    """Observation ONI pour la réponse API."""

    date_centrale: date
    periode: str
    valeur_oni: Decimal

    model_config = ConfigDict(
        # on sérialise Decimal en nombre JSON
        json_encoders={Decimal: float},
    )
