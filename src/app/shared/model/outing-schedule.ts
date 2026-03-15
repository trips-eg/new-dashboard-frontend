export interface OutingSchedule {
  id?: number;
  dayOfWeek: number[];
  validFrom: string; // Date ISO string
  validTo: string; // Date ISO string
  schedualType: number;
  times: { id?: number; startTime: string; endTime: string }[];
  outingId?: number;
}
