export interface ITripCreateData {
  userId: string;
  photos: string[];
  destination: string;
  travelType: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  description: string;
}
