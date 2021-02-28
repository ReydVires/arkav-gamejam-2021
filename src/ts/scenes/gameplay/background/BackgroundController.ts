import { BackgroundView, EventNames } from "./BackgroundView";

type OnCreateFinish = (gameObjects: Phaser.GameObjects.Image[]) => void

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
			riverBg.gameObject.y -= (dt / this._view.props.speedResistance) * this._view.displayHeightRatio;

			const bottomEdge = riverBg.gameObject.getBottomCenter().y;
			if (bottomEdge <= 0) {
				riverBg.gameObject.y += (riverBg.gameObject.displayHeight * 2);
				this._view.event.emit(EventNames.onUpdateSpeedResistance);
			}
		});
	}

	updateSpeedResistance (): void {
		const doUpdateSpeedRes = Math.random() >= 0.8;
		if (!doUpdateSpeedRes) return;

		const currSpeedResistence = this._view.props.speedResistance;
		const resistanceCoef = 0.00125;
		let newSpeedResistance = currSpeedResistence - resistanceCoef;
		if (newSpeedResistance < this._view.maxSpeedResistanceThreshold) {
			newSpeedResistance = this._view.maxSpeedResistanceThreshold;
		}

		this._view.props.speedResistance = newSpeedResistance;
	}

	onUpdateSpeedResistance (events: Function): void {
		this._view.event.on(EventNames.onUpdateSpeedResistance, events);
	}

	onCreateFinish (events: OnCreateFinish): void {
		this._view.event.once(EventNames.onCreateFinish, events);
	}

}