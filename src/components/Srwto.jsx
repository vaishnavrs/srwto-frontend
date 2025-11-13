// Srwto.jsx
import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const toNumber = (v, fallback = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function Srwto() {
  // Income
  const [daysPerMonth, setDaysPerMonth] = useState(20);
  const [kmPerDay, setKmPerDay] = useState(250);
  const [farePerKm, setFarePerKm] = useState(12);

  // Fuel specifics
  const [fuelCostPerLitre, setFuelCostPerLitre] = useState(100);
  const [vehicleKmpl, setVehicleKmpl] = useState(5);

  // Expenditure (monthly inputs)
  const [oilSparesMonthly, setOilSparesMonthly] = useState(4000);
  const [taxesMonthly, setTaxesMonthly] = useState(2000);
  const [insuranceMonthly, setInsuranceMonthly] = useState(1500);
  const [maintenanceMonthly, setMaintenanceMonthly] = useState(5000);
  const [staffSalaryMonthly, setStaffSalaryMonthly] = useState(0);
  const [drawingsMonthly, setDrawingsMonthly] = useState(2500);
  const [garageRentMonthly, setGarageRentMonthly] = useState(0);
  const [othersMonthly, setOthersMonthly] = useState(1500);
  const [depreciationPct, setDepreciationPct] = useState(10);

  // Annual values
  const [interestOnLoanAnnual, setInterestOnLoanAnnual] = useState(50000);
  const [taxProvisionMonthly, setTaxProvisionMonthly] = useState(0);
  const [repaymentObligationAnnual, setRepaymentObligationAnnual] = useState(120000);

  // Target DSCR
  const [targetDscr, setTargetDscr] = useState(2.5);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [touched, setTouched] = useState({}); // for validation highlight

  const monthlyToAnnual = (m) => toNumber(m) * 12.0;

  const buildPayload = () => ({
    days_per_month: toNumber(daysPerMonth),
    km_per_day: toNumber(kmPerDay),
    fare_per_km: toNumber(farePerKm),
    fuel_cost_per_litre: toNumber(fuelCostPerLitre),
    vehicle_kmpl: toNumber(vehicleKmpl),
    oil_spares_annual: monthlyToAnnual(oilSparesMonthly),
    taxes_annual: monthlyToAnnual(taxesMonthly),
    insurance_annual: monthlyToAnnual(insuranceMonthly),
    maintenance_annual: monthlyToAnnual(maintenanceMonthly),
    staff_salary_annual: monthlyToAnnual(staffSalaryMonthly),
    drawings_annual: monthlyToAnnual(drawingsMonthly),
    garage_rent_annual: monthlyToAnnual(garageRentMonthly),
    others_annual: monthlyToAnnual(othersMonthly),
    depreciation_rate_pct: toNumber(depreciationPct),
    interest_on_loan_annual: toNumber(interestOnLoanAnnual),
    tax_provision_annual: monthlyToAnnual(taxProvisionMonthly),
    repayment_obligation_annual: toNumber(repaymentObligationAnnual),
    target_dscr: toNumber(targetDscr),
  });

  const simpleValidate = (payload) => {
    const missing = [];
    if (!payload.days_per_month) missing.push("Days per month");
    if (!payload.km_per_day) missing.push("Km per day");
    if (!payload.fare_per_km && payload.fare_per_km !== 0) missing.push("Fare per km");
    if (!payload.repayment_obligation_annual) missing.push("Repayment obligation (annual)");
    return missing;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = buildPayload();
    const missing = simpleValidate(payload);
    if (missing.length) {
      setError(`Please provide: ${missing.join(", ")}`);
      // mark fields touched for visual
      setTouched({ days: true, km: true, fare: true, repayment: true });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("https://srwto-backend.onrender.com/menus/dscr/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server error ${resp.status}: ${txt}`);
      }
      const json = await resp.json();
      setResult(json);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    setLoading(true);
    setError(null);

    const payload = buildPayload();
    try {
      const resp = await fetch("https://srwto-backend.onrender.com/menus/dscr_exact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`PDF generation failed: ${resp.status} ${txt}`);
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "srwto_dscr_filled_form.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message || "PDF error");
    } finally {
      setLoading(false);
    }
  };

  // Apply solver suggestion to form (if available)
  // const applySuggestion = () => {
  //   if (!result?.suggestion?.adjusted_inputs) return;
  //   const adj = result.suggestion.adjusted_inputs;
  //   if (adj.days_per_month != null) setDaysPerMonth(adj.days_per_month);
  //   if (adj.depreciation_rate_pct != null) setDepreciationPct(adj.depreciation_rate_pct);
  //   if (adj.drawings_annual != null) setDrawingsMonthly((adj.drawings_annual / 12).toFixed(2));
  //   if (adj.others_annual != null) setOthersMonthly((adj.others_annual / 12).toFixed(2));
  // };

  // small UI helpers
  // const fmtNum = (v) => {
  //   const n = Number(v);
  //   if (!Number.isFinite(n)) return "-";
  //   return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  // };

  return (
    <div className="container my-3">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="card-title">SRWTO DSCR Calculator</h4>

          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
            {/* Income row */}
            <div className="row g-2">
              <div className="col-12">
                <h6 className="mb-1">Income</h6>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Days on road / month</label>
                <input
                  className={`form-control ${touched.days && !daysPerMonth ? "is-invalid" : ""}`}
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, days: true }))}
                />
                <div className="form-text">Max 30</div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Km per day</label>
                <input
                  className={`form-control ${touched.km && !kmPerDay ? "is-invalid" : ""}`}
                  type="number"
                  min={0}
                  step="any"
                  value={kmPerDay}
                  onChange={(e) => setKmPerDay(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, km: true }))}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Fare / rate per km</label>
                <input
                  className={`form-control ${touched.fare && !farePerKm ? "is-invalid" : ""}`}
                  type="number"
                  min={0}
                  step="any"
                  value={farePerKm}
                  onChange={(e) => setFarePerKm(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, fare: true }))}
                />
              </div>
            </div>

            <hr />

            {/* Fuel & vehicle */}
            <div className="row g-2">
              <div className="col-12">
                <h6 className="mb-1">Fuel & Vehicle</h6>
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Fuel cost per litre</label>
                <input
                  className="form-control"
                  type="number"
                  min={0}
                  step="any"
                  value={fuelCostPerLitre}
                  onChange={(e) => setFuelCostPerLitre(e.target.value)}
                />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Vehicle kmpl</label>
                <input
                  className="form-control"
                  type="number"
                  min={0.1}
                  step="any"
                  value={vehicleKmpl}
                  onChange={(e) => setVehicleKmpl(e.target.value)}
                />
              </div>
            </div>

            <hr />

            {/* Expenditure */}
            <div className="row g-2">
              <div className="col-12">
                <h6 className="mb-1">Expenditure (monthly)</h6>
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Oil / Spares (monthly)</label>
                <input className="form-control" type="number" value={oilSparesMonthly} onChange={(e) => setOilSparesMonthly(e.target.value)} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Taxes (monthly)</label>
                <input className="form-control" type="number" value={taxesMonthly} onChange={(e) => setTaxesMonthly(e.target.value)} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Insurance (monthly)</label>
                <input className="form-control" type="number" value={insuranceMonthly} onChange={(e) => setInsuranceMonthly(e.target.value)} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Maintenance (monthly)</label>
                <input className="form-control" type="number" value={maintenanceMonthly} onChange={(e) => setMaintenanceMonthly(e.target.value)} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Staff salary (monthly)</label>
                <input className="form-control" type="number" value={staffSalaryMonthly} onChange={(e) => setStaffSalaryMonthly(e.target.value)} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Drawings (monthly)</label>
                <input className="form-control" type="number" value={drawingsMonthly} onChange={(e) => setDrawingsMonthly(e.target.value)} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Garage rent (monthly)</label>
                <input className="form-control" type="number" value={garageRentMonthly} onChange={(e) => setGarageRentMonthly(e.target.value)} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Others (monthly)</label>
                <input className="form-control" type="number" value={othersMonthly} onChange={(e) => setOthersMonthly(e.target.value)} />
              </div>

              <div className="col-12 col-md-4 d-flex align-items-center">
                <div style={{ width: "100%" }}>
                  <label className="form-label">Depreciation (%) — adjustable</label>
                  <input className="form-range" type="range" min={5} max={15} step={0.5} value={depreciationPct} onChange={(e) => setDepreciationPct(e.target.value)} />
                  <div className="small text-muted">{depreciationPct}%</div>
                </div>
              </div>
            </div>

            <hr />

            {/* Loan & taxes */}
            <div className="row g-2">
              <div className="col-12">
                <h6 className="mb-1">Loan & Taxes</h6>
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Interest on loan (annual)</label>
                <input className="form-control" type="number" value={interestOnLoanAnnual} onChange={(e) => setInterestOnLoanAnnual(e.target.value)} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Tax provision (monthly)</label>
                <input className="form-control" type="number" value={taxProvisionMonthly} onChange={(e) => setTaxProvisionMonthly(e.target.value)} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Repayment obligation (annual)</label>
                <input className={`form-control ${touched.repayment && !repaymentObligationAnnual ? "is-invalid" : ""}`} type="number" value={repaymentObligationAnnual} onChange={(e) => setRepaymentObligationAnnual(e.target.value)} onBlur={() => setTouched((t)=>({...t, repayment:true}))} />
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label">Target DSCR</label>
                <input className="form-control" type="number" step="0.1" value={targetDscr} onChange={(e) => setTargetDscr(e.target.value)} />
              </div>
            </div>

            {/* buttons */}
            <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Calculating</>) : "Calculate DSCR"}
              </button>

              <button className="btn btn-success" type="button" disabled={loading} onClick={downloadPdf}>
                {loading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating</>) : "Download Filled PDF"}
              </button>

              {/* <button className="btn btn-outline-secondary ms-sm-auto" type="button" disabled={!result?.suggestion} onClick={applySuggestion}>
                Apply suggestion
              </button> */}
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            {/* Result preview */}
            {result && (
              <div className="mt-3">
                <h6>Result</h6>
                <div className="row">
                  <div className="col-6 col-md-3">
                    <small className="text-muted">Baseline DSCR</small>
                    <div className="fw-bold">{result.baseline?.dscr ? Number(result.baseline.dscr).toFixed(2) : "N/A"}</div>
                  </div>

                  <div className="col-6 col-md-3">
                    <small className="text-muted">Final DSCR (suggestion)</small>
                    <div className="fw-bold">{result.suggestion?.final_dscr ? Number(result.suggestion.final_dscr).toFixed(2) : "N/A"}</div>
                  </div>

                  <div className="col-12 mt-2">
                    <details>
                      <summary>Show breakdown JSON</summary>
                      <pre style={{ maxHeight: 240, overflow: "auto", fontSize: 12 }}>{JSON.stringify(result, null, 2)}</pre>
                    </details>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
