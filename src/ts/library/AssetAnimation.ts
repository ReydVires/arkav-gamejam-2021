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
	player_idle: {
		key: 'player_idle',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.player_idle.key,
		start: 0,
		end: 5,
		frameSpeed: 4,
		loop: true
	},

};