import { DataProps, EnvironmentView, EventNames } from "./EnvironmentView";

export class EnvironmentController {

	private _view: EnvironmentView;

	constructor (scene: Phaser.Scene) {
		this._view = new EnvironmentView(scene);
	}

	init (displayPercentage: number): void {
		this._view.create(displayPercentage);
	}

	private resetTimeToSpawn (): void {
		this._view.props.timeToSpawn += this._view.maxTimeToSpawn;
	}

	private getSpawnChance (): boolean {
		return Math.random() <= 0.5;
	}

	update (time: number, dt: number): void {
		this._view.environmentGroup.getChildren().forEach((go) => {
			const envGameObject = go as Phaser.GameObjects.Sprite;

			const [offsetX, threshold] = envGameObject.getData(DataProps.disableEdgePos) as number[];
			const fromLeft = envGameObject.getData(DataProps.sourceSide) as boolean;
			const speedTime = (envGameObject.getData(DataProps.speed) as number) * (dt * 0.01);

			envGameObject.x += speedTime;
			envGameObject.y += (speedTime * envGameObject.getData(DataProps.syncSpeedY) as number) * (fromLeft ? -1 : 1);

			const posX = envGameObject.x + offsetX;
			if (fromLeft ? (posX >= threshold) : (posX <= threshold) ) {
				this._view.event.emit(EventNames.onDeactive, envGameObject);
			}
		});

		this._view.props.timeToSpawn -= dt * 0.25;
		if (this._view.props.timeToSpawn <= 0) {
			if (!this.getSpawnChance()) return;
			this._view.event.emit(EventNames.onSpawn, this.getSpawnChance());
			this.resetTimeToSpawn();
		}
	}

}