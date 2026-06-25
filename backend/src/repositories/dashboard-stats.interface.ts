export interface IDashboardStats {
    countAllPatients(posyandu_id: string): Promise<number>;
    countExaminationsThisMonth(posyandu_id: string): Promise<number>;
}