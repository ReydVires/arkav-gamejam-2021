import { Assets as AssetsLoading } from "./AssetLoading";
import { Assets as AssetsGameplay } from "./AssetGameplay";
import { AssetType } from "../info/AssetType";

export const Animations = {

	player_raft_ride: {
		key: 'player_raft_ride',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.player_raft_ride.key,
		start: 0,
		end: 5,
		frameSpeed: 6,
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