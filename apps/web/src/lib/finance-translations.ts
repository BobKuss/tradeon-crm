/**
 * Finance module translations.
 * Import `ft` for English (default) or use `FINANCE_T[lang]` for multilingual support.
 * Replace with a real i18n library (next-intl, react-i18next, etc.) when needed.
 */

const en = {
  title:                    'Deal Profitability',
  subtitle:                 'Margin & Commission Calculator',
  purchaseCosts:            'Purchase Costs',
  salesCosts:               'Sales Costs',
  peopleCommission:         'People & Commission',
  result:                   'Result',

  purchasePriceNet:         'Purchase Price Net',
  salePriceNet:             'Sale Price Net',
  purchaseTransport:        'Purchase Transport',
  salesTransport:           'Sales Transport',
  preparation:              'Preparation',
  workshop:                 'Workshop',
  documents:                'Documents',
  registration:             'Registration',
  importExport:             'Import / Export',
  warrantyRisk:             'Warranty / Risk',
  bankCosts:                'Bank Costs',
  marketplaceCosts:         'Marketplace Costs',
  otherPurchaseCosts:       'Other Purchase Costs',
  otherSalesCosts:          'Other Sales Costs',

  buyerUser:                'Buyer',
  sellerUser:               'Seller',
  buyerShare:               'Buyer Share',
  sellerShare:              'Seller Share',
  doubleCommission:         'Double Commission',

  profitBeforeCommission:   'Profit Before Commission',
  marginPercent:            'Margin %',
  marginQualityScore:       'Margin Quality Score',
  commissionPool:           'Commission Pool',
  commissionPoolAmount:     'Commission Pool Amount',
  buyerCommission:          'Buyer Commission',
  sellerCommission:         'Seller Commission',
  totalCommission:          'Total Commission',
  finalNetProfit:           'Final Net Profit',
  finalMarginPercent:       'Final Margin %',

  approvalRequired:         'Approval Required',
  minimumProfitNotReached:  'Minimum profit of €1,000 not reached — no commission calculated.',
  negativeProfit:           'Negative or zero profit — no commission calculated.',

  save:                     'Save',
  recalculate:              'Recalculate',
  saving:                   'Saving…',
  saved:                    'Saved',
  error:                    'Error saving profitability data.',

  selectUser:               '— Select person —',
  noData:                   'No profitability data yet.',

  'score.critical':         'Critical',
  'score.low':              'Low',
  'score.medium':           'Medium',
  'score.good':             'Good',
  'score.excellent':        'Excellent',
} as const;

const de: Record<keyof typeof en, string> = {
  title:                    'Deal-Profitabilität',
  subtitle:                 'Marge & Provisionsrechner',
  purchaseCosts:            'Einkaufskosten',
  salesCosts:               'Verkaufskosten',
  peopleCommission:         'Personen & Provision',
  result:                   'Ergebnis',

  purchasePriceNet:         'Einkaufspreis netto',
  salePriceNet:             'Verkaufspreis netto',
  purchaseTransport:        'Einkaufstransport',
  salesTransport:           'Verkaufstransport',
  preparation:              'Aufbereitung',
  workshop:                 'Werkstatt',
  documents:                'Dokumente',
  registration:             'Zulassung',
  importExport:             'Import / Export',
  warrantyRisk:             'Garantie / Risiko',
  bankCosts:                'Bankkosten',
  marketplaceCosts:         'Marktplatzgebühren',
  otherPurchaseCosts:       'Sonstige Einkaufskosten',
  otherSalesCosts:          'Sonstige Verkaufskosten',

  buyerUser:                'Einkäufer',
  sellerUser:               'Verkäufer',
  buyerShare:               'Einkäufer-Anteil',
  sellerShare:              'Verkäufer-Anteil',
  doubleCommission:         'Doppelprovision',

  profitBeforeCommission:   'Gewinn vor Provision',
  marginPercent:            'Marge %',
  marginQualityScore:       'Margenqualität',
  commissionPool:           'Provisionspool',
  commissionPoolAmount:     'Provisionspool-Betrag',
  buyerCommission:          'Einkäufer-Provision',
  sellerCommission:         'Verkäufer-Provision',
  totalCommission:          'Gesamtprovision',
  finalNetProfit:           'Endgewinn netto',
  finalMarginPercent:       'Endmarge %',

  approvalRequired:         'Genehmigung erforderlich',
  minimumProfitNotReached:  'Mindestgewinn von €1.000 nicht erreicht — keine Provision berechnet.',
  negativeProfit:           'Negativer oder null Gewinn — keine Provision berechnet.',

  save:                     'Speichern',
  recalculate:              'Neu berechnen',
  saving:                   'Speichert…',
  saved:                    'Gespeichert',
  error:                    'Fehler beim Speichern der Daten.',

  selectUser:               '— Person auswählen —',
  noData:                   'Noch keine Profitabilitätsdaten.',

  'score.critical':         'Kritisch',
  'score.low':              'Niedrig',
  'score.medium':           'Mittel',
  'score.good':             'Gut',
  'score.excellent':        'Exzellent',
};

const es: Record<keyof typeof en, string> = {
  title:                    'Rentabilidad del Trato',
  subtitle:                 'Calculadora de Margen y Comisión',
  purchaseCosts:            'Costes de Compra',
  salesCosts:               'Costes de Venta',
  peopleCommission:         'Personas y Comisión',
  result:                   'Resultado',

  purchasePriceNet:         'Precio de Compra Neto',
  salePriceNet:             'Precio de Venta Neto',
  purchaseTransport:        'Transporte de Compra',
  salesTransport:           'Transporte de Venta',
  preparation:              'Preparación',
  workshop:                 'Taller',
  documents:                'Documentos',
  registration:             'Matriculación',
  importExport:             'Importación / Exportación',
  warrantyRisk:             'Garantía / Riesgo',
  bankCosts:                'Costes Bancarios',
  marketplaceCosts:         'Comisiones de Marketplace',
  otherPurchaseCosts:       'Otros Costes de Compra',
  otherSalesCosts:          'Otros Costes de Venta',

  buyerUser:                'Comprador',
  sellerUser:               'Vendedor',
  buyerShare:               'Parte Comprador',
  sellerShare:              'Parte Vendedor',
  doubleCommission:         'Comisión Doble',

  profitBeforeCommission:   'Beneficio Antes de Comisión',
  marginPercent:            'Margen %',
  marginQualityScore:       'Calidad del Margen',
  commissionPool:           'Pool de Comisión',
  commissionPoolAmount:     'Importe del Pool',
  buyerCommission:          'Comisión Comprador',
  sellerCommission:         'Comisión Vendedor',
  totalCommission:          'Comisión Total',
  finalNetProfit:           'Beneficio Neto Final',
  finalMarginPercent:       'Margen Final %',

  approvalRequired:         'Aprobación Requerida',
  minimumProfitNotReached:  'No se alcanza el beneficio mínimo de €1.000 — sin comisión calculada.',
  negativeProfit:           'Beneficio negativo o cero — sin comisión calculada.',

  save:                     'Guardar',
  recalculate:              'Recalcular',
  saving:                   'Guardando…',
  saved:                    'Guardado',
  error:                    'Error al guardar los datos de rentabilidad.',

  selectUser:               '— Seleccionar persona —',
  noData:                   'Sin datos de rentabilidad todavía.',

  'score.critical':         'Crítico',
  'score.low':              'Bajo',
  'score.medium':           'Medio',
  'score.good':             'Bueno',
  'score.excellent':        'Excelente',
};

export const FINANCE_T = { en, de, es } as const;

// Default export — English. Components import this directly.
export const ft = FINANCE_T.en;

export type FinanceLang = keyof typeof FINANCE_T;
export type FinanceTranslationKey = keyof typeof en;
