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
	obstacle_rockes_2: {
		key: 'obstacle_rockes_tap2',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.obstacle_rockes_2.key,
		start: 0,
		end: 5,
		frameSpeed: 6,
		loop: true
	},
	obstacle_rockes_3: {
		key: 'obstacle_rockes_tap3',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.obstacle_rockes_3.key,
		start: 0,
		end: 5,
		frameSpeed: 6,
		loop: true
	},
	obstacle_rockes_destroy: {
		key: 'obstacle_rockes_destroy',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.obstacle_rockes_destroy.key,
		start: 0,
		end: 5,
		frameSpeed: 10,
		loop: false
	},
	obstacle_rock_tap_destroy: {
		key: 'obstacle_rock_tap_destroy',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.obstacle_rock_tap_destroy.key,
		start: 0,
		end: 5,
		frameSpeed: 10,
		loop: false
	},
	obstacle_rock_tap_destroy2: {
		key: 'obstacle_rock_tap_destroy2',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.obstacle_rock_tap_destroy2.key,
		start: 0,
		end: 5,
		frameSpeed: 10,
		loop: false
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
	obstacle_trashes_drown: {
		key: 'obstacle_trashes_drown',
		type: AssetType.ANIMATION,
		spritesheetRef: AssetsGameplay.obstacle_trashes_drown.key,
		start: 0,
		end: 4,
		frameSpeed: 8,
		loop: false
	},

};