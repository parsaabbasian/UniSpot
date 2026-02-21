export interface Event {
    id: number;
    title: string;
    description: string;
    category: string;
    lat: number;
    lng: number;
    verified_count: number;
    duration_hours?: number;
    start_time: string;
    end_time: string;
    creator_name?: string;
}
