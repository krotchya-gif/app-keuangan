-- Migration: Add floating_phases and calculated result columns to kpr_simulations
-- Untuk menyimpan data fase bunga berjenjang dan hasil perhitungan

-- Add floating_phases column (JSONB for array of phases)
ALTER TABLE kpr_simulations 
ADD COLUMN IF NOT EXISTS floating_phases JSONB DEFAULT NULL;

-- Add calculated result columns
ALTER TABLE kpr_simulations
ADD COLUMN IF NOT EXISTS monthly_installment_min DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_installment_max DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_interest DECIMAL(18,2) DEFAULT 0;

-- Add documentation comments
COMMENT ON COLUMN kpr_simulations.floating_phases IS 
'Stores JSON array of floating transition phases: [{durationYears: number, rateAnnual: number}]. Null means single floating rate mode (non-berjenjang).';

COMMENT ON COLUMN kpr_simulations.monthly_installment_min IS 
'Cicilan minimum (periode fix) yang dihitung saat simulasi dibuat';

COMMENT ON COLUMN kpr_simulations.monthly_installment_max IS 
'Cicilan maksimum (periode floating) yang dihitung saat simulasi dibuat';

COMMENT ON COLUMN kpr_simulations.total_interest IS 
'Total bunga yang harus dibayar selama tenor KPR';
