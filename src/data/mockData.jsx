// Datos de movimientos de ganado
export const movementsData = [
    {
      id: '1',
      type: 'import',
      country: 'Brasil',
      animalCount: 250,
      animalType: 'Bovino',
      purpose: 'Reproducción',
      healthStatus: 'Saludable',
      documentNumber: 'IMP-2025-0125',
      dateOfMovement: '2025-04-15T00:00:00Z',
      responsible: 'Importadora Ganadera S.A.',
      destination: 'Meta',
      hasAlert: false,
      coordinates: { 
        origin: { lat: -15.77, lng: -47.92 }, 
        destination: { lat: 4.15, lng: -73.63 } 
      }
    },
    {
      id: '2',
      type: 'export',
      country: 'México',
      animalCount: 180,
      animalType: 'Bovino',
      purpose: 'Comercialización',
      healthStatus: 'Saludable',
      documentNumber: 'EXP-2025-0089',
      dateOfMovement: '2025-04-18T00:00:00Z',
      responsible: 'Exportadora Nacional Ltda.',
      origin: 'Córdoba',
      hasAlert: false,
      coordinates: { 
        origin: { lat: 8.75, lng: -75.88 }, 
        destination: { lat: 19.43, lng: -99.13 } 
      }
    },
    {
      id: '3',
      type: 'import',
      country: 'Argentina',
      animalCount: 120,
      animalType: 'Bovino',
      purpose: 'Reproducción',
      healthStatus: 'Saludable',
      documentNumber: 'IMP-2025-0142',
      dateOfMovement: '2025-04-22T00:00:00Z',
      responsible: 'Importadora Sur S.A.S.',
      destination: 'Valle del Cauca',
      hasAlert: false,
      coordinates: { 
        origin: { lat: -34.60, lng: -58.38 }, 
        destination: { lat: 3.45, lng: -76.53 } 
      }
    },
    {
      id: '4',
      type: 'export',
      country: 'Perú',
      animalCount: 90,
      animalType: 'Porcino',
      purpose: 'Comercialización',
      healthStatus: 'Saludable',
      documentNumber: 'EXP-2025-0103',
      dateOfMovement: '2025-04-28T00:00:00Z',
      responsible: 'Exportadora Andina S.A.',
      origin: 'Nariño',
      hasAlert: false,
      coordinates: { 
        origin: { lat: 1.21, lng: -77.28 }, 
        destination: { lat: -12.04, lng: -77.03 } 
      }
    },
    {
      id: '5',
      type: 'import',
      country: 'Estados Unidos',
      animalCount: 75,
      animalType: 'Bovino',
      purpose: 'Mejoramiento genético',
      healthStatus: 'Cuarentena',
      documentNumber: 'IMP-2025-0158',
      dateOfMovement: '2025-05-03T00:00:00Z',
      responsible: 'Genética Avanzada S.A.S.',
      destination: 'Cundinamarca',
      hasAlert: true,
      alertReason: 'Procedencia de zona con casos recientes de brucelosis',
      coordinates: { 
        origin: { lat: 39.73, lng: -104.99 }, 
        destination: { lat: 4.60, lng: -74.08 } 
      }
    }
  ];
  
  // Datos de brotes de enfermedades
  export const outbreaksData = [
    {
      id: '1',
      diseaseType: 'Fiebre Aftosa',
      status: 'active',
      severity: 'alta',
      detectionDate: '2025-04-10T00:00:00Z',
      region: 'Meta',
      municipality: 'Puerto López',
      affectedAnimals: 45,
      measures: 'Cuarentena, vacunación de emergencia, sacrificio controlado',
      responsibleTechnician: 'Dr. Luis Martínez',
      progress: [
        { date: '2025-04-10', newCases: 12, totalCases: 12 },
        { date: '2025-04-15', newCases: 20, totalCases: 32 },
        { date: '2025-04-20', newCases: 13, totalCases: 45 },
        { date: '2025-04-25', newCases: 0, totalCases: 45 }
      ],
      coordinates: { lat: 4.08, lng: -72.96 }
    },
    {
      id: '2',
      diseaseType: 'Brucelosis',
      status: 'controlled',
      severity: 'media',
      detectionDate: '2025-03-28T00:00:00Z',
      region: 'Antioquia',
      municipality: 'Santa Rosa de Osos',
      affectedAnimals: 28,
      measures: 'Aislamiento, pruebas serológicas, vacunación estratégica',
      responsibleTechnician: 'Dra. Carmen Jiménez',
      progress: [
        { date: '2025-03-28', newCases: 8, totalCases: 8 },
        { date: '2025-04-05', newCases: 13, totalCases: 21 },
        { date: '2025-04-12', newCases: 7, totalCases: 28 },
        { date: '2025-04-19', newCases: 0, totalCases: 28 },
        { date: '2025-04-26', newCases: 0, totalCases: 28 }
      ],
      coordinates: { lat: 6.65, lng: -75.46 }
    },
    {
      id: '3',
      diseaseType: 'Fiebre Aftosa',
      status: 'eradicated',
      severity: 'baja',
      detectionDate: '2025-02-15T00:00:00Z',
      region: 'Córdoba',
      municipality: 'Montería',
      affectedAnimals: 17,
      measures: 'Cuarentena, vacunación, seguimiento epidemiológico',
      responsibleTechnician: 'Dr. José Ramírez',
      progress: [
        { date: '2025-02-15', newCases: 5, totalCases: 5 },
        { date: '2025-02-22', newCases: 8, totalCases: 13 },
        { date: '2025-03-01', newCases: 4, totalCases: 17 },
        { date: '2025-03-08', newCases: 0, totalCases: 17 },
        { date: '2025-03-15', newCases: 0, totalCases: 17 },
        { date: '2025-03-22', newCases: 0, totalCases: 17 }
      ],
      coordinates: { lat: 8.75, lng: -75.88 }
    },
    {
      id: '4',
      diseaseType: 'Tuberculosis Bovina',
      status: 'active',
      severity: 'alta',
      detectionDate: '2025-04-25T00:00:00Z',
      region: 'Cundinamarca',
      municipality: 'Ubaté',
      affectedAnimals: 23,
      measures: 'Cuarentena, pruebas diagnósticas, sacrificio sanitario',
      responsibleTechnician: 'Dra. Laura Salazar',
      progress: [
        { date: '2025-04-25', newCases: 8, totalCases: 8 },
        { date: '2025-05-02', newCases: 15, totalCases: 23 }
      ],
      coordinates: { lat: 5.31, lng: -73.82 }
    }
  ];
  
  // Datos de jornadas de vacunación
  export const vaccinationsData = [
    {
      id: '1',
      vaccinatorId: '1',
      vaccinatorName: 'Juan Pérez',
      farm: 'Finca El Recreo',
      municipality: 'Chía',
      region: 'Cundinamarca',
      campaign: 'Campaña Nacional 2025 - Fase 1',
      campaignStatus: 'En Curso',
      vaccineType: 'Aftosa Bivalente',
      animalsVaccinated: 120,
      maleCount: 45,
      femaleCount: 75,
      youngCount: 25,
      adultCount: 95,
      observations: 'Sin novedades durante la jornada',
      dateCreated: '2025-05-05T08:30:00Z',
      coordinates: { lat: 4.85, lng: -74.05 }
    },
    {
      id: '2',
      vaccinatorId: '1',
      vaccinatorName: 'Juan Pérez',
      farm: 'Hacienda La Primavera',
      municipality: 'Cajicá',
      region: 'Cundinamarca',
      campaign: 'Campaña Nacional 2025 - Fase 1',
      campaignStatus: 'En Curso',
      vaccineType: 'Aftosa Bivalente',
      animalsVaccinated: 230,
      maleCount: 100,
      femaleCount: 130,
      youngCount: 50,
      adultCount: 180,
      observations: 'Algunos animales presentaron resistencia',
      dateCreated: '2025-05-06T09:15:00Z',
      coordinates: { lat: 4.92, lng: -74.02 }
    },
    {
      id: '3',
      vaccinatorId: '1',
      vaccinatorName: 'Juan Pérez',
      farm: 'Rancho Grande',
      municipality: 'Zipaquirá',
      region: 'Cundinamarca',
      campaign: 'Campaña Nacional 2025 - Fase 1',
      campaignStatus: 'En Curso',
      vaccineType: 'Aftosa Bivalente',
      animalsVaccinated: 175,
      maleCount: 70,
      femaleCount: 105,
      youngCount: 40,
      adultCount: 135,
      observations: 'Completado sin novedades',
      dateCreated: '2025-05-07T10:20:00Z',
      coordinates: { lat: 5.02, lng: -74.00 }
    },
    {
      id: '4',
      vaccinatorId: '2',
      vaccinatorName: 'María López',
      farm: 'Finca Los Alpes',
      municipality: 'Medellín',
      region: 'Antioquia',
      campaign: 'Campaña Nacional 2025 - Fase 1',
      campaignStatus: 'En Curso',
      vaccineType: 'Aftosa Bivalente',
      animalsVaccinated: 320,
      maleCount: 140,
      femaleCount: 180,
      youngCount: 75,
      adultCount: 245,
      observations: 'Completado en dos días por el tamaño del hato',
      dateCreated: '2025-05-08T08:45:00Z',
      coordinates: { lat: 6.25, lng: -75.57 }
    },
    {
      id: '5',
      vaccinatorId: '3',
      vaccinatorName: 'Carlos Rodríguez',
      farm: 'Hacienda El Edén',
      municipality: 'Cali',
      region: 'Valle del Cauca',
      campaign: 'Campaña Nacional 2025 - Fase 1',
      campaignStatus: 'En Curso',
      vaccineType: 'Triple Bovina',
      animalsVaccinated: 195,
      maleCount: 85,
      femaleCount: 110,
      youngCount: 45,
      adultCount: 150,
      observations: 'Jornada completada satisfactoriamente',
      dateCreated: '2025-05-09T09:30:00Z',
      coordinates: { lat: 3.45, lng: -76.53 }
    }
  ];