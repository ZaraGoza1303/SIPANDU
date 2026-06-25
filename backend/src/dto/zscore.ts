import whoData from "../../standar-who.json" with {type: "json"}
import { StuntingStatus, WastingStatus, UnderweightStatus } from "../generated/prisma/client.js";

interface ZScoreOutput {
  wfa: number;
  hfa: number;
  wfh: number;
  stuntingStatus: StuntingStatus;
  wastingStatus: WastingStatus;
  underweightStatus: UnderweightStatus;
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

    let stuntingStatus: StuntingStatus = StuntingStatus.Normal;
    let wastingStatus: WastingStatus = WastingStatus.GiziBaikNormal;
    let underweightStatus: UnderweightStatus = UnderweightStatus.BeratBadanNormal;

    if (hfa < -3) stuntingStatus = StuntingStatus.SeverelyStunted;
    else if (hfa < -2) stuntingStatus = StuntingStatus.Stunted;
    else if (hfa > 3) stuntingStatus = StuntingStatus.High;

    if (wfh < -3) wastingStatus = WastingStatus.GiziBurukSeverelyWasted;
    else if (wfh < -2) wastingStatus = WastingStatus.GiziKurangWasted;
    else if (wfh > 1) wastingStatus = WastingStatus.BerisikoGiziLebih;

    if (wfa < -3) underweightStatus = UnderweightStatus.BeratBadanSangatKurang;
    else if (wfa < -2) underweightStatus = UnderweightStatus.BeratBadanKurang;

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