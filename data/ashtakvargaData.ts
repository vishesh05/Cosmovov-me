export interface AshtakvargaInterpretation {
    title: string;
    description: string;
    category: 'excellent' | 'good' | 'moderate' | 'weak';
}

export const SAV_STRENGTH_LEVELS = {
    excellent: { min: 30, label: 'Excellent', color: 'green' },
    good: { min: 25, label: 'Good', color: 'blue' },
    moderate: { min: 20, label: 'Moderate', color: 'yellow' },
    weak: { min: 0, label: 'Weak', color: 'red' }
};

export const BAV_STRENGTH_LEVELS = {
    excellent: { min: 5, label: 'Very Strong' },
    good: { min: 4, label: 'Strong' },
    moderate: { min: 3, label: 'Moderate' },
    weak: { min: 0, label: 'Weak' }
};

export function getSAVStrength(points: number): keyof typeof SAV_STRENGTH_LEVELS {
    if (points >= 30) return 'excellent';
    if (points >= 25) return 'good';
    if (points >= 20) return 'moderate';
    return 'weak';
}

export function getBAVStrength(points: number): keyof typeof BAV_STRENGTH_LEVELS {
    if (points >= 5) return 'excellent';
    if (points >= 4) return 'good';
    if (points >= 3) return 'moderate';
    return 'weak';
}

export const HOUSE_INTERPRETATIONS: { [key: number]: { [strength: string]: string } } = {
    1: {
        excellent: 'Exceptional vitality, strong personality, and natural leadership abilities. Excellent health and self-confidence.',
        good: 'Good physical constitution and positive self-image. Favorable for personal initiatives.',
        moderate: 'Average health and self-expression. Requires conscious effort for personal development.',
        weak: 'Challenges in health or self-confidence. Need for remedies and self-care practices.'
    },
    2: {
        excellent: 'Outstanding wealth accumulation potential. Strong family bonds and excellent speech.',
        good: 'Good financial stability and family support. Pleasant communication skills.',
        moderate: 'Moderate financial resources. Family relationships require attention.',
        weak: 'Financial challenges possible. Speech and family matters need careful handling.'
    },
    3: {
        excellent: 'Exceptional courage, excellent siblings relationships, and strong communication abilities.',
        good: 'Good initiative power and supportive siblings. Favorable for short journeys.',
        moderate: 'Average courage and sibling relations. Efforts needed for skill development.',
        weak: 'Challenges with courage or siblings. Need to develop confidence and skills.'
    },
    4: {
        excellent: 'Great emotional happiness, excellent property prospects, and strong mother bond.',
        good: 'Good domestic peace and property gains. Favorable education and vehicles.',
        moderate: 'Average home comforts. Mother relationship and property require attention.',
        weak: 'Emotional challenges or property issues. Need for inner peace practices.'
    },
    5: {
        excellent: 'Exceptional intelligence, blessed with children, and excellent creative abilities.',
        good: 'Good intellect and favorable for children. Strong romantic and creative pursuits.',
        moderate: 'Average intelligence and children matters. Creative expression needs development.',
        weak: 'Challenges in education or children. Need for spiritual and creative practices.'
    },
    6: {
        excellent: 'Strong ability to overcome enemies and obstacles. Excellent service and health recovery.',
        good: 'Good capacity to handle challenges. Favorable for competitive fields.',
        moderate: 'Average ability to face obstacles. Health and enemies require vigilance.',
        weak: 'Significant challenges from enemies or health. Need for protective remedies.'
    },
    7: {
        excellent: 'Exceptional partnership and marriage prospects. Strong business acumen.',
        good: 'Good marital harmony and partnership success. Favorable for collaborations.',
        moderate: 'Average partnership experiences. Marriage requires conscious effort.',
        weak: 'Challenges in relationships or partnerships. Need for relationship counseling.'
    },
    8: {
        excellent: 'Strong longevity and transformation power. Excellent for occult and research.',
        good: 'Good ability to handle crises. Favorable for inheritance and hidden knowledge.',
        moderate: 'Average transformation experiences. Requires caution in risky matters.',
        weak: 'Challenges in longevity or sudden events. Need for protective practices.'
    },
    9: {
        excellent: 'Exceptional fortune, strong father bond, and excellent spiritual inclinations.',
        good: 'Good luck and favorable for higher learning. Strong dharmic tendencies.',
        moderate: 'Average fortune and father relations. Spiritual growth needs attention.',
        weak: 'Challenges in luck or with father. Need for dharmic practices and pilgrimages.'
    },
    10: {
        excellent: 'Outstanding career success and social status. Excellent professional reputation.',
        good: 'Good career prospects and public recognition. Favorable for authority positions.',
        moderate: 'Average career growth. Professional success requires sustained effort.',
        weak: 'Career challenges or reputation issues. Need for skill development and hard work.'
    },
    11: {
        excellent: 'Exceptional gains and income. Strong network of friends and fulfilled desires.',
        good: 'Good income sources and supportive friends. Favorable for aspirations.',
        moderate: 'Average gains and friendships. Income requires active pursuit.',
        weak: 'Challenges in income or friendships. Need for networking and financial planning.'
    },
    12: {
        excellent: 'Strong spiritual liberation potential. Excellent for foreign connections and charity.',
        good: 'Good for spiritual practices and foreign matters. Favorable for meditation.',
        moderate: 'Average spiritual inclinations. Expenses and losses need monitoring.',
        weak: 'Excessive expenses or losses possible. Need for spiritual discipline and budgeting.'
    }
};

export const GENERAL_INTERPRETATIONS = {
    totalPoints: {
        high: 'Total SAV points above 340 indicate a generally fortunate chart with strong karmic support.',
        average: 'Total SAV points between 320-340 indicate balanced karma with both opportunities and challenges.',
        low: 'Total SAV points below 320 suggest need for conscious effort and remedial measures.'
    },
    transit: 'When planets transit through houses with high SAV points (28+), their positive effects are amplified. Low SAV houses (below 22) may require extra caution during transits.'
};
