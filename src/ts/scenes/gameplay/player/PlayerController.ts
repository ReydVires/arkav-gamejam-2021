import { PlayerView } from "./PlayerView";

export class PlayerController {

	private _view: PlayerView;

	constructor (scene: Phaser.Scene) {
		this._view = new PlayerView(scene);
	}

	init (displayPercentage: number): void {
		this._view.create(displayPercentage);
	}

	update (time: number, dt: number): void {}

}