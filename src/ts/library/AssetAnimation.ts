import { Assets as AssetsLoading } from "./AssetLoading";
import { Assets as AssetsGameplay } from "./AssetGameplay";
import { AssetType } from "../info/AssetType";

export const Animations = {

	loading_text: {
		key: 'loading_text',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsLoading.loading_text.key,
		start: 0,
		end: 3,
		frameSpeed: 4,
		loop: true
	},
	obstacle_log: {
		key: 'obstacle_log',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.obstacle_log.key,
		start: 0,
		end: 5,
		frameSpeed: 6,
		loop: true
	},
	obstacle_rockes: {
		key: 'obstacle_rockes',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.obstacle_rockes.key,
		start: 0,
		end: 4,
		frameSpeed: 6,
		loop: true
	},
	obstacle_trashes: {
		key: 'obstacle_trashes',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.obstacle_trashes.key,
		start: 0,
		end: 4,
		frameSpeed: 6,
		loop: true
	},

};