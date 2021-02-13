import { BackgroundView } from "./BackgroundView";

export class BackgroundController {

	private _view: BackgroundView;

	constructor (scene: Phaser.Scene) {
		this._view = new BackgroundView(scene);
	}

	init (): void {
		this._view.create();
	}

	update (time: number, dt: number): void {}

	displayPercentage (): number {
		return this._view.displayHeightRatio;
	}

	getEdge (): number[] {
		return this._view.getEdge;
	}

}