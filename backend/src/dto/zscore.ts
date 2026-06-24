import whoData from "../../standar-who.json" with {type: "json"}

interface ZScoreOutput {
  wfa: number;
  hfa: number;
  wfh: number;
  stuntingStatus: string;
  wastingStatus: string;
  underweightStatus: string;
}

interface LMSParams {
  L: number;
  M: number;
  S: number;
}

interface UmurParams {
  wfa: LMSParams;
  hfa: LMSParams;
  wfh: LMSParams;
}

let stuntingStatus = "Normal";
let wastingStatus = "Gizi Baik (Normal)";
let underweightStatus = "Berat Badan Normal";


function zScoreLMS(X: number, L: number, M: number, S: number): number {
  if (L === 0) {
    return Math.log(X / M) / S;
  }
  return (Math.pow(X / M, L) - 1) / (L * S);
}

export function calculateZScoreWHO(weight: number, height: number, age_months: number, gender: string): ZScoreOutput{
    const genderKey = gender === 'L' ? 'laki_laki' : 'perempuan';
    const dataGender = whoData[genderKey as keyof typeof whoData];

    const umurKey = age_months.toString();
    const acuan = dataGender[umurKey as keyof typeof dataGender];

    if (!acuan) {
        throw new Error(`Data umur ${age_months} bulan tidak ditemukan.`);
    }

    const wfa = zScoreLMS(weight, acuan.wfa.L, acuan.wfa.M, acuan.wfa.S);
    const hfa = zScoreLMS(height, acuan.hfa.L, acuan.hfa.M, acuan.hfa.S);
    const wfh = zScoreLMS(weight, acuan.wfh.L, acuan.wfh.M, acuan.wfh.S);
 
    if (hfa < -3) stuntingStatus = "Severely Stunting (Sangat Pendek)";
    else if (hfa < -2) stuntingStatus = "Stunting (Pendek)";
    else if (hfa > 3) stuntingStatus = "Tinggi";

    if (wfh < -3) wastingStatus = "Gizi Buruk (Severely Wasted)";
    else if (wfh < -2) wastingStatus = "Gizi Kurang (Wasted)";
    else if (wfh > 1) wastingStatus = "Berisiko Gizi Lebih";

    if (wfa < -3) underweightStatus = "Berat Badan Sangat Kurang";
    else if (wfa < -2) underweightStatus = "Berat Badan Kurang";

    const res: ZScoreOutput = {
        wfa: Math.round(wfa * 100) / 100,
        hfa: Math.round(hfa * 100) / 100,
        wfh: Math.round(wfh * 100) / 100,
        stuntingStatus,
        wastingStatus,
        underweightStatus,
    }

    return res;
}