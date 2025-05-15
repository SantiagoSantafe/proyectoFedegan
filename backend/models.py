from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel

# Modelo para Movimiento de Ganado
class Movement(BaseModel):
    id: Optional[int] = None
    type: str  # import, export
    country: str
    animalCount: int
    animalType: str
    purpose: str
    healthStatus: str
    documentNumber: str
    dateOfMovement: datetime
    responsible: str
    origin: Optional[str] = None
    destination: Optional[str] = None
    hasAlert: bool = False
    alertReason: Optional[str] = None
    coordinates: Dict  # {origin: {lat, lng}, destination: {lat, lng}}

# Modelo para Brote de Enfermedad
class Outbreak(BaseModel):
    id: Optional[int] = None
    diseaseType: str
    status: str  # active, controlled, eradicated
    severity: str  # alta, media, baja
    detectionDate: datetime
    region: str
    municipality: str
    affectedAnimals: int
    measures: str
    responsibleTechnician: str
    progress: List[Dict]  # [{date, newCases, totalCases}, ...]
    coordinates: Dict  # {lat, lng}

# Modelo para Jornada de Vacunación
class Vaccination(BaseModel):
    id: Optional[int] = None
    vaccinatorId: str
    vaccinatorName: str
    farm: str
    municipality: str
    region: str
    campaign: str
    campaignStatus: str
    vaccineType: str
    animalsVaccinated: int
    maleCount: int
    femaleCount: int
    youngCount: int
    adultCount: int
    observations: Optional[str] = None
    dateCreated: datetime
    coordinates: Dict  # {lat, lng}