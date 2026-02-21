export interface Event {
    id: number;
    title: string;
    description: string;
    category: string;
    lat: number;
    lng: number;
    verified_count: number;
    duration_hours?: number;
}
