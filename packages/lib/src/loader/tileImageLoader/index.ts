/**
 *@description: Plugin form image tile loader
 *@author: 郭江峰
 *@date: 2023-04-05
 */

import { registerImgLoader } from "../..";
import { TileImageLoader } from "./TileImageLoader";
export * from "./TileImageLoader";

registerImgLoader(new TileImageLoader());
