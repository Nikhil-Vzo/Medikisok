export type PrakritiDosha = 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridoshaja';
export type AgniType = 'Manda' | 'Tikshna' | 'Visham' | 'Sama';
export type KoshthaType = 'Mridu' | 'Madhyama' | 'Krura';
export type BalaGrade = 'Pravara' | 'Madhyama' | 'Avara';

export interface DashavidhaPariksha {
  // 1. Prakriti (Natural Constitution)
  prakriti: {
    dominant: PrakritiDosha;
    characteristics: string[];
  };
  // 2. Vikriti (Current Morbid Imbalance)
  vikriti: {
    aggravatedDosha: PrakritiDosha;
    severity: 'Mild' | 'Moderate' | 'Severe';
  };
  // 3. Sara (Tissue Essence / Dhatu State)
  sara: BalaGrade;
  // 4. Samhanana (Body Compactness)
  samhanana: BalaGrade;
  // 5. Pramana (Anthropometry / Body Proportions)
  pramana: 'Appropriate' | 'Overweight' | 'Underweight';
  // 6. Satmya (Adaptability / Homologation)
  satmya: 'Eka-Rasa' | 'Sarva-Rasa' | 'Oka-Satmya';
  // 7. Sattva (Mental Temperament & Resilience)
  sattva: BalaGrade;
  // 8. Ahara Shakti (Intake & Digestive Capacity)
  aharaShakti: {
    abhyavaharana: BalaGrade; // Ingestion
    jarana: BalaGrade;        // Digestion
    agni: AgniType;
    koshtha: KoshthaType;
  };
  // 9. Vyayama Shakti (Physical Stamina & Work Capacity)
  vyayamaShakti: BalaGrade;
  // 10. Vaya (Age Category)
  vaya: 'Bala' | 'Madhyama' | 'Vriddha';
}

export interface AharaViharaAssessment {
  dietaryHabits: {
    foodPreference: 'Vegetarian' | 'Non-Vegetarian' | 'Mixed';
    tastePredominance: string[]; // Madhura, Amla, Lavana, Katu, Tikta, Kashaya
    mealTiming: 'Regular' | 'Irregular';
    waterIntake: string;
  };
  viharaHabits: {
    sleepPattern: 'Sound' | 'Disturbed' | 'Insomnia' | 'Excessive';
    sleepHours: number;
    daySleep: boolean;
    physicalActivity: 'Sedentary' | 'Moderate' | 'Heavy';
    stressLevel: 'Low' | 'Moderate' | 'High';
  };
  nidanaFactors: string[]; // Causative factors identified
}

export interface AyushClinicalProfile {
  chiefComplaintAyush: string;
  dashavidha: DashavidhaPariksha;
  aharaVihara: AharaViharaAssessment;
  sampraptiGhataka?: {
    dosha?: string;
    dushya?: string;
    srotas?: string;
    agvimandya?: boolean;
  };
}
