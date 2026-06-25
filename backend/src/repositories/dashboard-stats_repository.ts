import { PrismaClient, StuntingStatus } from "../generated/prisma/client.js";
import type { AgeGroupCount, IDashboardStatsRepository } from "./dashboard-stats.interface.js";

export class DashboardStatsRepository implements IDashboardStatsRepository {
    private db: PrismaClient;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    async countAllPatients(posyandu_id: string): Promise<number> {
        return await this.db.patient.count({
            where: { posyandu_id }
        });
    }

    async countTotalExaminationsThisMonth(posyandu_id: string): Promise<number> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        return await this.db.examination.count({
            where: {
                exam_date: {
                    gte: startOfMonth,
                    lt: startOfNextMonth,
                },
                patient: {
                    posyandu_id
                }
            }
        });
    }

    async countActiveStunting(posyandu_id: string): Promise<number> {
        return await this.db.stuntingResult.count({
            where: {
                stunting_status: {
                    in: [StuntingStatus.Stunted, StuntingStatus.SeverelyStunted]
                },
                examination: {
                    patient: {
                        posyandu_id
                    }
                }
            }
        });
    }

    async countNormalStatus(posyandu_id: string): Promise<number> {
        return await this.db.stuntingResult.count({
            where: {
                stunting_status: StuntingStatus.Normal,
                examination: {
                    patient: {
                        posyandu_id
                    }
                }
            }
        });
    }

    async countByAgeGroup(posyandu_id: string): Promise<AgeGroupCount[]> {
        const grouped = await this.db.stuntingResult.groupBy({
            by: ['age_months'],
            where: {
                examination: {
                    patient: { posyandu_id }
                }
            },
            _count: { age_months: true }
        });

        const ranges = [
            { label: '0-11 Bulan', min: 0, max: 11 },
            { label: '12-23 Bulan', min: 12, max: 23 },
            { label: '24-35 Bulan', min: 24, max: 35 },
            { label: '36-47 Bulan', min: 36, max: 47 },
            { label: '48-59 Bulan', min: 48, max: 59 },
        ];

        return ranges.map(({ label, min, max }) => ({
            range: label,
            count: grouped
                .filter(g => g.age_months >= min && g.age_months <= max)
                .reduce((sum, g) => sum + g._count.age_months, 0)
        }));
    }
}
