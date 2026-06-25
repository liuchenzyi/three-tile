import { SourceOptions, TileSource } from "three-tile";

export type ArcGisSourceOptions = SourceOptions & { style?: string };
/**
 *  ArcGis datasource
 */
export class ArcGisSource extends TileSource {
	public dataType: string = "image";
	public attribution = "ArcGIS";
	public style = "World_Imagery";
	// public url = "https://services.arcgisonline.com/arcgis/rest/services/{style}/MapServer/tile/{z}/{y}/{x}";
	public url = "https://server.arcgisonline.com/arcgis/rest/services/{style}/MapServer/tile/{z}/{y}/{x}";
	constructor(options?: ArcGisSourceOptions) {
		super(options);
		Object.assign(this, options);
	}
}
