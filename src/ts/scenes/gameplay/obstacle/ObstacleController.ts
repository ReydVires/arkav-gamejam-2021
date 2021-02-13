import { DataProps, EventNames, ObstacleView } from "./ObstacleView";

export class ObstacleController {

	private _view: ObstacleView;

	constructor (scene: Phaser.Scene) {
		this._view = new ObstacleView(scene);
	}

	init (displayPercentage: number, edges: number[]): void {
		this._view.create(displayPercentage, edges);
	}

	private resetTimeToSpawn (): void {
		this._view.props.timeToSpawn += this._view.maxTimeToSpawn;
	}

	private deactiveObstacle (gameObject: Phaser.Physics.Arcade.Sprite): void {
		const deactiveThreshold = gameObject.getData(DataProps.deactiveThreshold) as number;
		if (gameObject.y >= deactiveThreshold) return;
		this._view.deactiveObstacle(gameObject);
	}

	update (time: number, dt: number): void {
		this._view.obstacles.forEach((obstacle) => {
			(obstacle.gameObject.active) && this.deactiveObstacle(obstacle.gameObject);
		});

		const timeLoss = dt * 0.5;
		this._view.props.timeToSpawn -= timeLoss;
		if (this._view.props.timeToSpawn <= 0) {
			this._view.event.emit(EventNames.onSpawn);
			this.resetTimeToSpawn();
		}
	}

}