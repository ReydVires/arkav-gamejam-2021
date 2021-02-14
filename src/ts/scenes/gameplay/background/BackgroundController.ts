import { BackgroundView } from "./BackgroundView";

export class BackgroundController {

	private _view: BackgroundView;

	constructor (scene: Phaser.Scene) {
		this._view = new BackgroundView(scene);
	}

	init (): void {
		this._view.create();
	}

	displayPercentage (): number {
		return this._view.displayHeightRatio;
	}

	getEdge (): number[] {
		return this._view.edge;
	}

	update (time: number, dt: number): void {
		this._view.backgrounds.forEach((riverBg) => {
			riverBg.gameObject.y -= (dt * 0.45) * this._view.displayHeightRatio;
			const { y: bottom } = riverBg.gameObject.getBottomCenter();
			if (bottom < 0) {
				riverBg.gameObject.y += (riverBg.gameObject.displayHeight * 2);
			}
		});
	}

}