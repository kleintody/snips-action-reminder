module.exports = {
    DEFAULT_LOCALE: 'english',
    SUPPORTED_LOCALES: [
        'english',
        'french'
    ],
    DEFAULT_LANGUAGE: 'en',
    LANGUAGE_MAPPINGS: {
        english: 'en',
        french: 'fr'
    },
    INTENT_PROBABILITY_THRESHOLD: 0.2,
    INTENT_FILTER_PROBABILITY_THRESHOLD: 0,
    SLOT_CONFIDENCE_THRESHOLD: 0,
    ASR_TOKENS_CONFIDENCE_THRESHOLD: 0.2,
    GRAIN_TO_STRING: [
        'Year',
        'Quarter',
        'Month',
        'Week',
        'Day',
        'Hour',
        'Minute',
        'Second',
    ]
}