/**
 *@description: Tile Loader factory
 *@author: 郭江峰
 *@date: 2023-04-06
 */

import { ISource } from "../source";
import { ITileMaterialLoader } from "./ITileLoaders";
import { TileLoadingManager } from "./TileLoadingManager";

const author = { name: "GuoJF" };

/**
 * Factory for loader
 */
export const LoaderFactory = {
	manager: new TileLoadingManager(),
	// Dict of img loader
	imgLoaderMap: new Map<string, ITileMaterialLoader>(),

	/**
	 * Register material loader
	 * @param loader material loader
	 */
	registerMaterialLoader(loader: ITileMaterialLoader) {
		LoaderFactory.imgLoaderMap.set(loader.dataType, loader);
		loader.info.author = loader.info.author ?? author.name;
	},

	/**
	 * Get material loader from datasource
	 * @param source datasource
	 * @returns material loader
	 */
	getMaterialLoader(source: ISource | string) {
		const dataType = typeof source === "string" ? source : source.dataType;
		const loader = LoaderFactory.imgLoaderMap.get(dataType);
		if (loader) {
			return loader;
		} else {
			throw new Error(`Image source dataType("${dataType}") is not supported!`);
		}
	},

	/**
	 * Get all loaders
	 * @returns Image loaders
	 */
	getLoaders() {
		return {
			imgLoaders: Array.from(LoaderFactory.imgLoaderMap.values()),
		};
	},
};
