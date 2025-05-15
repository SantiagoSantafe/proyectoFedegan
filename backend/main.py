from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional, Any
from datetime import datetime
import copy

# Importar modelos y datos de ejemplo
from models import Movement, Outbreak, Vaccination
from mock_data import movements_data, outbreaks_data, vaccinations_data

app = FastAPI(
    title="FEDEGÁN API",
    description="API simple para el sistema de monitoreo de FEDEGÁN",
    version="1.0.0"
)

# Configuración de CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las orígenes en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base de datos en memoria (para simplicidad)
db = {
    "movements": movements_data,
    "outbreaks": outbreaks_data,
    "vaccinations": vaccinations_data
}

# Función para obtener el próximo ID
def get_next_id(collection):
    if not collection:
        return 1
    return max(item.id for item in collection) + 1

# ---- Rutas para Movimientos ----

@app.get("/api/movements", response_model=List[Movement])
def get_movements(
    type: Optional[str] = Query(None, description="Filtrar por tipo (import/export)"),
    country: Optional[str] = Query(None, description="Filtrar por país"),
    has_alert: Optional[bool] = Query(None, description="Filtrar por alertas")
):
    """Obtener todos los movimientos de ganado con filtros opcionales"""
    result = db["movements"]
    
    # Aplicar filtros
    if type:
        result = [m for m in result if m.type == type]
    if country:
        result = [m for m in result if m.country == country]
    if has_alert is not None:
        result = [m for m in result if m.hasAlert == has_alert]
    
    return result

@app.get("/api/movements/{id}", response_model=Movement)
def get_movement(id: int):
    """Obtener un movimiento específico por ID"""
    for movement in db["movements"]:
        if movement.id == id:
            return movement
    raise HTTPException(status_code=404, detail="Movimiento no encontrado")

@app.post("/api/movements", response_model=Movement)
def create_movement(movement: Movement):
    """Crear un nuevo movimiento de ganado"""
    # Asignar un nuevo ID
    movement.id = get_next_id(db["movements"])
    
    # Verificar duplicados de documentNumber
    if any(m.documentNumber == movement.documentNumber for m in db["movements"]):
        raise HTTPException(status_code=400, detail="Número de documento ya existe")
    
    # Guardar en la "base de datos"
    db["movements"].append(movement)
    return movement

@app.put("/api/movements/{id}", response_model=Movement)
def update_movement(id: int, movement_update: Movement):
    """Actualizar un movimiento existente"""
    for i, movement in enumerate(db["movements"]):
        if movement.id == id:
            # Mantener el ID original
            movement_update.id = id
            db["movements"][i] = movement_update
            return movement_update
    raise HTTPException(status_code=404, detail="Movimiento no encontrado")

@app.delete("/api/movements/{id}", response_model=Movement)
def delete_movement(id: int):
    """Eliminar un movimiento"""
    for i, movement in enumerate(db["movements"]):
        if movement.id == id:
            return db["movements"].pop(i)
    raise HTTPException(status_code=404, detail="Movimiento no encontrado")

# ---- Rutas para Brotes ----

@app.get("/api/outbreaks", response_model=List[Outbreak])
def get_outbreaks(
    status: Optional[str] = Query(None, description="Filtrar por estado (active/controlled/eradicated)"),
    disease_type: Optional[str] = Query(None, description="Filtrar por tipo de enfermedad"),
    region: Optional[str] = Query(None, description="Filtrar por región")
):
    """Obtener todos los brotes con filtros opcionales"""
    result = db["outbreaks"]
    
    # Aplicar filtros
    if status:
        result = [o for o in result if o.status == status]
    if disease_type:
        result = [o for o in result if o.diseaseType == disease_type]
    if region:
        result = [o for o in result if o.region == region]
    
    return result

@app.get("/api/outbreaks/active", response_model=List[Outbreak])
def get_active_outbreaks():
    """Obtener todos los brotes activos"""
    return [o for o in db["outbreaks"] if o.status == "active"]

@app.get("/api/outbreaks/{id}", response_model=Outbreak)
def get_outbreak(id: int):
    """Obtener un brote específico por ID"""
    for outbreak in db["outbreaks"]:
        if outbreak.id == id:
            return outbreak
    raise HTTPException(status_code=404, detail="Brote no encontrado")

@app.post("/api/outbreaks", response_model=Outbreak)
def create_outbreak(outbreak: Outbreak):
    """Crear un nuevo brote"""
    # Asignar un nuevo ID
    outbreak.id = get_next_id(db["outbreaks"])
    
    # Guardar en la "base de datos"
    db["outbreaks"].append(outbreak)
    return outbreak

@app.put("/api/outbreaks/{id}", response_model=Outbreak)
def update_outbreak(id: int, outbreak_update: Outbreak):
    """Actualizar un brote existente"""
    for i, outbreak in enumerate(db["outbreaks"]):
        if outbreak.id == id:
            # Mantener el ID original
            outbreak_update.id = id
            db["outbreaks"][i] = outbreak_update
            return outbreak_update
    raise HTTPException(status_code=404, detail="Brote no encontrado")

@app.delete("/api/outbreaks/{id}", response_model=Outbreak)
def delete_outbreak(id: int):
    """Eliminar un brote"""
    for i, outbreak in enumerate(db["outbreaks"]):
        if outbreak.id == id:
            return db["outbreaks"].pop(i)
    raise HTTPException(status_code=404, detail="Brote no encontrado")

# ---- Rutas para Vacunaciones ----

@app.get("/api/vaccinations", response_model=List[Vaccination])
def get_vaccinations(
    region: Optional[str] = Query(None, description="Filtrar por región"),
    campaign: Optional[str] = Query(None, description="Filtrar por campaña"),
    vaccinator_id: Optional[str] = Query(None, description="Filtrar por ID del vacunador")
):
    """Obtener todas las vacunaciones con filtros opcionales"""
    result = db["vaccinations"]
    
    # Aplicar filtros
    if region:
        result = [v for v in result if v.region == region]
    if campaign:
        result = [v for v in result if v.campaign == campaign]
    if vaccinator_id:
        result = [v for v in result if v.vaccinatorId == vaccinator_id]
    
    return result

@app.get("/api/vaccinations/stats")
def get_vaccination_stats():
    """Obtener estadísticas generales de vacunación"""
    total_animals = sum(v.animalsVaccinated for v in db["vaccinations"])
    total_males = sum(v.maleCount for v in db["vaccinations"])
    total_females = sum(v.femaleCount for v in db["vaccinations"])
    total_young = sum(v.youngCount for v in db["vaccinations"])
    total_adult = sum(v.adultCount for v in db["vaccinations"])
    
    return {
        "totalAnimals": total_animals,
        "totalMales": total_males,
        "totalFemales": total_females,
        "totalYoung": total_young,
        "totalAdult": total_adult,
        "totalVaccinations": len(db["vaccinations"])
    }

@app.get("/api/vaccinations/{id}", response_model=Vaccination)
def get_vaccination(id: int):
    """Obtener una vacunación específica por ID"""
    for vaccination in db["vaccinations"]:
        if vaccination.id == id:
            return vaccination
    raise HTTPException(status_code=404, detail="Registro de vacunación no encontrado")

@app.post("/api/vaccinations", response_model=Vaccination)
def create_vaccination(vaccination: Vaccination):
    """Crear un nuevo registro de vacunación"""
    # Validar que las sumas coincidan
    if (vaccination.maleCount + vaccination.femaleCount != vaccination.animalsVaccinated or
        vaccination.youngCount + vaccination.adultCount != vaccination.animalsVaccinated):
        raise HTTPException(
            status_code=400,
            detail="La suma de machos y hembras, así como jóvenes y adultos debe ser igual al total"
        )
    
    # Asignar un nuevo ID
    vaccination.id = get_next_id(db["vaccinations"])
    
    # Asegurar que dateCreated esté presente
    if not vaccination.dateCreated:
        vaccination.dateCreated = datetime.now()
    
    # Guardar en la "base de datos"
    db["vaccinations"].append(vaccination)
    return vaccination

@app.put("/api/vaccinations/{id}", response_model=Vaccination)
def update_vaccination(id: int, vaccination_update: Vaccination):
    """Actualizar un registro de vacunación existente"""
    # Validar que las sumas coincidan
    if (vaccination_update.maleCount + vaccination_update.femaleCount != vaccination_update.animalsVaccinated or
        vaccination_update.youngCount + vaccination_update.adultCount != vaccination_update.animalsVaccinated):
        raise HTTPException(
            status_code=400,
            detail="La suma de machos y hembras, así como jóvenes y adultos debe ser igual al total"
        )
    
    for i, vaccination in enumerate(db["vaccinations"]):
        if vaccination.id == id:
            # Mantener el ID original
            vaccination_update.id = id
            db["vaccinations"][i] = vaccination_update
            return vaccination_update
    raise HTTPException(status_code=404, detail="Registro de vacunación no encontrado")

@app.delete("/api/vaccinations/{id}", response_model=Vaccination)
def delete_vaccination(id: int):
    """Eliminar un registro de vacunación"""
    for i, vaccination in enumerate(db["vaccinations"]):
        if vaccination.id == id:
            return db["vaccinations"].pop(i)
    raise HTTPException(status_code=404, detail="Registro de vacunación no encontrado")

# ---- Rutas para Datos Públicos ----

@app.get("/api/public/stats")
def get_public_stats():
    """Obtener estadísticas públicas generales"""
    # Obtener estadísticas de vacunación
    vaccination_stats = get_vaccination_stats()
    
    # Conteo de importaciones y exportaciones
    imports = len([m for m in db["movements"] if m.type == "import"])
    exports = len([m for m in db["movements"] if m.type == "export"])
    
    # Conteo de brotes activos
    active_outbreaks = len([o for o in db["outbreaks"] if o.status == "active"])
    
    # Animales por región
    animals_by_region = {}
    for v in db["vaccinations"]:
        if v.region not in animals_by_region:
            animals_by_region[v.region] = 0
        animals_by_region[v.region] += v.animalsVaccinated
    
    return {
        "totalAnimals": vaccination_stats["totalAnimals"],
        "totalImports": imports,
        "totalExports": exports,
        "activeOutbreaks": active_outbreaks,
        "animalsByRegion": animals_by_region
    }

@app.get("/api/public/movements")
def get_public_movements():
    """Obtener estadísticas públicas de movimientos"""
    # Movimientos por país
    movements_by_country = {}
    for m in db["movements"]:
        if m.country not in movements_by_country:
            movements_by_country[m.country] = {"imports": 0, "exports": 0}
        
        if m.type == "import":
            movements_by_country[m.country]["imports"] += m.animalCount
        else:
            movements_by_country[m.country]["exports"] += m.animalCount
    
    # Distribución por propósito
    purpose_distribution = {}
    for m in db["movements"]:
        if m.purpose not in purpose_distribution:
            purpose_distribution[m.purpose] = 0
        purpose_distribution[m.purpose] += m.animalCount
    
    return {
        "movementsByCountry": movements_by_country,
        "purposeDistribution": purpose_distribution,
        "totalImports": sum(m.animalCount for m in db["movements"] if m.type == "import"),
        "totalExports": sum(m.animalCount for m in db["movements"] if m.type == "export")
    }

@app.get("/api/public/outbreaks")
def get_public_outbreaks():
    """Obtener estadísticas públicas de brotes"""
    # Conteo por estado
    status_count = {"active": 0, "controlled": 0, "eradicated": 0}
    for o in db["outbreaks"]:
        status_count[o.status] += 1
    
    # Distribución por enfermedad
    disease_distribution = {}
    for o in db["outbreaks"]:
        if o.diseaseType not in disease_distribution:
            disease_distribution[o.diseaseType] = 0
        disease_distribution[o.diseaseType] += o.affectedAnimals
    
    # Distribución por región
    region_distribution = {}
    for o in db["outbreaks"]:
        if o.region not in region_distribution:
            region_distribution[o.region] = 0
        region_distribution[o.region] += o.affectedAnimals
    
    return {
        "statusDistribution": status_count,
        "diseaseDistribution": disease_distribution,
        "regionDistribution": region_distribution,
        "totalOutbreaks": len(db["outbreaks"]),
        "totalAffectedAnimals": sum(o.affectedAnimals for o in db["outbreaks"])
    }

@app.get("/")
def read_root():
    """Página principal de la API"""
    return {
        "message": "Bienvenido a la API de FEDEGÁN",
        "endpoints": {
            "movements": "/api/movements",
            "outbreaks": "/api/outbreaks",
            "vaccinations": "/api/vaccinations",
            "public_stats": "/api/public/stats"
        },
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)