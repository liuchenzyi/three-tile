/**
 *@description: Map projection interface
 *@author: 郭江峰
 *@date: 2023-04-06
 */

// projection ID, only support 3857 and 4326
export type ProjectionType = "3857" | "4326";

/**
 * Porjection interface
 */
export interface IProjection {
	readonly ID: ProjectionType;
	readonly mapWidth: number; // W-E scale
	readonly mapHeight: number; // N-S scale
	readonly mapDepth: number; // height scale

	project(lon: number, lat: number): { x: number; y: number };
	unProject(x: number, y: number): { lon: number; lat: number };
	getProjBoundsFromLonLat(bounds: [number, number, number, number]): [number, number, number, number];
	getProjBoundsFromXYZ(x: number, y: number, z: number): [number, number, number, number];
	getLonLatBoundsFromXYZ(x: number, y: number, z: number): [number, number, number, number];
}
